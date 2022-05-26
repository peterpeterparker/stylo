import {debounce, hexToRgb, rgbToHex} from '@deckdeckgo/utils';
import {Component, Event, EventEmitter, h, Host, Prop, State, Watch} from '@stencil/core';
import {StyloPaletteColor} from '../../../types/palette';

@Component({
  tag: 'stylo-color-input',
  styleUrl: 'input.scss',
  shadow: true
})
export class Input {
  @Prop()
  colorHex: string;

  @Prop()
  colorRgb: string;

  @Prop()
  customColorRgb: string;

  @Prop()
  inputAlt: string;

  @State()
  private color: string;

  @Event()
  selectHexColor: EventEmitter<StyloPaletteColor>;

  private readonly debounceSelectColor: (inputColor: string) => void = debounce(
    (inputColor: string) => this.emitColor(inputColor),
    500
  );

  async componentWillLoad() {
    this.color = this.initColorHex();
  }

  @Watch('colorHex')
  @Watch('colorRgb')
  @Watch('customColorRgb')
  async watchColors() {
    this.color = this.initColorHex();
  }

  private initColorHex(): string {
    if (this.colorHex) {
      return this.colorHex;
    }

    if (this.customColorRgb) {
      return rgbToHex(this.customColorRgb);
    }

    return rgbToHex(this.colorRgb);
  }

  private emitColor(inputColor: string) {
    const hex: string = `#${inputColor.replace('#', '')}`;

    const rgb: string | undefined = hexToRgb(hex);

    if (!rgb) {
      return;
    }

    this.selectHexColor.emit({
      hex,
      rgb
    });
  }

  render() {
    return (
      <Host>
        <span>#</span>
        <input
          type="text"
          name="color-picker"
          aria-label={this.inputAlt}
          onInput={($event: UIEvent) =>
            this.debounceSelectColor(($event.target as InputTargetEvent).value)
          }
          value={this.color?.replace('#', '')}
        />
      </Host>
    );
  }
}
