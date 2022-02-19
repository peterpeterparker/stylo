import {getSelection, moveCursorToEnd, moveCursorToStart} from '@deckdeckgo/utils';
import containerStore from '../stores/container.store';
import undoRedoStore from '../stores/undo-redo.store';
import {UndoRedoAddRemoveParagraph, UndoRedoUpdateParagraph} from '../types/undo-redo';
import {elementIndex, toHTMLElement} from '../utils/node.utils';
import {
  addEmptyText,
  createEmptyParagraph,
  createNewEmptyLine,
  findParagraph,
  isParagraphCode,
  isParagraphList,
  addParagraph, prependEmptyText
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

    const fragment: DocumentFragment = range.cloneContents();
    const isEndOfParagraph: boolean = fragment.textContent === '';

    const {shiftKey} = $event;

    if (shiftKey || isParagraphCode({paragraph})) {
      await this.createLineBreak({anchor, paragraph, isEndOfParagraph, range});

      return;
    }

    // We created a new paragraph with the cursor at the end aka we pressed "Enter" with the cursor at the end of the paragraph
    if (isEndOfParagraph) {
      const newParagraph: Node | undefined = await createEmptyParagraph({
        container: containerStore.state.ref,
        paragraph
      });

      moveCursorToEnd(newParagraph);
      return;
    }

    await this.createParagraphWithContent({
      range,
      paragraph
    });
  }

  private async createParagraphWithContent({
    paragraph,
    range
  }: {
    paragraph: HTMLElement;
    range: Range;
  }) {
    // We have to handle undo-redo manually because we want the redo to redo everything in one block
    undoRedoStore.state.observe = false;

    // We undo-redo stack an update of the current paragraph value
    const updateParagraphs: UndoRedoUpdateParagraph[] = this.toUpdateParagraphs([paragraph]);

    // The new fragment is a div - i.e. is a paragraph
    const moveFragment: DocumentFragment = range.extractContents();
    const newParagraph: Node | undefined = await addParagraph({
      container: containerStore.state.ref,
      paragraph,
      fragment: moveFragment
    });

    // We undo-redo stack the new paragraph to remove it on undo
    const addRemoveParagraphs = this.toAddParagraphs([toHTMLElement(newParagraph)]);

    // If original paragraph is now empty - the all content has been moved to a new paragraph - we add a zero length width otherwise the div has no height
    // We do not need to add this to undo-redo stack
    // Happens for example when user click enter at the begin of the paragraph
    if (paragraph.textContent === '') {
      await prependEmptyText({paragraph});
    }

    stackUndoParagraphs({
      container: containerStore.state.ref,
      addRemoveParagraphs,
      updateParagraphs
    });

    // We don't move the cursor, we keep the position at the beginning of the new paragraph

    undoRedoStore.state.observe = true;
  }

  private toAddParagraphs(paragraphs: HTMLElement[]): UndoRedoAddRemoveParagraph[] {
    return paragraphs.map((paragraph: HTMLElement) => ({
      outerHTML: paragraph.outerHTML,
      index: elementIndex(paragraph),
      mutation: 'add'
    }));
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

    const text: Node | undefined = await addEmptyText({
      paragraph,
      element: newNode as HTMLElement
    });

    moveCursorToStart(text);

    undoRedoStore.state.observe = true;
  }
}
