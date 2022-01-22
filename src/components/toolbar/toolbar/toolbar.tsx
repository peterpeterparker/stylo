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
  Fragment,
  h,
  Host,
  Prop,
  State,
  Watch
} from '@stencil/core';
import configStore from '../../../stores/config.store';
import {ExecCommandAction} from '../../../types/execcommand';
import {
  StyloToolbar,
  ToolbarAction,
  ToolbarActions,
  ToolbarAlign,
  ToolbarAnchorLink,
  ToolbarFontSize,
  ToolbarList
} from '../../../types/toolbar';
import {execCommand} from '../../../utils/execcommand.utils';
import {execCommandNative} from '../../../utils/execcommnad-native.utils';
import {toHTMLElement} from '../../../utils/node.utils';
import {findParagraph, isParagraph} from '../../../utils/paragraph.utils';
import {
  getBold,
  getContentAlignment,
  getFontSize,
  getItalic,
  getList,
  getStrikeThrough,
  getUnderline,
  isAnchorImage
} from '../../../utils/toolbar.utils';
import {IconAlignCenter} from '../../icons/align-center';
import {IconAlignLeft} from '../../icons/align-left';
import {IconAlignRight} from '../../icons/align-right';
import {IconColor} from '../../icons/color';
import {IconLink} from '../../icons/link';
import {IconOl} from '../../icons/ol';
import {IconPalette} from '../../icons/palette';
import {IconUl} from '../../icons/ul';

/**
 * @slot - related to the customActions property
 */
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
  config: Partial<StyloToolbar> | undefined;

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

  private debounceDisplayToolsActivated: () => void = debounce(() => {
    this.displayToolsActivated = true;
    this.toolbarActivated.emit(true);
  });

  private selection: Selection = null;

  private anchorLink: ToolbarAnchorLink = null;
  private anchorEvent: MouseEvent | TouchEvent | undefined;

  @State()
  private link: boolean = false;

  @State()
  private toolbarActions: ToolbarActions = ToolbarActions.SELECTION;

  @Event()
  toolbarActivated: EventEmitter<boolean>;

  /**
   * Triggered when an image is manipulated. Note: the event won't provide directly the image but rather its container element
   */
  @Event()
  imgDidChange: EventEmitter<HTMLElement>;

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

  private iOSTimerScroll: number;

  /**
   * Triggered when a custom action is selected. Its detail provide an action name, the Selection and an anchorLink
   */
  @Event()
  customAction: EventEmitter<ToolbarAction>;

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
  private mobile: boolean = isMobile();

  private unsubscribe: () => void | undefined;

  constructor() {
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
  }

  componentWillLoad() {
    this.initDefaultContentAlign();

    this.unsubscribe = configStore.onChange('toolbar', ({globalEvents}: StyloToolbar) =>
      this.onGlobalEventsChange(globalEvents)
    );

    this.applyStandaloneConfig();
  }

  connectedCallback() {
    this.attachSelectionChangeHandler();
    this.attachListener();
  }

  disconnectedCallback() {
    this.detachSelectionChangeHandler();
    this.detachListener();

    this.unsubscribe?.();
  }

  private onGlobalEventsChange(changedValue: boolean) {
    if (changedValue) {
      this.attachSelectionChangeHandler();
    } else {
      this.detachSelectionChangeHandler();
    }
  }

  @Watch('containerRef')
  onContainerRef() {
    if (!this.containerRef) {
      return;
    }

    this.detachListener();
    this.attachListener();
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

  private attachSelectionChangeHandler() {
    if (!configStore.state.toolbar.globalEvents) {
      return;
    }

    document.addEventListener('selectionchange', this.handleSelectionChange, {
      passive: true
    });
  }

  private detachSelectionChangeHandler() {
    if (configStore.state.toolbar.globalEvents) {
      return;
    }

    document.removeEventListener('selectionchange', this.handleSelectionChange);
  }

  private attachListener() {
    const listenerElement: HTMLElement | Document = this.containerRef || document;
    listenerElement?.addEventListener('mousedown', this.startSelection, {passive: true});
    listenerElement?.addEventListener('touchstart', this.startSelection, {passive: true});
    document.addEventListener('resize', () => this.reset(true));
  }

  private detachListener() {
    const listenerElement: HTMLElement | Document = this.containerRef || document;

    listenerElement?.removeEventListener('mousedown', this.startSelection);
    listenerElement?.removeEventListener('touchstart', this.startSelection);
    document.removeEventListener('resize', () => this.reset(true));
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

    if (this.toolbarActions !== ToolbarActions.IMAGE) {
      this.anchorEvent = $event;
    }

    if (this.toolsActivated) {
      this.resetImageToolbarActions($event);

      return;
    }

    if (this.toolbarActions === ToolbarActions.IMAGE) {
      this.anchorEvent = $event;
    }

    this.displayImageActions($event);
  };

  private resetImageToolbarActions($event: MouseEvent | TouchEvent) {
    if (this.toolbarActions !== ToolbarActions.IMAGE) {
      return;
    }

    if ($event && $event.target && $event.target instanceof HTMLElement) {
      const target: HTMLElement = toHTMLElement($event.target);

      if (target && target.nodeName && target.nodeName.toLowerCase() !== 'stylo-toolbar') {
        this.reset(false);
      }
    }
  }

  private displayImageActions($event: MouseEvent | TouchEvent) {
    if (!configStore.state.toolbar.actions.img) {
      return;
    }

    const isAnchorImg: boolean = this.isAnchorImage();
    if (!isAnchorImg) {
      return;
    }

    $event.stopImmediatePropagation();

    this.reset(true);

    setTimeout(
      () => {
        this.activateToolbarImage();
        this.setToolbarAnchorPosition();
      },
      this.mobile ? 300 : 100
    );
  }

  private activateToolbarImage() {
    this.toolbarActions = ToolbarActions.IMAGE;

    this.setToolsActivated(true);
  }

  private isAnchorImage() {
    return isAnchorImage(this.anchorEvent, configStore.state.toolbar.actions.img?.anchor);
  }

  private handleSelectionChange(_$event: UIEvent) {
    if (
      this.toolbarActions === ToolbarActions.COLOR ||
      this.toolbarActions === ToolbarActions.BACKGROUND_COLOR ||
      this.toolbarActions === ToolbarActions.LINK
    ) {
      return;
    }

    const anchorImage: boolean = this.isAnchorImage();
    if (this.toolbarActions === ToolbarActions.IMAGE && anchorImage) {
      this.reset(false);
      return;
    }

    this.displayTools();
  }

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

    if (this.toolsActivated) {
      this.selection = selection;

      if (selection.rangeCount > 0) {
        const range: Range = selection.getRangeAt(0);
        this.anchorLink = {
          range: range,
          text: selection.toString(),
          element: document.activeElement
        };

        this.setToolbarAnchorPosition();
      }
    }
  }

  private setToolbarAnchorPosition() {
    if (this.mobile) {
      this.handlePositionIOS();

      return;
    }

    if (this.tools) {
      const selection: Selection | null = getSelection();
      const range: Range | undefined = selection?.getRangeAt(0);
      const rect: DOMRect | undefined = range?.getBoundingClientRect();

      const containerRect: DOMRect | undefined = this.containerRef?.getBoundingClientRect();

      const eventX: number = unifyEvent(this.anchorEvent).clientX;
      const eventY: number = unifyEvent(this.anchorEvent).clientY;

      const x: number =
        rect && containerRect
          ? rect.left - containerRect.left + this.containerRef.offsetLeft + rect.width / 2
          : eventX;
      const y: number =
        rect && containerRect ? rect.top - containerRect.top + this.containerRef.offsetTop : eventY;

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
  }

  private handlePositionIOS() {
    if (!isIOS() || !this.anchorEvent) {
      return;
    }

    this.setStickyPositionIOS();
  }

  private setStickyPositionIOS() {
    if (!isIOS() || !window) {
      return;
    }

    if (this.iOSTimerScroll > 0) {
      clearTimeout(this.iOSTimerScroll);
    }

    this.iOSTimerScroll = window.setTimeout(() => {
      this.el.style.setProperty('--stylo-toolbar-sticky-scroll', `${window.scrollY}px`);
    }, 50);
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

  // TODO: Find a clever way to detect to root container
  // We iterate until we find the root container to detect if bold, underline or italic are active
  private findStyle(node: Node) {
    if (!node) {
      return;
    }

    // Just in case
    if (node.nodeName.toUpperCase() === 'HTML' || node.nodeName.toUpperCase() === 'BODY') {
      return;
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
    } else {
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

      this.findStyle(node.parentNode);

      if (this.fontSize === undefined) {
        this.fontSize = getFontSize(toHTMLElement(node));
      }
    }
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

    this.toolbarActions = ToolbarActions.SELECTION;
    this.anchorLink = null;
    this.link = false;

    if (window) {
      window.removeEventListener('scroll', () => {
        this.setStickyPositionIOS();
      });
      window.removeEventListener('resize', () => {
        this.reset(true, true);
      });
    }

    if (
      blurActiveElement &&
      document &&
      document.activeElement &&
      document.activeElement instanceof HTMLElement
    ) {
      document.activeElement.blur();
    }
  }

  private toggleLink() {
    if (this.link) {
      this.removeLink();
      this.reset(true);
    } else {
      this.openLink();
    }
  }

  private removeLink() {
    if (!this.selection) {
      return;
    }

    let content: Node = this.selection.anchorNode;

    if (!content || !content.parentElement) {
      return;
    }

    if (content.nodeType === 3) {
      content = content.parentElement;
    }

    if (!content.nodeName && content.nodeName.toLowerCase() !== 'a') {
      return;
    }

    content.parentElement.insertBefore(document.createTextNode(content.textContent), content);
    content.parentElement.removeChild(content);
  }

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

  private openColorPicker(action: ToolbarActions.COLOR | ToolbarActions.BACKGROUND_COLOR) {
    this.toolbarActions = action;
  }

  private openAlignmentActions() {
    this.toolbarActions = ToolbarActions.ALIGNMENT;
  }

  private openFontSizeActions() {
    this.toolbarActions = ToolbarActions.FONT_SIZE;
  }

  private openListActions() {
    this.toolbarActions = ToolbarActions.LIST;
  }

  private onCustomAction($event: UIEvent, action: string) {
    $event.stopPropagation();

    this.customAction.emit({
      action: action,
      selection: this.selection,
      anchorLink: this.anchorLink
    });
  }

  private onExecCommand($event: CustomEvent<ExecCommandAction>) {
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
  }

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
    let classNames: string = this.displayToolsActivated
      ? this.mobile
        ? 'tools tools-activated tools-mobile'
        : 'tools tools-activated'
      : this.mobile
      ? 'tools tools-mobile'
      : 'tools';

    if (this.mobile) {
      classNames += ' tools-sticky';
    }

    const hostClass = isIOS() ? 'tools-ios' : undefined;

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
      <Host class={hostClass}>
        <div class={classNames} ref={(el) => (this.tools = el as HTMLDivElement)} style={style}>
          <stylo-toolbar-triangle
            class={position === 'above' ? 'bottom' : 'top'}
            style={{
              '--stylo-toolbar-triangle-start': `${this.toolsPosition?.anchorLeft}px`
            }}
          ></stylo-toolbar-triangle>
          {this.renderActions()}
        </div>
      </Host>
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
        ></stylo-toolbar-link>
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
          onExecCommand={($event: CustomEvent<ExecCommandAction>) => this.onExecCommand($event)}
        ></stylo-toolbar-color>
      );
    }

    if (this.toolbarActions === ToolbarActions.IMAGE) {
      return (
        <stylo-toolbar-image
          containerRef={this.containerRef}
          anchorEvent={this.anchorEvent}
          imgDidChange={this.imgDidChange}
          onImgModified={() => this.reset(true)}
        ></stylo-toolbar-image>
      );
    }

    if (this.toolbarActions === ToolbarActions.ALIGNMENT) {
      return (
        <stylo-toolbar-align
          containerRef={this.containerRef}
          anchorEvent={this.anchorEvent}
          align={this.align}
          onAlignModified={() => this.reset(true)}
        ></stylo-toolbar-align>
      );
    }

    if (this.toolbarActions === ToolbarActions.LIST) {
      return (
        <stylo-toolbar-list
          disabledTitle={this.disabledTitle}
          list={this.list}
          onExecCommand={($event: CustomEvent<ExecCommandAction>) => this.onExecCommand($event)}
        ></stylo-toolbar-list>
      );
    }

    if (this.toolbarActions === ToolbarActions.FONT_SIZE) {
      return (
        <stylo-toolbar-font-size
          fontSize={this.fontSize}
          onExecCommand={($event: CustomEvent<ExecCommandAction>) => this.onExecCommand($event)}
        ></stylo-toolbar-font-size>
      );
    }

    return this.renderSelectionActions();
  }

  private renderSelectionActions() {
    return (
      <Fragment>
        <stylo-toolbar-style
          disabledTitle={this.disabledTitle}
          bold={this.bold === 'bold'}
          italic={this.italic === 'italic'}
          underline={this.underline === 'underline'}
          strikethrough={this.strikethrough === 'strikethrough'}
          onExecCommand={($event: CustomEvent<ExecCommandAction>) => this.onExecCommand($event)}
        ></stylo-toolbar-style>

        {this.renderSeparator()}

        {this.renderFontSizeAction()}

        {this.renderColorActions()}

        {this.renderSeparator()}

        {this.renderAlignAction()}

        {this.renderListAction()}

        {this.renderLinkSeparator()}

        <stylo-toolbar-button
          onAction={() => this.toggleLink()}
          cssClass={this.link ? 'active' : undefined}
        >
          <IconLink></IconLink>
        </stylo-toolbar-button>

        {this.renderCustomActions()}
      </Fragment>
    );
  }

  private renderColorActions() {
    const result = [
      <stylo-toolbar-button onAction={() => this.openColorPicker(ToolbarActions.COLOR)}>
        <IconPalette></IconPalette>
      </stylo-toolbar-button>
    ];

    if (configStore.state.toolbar.actions.backgroundColor) {
      result.push(
        <stylo-toolbar-button
          onAction={() => this.openColorPicker(ToolbarActions.BACKGROUND_COLOR)}
        >
          <IconColor></IconColor>
        </stylo-toolbar-button>
      );
    }

    return result;
  }

  private renderSeparator() {
    return <stylo-toolbar-separator></stylo-toolbar-separator>;
  }

  private renderLinkSeparator() {
    if (!this.list && !this.align) {
      return undefined;
    }

    return this.renderSeparator();
  }

  private renderCustomActions() {
    return configStore.state.toolbar.actions.customActions
      ? configStore.state.toolbar.actions.customActions
          .split(',')
          .map((customAction: string) => this.renderCustomAction(customAction))
      : undefined;
  }

  private renderCustomAction(customAction: string) {
    return (
      <Fragment>
        {this.renderSeparator()}
        <stylo-toolbar-button
          onClick={($event: UIEvent) => this.onCustomAction($event, customAction)}
        >
          <slot name={customAction}></slot>
        </stylo-toolbar-button>
      </Fragment>
    );
  }

  private renderListAction() {
    if (!this.list) {
      return undefined;
    }

    return (
      <stylo-toolbar-button onAction={() => this.openListActions()}>
        {this.list === ToolbarList.UNORDERED ? <IconUl></IconUl> : <IconOl></IconOl>}
      </stylo-toolbar-button>
    );
  }

  private renderAlignAction() {
    if (!this.align) {
      return undefined;
    }

    return (
      <stylo-toolbar-button onAction={() => this.openAlignmentActions()}>
        {this.align === ToolbarAlign.LEFT ? (
          <IconAlignLeft></IconAlignLeft>
        ) : this.align === ToolbarAlign.CENTER ? (
          <IconAlignCenter></IconAlignCenter>
        ) : (
          <IconAlignRight></IconAlignRight>
        )}
      </stylo-toolbar-button>
    );
  }

  private renderFontSizeAction() {
    if (!this.fontSize) {
      return undefined;
    }

    return (
      <Fragment>
        <stylo-toolbar-button onAction={() => this.openFontSizeActions()}>
          <span>
            A<small>A</small>
          </span>
        </stylo-toolbar-button>

        {this.renderSeparator()}
      </Fragment>
    );
  }
}
