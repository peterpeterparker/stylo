import {getSelection} from '@deckdeckgo/utils';
import containerStore from '../stores/container.store';
import {toHTMLElement} from '../utils/node.utils';
import {
  createEmptyParagraph,
  createNewEmptyLine,
  findParagraph,
  isParagraphCode,
  isParagraphList
} from '../utils/paragraph.utils';

export class EnterEvents {
  init() {
    containerStore.state.ref?.addEventListener('keydown', this.onKeyDown);
  }

  destroy() {
    containerStore.state.ref?.removeEventListener('keydown', this.onKeyDown);
  }

  private onKeyDown = ($event: KeyboardEvent) => {
    const {code} = $event;

    if (!['Enter'].includes(code)) {
      return;
    }

    this.createParagraph($event);
  };

  private createParagraph($event: KeyboardEvent) {
    const anchor: HTMLElement | undefined = toHTMLElement(getSelection()?.anchorNode);

    // Create only if we have an anchor otherwise let the browser deals with it
    if (!anchor) {
      return;
    }

    const paragraph: HTMLElement | undefined = toHTMLElement(
      findParagraph({element: anchor, container: containerStore.state.ref})
    );

    // Same as above but should not happen
    if (!paragraph) {
      return;
    }

    // In "list" we use return to create new lines
    if (isParagraphList({paragraph})) {
      return;
    }

    $event.preventDefault();

    const {shiftKey} = $event;

    if (shiftKey || isParagraphCode({paragraph})) {
      createNewEmptyLine({paragraph: anchor});
      return;
    }

    createEmptyParagraph({
      container: containerStore.state.ref,
      paragraph
    });
  }
}
