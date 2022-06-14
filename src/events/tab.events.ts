import {moveCursorToEnd} from '@deckdeckgo/utils';
import containerStore from '../stores/container.store';
import {isTextNode} from '../utils/node.utils';
import {findParagraph} from '../utils/paragraph.utils';
import {getRange} from '../utils/selection.utils';

export class TabEvents {
  init() {
    containerStore.state.ref?.addEventListener('keydown', this.onKeyDown);
  }

  destroy() {
    containerStore.state.ref?.removeEventListener('keydown', this.onKeyDown);
  }

  private onKeyDown = ($event: KeyboardEvent) => {
    const {key, shiftKey} = $event;

    if (!['Tab'].includes(key) || shiftKey) {
      return;
    }

    this.catchTab($event);
  };

  private catchTab($event: KeyboardEvent) {
    const {range, selection} = getRange(containerStore.state.ref);

    if (!range) {
      return;
    }

    $event.preventDefault();

    const node: Node | undefined = selection?.focusNode;

    if (!isTextNode(node)) {
      const paragraph: Node | undefined = findParagraph({
        element: node,
        container: containerStore.state.ref
      });

      if (paragraph !== undefined) {
        this.createTabulation({range});
        return;
      }

      return;
    }

    this.createTabulation({range});
  }

  private createTabulation({range}: {range: Range}) {
    const span: HTMLSpanElement = document.createElement('span');
    span.innerHTML = '\u0009';

    range?.insertNode(span);

    moveCursorToEnd(span);
  }
}
