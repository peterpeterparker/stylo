import {getSelection} from '@deckdeckgo/utils';
import {UndoRedoSelection} from '../types/undo-redo';
import {elementIndex, findNodeAtDepths, nodeDepths, toHTMLElement} from './node.utils';
import {findParagraph} from './paragraph.utils';

export const toUndoRedoSelection = (container: Node): UndoRedoSelection | undefined => {
  const selection: Selection | null = getSelection();
  const range: Range | undefined = selection?.getRangeAt(0);

  if (!range) {
    return undefined;
  }

  const {anchorNode, focusNode} = selection;

  const startParagraph: HTMLElement | undefined = toHTMLElement(
    findParagraph({element: anchorNode, container})
  );
  const endParagraph: HTMLElement | undefined = toHTMLElement(
    findParagraph({element: focusNode, container})
  );

  if (!startParagraph || !endParagraph) {
    return;
  }

  return {
    startIndex: elementIndex(startParagraph),
    startIndexDepths: nodeDepths({
      target: anchorNode,
      paragraph: findParagraph({element: anchorNode, container})
    }),
    startOffset: selection.anchorOffset,
    endIndex: elementIndex(endParagraph),
    endIndexDepths: nodeDepths({
      target: focusNode,
      paragraph: findParagraph({element: focusNode, container})
    }),
    endOffset: selection.focusOffset,
    reverse: !anchorNode.isEqualNode(range.startContainer)
  };
};

export const redoSelection = ({
  selection,
  container
}: {
  selection: UndoRedoSelection | undefined;
  container: HTMLElement;
}) => {
  if (!selection) {
    return;
  }

  const {startIndex, startIndexDepths, startOffset, endIndex, endIndexDepths, endOffset, reverse} =
    selection;

  const startParagraph: Element | undefined =
    container.children[Math.min(startIndex, container.children.length - 1)];

  const endParagraph: Element | undefined =
    container.children[Math.min(endIndex, container.children.length - 1)];

  const startNode: Node | undefined = findNodeAtDepths({
    parent: startParagraph,
    indexDepths: startIndexDepths
  });
  const endNode: Node | undefined = findNodeAtDepths({
    parent: endParagraph,
    indexDepths: endIndexDepths
  });

  if (!startNode || !endNode) {
    return;
  }

  const range: Range = document.createRange();

  if (!reverse) {
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
  } else {
    range.setEnd(startNode, startOffset);
    range.setStart(endNode, endOffset);
  }

  const windowSelection: Selection | null = getSelection();
  windowSelection?.removeAllRanges();
  windowSelection?.addRange(range);

  range.detach();
};
