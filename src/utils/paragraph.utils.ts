import {moveCursorToEnd} from '@deckdeckgo/utils';
import {createEmptyElement} from './create-element.utils';
import {isTextNode, toHTMLElement} from './node.utils';

export const findParagraph = ({
  element,
  container
}: {
  element: Node;
  container: Node;
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

export const isParagraph = ({element, container}: {element: Node; container: Node}): boolean => {
  if (!element) {
    return false;
  }

  const {parentElement} = element;

  return parentElement?.isEqualNode(container);
};

export const isTargetParagraph = ({target, container}: {target: Node; container: Node}): boolean =>
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

    const {firstChild}: Node = toHTMLElement(addedNodes[focus === 'first' ? 0 : addedNodes.length - 1]);

    moveCursorToEnd(firstChild);
  });

  addObserver.observe(container, {childList: true, subtree: true});

  const anchor: HTMLElement | undefined = toHTMLElement(paragraph.previousElementSibling);

  // We delete present paragraph and add the new element and assumes the mutation observer will trigger both delete and add in a single mutation.
  // Thanks to this, only one entry will be added in the undo-redo stack.
  container.removeChild(paragraph);

  if (!anchor) {
    container.append(...elements);
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
}) => {
  const addObserver: MutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
    addObserver.disconnect();
    moveCursorToEnd(mutations[0]?.addedNodes?.[0]);
  });

  addObserver.observe(container, {childList: true, subtree: true});

  const div: HTMLElement = createEmptyElement({nodeName: 'div'});

  // Should not happen, fallback
  if (!paragraph) {
    container.append(div);
    return;
  }

  paragraph.after(div);
};

export const createNewEmptyLine = ({paragraph}: {paragraph: HTMLElement}) => {
  const addObserver: MutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
    addObserver.disconnect();
    moveCursorToEnd(mutations[0]?.addedNodes?.[mutations[0]?.addedNodes.length - 1]);
  });

  addObserver.observe(paragraph, {childList: true, subtree: true});

  const br: HTMLBRElement = document.createElement('br');
  const text: Text = document.createTextNode('\u200B');

  paragraph.append(...[br, text]);
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
