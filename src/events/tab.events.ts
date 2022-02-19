import {moveCursorToEnd} from '@deckdeckgo/utils';
import containerStore from '../stores/container.store';
import {isTextNode} from '../utils/node.utils';
import {getRange} from '../utils/selection.utils';

export class TabEvents {
  init() {
    containerStore.state.ref?.addEventListener('keydown', this.onKeyDown);
  }

  destroy() {
    containerStore.state.ref?.removeEventListener('keydown', this.onKeyDown);
  }

  private onKeyDown = ($event: KeyboardEvent) => {
    const {key} = $event;

    if (!['Tab'].includes(key)) {
      return;
    }

    this.catchTab($event);
  };

  private catchTab($event: KeyboardEvent) {
    const {range, selection} = getRange(containerStore.state.ref);

    if (!range) {
      return;
    }

    const node: Node | undefined = selection?.focusNode;

    if (!isTextNode(node)) {
      return;
    }

    $event.preventDefault();

    const text: Text = document.createTextNode('\u0009');
    range?.insertNode(text);

    moveCursorToEnd(text);
  }
}
