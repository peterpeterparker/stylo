import {isMobile} from '@deckdeckgo/utils';
import {Component, Event, EventEmitter, h, Host, Prop} from '@stencil/core';
import {ExecCommandAction} from '../../../../types/execcommand';
import {ToolbarFontSize} from '../../../../types/toolbar';

@Component({
  tag: 'stylo-toolbar-font-size',
  styleUrl: 'font-size.scss',
  shadow: true
})
export class FontSize {
  @Prop()
  fontSize: ToolbarFontSize;

  @Event()
  private execCommand: EventEmitter<ExecCommandAction>;

  private mobile: boolean = isMobile();

  private modifyFontSize($event: UIEvent, size: ToolbarFontSize) {
    $event.stopPropagation();

    const value: string = Object.keys(ToolbarFontSize).find((key) => ToolbarFontSize[key] === size);

    this.execCommand.emit({
      cmd: 'style',
      detail: {
        style: 'font-size',
        value: value.toLowerCase().replace('_', '-'),
        initial: (element: HTMLElement | null) =>
          element && element.style['font-size'] === value.toLowerCase().replace('_', '-')
      }
    });
  }

  render() {
    return (
      <Host class={this.mobile ? 'tools-sticky' : undefined}>
        {this.renderAction(ToolbarFontSize.X_SMALL)}
        {this.renderAction(ToolbarFontSize.SMALL)}
        {this.renderAction(ToolbarFontSize.MEDIUM)}
        {this.renderAction(ToolbarFontSize.LARGE)}
        {this.renderAction(ToolbarFontSize.X_LARGE)}
        {this.renderAction(ToolbarFontSize.XX_LARGE)}
        {this.renderAction(ToolbarFontSize.XXX_LARGE)}
      </Host>
    );
  }

  private renderAction(size: ToolbarFontSize) {
    return (
      <stylo-toolbar-button
        onAction={($event: CustomEvent<UIEvent>) => this.modifyFontSize($event.detail, size)}
        class={this.fontSize === size ? 'active' : undefined}
      >
        <span>{size.toString()}</span>
      </stylo-toolbar-button>
    );
  }
}
