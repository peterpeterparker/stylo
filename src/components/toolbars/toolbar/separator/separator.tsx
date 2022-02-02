import {Component, h} from '@stencil/core';

@Component({
  tag: 'stylo-toolbar-separator',
  styleUrl: 'separator.scss',
  shadow: true
})
export class Separator {
  render() {
    return <div class="separator"></div>;
  }
}
