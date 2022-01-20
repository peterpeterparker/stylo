import {Component, h, Prop} from '@stencil/core';

@Component({
  tag: 'stylo-toolbar-triangle',
  styleUrl: 'triangle.scss',
  shadow: true
})
export class Separator {
  @Prop()
  mobile: boolean;

  render() {
    if (this.mobile) {
      return undefined;
    }

    return <div class="triangle"></div>;
  }
}
