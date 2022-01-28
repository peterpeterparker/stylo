import {isMobile} from '@deckdeckgo/utils';
import {Component, h, Host} from '@stencil/core';

@Component({
  tag: 'stylo-toolbar-separator',
  styleUrl: 'separator.scss',
  shadow: true
})
export class Separator {
  private mobile: boolean = isMobile();

  render() {
    const cssClass = this.mobile ? 'tools-mobile' : undefined;

    return (
      <Host class={cssClass}>
        <div class="separator"></div>
      </Host>
    );
  }
}
