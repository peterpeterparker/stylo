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
import {TabEvents} from '../../events/tab.events';
import {UndoRedoEvents} from '../../events/undo-redo.events';
import configStore, {
  DEFAULT_EXCLUDE_ATTRIBUTES,
  DEFAULT_PLACEHOLDERS,
  DEFAULT_PLUGINS,
  DEFAULT_TOOLBAR
} from '../../stores/config.store';
import containerStore from '../../stores/container.store';
import i18n from '../../stores/i18n.store';
import {StyloConfig} from '../../types/config';
import {injectHeadCSS} from '../../utils/css.utils';

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
  private readonly inputEvents: InputEvents = new InputEvents();
  private readonly tabEvents: TabEvents = new TabEvents();
  private readonly dataEvents: DataEvents = new DataEvents();

  private attributesObserver: MutationObserver | undefined;

  private mobile: boolean = isMobile();

  componentWillLoad() {
    this.init();
    this.applyConfig();
  }

  componentDidLoad() {
    injectHeadCSS();

    window?.addEventListener('resize', this.debounceSize);
  }

  disconnectedCallback() {
    window?.removeEventListener('resize', this.debounceSize);

    this.destroyEvents();

    this.attributesObserver?.disconnect();
  }

  @Watch('containerRef')
  onContainerRefChange() {
    this.destroyEvents();

    this.init();
  }

  @Watch('config')
  onConfigChange() {
    this.destroyEvents();

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

      this.contentEditable = this.containerRef.getAttribute('contenteditable') === 'true';

      if (this.contentEditable) {
        this.initEvents();
        return;
      }

      this.destroyEvents();
    });

    this.attributesObserver.observe(containerStore.state.ref, {attributes: true});

    this.contentEditable = this.containerRef.getAttribute('contenteditable') === 'true';
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
      menus,
      excludeAttributes
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

    configStore.state.menus = menus;
    configStore.state.excludeAttributes = [
      ...DEFAULT_EXCLUDE_ATTRIBUTES,
      ...(excludeAttributes || [])
    ];
  }

  private destroyEvents() {
    this.undoRedoEvents.destroy();
    this.inputEvents.destroy();
    this.enterEvents.destroy();
    this.tabEvents.destroy();
    this.dataEvents.destroy();
  }

  private initEvents() {
    if (!this.contentEditable) {
      return;
    }

    this.inputEvents.init();
    this.enterEvents.init();
    this.tabEvents.init();
    this.dataEvents.init({editorRef: this.el});
    this.undoRedoEvents.init();
  }

  render() {
    if (!this.contentEditable) {
      return undefined;
    }

    return (
      <Fragment>
        <stylo-add></stylo-add>
        <stylo-plugins></stylo-plugins>
        {!this.mobile ?? <stylo-toolbar containerRef={this.containerRef}></stylo-toolbar>}
        {configStore.state.menus?.length && <stylo-menus></stylo-menus>}
      </Fragment>
    );
  }
}
