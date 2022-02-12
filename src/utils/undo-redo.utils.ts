import {moveCursorToOffset} from '@deckdeckgo/utils';
import undoRedoStore from '../stores/undo-redo.store';
import {
  UndoRedoAddRemoveParagraph,
  UndoRedoChange,
  UndoRedoChanges,
  UndoRedoInput,
  UndoRedoSelection,
  UndoRedoUpdateParagraph
} from '../types/undo-redo';
import {findNodeAtDepths, isTextNode, toHTMLElement} from './node.utils';
import {redoSelection} from './undo-redo-selection.utils';

export const stackUndoInput = ({
  container,
  data
}: {
  container: HTMLElement;
  data: UndoRedoInput;
}) => {
  if (!undoRedoStore.state.undo) {
    undoRedoStore.state.undo = [];
  }

  undoRedoStore.state.undo.push({
    changes: [
      {
        type: 'input',
        target: container,
        data
      }
    ]
  });

  undoRedoStore.state.redo = [];
};

export const stackUndoParagraphs = ({
  container,
  addRemoveParagraphs,
  updateParagraphs,
  selection
}: {
  container: HTMLElement;
  addRemoveParagraphs: UndoRedoAddRemoveParagraph[];
  updateParagraphs: UndoRedoUpdateParagraph[];
  selection?: UndoRedoSelection;
}) => {
  if (addRemoveParagraphs.length <= 0 && updateParagraphs.length <= 0) {
    return;
  }

  if (!undoRedoStore.state.undo) {
    undoRedoStore.state.undo = [];
  }

  const changes: UndoRedoChanges = {
    changes: [
      {
        type: 'paragraph',
        target: container,
        data: addRemoveParagraphs.map(
          ({outerHTML, index, mutation}: UndoRedoAddRemoveParagraph) => ({
            outerHTML,
            mutation,
            index
          })
        )
      },
      {
        type: 'update',
        target: container,
        data: updateParagraphs
      }
    ],
    selection
  };

  undoRedoStore.state.undo.push(changes);

  if (!undoRedoStore.state.redo) {
    undoRedoStore.state.redo = [];
  }
};

export const nextUndoChanges = (): UndoRedoChanges | undefined =>
  nextChange(undoRedoStore.state.undo);

export const nextRedoChanges = (): UndoRedoChanges | undefined =>
  nextChange(undoRedoStore.state.redo);

const nextChange = (changes: UndoRedoChanges[] | undefined): UndoRedoChanges | undefined => {
  if (!changes) {
    return undefined;
  }

  return changes[changes.length - 1];
};

export const undo = async () =>
  undoRedo({
    popFrom: () =>
      (undoRedoStore.state.undo = [
        ...undoRedoStore.state.undo.slice(0, undoRedoStore.state.undo.length - 1)
      ]),
    pushTo: (value: UndoRedoChanges) => undoRedoStore.state.redo.push(value),
    undoChanges: nextUndoChanges()
  });

export const redo = async () =>
  undoRedo({
    popFrom: () =>
      (undoRedoStore.state.redo = [
        ...undoRedoStore.state.redo.slice(0, undoRedoStore.state.redo.length - 1)
      ]),
    pushTo: (value: UndoRedoChanges) => undoRedoStore.state.undo.push(value),
    undoChanges: nextRedoChanges()
  });

const undoRedo = async ({
  popFrom,
  pushTo,
  undoChanges
}: {
  popFrom: () => void;
  pushTo: (value: UndoRedoChanges) => void;
  undoChanges: UndoRedoChanges | undefined;
}) => {
  if (!undoChanges) {
    return;
  }

  const {changes, selection}: UndoRedoChanges = undoChanges;

  const promises: Promise<UndoRedoChange>[] = changes.map((undoChange: UndoRedoChange) =>
    undoRedoChange({undoChange, selection})
  );
  const redoChanges: UndoRedoChange[] = await Promise.all(promises);

  pushTo({changes: redoChanges});

  popFrom();
};

const undoRedoChange = async ({
  undoChange,
  selection
}: {
  undoChange: UndoRedoChange;
  selection: UndoRedoSelection;
}): Promise<UndoRedoChange> => {
  const {type} = undoChange;

  if (type === 'input') {
    return undoRedoInput({undoChange});
  }

  if (type === 'paragraph') {
    return undoRedoParagraph({undoChange, selection});
  }

  return undoRedoUpdate({undoChange, selection});
};

const undoRedoInput = async ({
  undoChange
}: {
  undoChange: UndoRedoChange;
}): Promise<UndoRedoChange> => {
  const {data, target} = undoChange;

  const container: HTMLElement = toHTMLElement(target);

  const {oldValue, offset: newCaretPosition, index, indexDepths} = data as UndoRedoInput;

  const paragraph: Element | undefined = container.children[index];

  let text: Node | undefined = findNodeAtDepths({parent: paragraph, indexDepths});

  if (!text || !isTextNode(text)) {
    // We try to find sibling in case the parent does not yet exist. If we find it, we can replicate such parent for the new text.
    // Useful notably when reverting lists and li.
    const cloneIndexDepths: number[] = [...indexDepths];
    cloneIndexDepths.pop();

    let parent: Node | undefined =
      cloneIndexDepths.length <= 0
        ? text
          ? text.parentNode
          : undefined
        : findNodeAtDepths({parent: paragraph, indexDepths: [...cloneIndexDepths]});

    if (!parent && isTextNode(toHTMLElement(paragraph)?.lastChild)) {
      text = toHTMLElement(paragraph).lastChild;
    }

    if (!text) {
      if (!parent) {
        parent = await createLast({paragraph: toHTMLElement(paragraph) || container, container});
      }

      text = await prependText({parent: toHTMLElement(parent), container});
    }
  }

  const {previousValue} = await updateNodeValue({text, oldValue, container});

  moveCursorToOffset({
    element: text,
    offset: Math.min(
      oldValue.length > newCaretPosition ? newCaretPosition : oldValue.length,
      text.nodeValue.length
    )
  });

  return {
    type: 'input',
    target: container,
    data: {
      index,
      indexDepths,
      oldValue: previousValue,
      offset: newCaretPosition + (previousValue.length - oldValue.length)
    }
  };
};

const undoRedoParagraph = async ({
  undoChange,
  selection
}: {
  undoChange: UndoRedoChange;
  selection: UndoRedoSelection;
}): Promise<UndoRedoChange> => {
  const {data, target} = undoChange;

  const container: HTMLElement = toHTMLElement(target);

  const paragraphs: UndoRedoAddRemoveParagraph[] = data as UndoRedoAddRemoveParagraph[];

  let to: UndoRedoAddRemoveParagraph[] = [];

  for (const paragraph of paragraphs) {
    const {index, outerHTML, mutation} = paragraph;

    if (mutation === 'add') {
      await removeNode({container, index});

      to = [
        {
          outerHTML,
          index,
          mutation: 'remove'
        },
        ...to
      ];
    }

    if (mutation === 'remove') {
      await insertNode({container, index, outerHTML});

      to = [
        {
          outerHTML,
          mutation: 'add',
          index
        },
        ...to
      ];
    }
  }

  redoSelection({container, selection});

  return {
    ...undoChange,
    data: to
  };
};

const undoRedoUpdate = async ({
  undoChange,
  selection
}: {
  undoChange: UndoRedoChange;
  selection: UndoRedoSelection;
}): Promise<UndoRedoChange> => {
  const {data, target} = undoChange;

  const paragraphs: UndoRedoUpdateParagraph[] = data as UndoRedoUpdateParagraph[];

  const container: HTMLElement = toHTMLElement(target);

  const to: UndoRedoUpdateParagraph[] = [];

  for (const paragraph of paragraphs) {
    const {index, outerHTML} = paragraph;

    const {previousOuterHTML} = await updateNode({
      container,
      index,
      outerHTML
    });
    to.push({index, outerHTML: previousOuterHTML});
  }

  redoSelection({container, selection});

  return {
    ...undoChange,
    data: to
  };
};

/**
 * Because we are using indexes to add or remove back and forth elements, we have to wait for changes to be applied to the DOM before iterating to next element to process.
 * That's why the mutation observer and promises.
 */

const insertNode = ({
  container,
  index,
  outerHTML
}: {
  outerHTML: string;
  index: number;
  container: HTMLElement;
}): Promise<void> =>
  new Promise<void>((resolve) => {
    const changeObserver: MutationObserver = new MutationObserver(
      (_mutations: MutationRecord[]) => {
        changeObserver.disconnect();
        resolve();
      }
    );

    changeObserver.observe(container, {childList: true, subtree: true});

    const previousSiblingIndex: number = index - 1;
    container.children[
      Math.min(previousSiblingIndex, container.children.length - 1)
    ].insertAdjacentHTML('afterend', outerHTML);
  });

const removeNode = ({container, index}: {index: number; container: HTMLElement}): Promise<void> =>
  new Promise<void>((resolve) => {
    const changeObserver: MutationObserver = new MutationObserver(() => {
      changeObserver.disconnect();

      resolve();
    });

    changeObserver.observe(container, {childList: true, subtree: true});

    const element: Element | undefined =
      container.children[Math.min(index, container.children.length - 1)];
    element?.parentElement.removeChild(element);
  });

const updateNode = ({
  container,
  index,
  outerHTML
}: {
  outerHTML: string;
  index: number;
  container: HTMLElement;
}): Promise<{previousOuterHTML: string}> =>
  new Promise<{previousOuterHTML: string}>((resolve) => {
    const paragraph: Element = container.children[Math.min(index, container.children.length - 1)];

    const previousOuterHTML: string = paragraph.outerHTML;

    const changeObserver: MutationObserver = new MutationObserver(
      (_mutations: MutationRecord[]) => {
        changeObserver.disconnect();
        resolve({previousOuterHTML});
      }
    );

    changeObserver.observe(container, {childList: true, subtree: true});

    paragraph.outerHTML = outerHTML;
  });

const prependText = ({
  parent,
  container
}: {
  parent: HTMLElement;
  container: HTMLElement;
}): Promise<Node> =>
  new Promise<Node>((resolve) => {
    const text: Node = document.createTextNode('');

    const changeObserver: MutationObserver = new MutationObserver(() => {
      changeObserver.disconnect();

      resolve(text);
    });

    changeObserver.observe(container, {childList: true, subtree: true});

    parent.prepend(text);
  });

const updateNodeValue = ({
  container,
  oldValue,
  text
}: {
  oldValue: string;
  text: Node;
  container: HTMLElement;
}): Promise<{previousValue: string}> =>
  new Promise<{previousValue: string}>((resolve) => {
    const previousValue: string = text.nodeValue;

    const changeObserver: MutationObserver = new MutationObserver(() => {
      changeObserver.disconnect();

      resolve({previousValue});
    });

    changeObserver.observe(container, {characterData: true, subtree: true});

    text.nodeValue = oldValue;
  });

const createLast = ({
  container,
  paragraph
}: {
  container: HTMLElement;
  paragraph: HTMLElement;
}): Promise<HTMLElement> =>
  new Promise<HTMLElement>((resolve) => {
    const anchor: HTMLElement =
      paragraph.lastElementChild?.nodeName.toLowerCase() !== 'br'
        ? toHTMLElement(paragraph.lastElementChild)
        : document.createElement('span');

    const parent: HTMLElement = toHTMLElement(anchor.cloneNode());
    parent.innerHTML = '';

    const changeObserver: MutationObserver = new MutationObserver(() => {
      changeObserver.disconnect();

      resolve(parent);
    });

    changeObserver.observe(container, {childList: true, subtree: true});

    anchor.after(parent);
  });
