import {Component, ComponentInterface, Element, h, Host, Listen, State} from '@stencil/core';
import configStore from '../../../stores/config.store';
import containerStore from '../../../stores/container.store';
import {StyloPlugin} from '../../../types/plugin';
import {toHTMLElement} from '../../../utils/node.utils';
import {focusParagraph} from '../../../utils/paragraph.utils';
import { isMobile } from '@deckdeckgo/utils';

@Component({
  tag: 'stylo-plugins',
  styleUrl: 'plugins.scss',
  shadow: true
})
export class Plugins implements ComponentInterface {
  @Element()
  private el: HTMLElement;

  @State()
  private display: boolean = false;

  @State()
  private position: {left: number; top: number; downward: boolean} | undefined = undefined;

  private paragraph: HTMLElement | undefined | null;

  private destroyListener: () => void | undefined;

  componentWillLoad() {
    this.destroyListener = containerStore.onChange('size', () => {
      if (isMobile()) {
        return;
      }

      this.hide();
    });
  }

  disconnectedCallback() {
    this.destroyListener?.();
  }

  /**
   * If user click anywhere not in the stylo-editor, hide the transform options
   */
  @Listen('click', {target: 'document', passive: true})
  onMouseDown(_$event: MouseEvent | TouchEvent) {
    this.hide();
  }

  @Listen('hidePlugins', {target: 'document', passive: true})
  onHidePlugins() {
    this.hide();
  }

  private hide() {
    this.display = false;

    // To make the visual transition not glitchy, we hide first and then move the component outside
    setTimeout(() => (this.position = undefined), 150);
  }

  @Listen('listPlugins', {target: 'document', passive: true})
  onListPlugins({detail: paragraph}: CustomEvent<HTMLElement | undefined>) {
    if (!paragraph) {
      this.hide();
      return;
    }

    const {height, top}: DOMRect = paragraph.getBoundingClientRect();

    // top + size + margin
    const downward: boolean = top + 220 + 16 < (window.innerHeight || screen.height);

    this.position = {
      top: paragraph.offsetTop + (downward ? height : -1 * height),
      left: paragraph.offsetLeft,
      downward
    };

    this.paragraph = paragraph;

    this.displayAndFocus();
  }

  private displayAndFocus() {
    const onRender = async (_mutations: MutationRecord[], observer: MutationObserver) => {
      observer.disconnect();

      await this.el.shadowRoot.querySelector('stylo-list')?.focusFirstButton();
    };

    const docObserver: MutationObserver = new MutationObserver(onRender);
    docObserver.observe(this.el, {attributes: true, subtree: true});

    setTimeout(() => (this.display = true), 150);
  }

  private onCancelPlugins() {
    this.hide();

    focusParagraph({paragraph: this.paragraph});
  }

  private async onApplyPlugin(plugin: StyloPlugin) {
    if (!containerStore.state.ref || !this.paragraph) {
      return;
    }

    this.hide();

    const {files} = plugin;

    if (files !== undefined) {
      this.openFilePicker(plugin);
      return;
    }

    await this.transformParagraph({plugin});
  }

  private async transformParagraph({
    plugin,
    files
  }: {
    plugin: StyloPlugin;
    files?: FileList | null;
  }) {
    const {createParagraphs} = plugin;

    await createParagraphs({
      paragraph: toHTMLElement(this.paragraph),
      container: containerStore.state.ref,
      files
    });
  }

  private openFilePicker(plugin: StyloPlugin) {
    const input: HTMLInputElement | null = this.filePicker(plugin);
    input?.click();
  }

  private async onFilePickerChange(plugin: StyloPlugin) {
    const input: HTMLInputElement | null = this.filePicker(plugin);

    if (!input || input.files.length <= 0) {
      return;
    }

    await this.transformParagraph({plugin, files: input.files});

    // Reset input otherwise a new data cannot be selected
    input.value = '';
  }

  private filePicker({files}: StyloPlugin): HTMLInputElement | null {
    const {accept} = files;

    return this.el.shadowRoot.querySelector(`input[accept="${accept}"]`);
  }

  render() {
    const style: Record<string, string> =
      this.position === undefined
        ? {}
        : {
            '--actions-top': `${this.position.top}px`,
            '--actions-left': `${this.position.left}px`,
            '--actions-translate-y': `${this.position.downward ? '0' : '-100%'}`
          };

    return (
      <Host style={style} class={`${this.display ? 'display' : 'hidden'}`}>
        {this.renderList()}

        {this.renderInputs()}
      </Host>
    );
  }

  private renderInputs() {
    return configStore.state.plugins
      .filter(({files}: StyloPlugin) => files !== undefined)
      .map((plugin: StyloPlugin) => {
        const {accept, multiple} = plugin.files;

        return (
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={async () => await this.onFilePickerChange(plugin)}
          />
        );
      });
  }

  private renderList() {
    return (
      <stylo-list
        onApplyPlugin={async ({detail}: CustomEvent<StyloPlugin>) =>
          await this.onApplyPlugin(detail)
        }
        onCancelPlugins={() => this.onCancelPlugins()}></stylo-list>
    );
  }
}
