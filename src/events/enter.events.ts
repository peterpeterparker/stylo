import {getSelection, moveCursorToEnd} from '@deckdeckgo/utils';
import containerStore from '../stores/container.store';
import {toHTMLElement} from '../utils/node.utils';
import {
  createEmptyParagraph,
  createNewEmptyLine,
  findParagraph,
  isParagraphCode,
  isParagraphList
} from '../utils/paragraph.utils';
import undoRedoStore from '../stores/undo-redo.store';

export class EnterEvents {
  init() {
    containerStore.state.ref?.addEventListener('keydown', this.onKeyDown);
  }

  destroy() {
    containerStore.state.ref?.removeEventListener('keydown', this.onKeyDown);
  }

  private onKeyDown = async ($event: KeyboardEvent) => {
    const {code} = $event;

    if (!['Enter'].includes(code)) {
      return;
    }

    await this.createParagraph($event);
  };

  private async createParagraph($event: KeyboardEvent) {
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

    const newParagraph: Node | undefined = await createEmptyParagraph({
      container: containerStore.state.ref,
      paragraph
    });

    if (!newParagraph) {
      return;
    }

    // Extract the rest of the "line" (the paragraph) form the cursor position to end
    const range: Range = getSelection().getRangeAt(0);
    range.collapse(true);
    range.setEndAfter(paragraph);

    const fragment: DocumentFragment = getSelection().getRangeAt(0).cloneContents();

    // We created a new paragraph with the cursor at the end
    if (fragment.textContent === '') {
      moveCursorToEnd(newParagraph);
      return;
    }

    undoRedoStore.state.observe = false;

    const moveFragment: DocumentFragment = getSelection().getRangeAt(0).extractContents();
    newParagraph.replaceChild(moveFragment, newParagraph.firstChild);

    // We don't move the cursor, we keep the position at the begin of the new paragraph

    // TODO: stack changes to undo redo...how?!?
    // TODO: observe mutations

    undoRedoStore.state.observe = true;
  }
}
