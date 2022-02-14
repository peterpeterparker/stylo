import {
  clearTheSelection,
  debounce,
  getAnchorElement,
  getSelection,
  isIOS,
  isMobile,
  isRTL,
  unifyEvent
} from '@deckdeckgo/utils';
import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  h,
  Listen,
  Prop,
  State,
  Watch
} from '@stencil/core';
import configStore from '../../../../stores/config.store';
import {ExecCommandAction} from '../../../../types/execcommand';
import {
  StyloConfigToolbar,
  ToolbarActions,
  ToolbarAlign,
  ToolbarAnchorLink,
  ToolbarFontSize,
  ToolbarList
} from '../../../../types/toolbar';
import {execCommand} from '../../../../utils/execcommand.utils';
import {execCommandNative} from '../../../../utils/execcommnad-native.utils';
import {removeLink} from '../../../../utils/link.utils';
import {toHTMLElement} from '../../../../utils/node.utils';
import {findParagraph, isParagraph} from '../../../../utils/paragraph.utils';
import {
  getBold,
  getContentAlignment,
  getFontSize,
  getItalic,
  getList,
  getStrikeThrough,
  getUnderline
} from '../../../../utils/toolbar.utils';
import {Style} from '../actions/style/style';

@Component({
  tag: 'stylo-toolbar',
  styleUrl: 'toolbar.scss',
  shadow: true
})
export class Toolbar implements ComponentInterface {
  @Element() el: HTMLElement;

  /**
   * If used in a standalone mode, the configuration can also be set. It will be applied over the default configuration.
   */
  @Prop()
  config: Partial<StyloConfigToolbar> | undefined;

  /**
   * To attach the inline editor event listeners to a specific container instead of the document
   */
  @Prop()
  containerRef: HTMLElement | undefined;

  @State()
  private bold: 'bold' | 'initial' | undefined = undefined;

  @State()
  private italic: 'italic' | 'initial' | undefined = undefined;

  @State()
  private underline: 'underline' | 'initial' | undefined = undefined;

  @State()
  private strikethrough: 'strikethrough' | 'initial' | undefined = undefined;

  @State()
  private align: ToolbarAlign;

  @State()
  private list: ToolbarList | undefined = undefined;

  @State()
  private fontSize: ToolbarFontSize | undefined = undefined;

  @State()
  private disabledTitle: boolean = false;

  @State()
  private toolsActivated: boolean = false;

  @State()
  private displayToolsActivated: boolean = false;

  private readonly debounceDisplayToolsActivated: () => void = debounce(() => {
    this.displayToolsActivated = true;
    this.toolbarActivated.emit(true);
  });

  private selection: Selection = null;

  private anchorLink: ToolbarAnchorLink = null;
  private anchorEvent: MouseEvent | TouchEvent | undefined;

  @State()
  private link: boolean = false;

  @State()
  private toolbarActions: ToolbarActions = ToolbarActions.STYLE;

  @Event()
  toolbarActivated: EventEmitter<boolean>;

  /**
   * Triggered when a link is created by the user. The event detail is the container
   */
  @Event()
  linkCreated: EventEmitter<HTMLElement>;

  /**
   * Triggered when the style is modified (bold, italic, color, alignment, etc.). The event detail is the container
   */
  @Event()
  styleDidChange: EventEmitter<HTMLElement>;

  private tools!: HTMLDivElement;

  @State()
  private toolsPosition:
    | {
        left: string;
        right: string;
        top: number;
        position: 'above' | 'under';
        align: 'start' | 'center' | 'end';
        anchorLeft: number;
      }
    | undefined;

  private rtl: boolean = isRTL();

  constructor() {
    this.onSelectionChange = this.onSelectionChange.bind(this);
  }

  componentWillLoad() {
    this.initDefaultContentAlign();
    this.applyStandaloneConfig();
  }

  connectedCallback() {
    this.addListener();
  }

  disconnectedCallback() {
    this.removeListener();
  }

  @Watch('containerRef')
  onContainerRef() {
    if (!this.containerRef) {
      return;
    }

    this.removeListener();
    this.addListener();
  }

  @Watch('config')
  onConfigChange() {
    this.applyStandaloneConfig();
  }

  private applyStandaloneConfig() {
    if (!this.config) {
      return;
    }

    configStore.state.toolbar = {
      ...configStore.state.toolbar,
      ...this.config
    };
  }

  @Listen('selectionchange', {target: 'document', passive: true})
  onSelectionChange() {
    if (
      [ToolbarActions.COLOR, ToolbarActions.BACKGROUND_COLOR, ToolbarActions.LINK].includes(
        this.toolbarActions
      )
    ) {
      return;
    }

    this.displayTools();
  }

  @Listen('resize', {target: 'window'})
  onResize() {
    // On Android, keyboard display resize screen
    if (isMobile()) {
      return;
    }

    this.reset(true);
  }

  private addListener() {
    const listenerElement: HTMLElement | Document = this.containerRef || document;
    listenerElement?.addEventListener('mousedown', this.startSelection, {passive: true});
    listenerElement?.addEventListener('touchstart', this.startSelection, {passive: true});
  }

  private removeListener() {
    const listenerElement: HTMLElement | Document = this.containerRef || document;
    listenerElement?.removeEventListener('mousedown', this.startSelection);
    listenerElement?.removeEventListener('touchstart', this.startSelection);
  }

  private startSelection = ($event: MouseEvent | TouchEvent) => {
    const action: boolean = $event.composedPath().includes(this.el);

    if (action) {
      return;
    }

    if (this.displayToolsActivated && !action) {
      // If use in a shadowed containerRef context, onSelectionChange might not be triggered
      this.reset(true);
      return;
    }

    this.anchorEvent = $event;
  };

  private displayTools() {
    const selection: Selection | null = getSelection();

    if (!this.anchorEvent) {
      this.reset(false);
      return;
    }

    if (this.containerRef && !this.containerRef.contains(this.anchorEvent.target as Node)) {
      this.reset(false);
      return;
    }

    if (!selection || !selection.toString() || selection.toString().trim().length <= 0) {
      this.reset(false);
      return;
    }

    const activated: boolean = this.activateToolbar(selection);
    this.setToolsActivated(activated);

    if (!this.toolsActivated) {
      return;
    }

    this.selection = selection;

    if (selection.rangeCount > 0) {
      const range: Range = selection.getRangeAt(0);
      this.anchorLink = {
        range: range.cloneRange()
      };

      this.setToolbarAnchorPosition();
    }
  }

  private setToolbarAnchorPosition() {
    if (!this.tools) {
      return;
    }

    const selection: Selection | null = getSelection();
    const range: Range | undefined = selection?.getRangeAt(0);
    const rect: DOMRect | undefined = range?.getBoundingClientRect();

    const containerRect: DOMRect | undefined = this.containerRef?.getBoundingClientRect();
    const styloContainerRect = (this.tools.parentNode as ShadowRoot).host.getBoundingClientRect();

    const eventX: number = unifyEvent(this.anchorEvent).clientX;
    const eventY: number = unifyEvent(this.anchorEvent).clientY;

    const x: number =
      rect && containerRect
        ? rect.left - containerRect.left + this.containerRef.offsetLeft + rect.width / 2
        : eventX - styloContainerRect.x;
    const y: number =
      rect && containerRect
        ? rect.top - containerRect.top + this.containerRef.offsetTop
        : eventY - styloContainerRect.y;

    const position: 'above' | 'under' = eventY > 100 ? 'above' : 'under';

    let top: number = position === 'above' ? y - 16 : y + (rect?.height || 0) + 8;

    const innerWidth: number = isIOS() ? screen.width : window.innerWidth;

    const fixedLeft: number = (rect?.left || eventX) - 40;

    const safeAreaMarginX: number = 16;

    // Limit overflow right
    const overflowLeft: boolean = this.tools.offsetWidth / 2 + safeAreaMarginX > x;
    const overflowRight: boolean =
      innerWidth > 0 && fixedLeft > innerWidth - (this.tools.offsetWidth + safeAreaMarginX);

    // To set the position of the tools
    this.toolsPosition = {
      top,
      left: overflowRight ? `auto` : overflowLeft ? `${safeAreaMarginX}px` : `${x}px`,
      right: overflowRight ? `${safeAreaMarginX}px` : `auto`,
      position,
      align: overflowRight ? 'end' : overflowLeft ? 'start' : 'center',
      anchorLeft: overflowLeft
        ? x - safeAreaMarginX
        : overflowRight
        ? x - (innerWidth - safeAreaMarginX - this.tools.offsetWidth)
        : this.tools.offsetWidth / 2
    };
  }

  private activateToolbar(selection: Selection): boolean {
    const tools: boolean = selection && selection.toString() && selection.toString().length > 0;

    if (tools) {
      this.initStyle(selection);
      this.initLink(selection);
    }

    return tools;
  }

  private initStyle(selection: Selection) {
    if (!selection || selection.rangeCount <= 0) {
      return;
    }

    const content: HTMLElement | null = getAnchorElement(selection);

    if (!content) {
      return;
    }

    this.initStyleForNode(content);
  }

  private initStyleForNode(node: Node) {
    this.bold = undefined;
    this.italic = undefined;
    this.underline = undefined;
    this.strikethrough = undefined;
    this.list = undefined;
    this.fontSize = undefined;

    this.initDefaultContentAlign();

    this.findStyle(node);
  }

  private initDefaultContentAlign() {
    this.align = this.rtl ? ToolbarAlign.RIGHT : ToolbarAlign.LEFT;
  }

  // We iterate until we find the root container to detect if bold, underline or italic are active
  private findStyle(node: Node | undefined) {
    if (!node) {
      return;
    }

    // Just in case
    if (node.nodeName.toUpperCase() === 'HTML' || node.nodeName.toUpperCase() === 'BODY') {
      return;
    }

    if (this.bold === undefined) {
      this.bold = getBold(toHTMLElement(node));
    }

    if (this.italic === undefined) {
      this.italic = getItalic(toHTMLElement(node));
    }

    if (this.underline === undefined) {
      this.underline = getUnderline(toHTMLElement(node));
    }

    if (this.strikethrough === undefined) {
      this.strikethrough = getStrikeThrough(toHTMLElement(node));
    }

    if (this.list === undefined) {
      this.list = getList(toHTMLElement(node));
    }

    if (this.fontSize === undefined) {
      this.fontSize = getFontSize(toHTMLElement(node));
    }

    if (isParagraph({element: node, container: this.containerRef})) {
      const nodeName: string = node.nodeName.toUpperCase();

      this.disabledTitle =
        nodeName === 'H1' ||
        nodeName === 'H2' ||
        nodeName === 'H3' ||
        nodeName === 'H4' ||
        nodeName === 'H5' ||
        nodeName === 'H6';

      this.align = getContentAlignment(toHTMLElement(node));

      return;
    }

    this.findStyle(node.parentNode);
  }

  private initLink(selection: Selection) {
    if (!selection) {
      return;
    }

    let content: Node = selection.anchorNode;

    if (!content) {
      return;
    }

    if (content.nodeType === 3) {
      content = content.parentElement;
    }

    this.link = content.nodeName && content.nodeName.toLowerCase() === 'a';
  }

  /**
   * Reset the inline editor (= hide it) and optionally clear its selection.
   * @param clearSelection
   * @param blurActiveElement
   */
  private reset(clearSelection: boolean, blurActiveElement?: boolean) {
    if (clearSelection) {
      clearTheSelection();
    }

    this.setToolsActivated(false);

    if (clearSelection) {
      // We don't want to emit that state a zillion time but only when needed
      this.toolbarActivated.emit(false);
    }

    this.selection = null;

    this.toolbarActions = ToolbarActions.STYLE;
    this.anchorLink = null;
    this.link = false;

    if (
      blurActiveElement &&
      document.activeElement &&
      document.activeElement instanceof HTMLElement
    ) {
      document.activeElement.blur();
    }
  }

  private toggleLink = () => {
    if (this.link) {
      removeLink();
      this.reset(true);
    } else {
      this.openLink();
    }
  };

  private openLink() {
    this.toolbarActions = ToolbarActions.LINK;
  }

  private setToolsActivated(activated: boolean) {
    this.toolsActivated = activated;

    if (activated) {
      this.debounceDisplayToolsActivated();
    } else {
      this.displayToolsActivated = false;
    }
  }

  /***
   * The toolbar is already displayed and we want to switch the actions
   */
  private switchToolbarActions = (actions: ToolbarActions) => (this.toolbarActions = actions);

  private onExecCommand = ($event: CustomEvent<ExecCommandAction>) => {
    if (!$event || !$event.detail) {
      return;
    }

    // onSelectionChange is triggered if DOM changes, we still need to detect attributes changes to refresh style
    this.onAttributesChangesInitStyle();

    if (configStore.state.toolbar.command === 'native') {
      execCommandNative($event.detail);
    } else {
      execCommand(this.selection, $event.detail, this.containerRef);
    }

    if ($event.detail.cmd === 'list' || isIOS()) {
      this.reset(true);
    }

    const container: Node | undefined = findParagraph({
      element: !this.selection ? document.activeElement : this.selection.anchorNode,
      container: this.containerRef
    });

    if (!container) {
      return;
    }

    this.styleDidChange.emit(toHTMLElement(container));
  };

  private onAttributesChangesInitStyle() {
    const anchorNode: HTMLElement | null = getAnchorElement(this.selection);

    if (!anchorNode) {
      return;
    }

    const observer: MutationObserver = new MutationObserver(() => {
      observer.disconnect();

      this.initStyleForNode(anchorNode);
    });

    observer.observe(anchorNode, {attributes: true});
  }

  render() {
    let classNames: string = this.displayToolsActivated ? 'tools tools-activated' : 'tools';

    const position: string = this.toolsPosition?.position || 'above';

    const style: Record<string, string> | undefined = this.toolsPosition
      ? {
          '--actions-top': `${this.toolsPosition.top}px`,
          '--actions-left': this.toolsPosition.left,
          '--actions-right': this.toolsPosition.right,
          '--actions-translate-x': `${this.toolsPosition.align === 'center' ? '-50%' : '0'}`,
          '--actions-translate-y': `${this.toolsPosition.position === 'above' ? '-100%' : '0'}`
        }
      : undefined;

    return (
      <div class={classNames} ref={(el) => (this.tools = el as HTMLDivElement)} style={style}>
        <stylo-toolbar-triangle
          class={position === 'above' ? 'bottom' : 'top'}
          style={{
            '--stylo-toolbar-triangle-start': `${this.toolsPosition?.anchorLeft}px`
          }}></stylo-toolbar-triangle>
        {this.renderActions()}
      </div>
    );
  }

  private renderActions() {
    if (this.toolbarActions === ToolbarActions.LINK) {
      return (
        <stylo-toolbar-link
          containerRef={this.containerRef}
          toolbarActions={this.toolbarActions}
          anchorLink={this.anchorLink}
          linkCreated={this.linkCreated}
          onLinkModified={($event: CustomEvent<boolean>) =>
            this.reset($event.detail)
          }></stylo-toolbar-link>
      );
    }

    if (
      this.toolbarActions === ToolbarActions.COLOR ||
      this.toolbarActions === ToolbarActions.BACKGROUND_COLOR
    ) {
      return (
        <stylo-toolbar-color
          containerRef={this.containerRef}
          action={
            this.toolbarActions === ToolbarActions.BACKGROUND_COLOR ? 'background-color' : 'color'
          }
          onExecCommand={this.onExecCommand}></stylo-toolbar-color>
      );
    }

    if (this.toolbarActions === ToolbarActions.ALIGNMENT) {
      return (
        <stylo-toolbar-align
          containerRef={this.containerRef}
          anchorEvent={this.anchorEvent}
          align={this.align}
          onAlignModified={() => this.reset(true)}></stylo-toolbar-align>
      );
    }

    if (this.toolbarActions === ToolbarActions.LIST) {
      return (
        <stylo-toolbar-list
          list={this.list}
          onExecCommand={this.onExecCommand}></stylo-toolbar-list>
      );
    }

    if (this.toolbarActions === ToolbarActions.FONT_SIZE) {
      return (
        <stylo-toolbar-font-size
          fontSize={this.fontSize}
          onExecCommand={this.onExecCommand}></stylo-toolbar-font-size>
      );
    }

    return (
      <Style
        align={this.align}
        list={this.list}
        switchToolbarActions={this.switchToolbarActions}
        bold={this.bold}
        disabledTitle={this.disabledTitle}
        italic={this.italic}
        strikethrough={this.strikethrough}
        underline={this.underline}
        link={this.link}
        onExecCommand={this.onExecCommand}
        toggleLink={this.toggleLink}></Style>
    );
  }
}
