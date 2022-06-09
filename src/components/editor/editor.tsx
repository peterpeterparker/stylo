import {debounce, isMobile} from '@deckdeckgo/utils';
import {
  Component,
  ComponentInterface,
  Element,
  Fragment,
  h,
  Prop,
  State,
  Watch
} from '@stencil/core';
import {DataEvents} from '../../events/data.events';
import {EnterEvents} from '../../events/enter.events';
import {InputEvents} from '../../events/input.events';
import {PasteEvents} from '../../events/paste.events';
import {PlaceholderEvents} from '../../events/placeholder.events';
import {TabEvents} from '../../events/tab.events';
import {UndoRedoEvents} from '../../events/undo-redo.events';
import configStore, {
  DEFAULT_EXCLUDE_ATTRIBUTES,
  DEFAULT_PARAGRAPH_IDENTIFIER,
  DEFAULT_PLACEHOLDERS,
  DEFAULT_PLUGINS,
  DEFAULT_TEXT_PARAGRAPHS,
  DEFAULT_TOOLBAR
} from '../../stores/config.store';
import containerStore from '../../stores/container.store';
import i18n from '../../stores/i18n.store';
import undoRedoStore from '../../stores/undo-redo.store';
import {StyloConfig} from '../../types/config';
import {injectCSS} from '../../utils/css.utils';

@Component({
  tag: 'stylo-editor',
  styleUrl: 'editor.scss',
  shadow: false
})
export class Editor implements ComponentInterface {
  @Element()
  private el: HTMLElement;

  /**
   * Optional editor configurations
   * - i18n provides language and optional list of custom translations
   * - plugins, if provided, replaces the default plugin config
   * - Toolbar, if provided, is merged with the default toolbar config
   * - Menus, if provided, is merged with the default menus config
   */
  @Prop()
  config: StyloConfig | undefined;

  /**
   * The container (e.g. an article, a div, etc.) that contains the content, the paragraphs.
   * Must have the attribute `contenteditable` set to `true`.
   */
  @Prop()
  containerRef: HTMLElement | undefined;

  @State()
  private contentEditable: boolean = true;

  private readonly debounceSize: () => void = debounce(() => this.applySize(), 250);

  private readonly undoRedoEvents: UndoRedoEvents = new UndoRedoEvents();
  private readonly enterEvents: EnterEvents = new EnterEvents();
  private readonly placeHolderEvents: PlaceholderEvents = new PlaceholderEvents();
  private readonly inputEvents: InputEvents = new InputEvents();
  private readonly tabEvents: TabEvents = new TabEvents();
  private readonly dataEvents: DataEvents = new DataEvents();
  private readonly pasteEvents: PasteEvents = new PasteEvents();

  private attributesObserver: MutationObserver | undefined;

  private mobile: boolean = isMobile();

  componentWillLoad() {
    this.init();
    this.applyConfig();
  }

  componentDidLoad() {
    window?.addEventListener('resize', this.debounceSize);
  }

  disconnectedCallback() {
    window?.removeEventListener('resize', this.debounceSize);

    this.destroy();

    this.attributesObserver?.disconnect();
  }

  @Watch('containerRef')
  onContainerRefChange() {
    this.destroy();

    this.init();
  }

  @Watch('config')
  onConfigChange() {
    this.destroy();

    this.applyConfig();

    this.initEvents();
  }

  private applySize() {
    if (isMobile()) {
      return;
    }

    containerStore.state.size = this.containerRef?.getBoundingClientRect();
  }

  private init() {
    containerStore.state.ref = this.containerRef;

    if (!this.containerRef) {
      return;
    }

    injectCSS({rootNode: this.containerRef.getRootNode()});

    containerStore.state.ref.classList.add('stylo-container');

    this.containerRefEditable();

    this.applySize();
    this.initEvents();
  }

  /**
   * Observe and init containerref "contenteditable" state. Notably useful in case consumer toggles such state.
   */
  private containerRefEditable() {
    this.attributesObserver?.disconnect();

    this.attributesObserver = new MutationObserver((mutations: MutationRecord[]) => {
      const contentEditableChanged: MutationRecord | undefined = mutations.find(
        ({attributeName}: MutationRecord) =>
          ['contenteditable'].includes(attributeName.toLowerCase())
      );

      if (!contentEditableChanged) {
        return;
      }

      this.contentEditable = this.isContentEditable();

      if (this.contentEditable) {
        this.initEvents();
        return;
      }

      this.destroy();
    });

    this.attributesObserver.observe(containerStore.state.ref, {attributes: true});

    this.contentEditable = this.isContentEditable();
  }

  private isContentEditable(): boolean {
    return ['true', ''].includes(this.containerRef.getAttribute('contenteditable'));
  }

  private applyConfig() {
    if (!this.config) {
      return;
    }

    const {
      plugins,
      toolbar,
      i18n: customI18n,
      placeholders,
      textParagraphs,
      menus,
      attributes
    } = this.config;

    i18n.state.custom = customI18n?.custom;

    i18n.state.lang = customI18n?.lang || 'en';

    configStore.state.plugins = plugins || DEFAULT_PLUGINS;

    configStore.state.toolbar = toolbar
      ? {
          ...configStore.state.toolbar,
          ...toolbar
        }
      : DEFAULT_TOOLBAR;

    configStore.state.placeholders = placeholders || DEFAULT_PLACEHOLDERS;
    configStore.state.textParagraphs = textParagraphs || DEFAULT_TEXT_PARAGRAPHS;

    configStore.state.menus = menus;

    const paragraphIdentifier: string =
      attributes?.paragraphIdentifier ?? DEFAULT_PARAGRAPH_IDENTIFIER;

    configStore.state.attributes = {
      paragraphIdentifier,
      exclude: [
        ...new Set([
          ...(attributes?.exclude ?? []),
          ...DEFAULT_EXCLUDE_ATTRIBUTES,
          paragraphIdentifier
        ])
      ]
    };
  }

  private destroy() {
    this.undoRedoEvents.destroy();
    this.inputEvents.destroy();
    this.enterEvents.destroy();
    this.placeHolderEvents.destroy();
    this.tabEvents.destroy();
    this.dataEvents.destroy();
    this.pasteEvents.destroy();

    undoRedoStore.state.undo = [];
    undoRedoStore.state.redo = [];
  }

  private initEvents() {
    if (!this.contentEditable) {
      return;
    }

    this.inputEvents.init();
    this.enterEvents.init();
    this.placeHolderEvents.init({editorRef: this.el});
    this.tabEvents.init();
    this.dataEvents.init({editorRef: this.el});
    this.undoRedoEvents.init();
    this.pasteEvents.init();
  }

  render() {
    if (!this.contentEditable) {
      return undefined;
    }

    return (
      <Fragment>
        <stylo-add></stylo-add>
        <stylo-plugins></stylo-plugins>
        {this.renderToolbar()}
        {configStore.state.menus?.length && <stylo-menus></stylo-menus>}
      </Fragment>
    );
  }

  private renderToolbar() {
    if (this.mobile) {
      return undefined;
    }

    return <stylo-toolbar containerRef={this.containerRef}></stylo-toolbar>;
  }
}
