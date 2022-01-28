import {debounce, hexToRgb} from '@deckdeckgo/utils';
import {Component, Element, Event, EventEmitter, h, Host, Prop, State, Watch} from '@stencil/core';
import {DEFAULT_PALETTE, StyloPalette, StyloPaletteColor} from '../../../types/palette';

@Component({
  tag: 'stylo-color',
  styleUrl: 'color.scss',
  shadow: true
})
export class Color {
  @Element() el: HTMLElement;

  /**
   * The palette of color.
   */
  @Prop({mutable: true})
  palette: StyloPalette[] = DEFAULT_PALETTE;

  /**
   * An accessibility label for the color input field
   */
  @Prop() inputAlt: string = 'Input a color (hex)';

  /**
   * The current selected color provided as hexadecimal value
   */
  @Prop() colorHex: string;
  /**
   * The current selected color provided as a rgb value (without "rgb()", only value such as for example 255, 67, 54)
   */
  @Prop() colorRgb: string;

  @State()
  private selectedColorHex: string;

  @State()
  private selectedColorRgb: string;

  @State()
  private selectedColorPalette: boolean = false;

  @State()
  private selectedCustomColorRgb: string;

  /**
   * Emit the selected color
   */
  @Event()
  colorChange: EventEmitter<StyloPaletteColor>;

  private readonly debounceInitSelectedColorPalette: () => void = debounce(() => {
    this.selectedColorPalette = this.initSelectedColorPalette();

    this.selectedCustomColorRgb = !this.selectedColorPalette ? this.selectedColorRgb : undefined;
  }, 150);

  componentWillLoad() {
    this.selectedColorHex = this.colorHex;
    this.selectedColorRgb = this.colorRgb ? this.colorRgb : hexToRgb(this.colorHex);

    this.selectedColorPalette = this.initSelectedColorPalette();

    if (!this.selectedColorPalette) {
      this.selectedCustomColorRgb = this.selectedColorRgb;
    }
  }

  @Watch('colorHex')
  async onColorHexChange() {
    this.applyColorHexChange(this.colorHex, undefined);
  }

  private applyColorHexChange(colorHex: string, colorRgb: string | undefined) {
    this.selectedColorHex = colorHex;
    this.selectedColorRgb = colorRgb;

    this.debounceInitSelectedColorPalette();

    // Render component again
    this.palette = [...this.palette];
  }

  @Watch('colorRgb')
  async onColorRgbChange() {
    this.selectedColorHex = undefined;
    this.selectedColorRgb = this.colorRgb;

    this.debounceInitSelectedColorPalette();

    // Render component again
    this.palette = [...this.palette];
  }

  private pickColor(paletteColor: StyloPalette) {
    if (!this.palette || this.palette.length <= 0) {
      return;
    }

    this.selectedColorHex = paletteColor.color ? paletteColor.color.hex : undefined;
    this.selectedColorRgb = paletteColor.color ? paletteColor.color.rgb : undefined;

    this.colorChange.emit(paletteColor.color);

    this.selectedColorPalette = true;

    this.selectedCustomColorRgb = undefined;
  }

  private selectColor = ($event: CustomEvent<StyloPaletteColor>) => {
    const color = $event.detail;

    this.applyColorHexChange(color.hex, color.rgb);

    this.colorChange.emit(color);
  };

  private isHexColorSelected(element: StyloPalette): boolean {
    if (!element || !element.color || !element.color.hex) {
      return false;
    }

    if (!this.selectedColorHex) {
      return false;
    }

    return this.selectedColorHex.toUpperCase() === element.color.hex.toUpperCase();
  }

  private isRgbColorSelected(element: StyloPalette): boolean {
    if (!element || !element.color || !element.color.rgb) {
      return false;
    }

    if (!this.selectedColorRgb) {
      return false;
    }

    return (
      this.selectedColorRgb.replace(/\s/g, '').toUpperCase() ===
      element.color.rgb.replace(/\s/g, '').toUpperCase()
    );
  }

  private initSelectedColorPalette(): boolean {
    if (!this.palette || this.palette.length <= 0) {
      return false;
    }

    const index: number = this.palette.findIndex((element: StyloPalette) => {
      return this.isHexColorSelected(element) || this.isRgbColorSelected(element);
    });

    return index > -1;
  }

  render() {
    return (
      <Host>
        {this.renderPalette()}
        {this.renderInput()}
      </Host>
    );
  }

  private renderPalette() {
    if (this.palette && this.palette.length > 0) {
      return this.palette.map((element: StyloPalette) => {
        const style = {
          '--stylo-palette-color-hex': `${element.color.hex}`,
          '--stylo-palette-color-rgb': `${element.color.rgb}`
        };

        if (element.display) {
          style['--stylo-palette-border-color'] = element.display.borderColor;
          style['--stylo-palette-box-shadow-color'] = element.display.boxShadowColor;
        }

        return (
          <button
            aria-label={element.alt}
            class={
              this.isHexColorSelected(element) || this.isRgbColorSelected(element)
                ? 'selected'
                : undefined
            }
            style={style}
            onClick={() => this.pickColor(element)}></button>
        );
      });
    } else {
      return undefined;
    }
  }

  private renderInput() {
    return (
      <stylo-color-input
        colorHex={this.selectedColorHex}
        colorRgb={this.selectedColorRgb}
        customColorRgb={this.selectedCustomColorRgb}
        inputAlt={this.inputAlt}
        onSelectHexColor={this.selectColor}></stylo-color-input>
    );
  }
}
