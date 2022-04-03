import {moveCursorToEnd} from '@deckdeckgo/utils';
import {createEmptyElement} from './create-element.utils';
import {isTextNode, nodeIndex, toHTMLElement} from './node.utils';

export const findParagraph = ({
  element,
  container
}: {
  element: Node;
  container: Node | undefined;
}): Node | undefined => {
  if (!container) {
    return undefined;
  }

  // Just in case
  if (container.nodeName.toUpperCase() === 'HTML' || container.nodeName.toUpperCase() === 'BODY') {
    return undefined;
  }

  if (!container.parentNode) {
    return undefined;
  }

  const {parentElement} = element;

  if (!parentElement) {
    return undefined;
  }

  if (parentElement.isEqualNode(container)) {
    return element;
  }

  return findParagraph({element: parentElement, container});
};

/**
 * <article>
 *   <div>
 *     <span>
 *       => isStartNode = true
 *
 * <article>
 *   <div>
 *     Hello <span>
 *             => isStartNode = false
 */
export const isStartNode = ({
  element,
  container
}: {
  element: Node | undefined;
  container: Node | undefined;
}): boolean => {
  if (!container) {
    return false;
  }

  // Just in case
  if (container.nodeName.toUpperCase() === 'HTML' || container.nodeName.toUpperCase() === 'BODY') {
    return false;
  }

  if (isParagraph({element, container})) {
    return true;
  }

  // If node is the direct first child of it's parent, we can check the parent until we get the container
  if (nodeIndex(element) === 0) {
    return isStartNode({element: element.parentElement, container});
  }

  return false;
};

export const isParagraph = ({
  element,
  container
}: {
  element: Node | undefined;
  container: Node;
}): boolean => {
  if (!element) {
    return false;
  }

  const {parentElement} = element;

  if (!parentElement) {
    return false;
  }

  return parentElement?.isEqualNode(container);
};

export const isTargetContainer = ({target, container}: {target: Node; container: Node}): boolean =>
  target.isEqualNode(container);

export const focusParagraph = ({paragraph}: {paragraph: Node | undefined}) => {
  if (!isTextNode(paragraph)) {
    toHTMLElement(paragraph).focus();
  }

  moveCursorToEnd(paragraph);
};

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

  const anchor: HTMLElement | null = toHTMLElement(paragraph.previousElementSibling);

  // We delete present paragraph and add the new element and assumes the mutation observer will trigger both delete and add in a single mutation.
  // Thanks to this, only one entry will be added in the undo-redo stack.
  container.removeChild(paragraph);

  if (!anchor) {
    container.prepend(...elements);
    return;
  }

  anchor.after(...elements);
};

export const createEmptyParagraph = ({
  paragraph,
  container
}: {
  container: HTMLElement;
  paragraph: HTMLElement;
}): Promise<Node | undefined> => {
  return new Promise<Node | undefined>((resolve) => {
    const addObserver: MutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
      addObserver.disconnect();

      resolve(mutations[0]?.addedNodes?.[0]);
    });

    addObserver.observe(container, {childList: true, subtree: true});

    const div: HTMLElement = createEmptyElement({nodeName: 'div'});

    // Should not happen, fallback
    if (!paragraph) {
      container.append(div);
      return;
    }

    paragraph.after(div);
  });
};

export const addParagraph = ({
  paragraph,
  container,
  fragment
}: {
  container: HTMLElement;
  paragraph: HTMLElement;
  fragment: DocumentFragment;
}): Promise<Node | undefined> => {
  return new Promise<Node | undefined>((resolve) => {
    const addObserver: MutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
      addObserver.disconnect();

      resolve(mutations[0]?.addedNodes?.[0]);
    });

    addObserver.observe(container, {childList: true, subtree: true});

    paragraph.after(fragment);
  });
};

export const createNewEmptyLine = ({
  paragraph,
  range
}: {
  paragraph: HTMLElement;
  range: Range;
}): Promise<Node | undefined> => {
  const br: HTMLBRElement = document.createElement('br');
  return insertNodeInRange({observerRoot: paragraph, range, element: br});
};

export const createNewParagraph = ({
  container,
  range,
  text
}: {
  container: HTMLElement;
  range: Range;
  text: string;
}): Promise<Node | undefined> => {
  const div: HTMLDivElement = document.createElement('div');
  div.innerHTML = text;
  return insertNodeInRange({observerRoot: container, range, element: div});
};

const insertNodeInRange = ({
  observerRoot,
  range,
  element
}: {
  observerRoot: HTMLElement;
  range: Range;
  element: HTMLElement;
}): Promise<Node | undefined> => {
  return new Promise<Node | undefined>((resolve) => {
    const addObserver: MutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
      addObserver.disconnect();

      resolve(mutations[0]?.addedNodes?.[0]);
    });

    addObserver.observe(observerRoot, {childList: true, subtree: true});

    range.insertNode(element);
  });
};

export const prependEmptyText = ({
  paragraph
}: {
  paragraph: HTMLElement;
}): Promise<Node | undefined> => {
  return new Promise<Node | undefined>((resolve) => {
    const addObserver: MutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
      addObserver.disconnect();

      resolve(mutations[0]?.addedNodes?.[0]);
    });

    addObserver.observe(paragraph, {childList: true, subtree: true});

    const text: Text = document.createTextNode('\u200B');
    paragraph.prepend(text);
  });
};

export const addEmptyText = ({
  paragraph,
  element
}: {
  paragraph: HTMLElement;
  element: HTMLElement;
}): Promise<Node | undefined> => {
  return new Promise<Node | undefined>((resolve) => {
    const addObserver: MutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
      addObserver.disconnect();

      resolve(mutations[0]?.addedNodes?.[0]);
    });

    addObserver.observe(paragraph, {childList: true, subtree: true});

    const text: Text = document.createTextNode('\u200B');
    element.after(text);
  });
};

export const isParagraphEmpty = ({paragraph}: {paragraph: HTMLElement | undefined}): boolean =>
  ['', '\n', '\u200B'].includes(paragraph?.textContent?.trim());

export const isParagraphNotEditable = ({
  paragraph
}: {
  paragraph: HTMLElement | undefined;
}): boolean => paragraph?.getAttribute('contenteditable') === 'false';

export const isParagraphCode = ({paragraph}: {paragraph: HTMLElement}): boolean => {
  // DeckDeckGo web components
  if (paragraph.nodeName.toLowerCase().startsWith('deckgo-')) {
    return true;
  }

  return ['code', 'pre'].includes(paragraph.nodeName.toLowerCase());
};

export const isParagraphList = ({paragraph}: {paragraph: HTMLElement}): boolean =>
  ['ul', 'ol', 'dl'].includes(paragraph.nodeName.toLowerCase());
