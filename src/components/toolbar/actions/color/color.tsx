import {getAnchorElement, getSelection, hexToRgb, isMobile} from '@deckdeckgo/utils';
import {Component, Event, EventEmitter, h, Host, Prop, State} from '@stencil/core';
import configStore from '../../../../stores/config.store';
import {ExecCommandAction} from '../../../../types/execcommand';
import {toHTMLElement} from '../../../../utils/node.utils';
import {findStyleNode} from '../../../../utils/toolbar.utils';

@Component({
  tag: 'stylo-toolbar-color',
  styleUrl: 'color.scss',
  shadow: true
})
export class Color {
  @Prop()
  action: 'color' | 'background-color';

  @Prop()
  containerRef: HTMLElement | undefined;

  @State()
  private colorRgb: string | undefined;

  @Event()
  private execCommand: EventEmitter<ExecCommandAction>;

  private range: Range | undefined;

  private mobile: boolean = isMobile();

  componentWillLoad() {
    this.initColor();
  }

  private initColor() {
    const selection: Selection | null = getSelection();
    this.range = selection?.getRangeAt(0);

    const anchor: HTMLElement | null = getAnchorElement(selection);

    if (!anchor) {
      return;
    }

    const style: Node | null = findStyleNode(
      anchor,
      this.action === 'color' ? 'color' : 'background-color',
      this.containerRef
    );

    if (!style) {
      return;
    }

    const css: CSSStyleDeclaration = window?.getComputedStyle(toHTMLElement(style));

    this.colorRgb = (this.action === 'color' ? css.color : css.backgroundColor)
      .replace('rgb(', '')
      .replace(')', '');
  }

  private selectColor($event: CustomEvent) {
    const selection: Selection | undefined = getSelection();

    if (!selection || !$event || !$event.detail) {
      return;
    }

    if (!this.action) {
      return;
    }

    selection?.removeAllRanges();
    selection?.addRange(this.range);

    const observer: MutationObserver = new MutationObserver((_mutations: MutationRecord[]) => {
      observer.disconnect();

      // No node were added so the style was modified
      this.range = selection?.getRangeAt(0);
    });

    const anchorNode: HTMLElement | null = getAnchorElement(selection);

    if (!anchorNode) {
      return;
    }

    observer.observe(anchorNode, {childList: true});

    this.execCommand.emit({
      cmd: 'style',
      detail: {
        style: this.action,
        value: $event.detail.hex,
        initial: (element: HTMLElement | null) => {
          const rgb: string = hexToRgb($event.detail.hex);
          return (
            element &&
            (element.style[this.action] === $event.detail.hex ||
              element.style[this.action] === `rgb(${rgb})`)
          );
        }
      }
    });
  }

  render() {
    const cssClass = this.mobile ? 'tools-mobile' : undefined;

    return (
      <Host class={cssClass}>
        <stylo-color
          color-rgb={this.colorRgb}
          onColorChange={($event: CustomEvent) => this.selectColor($event)}
          palette={configStore.state.toolbar.palette}
        ></stylo-color>
      </Host>
    );
  }
}
