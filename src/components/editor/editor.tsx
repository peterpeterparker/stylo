import {debounce} from '@deckdeckgo/utils';
import {Component, ComponentInterface, Element, Fragment, h, Prop, Watch} from '@stencil/core';
import {DataEvents} from '../../events/data.events';
import {EnterEvents} from '../../events/enter.events';
import {InputEvents} from '../../events/input.events';
import {TabEvents} from '../../events/tab.events';
import {UndoRedoEvents} from '../../events/undo-redo.events';
import configStore, {
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
   * Optional editor configuration.
   * - Language
   * - Plugin, if provided, replaces the default plugin config
   * - Toolbar, if provided, is merged with the default toolbar config
   */
  @Prop()
  config: StyloConfig | undefined;

  /**
   * The container (e.g. an article, a div, etc.) that contains the content, the paragraphs.
   * Must have the attribute `contenteditable` set to `true`.
   */
  @Prop()
  containerRef: HTMLElement | undefined;

  private readonly debounceSize: () => void = debounce(() => this.applySize(), 250);

  private readonly undoRedoEvents: UndoRedoEvents = new UndoRedoEvents();
  private readonly inputEvents: InputEvents = new InputEvents();
  private readonly enterEvents: EnterEvents = new EnterEvents();
  private readonly tabEvents: TabEvents = new TabEvents();
  private readonly dataEvents: DataEvents = new DataEvents();

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
    containerStore.state.size = this.containerRef?.getBoundingClientRect();
  }

  private init() {
    containerStore.state.ref = this.containerRef;

    if (!this.containerRef) {
      return;
    }

    containerStore.state.ref.classList.add('stylo-container');

    this.applySize();
    this.initEvents();
  }

  private applyConfig() {
    if (!this.config) {
      return;
    }

    const {plugins, toolbar, lang, events, placeholders} = this.config;

    i18n.state.lang = lang || 'en';

    configStore.state.plugins = plugins || DEFAULT_PLUGINS;

    configStore.state.toolbar = toolbar
      ? {
          ...configStore.state.toolbar,
          ...toolbar
        }
      : DEFAULT_TOOLBAR;

    configStore.state.events = events;

    configStore.state.placeholders = placeholders || DEFAULT_PLACEHOLDERS;
  }

  private destroyEvents() {
    this.undoRedoEvents.destroy();
    this.inputEvents.destroy();
    this.enterEvents.destroy();
    this.tabEvents.destroy();
    this.dataEvents.destroy();
  }

  private initEvents() {
    this.inputEvents.init();
    this.enterEvents.init();
    this.tabEvents.init();
    this.dataEvents.init({editorRef: this.el});
    this.undoRedoEvents.init();
  }

  render() {
    return (
      <Fragment>
        <stylo-add></stylo-add>
        <stylo-plugins></stylo-plugins>
        <stylo-toolbar containerRef={this.containerRef}></stylo-toolbar>
      </Fragment>
    );
  }
}
