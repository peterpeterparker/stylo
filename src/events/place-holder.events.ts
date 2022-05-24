import containerStore from '../stores/container.store';
import {elementIndex, isTextNode} from '../utils/node.utils';
import {findParagraph} from '../utils/paragraph.utils';

export class PlaceHolderEvents {
  private editorRef: HTMLElement | undefined;

  init({editorRef}: {editorRef: HTMLElement | undefined}) {
    this.editorRef = editorRef;

    this.editorRef?.addEventListener('selectParagraph', this.onSelectParagraph);

    this.classesEmpty();
  }

  destroy() {
    this.editorRef?.removeEventListener('selectParagraph', this.onSelectParagraph);
  }

  private onSelectParagraph = ({detail}: CustomEvent<HTMLElement | undefined>) => {
    const firstParagraph: Element | undefined = containerStore.state.ref?.firstElementChild;
    const secondParagraph: Element | undefined = containerStore.state.ref?.children[1];

    const first: boolean = firstParagraph && detail && detail.isEqualNode(firstParagraph);
    const second: boolean = secondParagraph && detail && detail.isEqualNode(secondParagraph);

    containerStore.state.ref?.removeEventListener('keydown', this.onKeyChange);
    containerStore.state.ref?.removeEventListener('keyup', this.onKeyChange);

    if (first || second) {
      containerStore.state.ref?.addEventListener('keydown', this.onKeyChange);
      containerStore.state.ref?.addEventListener('keyup', this.onKeyChange);
    }

    this.classesEmpty();

    this.cleanEmpty();
  };

  private onKeyChange = () => {
    const paragraph: Node | undefined = findParagraph({
      element: getSelection()?.anchorNode,
      container: containerStore.state.ref
    });

    if (!paragraph || isTextNode(paragraph)) {
      return;
    }

    this.toggleClassEmpty(paragraph as HTMLElement);
  };

  private classesEmpty() {
    const firstParagraph: Element | undefined = containerStore.state.ref?.firstElementChild;
    const secondParagraph: Element | undefined = containerStore.state.ref?.children[1];

    this.classEmpty(firstParagraph);
    this.classEmpty(secondParagraph);
  }

  private classEmpty(element: Element | undefined) {
    if (!element) {
      return;
    }

    const paragraph: Node | undefined = findParagraph({
      element,
      container: containerStore.state.ref
    });

    if (!paragraph || isTextNode(paragraph)) {
      return;
    }

    this.toggleClassEmpty(paragraph as HTMLElement);
  }

  private toggleClassEmpty(paragraph: HTMLElement) {
    const empty: boolean =
      paragraph.textContent === '' ||
      (paragraph.textContent.charAt(0) === '\u200B' && paragraph.textContent.length === 1);

    if (empty) {
      paragraph.classList.add('stylo-empty');
      return;
    }

    paragraph.classList.remove('stylo-empty');
  }

  /**
   * If a paragraph is added between the two first placeholder the new div might be created with a copy of this class so we clean it
   */
  private cleanEmpty() {
    const elements: NodeListOf<HTMLElement> | undefined =
      containerStore.state.ref?.querySelectorAll('.stylo-empty');

    const others: HTMLElement[] = Array.from(elements || []).filter((element: HTMLElement) => elementIndex(element) > 1);

    for (const other of others) {
      other.classList.remove('stylo-empty');
    }
  }
}
