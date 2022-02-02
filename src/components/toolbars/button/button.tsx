import {Component, Event, EventEmitter, h, Prop} from '@stencil/core';

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

  @Prop()
  label: string;

  @Event()
  action: EventEmitter<UIEvent>;

  render() {
    return (
      <button
        onMouseDown={($event) => $event.stopPropagation()}
        onTouchStart={($event) => $event.stopPropagation()}
        onClick={($event: UIEvent) => this.action.emit($event)}
        disabled={this.disableAction}
        class={this.cssClass}
        aria-label={this.label}>
        <slot></slot>
      </button>
    );
  }
}
