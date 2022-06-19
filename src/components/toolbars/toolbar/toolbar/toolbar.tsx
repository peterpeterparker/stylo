import {
  clearTheSelection,
  debounce,
  getAnchorElement,
  isIOS,
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
import {isMobile} from '../../../../utils/mobile.utils';
import {toHTMLElement} from '../../../../utils/node.utils';
import {findParagraph, isParagraph} from '../../../../utils/paragraph.utils';
import {getRange, getSelection} from '../../../../utils/selection.utils';
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
  private selectionParagraph: Node | undefined = undefined;

  private anchorLink: ToolbarAnchorLink = null;

  private anchorEvent:
    | {
        $event: MouseEvent | TouchEvent;
        composedPath: EventTarget[];
      }
    | undefined;

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

  private onKeyDown = ($event: KeyboardEvent) => {
    const {code} = $event;

    if (['Escape'].includes(code)) {
      this.reset(false);
      return;
    }
  };

  @Listen('contextmenu', {target: 'document', passive: true})
  onContextMenu() {
    this.reset(false);
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

  private onContainerClick($event: MouseEvent | TouchEvent) {
    if (
      [ToolbarActions.COLOR, ToolbarActions.BACKGROUND_COLOR, ToolbarActions.LINK].includes(
        this.toolbarActions
      )
    ) {
      return;
    }

    $event.preventDefault();
  }

  private addListener() {
    const listenerElement: HTMLElement | Document = this.containerRef || document;
    listenerElement?.addEventListener('mousedown', this.startSelection, {passive: true});
    listenerElement?.addEventListener('touchstart', this.startSelection, {passive: true});
    listenerElement?.addEventListener('keydown', this.onKeyDown, {passive: true});
  }

  private removeListener() {
    const listenerElement: HTMLElement | Document = this.containerRef || document;
    listenerElement?.removeEventListener('mousedown', this.startSelection);
    listenerElement?.removeEventListener('touchstart', this.startSelection);
    listenerElement?.removeEventListener('keydown', this.onKeyDown);
  }

  private startSelection = ($event: MouseEvent | TouchEvent) => {
    this.anchorEvent = {
      $event,
      composedPath: $event.composedPath()
    };
  };

  private displayTools() {
    let selection: Selection | null = getSelection(this.containerRef);

    if (!this.anchorEvent) {
      this.reset(false);
      return;
    }

    const {$event, composedPath} = this.anchorEvent;

    if (
      this.containerRef &&
      !this.containerRef.contains($event.target as Node) &&
      !this.containerRef.contains(composedPath[0] as Node)
    ) {
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
    this.selectionParagraph = findParagraph({
      element: !this.selection ? document.activeElement : this.selection.anchorNode,
      container: this.containerRef
    });

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

    const {$event} = this.anchorEvent;

    const eventX: number = unifyEvent($event).clientX;
    const eventY: number = unifyEvent($event).clientY;

    const {range} = getRange(this.containerRef);

    const selectionRect: DOMRect | undefined = range?.getBoundingClientRect();

    // Calculate the absolute position on the screen where the container should be (if it's above the selection)
    const targetAbsoluteX: number = selectionRect
      ? selectionRect.x + selectionRect.width / 2
      : eventX;
    const targetAbsoluteY: number = selectionRect ? selectionRect.y : eventY;

    const {x, y}: DOMRect = this.el.shadowRoot.host.getBoundingClientRect();

    // calculate the relative position between the containers
    const relativeX: number = targetAbsoluteX - x;
    const relativeY: number = targetAbsoluteY - y;

    const position: 'above' | 'under' = eventY > 100 ? 'above' : 'under';

    // TODO: this maybe not always be the case that the whole window size could be used for overlay
    const {innerWidth} = window;

    const topOffset = 16;
    const top: number =
      position === 'above' ? relativeY - topOffset : relativeY + (selectionRect?.height || 0) + 8;

    const safeAreaMarginX: number = 32;

    // Limit overflow right
    const overflowLeft: boolean = this.tools.offsetWidth / 2 + safeAreaMarginX > relativeX;

    const fixedLeft: number = (selectionRect?.left || eventX) - 40;

    const overflowRight: boolean =
      innerWidth > 0 && fixedLeft > innerWidth - (this.tools.offsetWidth / 2 + safeAreaMarginX);

    const left = overflowRight
      ? `${innerWidth - x - this.tools.offsetWidth - safeAreaMarginX}px`
      : overflowLeft
      ? `${safeAreaMarginX}px`
      : `${relativeX}px`;
    const right = `auto`;

    // To set the position of the tools
    this.toolsPosition = {
      top,
      left,
      right,
      position,
      align: overflowRight ? 'end' : overflowLeft ? 'start' : 'center',
      anchorLeft: overflowLeft
        ? relativeX - safeAreaMarginX
        : overflowRight
        ? relativeX - (innerWidth - safeAreaMarginX - this.tools.offsetWidth)
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
    if (!node || node instanceof ShadowRoot) {
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
    this.selectionParagraph = null;

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
      removeLink(this.containerRef);
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

    if (!this.selectionParagraph) {
      return;
    }

    this.styleDidChange.emit(toHTMLElement(this.selectionParagraph));
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
      <div
        class={classNames}
        ref={(el) => (this.tools = el as HTMLDivElement)}
        style={style}
        onClick={($event) => $event.stopPropagation()}
        onMouseDown={($event) => this.onContainerClick($event)}
        onTouchStart={($event) => this.onContainerClick($event)}>
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
          onLinkModified={($event: CustomEvent<boolean>) => this.reset($event.detail)}
          onClose={() => this.reset(false)}></stylo-toolbar-link>
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
          onExecCommand={this.onExecCommand}
          onClose={() => this.reset(false)}></stylo-toolbar-color>
      );
    }

    if (this.toolbarActions === ToolbarActions.ALIGNMENT) {
      return (
        <stylo-toolbar-align
          containerRef={this.containerRef}
          anchorEvent={this.anchorEvent.$event}
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
