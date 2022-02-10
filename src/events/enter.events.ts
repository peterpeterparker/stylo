import {getSelection, moveCursorToEnd, moveCursorToStart} from '@deckdeckgo/utils';
import containerStore from '../stores/container.store';
import undoRedoStore from '../stores/undo-redo.store';
import {UndoRedoUpdateParagraph} from '../types/undo-redo';
import {elementIndex, toHTMLElement} from '../utils/node.utils';
import {
  appendEmptyText,
  createEmptyParagraph,
  createNewEmptyLine,
  findParagraph,
  isParagraphCode,
  isParagraphList,
  replaceParagraphFirstChild
} from '../utils/paragraph.utils';
import {stackUndoParagraphs} from '../utils/undo-redo.utils';

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

    // Extract the rest of the "line" (the paragraph) form the cursor position to end
    const range: Range = getSelection().getRangeAt(0);
    range.collapse(true);
    range.setEndAfter(paragraph);

    const fragment: DocumentFragment = getSelection().getRangeAt(0).cloneContents();
    const isEndOfParagraph: boolean = fragment.textContent === '';

    const {shiftKey} = $event;

    if (shiftKey || isParagraphCode({paragraph})) {
      await this.createLineBreak({anchor, paragraph, isEndOfParagraph, range});

      return;
    }

    const newParagraph: Node | undefined = await createEmptyParagraph({
      container: containerStore.state.ref,
      paragraph
    });

    if (!newParagraph) {
      return;
    }

    // We created a new paragraph with the cursor at the end aka we pressed "Enter" with the cursor at the end of the paragraph
    if (isEndOfParagraph) {
      moveCursorToEnd(newParagraph);
      return;
    }

    await this.createParagraphWithContent({paragraph, newParagraph: newParagraph as HTMLElement});
  }

  private async createParagraphWithContent({
    paragraph,
    newParagraph
  }: {
    paragraph: HTMLElement;
    newParagraph: HTMLElement;
  }) {
    // We have to handle undo-redo manually otherwise we will get two entries in the stack, one for the "extractContents" and one when we replace the child in the new paragraph
    undoRedoStore.state.observe = false;

    stackUndoParagraphs({
      container: containerStore.state.ref,
      addRemoveParagraphs: [],
      updateParagraphs: this.toUpdateParagraphs([paragraph, newParagraph])
    });

    const moveFragment: DocumentFragment = getSelection().getRangeAt(0).extractContents();
    await replaceParagraphFirstChild({
      container: containerStore.state.ref,
      paragraph: newParagraph,
      fragment: moveFragment
    });

    // We don't move the cursor, we keep the position at the beginning of the new paragraph

    undoRedoStore.state.observe = true;
  }

  private toUpdateParagraphs(paragraphs: HTMLElement[]): UndoRedoUpdateParagraph[] {
    return paragraphs.map((paragraph: HTMLElement) => ({
      outerHTML: paragraph.outerHTML,
      index: elementIndex(paragraph)
    }));
  }

  private async createLineBreak({
    anchor,
    paragraph,
    isEndOfParagraph,
    range
  }: {
    anchor: HTMLElement;
    paragraph: HTMLElement;
    isEndOfParagraph: boolean;
    range: Range;
  }) {
    undoRedoStore.state.observe = false;

    stackUndoParagraphs({
      container: containerStore.state.ref,
      addRemoveParagraphs: [],
      updateParagraphs: this.toUpdateParagraphs([paragraph])
    });

    // Reset range end we do not want to select empty text
    range.setEndAfter(getSelection().anchorNode);

    const newNode: Node | undefined = await createNewEmptyLine({
      paragraph: anchor,
      range
    });

    if (!isEndOfParagraph || !newNode) {
      moveCursorToStart(newNode);

      undoRedoStore.state.observe = true;
      return;
    }

    const text: Node | undefined = await appendEmptyText({
      paragraph,
      element: newNode as HTMLElement
    });

    moveCursorToStart(text);

    undoRedoStore.state.observe = true;
  }
}
