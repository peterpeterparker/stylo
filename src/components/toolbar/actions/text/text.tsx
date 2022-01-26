import {isMobile} from '@deckdeckgo/utils';
import {Component, Event, EventEmitter, h, Host, Prop} from '@stencil/core';
import {ExecCommandAction} from '../../../../types/execcommand';

@Component({
  tag: 'stylo-toolbar-text',
  styleUrl: 'text.scss',
  shadow: true
})
export class Text {
  @Prop()
  disabledTitle: boolean = false;

  @Prop()
  bold: boolean;

  @Prop()
  italic: boolean;

  @Prop()
  underline: boolean;

  @Prop()
  strikethrough: boolean;

  @Event()
  private execCommand: EventEmitter<ExecCommandAction>;

  private mobile: boolean = isMobile();

  private styleBold($event: UIEvent) {
    $event.stopPropagation();

    this.execCommand.emit({
      cmd: 'style',
      detail: {
        style: 'font-weight',
        value: 'bold',
        initial: (element: HTMLElement | null) => element && element.style['font-weight'] === 'bold'
      }
    });
  }

  private styleItalic($event: UIEvent) {
    $event.stopPropagation();

    this.execCommand.emit({
      cmd: 'style',
      detail: {
        style: 'font-style',
        value: 'italic',
        initial: (element: HTMLElement | null) =>
          element && element.style['font-style'] === 'italic'
      }
    });
  }

  private styleUnderline($event: UIEvent) {
    $event.stopPropagation();

    this.execCommand.emit({
      cmd: 'style',
      detail: {
        style: 'text-decoration',
        value: 'underline',
        initial: (element: HTMLElement | null) =>
          element && element.style['text-decoration'] === 'underline'
      }
    });
  }

  private styleStrikeThrough($event: UIEvent) {
    $event.stopPropagation();

    this.execCommand.emit({
      cmd: 'style',
      detail: {
        style: 'text-decoration',
        value: 'line-through',
        initial: (element: HTMLElement | null) =>
          element && element.style['text-decoration'] === 'line-through'
      }
    });
  }

  render() {
    const cssClass = this.mobile ? 'tools-mobile' : undefined;

    return (
      <Host class={cssClass}>
        <stylo-toolbar-button
          onAction={($event: CustomEvent<UIEvent>) => this.styleBold($event.detail)}
          disableAction={this.disabledTitle}
          cssClass={this.bold ? 'active' : undefined}
          class="bold"
        >
          <span>B</span>
        </stylo-toolbar-button>
        <stylo-toolbar-button
          onAction={($event: CustomEvent<UIEvent>) => this.styleItalic($event.detail)}
          cssClass={this.italic ? 'active' : undefined}
          class="italic"
        >
          <span>I</span>
        </stylo-toolbar-button>
        <stylo-toolbar-button
          onAction={($event: CustomEvent<UIEvent>) => this.styleUnderline($event.detail)}
          cssClass={this.underline ? 'active' : undefined}
          class={this.underline ? 'active underline' : 'underline'}
        >
          <span>U</span>
        </stylo-toolbar-button>
        <stylo-toolbar-button
          onAction={($event: CustomEvent<UIEvent>) => this.styleStrikeThrough($event.detail)}
          cssClass={this.strikethrough ? 'active' : undefined}
          class="strikethrough"
        >
          <span style={{'text-decoration': 'line-through'}}>S</span>
        </stylo-toolbar-button>
      </Host>
    );
  }
}
