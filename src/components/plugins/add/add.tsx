import {debounce, isIOS, isMobile, moveCursorToStart} from '@deckdeckgo/utils';
import {
  Component,
  ComponentInterface,
  Event,
  EventEmitter,
  h,
  Host,
  Listen,
  State
} from '@stencil/core';
import configStore from '../../../stores/config.store';
import containerStore from '../../../stores/container.store';
import i18n from '../../../stores/i18n.store';
import {createEmptyElement} from '../../../utils/create-element.utils';
import {toHTMLElement} from '../../../utils/node.utils';
import {
  findParagraph,
  focusParagraph,
  isParagraphEmpty,
  isParagraphNotEditable
} from '../../../utils/paragraph.utils';
import {getSelection} from '../../../utils/selection.utils';
import {IconAdd} from '../../icons/add';

@Component({
  tag: 'stylo-add',
  styleUrl: 'add.scss',
  shadow: true
})
export class Add implements ComponentInterface {
  @State()
  private top: number | undefined;

  private paragraph: HTMLElement | undefined | null;

  /**
   * An event emitted when user click on the shadowed button.
   * - If selected paragraph is empty, emitted straight away
   * - If not empty, first a new paragraph is created and then event is emitted
   * Event is catched in `<style-plugins/>` and used to trigger the display of list of plugins.
   */
  @Event()
  listPlugins: EventEmitter<HTMLElement | undefined>;

  /**
   * If user types anything else than a "/" in an empty paragraph, hide the plugins.
   */
  @Event()
  hidePlugins: EventEmitter<void>;

  private readonly debouncePlaceholder: () => void = debounce(() => this.addPlaceholder(), 350);

  componentDidLoad() {
    window?.addEventListener('resize', () => this.hide());
    document?.addEventListener('focusout', this.onFocusout);
    containerStore.state.ref?.addEventListener('keydown', this.onKeyDown, {passive: true});
  }

  disconnectedCallback() {
    window?.removeEventListener('resize', () => this.hide());
    document?.removeEventListener('focusout', this.onFocusout);
    containerStore.state.ref?.removeEventListener('keydown', this.onKeyDown);
  }

  /**
   * When "enter" is pressed, create a new paragraph and select it.
   */
  private onKeyDown = ({code}: KeyboardEvent) => {
    if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(code)) {
      this.removePlaceholder();
    }

    if (['Backspace', 'Delete'].includes(code)) {
      this.displayOnMutations();
    }
  };

  @Listen('keyup', {target: 'document', passive: true})
  onKeyUp({code}: KeyboardEvent) {
    if (!['ArrowDown', 'ArrowUp', 'Enter', 'Backspace', 'Delete'].includes(code)) {
      if (this.top !== undefined) {
        this.hide();
      }

      return;
    }

    if (['ArrowDown', 'ArrowUp'].includes(code)) {
      this.display({onlyIfEmptyParagraph: false});
      return;
    }
  }

  /**
   * If user press "/" we want to display the list of plugins.
   */
  @Listen('beforeinput', {target: 'document', passive: true})
  onBeforeInput({data}: InputEvent) {
    if (!['/'].includes(data)) {
      this.hidePlugins.emit();
      return;
    }

    if (!this.paragraph || !this.paragraph.isConnected) {
      return;
    }

    if (!isParagraphEmpty({paragraph: this.paragraph})) {
      this.hidePlugins.emit();
      return;
    }

    this.focusListPlugins();
  }

  /**
   * Hide or display the component, the "plus" button.
   */
  @Listen('click', {target: 'document', passive: true})
  onClick({target}: MouseEvent | TouchEvent) {
    // We use the target only if not the container - it can happen for example if the margin is clicked, in such case we want to use the selection
    this.display({
      onlyIfEmptyParagraph: false,
      target: containerStore.state.ref?.isEqualNode(target as Node) ? undefined : target as Node
    });
  }

  @Listen('addParagraphs', {target: 'document', passive: true})
  onAddParagraphs({detail: addedParagraphs}: CustomEvent<HTMLElement[]>) {
    this.initParagraph({target: addedParagraphs[0], onlyIfEmptyParagraph: false});
  }

  private onFocusout = () => {
    // Only if not mobile because the event bubble and is triggered often
    if (!isIOS()) {
      return;
    }

    this.top = undefined;
  };

  private hide() {
    // On Android, keyboard display resize screen
    if (isMobile()) {
      return;
    }

    this.top = undefined;
  }

  private display({onlyIfEmptyParagraph, target}: {onlyIfEmptyParagraph: boolean, target?: Node}) {
    this.initParagraph({
      target: target ?? getSelection(containerStore.state.ref)?.anchorNode,
      onlyIfEmptyParagraph
    });
  }

  private displayOnMutations() {
    const onRender = (_mutations: MutationRecord[], observer: MutationObserver) => {
      observer.disconnect();

      this.display({onlyIfEmptyParagraph: true});
    };

    const docObserver: MutationObserver = new MutationObserver(onRender);
    docObserver.observe(containerStore.state.ref, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  private initParagraph = ({
    target,
    onlyIfEmptyParagraph
  }: {
    target: Node | null | undefined;
    onlyIfEmptyParagraph: boolean;
  }) => {
    if (!target) {
      this.hide();
      return;
    }

    const paragraph: Node | undefined = findParagraph({
      element: target as Node,
      container: containerStore.state.ref
    });

    this.paragraph = toHTMLElement(paragraph);

    if (!this.paragraph) {
      this.hide();
      return;
    }

    if (onlyIfEmptyParagraph && !isParagraphEmpty({paragraph: this.paragraph})) {
      this.hide();
      return;
    }

    this.top = this.paragraph.offsetTop;

    this.editPlaceholder();
  };

  private editPlaceholder() {
    this.removePlaceholder();

    this.debouncePlaceholder();
  }

  private addPlaceholder() {
    if (!isParagraphEmpty({paragraph: this.paragraph})) {
      return;
    }

    if (isParagraphNotEditable({paragraph: this.paragraph})) {
      return;
    }

    if (!configStore.state.placeholders.includes(this.paragraph?.nodeName.toLowerCase())) {
      return;
    }

    const cssBefore: CSSStyleDeclaration = window.getComputedStyle(this.paragraph, ':before');
    const cssAfter: CSSStyleDeclaration = window.getComputedStyle(this.paragraph, ':after');

    const emptyPseudoElement: string[] = ['""', 'none'];

    if (
      !emptyPseudoElement.includes(cssBefore.getPropertyValue('content')) ||
      !emptyPseudoElement.includes(cssAfter.getPropertyValue('content'))
    ) {
      // An external source use :before or :after to style this paragraph, we don't want to add noise in the ui
      return;
    }

    this.paragraph.setAttribute('placeholder', i18n.state.add.placeholder);
  }

  private removePlaceholder() {
    const placeholders: NodeListOf<HTMLElement> =
      containerStore.state.ref?.querySelectorAll('[placeholder]');
    placeholders?.forEach((element: HTMLElement) => element.removeAttribute('placeholder'));
  }

  private selectPlugins($event: UIEvent) {
    if (!this.paragraph || !containerStore.state.ref) {
      return;
    }

    $event.stopPropagation();

    if (
      isParagraphEmpty({paragraph: this.paragraph}) &&
      !isParagraphNotEditable({paragraph: this.paragraph})
    ) {
      this.focusListPlugins();

      return;
    }

    focusParagraph({paragraph: this.paragraph});

    const onRender = (mutations: MutationRecord[], observer: MutationObserver) => {
      observer.disconnect();

      const addedNodes: Node[] = mutations.reduce(
        (acc: Node[], {addedNodes}: MutationRecord) => [...acc, ...Array.from(addedNodes)],
        []
      );
      const div: Node | undefined = addedNodes.find(
        (node: Node) => node.nodeName.toLowerCase() === 'div'
      );

      moveCursorToStart(div);

      this.listPlugins.emit(div as HTMLElement | undefined);
    };

    const docObserver: MutationObserver = new MutationObserver(onRender);
    docObserver.observe(containerStore.state.ref, {childList: true, subtree: true});

    const div: HTMLElement = createEmptyElement({nodeName: 'div'});
    this.paragraph.after(div);

    this.hide();
  }

  private focusListPlugins() {
    focusParagraph({paragraph: this.paragraph});

    this.listPlugins.emit(this.paragraph);
  }

  render() {
    const style: Record<string, string> =
      this.top === undefined ? {display: 'none'} : {'--actions-top': `${this.top}px`};

    return (
      <Host style={style}>
        <button
          type="button"
          aria-label={i18n.state.add.add_element}
          onClick={($event: UIEvent) => this.selectPlugins($event)}
          onKeyDown={($event) => $event.stopPropagation()}
          onMouseDown={($event) => $event.stopPropagation()}
          onTouchStart={($event) => $event.stopPropagation()}>
          <IconAdd></IconAdd>
        </button>
      </Host>
    );
  }
}
