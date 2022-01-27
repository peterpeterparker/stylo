import {
  Component,
  ComponentInterface,
  Event,
  EventEmitter,
  h,
  Host,
  JSX,
  Listen,
  State
} from '@stencil/core';
import configStore from '../../../stores/config.store';
import containerStore from '../../../stores/container.store';
import {StyloMenu, StyloMenuAction, StyloMenuActionEvent} from '../../../types/menu';
import {renderIcon} from '../../../utils/icon.utils';
import {toHTMLElement} from '../../../utils/node.utils';
import {findParagraph} from '../../../utils/paragraph.utils';

@Component({
  tag: 'stylo-menus',
  styleUrl: 'menus.scss',
  shadow: true
})
export class Menus implements ComponentInterface {
  @State()
  private top: number | undefined;

  @State()
  private menu: StyloMenu | undefined = undefined;

  private paragraph: HTMLElement | undefined;

  /**
   * An event triggered when user select one of the custom actions of the menus provided in your configuration
   */
  @Event()
  menuAction: EventEmitter<StyloMenuActionEvent>;

  @Listen('keydown', {target: 'document', passive: true})
  onKeyDown() {
    this.hide();
  }

  @Listen('click', {target: 'document', passive: true})
  onClick({target}: MouseEvent | TouchEvent) {
    const paragraph: Node | undefined = findParagraph({
      element: target as Node,
      container: containerStore.state.ref
    });

    this.paragraph = toHTMLElement(paragraph);

    this.menu = configStore.state.menus?.find(
      ({nodeName}: StyloMenu) => this.paragraph?.nodeName.toLowerCase() === nodeName
    );

    this.top = this.menu && this.paragraph?.offsetTop;
  }

  private selectMenuAction({message}: StyloMenuAction) {
    if (!this.paragraph) {
      this.hide();
      return;
    }

    this.menuAction.emit({paragraph: this.paragraph, message});

    this.hide();
  }

  private hide() {
    this.paragraph = undefined;
    this.menu = undefined;
    this.top = undefined;
  }

  render() {
    const style: Record<string, string> =
      this.top === undefined ? {display: 'none'} : {'--menu-top': `${this.top}px`};

    return (
      <Host style={style}>
        {this.renderMenu()}

        <stylo-toolbar-triangle
          style={{
            '--stylo-toolbar-triangle-start': `50%`
          }}></stylo-toolbar-triangle>
      </Host>
    );
  }

  private renderMenu() {
    return this.menu?.actions.map((action: StyloMenuAction) => this.renderAction(action));
  }

  private renderAction(action: StyloMenuAction) {
    const {icon: iconSrc, text} = action;

    const icon: JSX.IntrinsicElements | undefined = renderIcon(iconSrc);

    return (
      <stylo-toolbar-button onAction={() => this.selectMenuAction(action)} label={text}>
        {icon ? icon : <div class="icon" innerHTML={iconSrc}></div>}
      </stylo-toolbar-button>
    );
  }
}
