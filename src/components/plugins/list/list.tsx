import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  Fragment,
  h,
  JSX,
  Method,
  Prop,
  State,
  Watch
} from '@stencil/core';
import configStore from '../../../stores/config.store';
import i18n from '../../../stores/i18n.store';
import {StyloPlugin} from '../../../types/plugin';
import {renderIcon} from '../../../utils/icon.utils';
import {toHTMLElement} from '../../../utils/node.utils';

@Component({
  tag: 'stylo-list',
  styleUrl: 'list.scss',
  shadow: true
})
export class List implements ComponentInterface {
  @Element()
  private el: HTMLElement;

  /**
   * Emit which plugin the user want to apply.
   */
  @Event()
  applyPlugin: EventEmitter<StyloPlugin>;

  /**
   * Emit when user actually do not want to apply a plugin.
   */
  @Event()
  cancelPlugins: EventEmitter<void>;

  /**
   * @internal
   */
  @Prop()
  display: boolean = false;

  @State()
  private plugins: StyloPlugin[];

  private focusButton: HTMLElement | undefined;

  private filter: string = '';

  componentWillLoad() {
    this.plugins = [...configStore.state.plugins];
  }

  componentDidUpdate() {
    this.focusOnUpdate();
  }

  private focusOnUpdate() {
    // If only one plugin button is displayed, focus it
    const buttons: NodeListOf<HTMLButtonElement> = this.el.shadowRoot.querySelectorAll('button');

    if (buttons.length === 1) {
      buttons[0].focus();
    }
  }

  private emitPlugin($event: UIEvent, plugin: StyloPlugin) {
    $event.stopPropagation();

    this.applyPlugin.emit(plugin);
  }

  @Watch('display')
  onDisplay() {
    if (this.display) {
      document.addEventListener('keydown', this.onKeyDown);
      return;
    }

    document.removeEventListener('keydown', this.onKeyDown, false);

    this.reset();
  }

  private reset() {
    this.filter = '';
    this.plugins = [...configStore.state.plugins];
  }

  private onKeyDown = ($event: KeyboardEvent) => {
    const {code} = $event;

    if (['Enter'].includes(code)) {
      return;
    }

    $event.preventDefault();

    if (['Escape'].includes(code)) {
      this.cancelPlugins.emit();
      return;
    }

    if (['ArrowDown'].includes(code)) {
      this.focusNext();
      return;
    }

    if (['ArrowUp'].includes(code)) {
      this.focusPrevious();
      return;
    }

    this.filterPlugins($event);
  };

  @Method()
  async focusFirstButton() {
    this.focusButton = this.el.shadowRoot.querySelector('button');
    this.focusButton?.focus();
  }

  private focusNext() {
    this.focusButton = toHTMLElement(
      (this.focusButton || this.el.shadowRoot.firstElementChild)?.nextElementSibling
    );
    this.focusButton?.focus();
  }

  private focusPrevious() {
    this.focusButton = toHTMLElement(
      (this.focusButton || this.el.shadowRoot.lastElementChild)?.previousElementSibling
    );
    this.focusButton?.focus();
  }

  private filterPlugins($event: KeyboardEvent) {
    const {code, metaKey, ctrlKey, key} = $event;

    if (metaKey || ctrlKey) {
      return;
    }

    // For example Space or ArrowUp
    if (key.length > 1 && !['Backspace'].includes(code)) {
      return;
    }

    this.filter =
      code === 'Backspace'
        ? this.filter.length > 0
          ? this.filter.slice(0, -1)
          : this.filter
        : `${this.filter}${key}`;

    this.plugins = [...configStore.state.plugins].filter(({text}: StyloPlugin) => {
      const label: string = i18n.state.plugins[text] ?? i18n.state.custom[text] ?? text;

      return label.toLowerCase().indexOf(this.filter.toLowerCase()) > -1;
    });
  }

  render() {
    return (
      <Fragment>
        {this.plugins.map((plugin: StyloPlugin, i: number) =>
          this.renderPlugin(plugin, `plugin-${i}`)
        )}

        {this.renderEmpty()}
      </Fragment>
    );
  }

  private renderEmpty() {
    if (this.plugins.length > 0) {
      return undefined;
    }

    return (
      <span class="empty">
        {i18n.state.plugins.no_matches}: <strong>{this.filter}</strong>
      </span>
    );
  }

  private renderPlugin(plugin: StyloPlugin, key: string) {
    const {text, icon: iconSrc} = plugin;

    const icon: JSX.IntrinsicElements | undefined = renderIcon(iconSrc);

    return (
      <button key={key} onClick={($event: UIEvent) => this.emitPlugin($event, plugin)}>
        {icon === undefined && (
          <div class="icon" {...(icon === undefined && {innerHTML: iconSrc})}></div>
        )}
        {icon}
        {this.renderText(text)}
      </button>
    );
  }

  private renderText(text: string) {
    const textValue: string = i18n.state.plugins[text] ?? i18n.state.custom[text] ?? text;

    if (this.filter.length > 0) {
      const rgxSplit = new RegExp(this.filter + '(.*)', 'gi');
      const split = textValue.split(rgxSplit);

      const rgxFilter = new RegExp(this.filter, 'gi');
      const filter = textValue.match(rgxFilter);

      return (
        <Fragment>
          {split[0] ?? ''}
          <strong>{filter[0] ?? ''}</strong>
          {split[1] ?? ''}
        </Fragment>
      );
    }

    return textValue;
  }
}
