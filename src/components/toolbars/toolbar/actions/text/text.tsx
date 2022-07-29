import {Component, Event, EventEmitter, h, Host, Prop} from '@stencil/core';
import i18n from '../../../../../stores/i18n.store';
import {ExecCommandAction} from '../../../../../types/execcommand';
import {
  actionBold,
  actionItalic,
  actionStrikeThrough,
  actionUnderline
} from '../../../../../utils/execcomand-text.utils';

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

  private styleBold($event: UIEvent) {
    $event.stopPropagation();

    this.execCommand.emit(actionBold);
  }

  private styleItalic($event: UIEvent) {
    $event.stopPropagation();

    this.execCommand.emit(actionItalic);
  }

  private styleUnderline($event: UIEvent) {
    $event.stopPropagation();

    this.execCommand.emit(actionUnderline);
  }

  private styleStrikeThrough($event: UIEvent) {
    $event.stopPropagation();

    this.execCommand.emit(actionStrikeThrough);
  }

  render() {
    return (
      <Host>
        <stylo-toolbar-button
          label={i18n.state.toolbar.bold}
          onAction={($event: CustomEvent<UIEvent>) => this.styleBold($event.detail)}
          disableAction={this.disabledTitle}
          cssClass={this.bold ? 'active' : undefined}
          class="bold">
          <span>B</span>
        </stylo-toolbar-button>
        <stylo-toolbar-button
          label={i18n.state.toolbar.italic}
          onAction={($event: CustomEvent<UIEvent>) => this.styleItalic($event.detail)}
          cssClass={this.italic ? 'active' : undefined}
          class="italic">
          <span>I</span>
        </stylo-toolbar-button>
        <stylo-toolbar-button
          label={i18n.state.toolbar.underline}
          onAction={($event: CustomEvent<UIEvent>) => this.styleUnderline($event.detail)}
          cssClass={this.underline ? 'active' : undefined}
          class={this.underline ? 'active underline' : 'underline'}>
          <span>U</span>
        </stylo-toolbar-button>
        <stylo-toolbar-button
          label={i18n.state.toolbar.strikethrough}
          onAction={($event: CustomEvent<UIEvent>) => this.styleStrikeThrough($event.detail)}
          cssClass={this.strikethrough ? 'active' : undefined}
          class="strikethrough">
          <span style={{'text-decoration': 'line-through'}}>S</span>
        </stylo-toolbar-button>
      </Host>
    );
  }
}
