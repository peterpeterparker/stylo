import {Component, Event, EventEmitter, h, Host, Prop} from '@stencil/core';
import i18n from '../../../../../stores/i18n.store';
import {ExecCommandAction} from '../../../../../types/execcommand';
import {ToolbarList} from '../../../../../types/toolbar';
import {IconOl} from '../../../../icons/ol';
import {IconUl} from '../../../../icons/ul';

@Component({
  tag: 'stylo-toolbar-list',
  styleUrl: 'list.scss',
  shadow: true
})
export class AlignActions {
  @Prop()
  list: ToolbarList;

  @Event()
  private execCommand: EventEmitter<ExecCommandAction>;

  private toggleList(e: UIEvent, type: 'ol' | 'ul') {
    e.stopPropagation();

    this.execCommand.emit({
      cmd: 'list',
      detail: {
        type
      }
    });
  }

  render() {
    return (
      <Host>
        <stylo-toolbar-button
          label={i18n.state.toolbar.list_ol}
          onAction={($event: CustomEvent<UIEvent>) => this.toggleList($event.detail, 'ol')}
          class={this.list === ToolbarList.ORDERED ? 'active' : undefined}>
          <IconOl></IconOl>
        </stylo-toolbar-button>

        <stylo-toolbar-button
          label={i18n.state.toolbar.list_ul}
          onAction={($event: CustomEvent<UIEvent>) => this.toggleList($event.detail, 'ul')}
          class={this.list === ToolbarList.UNORDERED ? 'active' : undefined}>
          <IconUl></IconUl>
        </stylo-toolbar-button>
      </Host>
    );
  }
}
