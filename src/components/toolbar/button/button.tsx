import {isMobile} from '@deckdeckgo/utils';
import {Component, Event, EventEmitter, h, Host, Prop} from '@stencil/core';

@Component({
  tag: 'stylo-toolbar-button',
  styleUrl: 'button.scss',
  shadow: true
})
export class Button {
  @Prop()
  disableAction: boolean = false;

  @Prop()
  cssClass: string;

  @Event()
  action: EventEmitter<UIEvent>;

  private mobile: boolean = isMobile();

  render() {
    const cssClass = this.mobile ? 'mobile' : undefined;

    return (
      <Host class={cssClass}>
        <button
          onMouseDown={($event) => $event.stopPropagation()}
          onTouchStart={($event) => $event.stopPropagation()}
          onClick={($event: UIEvent) => this.action.emit($event)}
          disabled={this.disableAction}
          class={this.cssClass}
        >
          <slot></slot>
        </button>
      </Host>
    );
  }
}
