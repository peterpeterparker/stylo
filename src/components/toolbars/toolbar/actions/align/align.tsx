import {isMobile} from '@deckdeckgo/utils';
import {Component, Event, EventEmitter, h, Host, Prop} from '@stencil/core';
import configStore from '../../../../../stores/config.store';
import i18n from '../../../../../stores/i18n.store';
import {ToolbarAlign} from '../../../../../types/toolbar';
import {execCommandAlign} from '../../../../../utils/execcommand-align.utils';
import {execCommandNativeAlign} from '../../../../../utils/execcommnad-native.utils';
import {IconAlignCenter} from '../../../../icons/align-center';
import {IconAlignLeft} from '../../../../icons/align-left';
import {IconAlignRight} from '../../../../icons/align-right';

@Component({
  tag: 'stylo-toolbar-align',
  styleUrl: 'align.scss',
  shadow: true
})
export class Align {
  @Prop()
  anchorEvent: MouseEvent | TouchEvent;

  @Prop()
  align: ToolbarAlign;

  @Prop()
  containerRef: HTMLElement | undefined;

  @Event()
  private alignModified: EventEmitter;

  private mobile: boolean = isMobile();

  private justifyContent($event: UIEvent, align: ToolbarAlign) {
    $event.stopPropagation();

    if (configStore.state.toolbar.command === 'native') {
      execCommandNativeAlign(align);
    } else {
      execCommandAlign(this.anchorEvent, this.containerRef, align);
    }

    this.alignModified.emit();
  }

  render() {
    return (
      <Host class={this.mobile ? 'tools-sticky' : undefined}>
        <stylo-toolbar-button
          label={i18n.state.toolbar.align_left}
          onAction={($event: CustomEvent<UIEvent>) =>
            this.justifyContent($event.detail, ToolbarAlign.LEFT)
          }
          class={this.align === ToolbarAlign.LEFT ? 'active' : undefined}>
          <IconAlignLeft></IconAlignLeft>
        </stylo-toolbar-button>
        <stylo-toolbar-button
          label={i18n.state.toolbar.align_center}
          onAction={($event: CustomEvent<UIEvent>) =>
            this.justifyContent($event.detail, ToolbarAlign.CENTER)
          }
          class={this.align === ToolbarAlign.CENTER ? 'active' : undefined}>
          <IconAlignCenter></IconAlignCenter>
        </stylo-toolbar-button>
        <stylo-toolbar-button
          label={i18n.state.toolbar.align_right}
          onAction={($event: CustomEvent<UIEvent>) =>
            this.justifyContent($event.detail, ToolbarAlign.RIGHT)
          }
          class={this.align === ToolbarAlign.RIGHT ? 'active' : undefined}>
          <IconAlignRight></IconAlignRight>
        </stylo-toolbar-button>
      </Host>
    );
  }
}
