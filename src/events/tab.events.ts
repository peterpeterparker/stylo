import {getSelection, moveCursorToEnd} from '@deckdeckgo/utils';
import containerStore from '../stores/container.store';
import {isTextNode} from '../utils/node.utils';

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
    $event.preventDefault();

    const selection: Selection | null = getSelection();
    const node: Node | undefined = selection?.focusNode;

    if (!isTextNode(node)) {
      return;
    }

    const range: Range | undefined = selection?.getRangeAt(0);
    const text: Text = document.createTextNode('\u0009');
    range?.insertNode(text);

    moveCursorToEnd(text);
  }
}
