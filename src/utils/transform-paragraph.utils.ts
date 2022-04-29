import {moveCursorToEnd} from '@deckdeckgo/utils';
import undoRedoStore from '../stores/undo-redo.store';
import {UndoRedoAddRemoveParagraph} from '../types/undo-redo';
import {elementIndex, toHTMLElement} from './node.utils';
import {stackUndoParagraphs} from './undo-redo.utils';

/**
 * Transform a paragraph to selected elements.
 *
 * Note: we manually stack the elements to undo-redo because the browser does not always provide the correct previousSibling references that can be used to undo-redo the paragraph that is deleted / replaced.
 */
export const transformParagraph = ({
  elements,
  paragraph,
  container,
  focus = 'first'
}: {
  elements: [HTMLElement, ...HTMLElement[]];
  container: HTMLElement;
  paragraph: HTMLElement;
  focus?: 'first' | 'last';
}) => {
  const addObserver: MutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
    addObserver.disconnect();

    undoRedoStore.state.observe = true;

    const addedNodes: Node[] = mutations.reduce(
      (acc: Node[], {addedNodes}: MutationRecord) => [...acc, ...Array.from(addedNodes)],
      []
    );

    if (addedNodes.length <= 0) {
      return;
    }

    const {firstChild}: Node = toHTMLElement(
      addedNodes[focus === 'first' ? 0 : addedNodes.length - 1]
    );

    moveCursorToEnd(firstChild);
  });

  addObserver.observe(container, {childList: true, subtree: true});

  undoRedoStore.state.observe = false;

  const index: number = elementIndex(paragraph);

  const addRemoveParagraphs: UndoRedoAddRemoveParagraph[] = [
    ...toAddParagraphs({paragraphs: elements, mutation: 'add', index}),
    ...toAddParagraphs({paragraphs: [paragraph], mutation: 'remove', index})
  ];

  transform({container, paragraph, elements});

  stackUndoParagraphs({
    container,
    addRemoveParagraphs,
    updateParagraphs: []
  });
};

const transform = ({
  elements,
  paragraph,
  container
}: {
  elements: [HTMLElement, ...HTMLElement[]];
  container: HTMLElement;
  paragraph: HTMLElement;
}) => {
  const anchor: HTMLElement | null = toHTMLElement(paragraph.previousElementSibling);

  container.removeChild(paragraph);

  if (!anchor) {
    container.prepend(...elements);
    return;
  }

  anchor.after(...elements);
};

const toAddParagraphs = ({
  paragraphs,
  mutation,
  index
}: {
  paragraphs: HTMLElement[];
  mutation: 'add' | 'remove';
  index: number;
}): UndoRedoAddRemoveParagraph[] => {
  return paragraphs.map((paragraph: HTMLElement, i: number) => ({
    outerHTML: paragraph.outerHTML,
    index: index + i,
    mutation
  }));
};
