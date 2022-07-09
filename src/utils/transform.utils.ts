import {caretPosition, isFirefox, isIOS, isSafari, moveCursorToEnd} from '@deckdeckgo/utils';
import containerStore from '../stores/container.store';
import undoRedoStore from '../stores/undo-redo.store';
import {toHTMLElement} from './node.utils';
import {getSelection} from './selection.utils';

export interface BeforeInputKey {
  key: string;
}

export interface TransformInput {
  match: ({lastKey, key}: {lastKey: BeforeInputKey | undefined; key: BeforeInputKey}) => boolean;
  transform: () => HTMLElement;
  postTransform?: () => Promise<void>;
  active: (parent: HTMLElement) => boolean;
  shouldTrim: (target: Node) => boolean;
  trim: () => number;
}

export const beforeInputTransformer: TransformInput[] = [
  {
    match: ({key, lastKey}: {lastKey: BeforeInputKey | undefined; key: BeforeInputKey}) => {
      if (isIOS()) {
        return ['‘', '’', '´'].includes(lastKey?.key) && key.key === ' ';
      }

      return key.key === '`';
    },
    transform: (): HTMLElement => {
      return document.createElement('mark');
    },
    active: ({nodeName}: HTMLElement) => nodeName.toLowerCase() === 'mark',
    shouldTrim: ({nodeValue}: Node) => nodeValue.charAt(nodeValue.length - 1) === '`',
    trim: (): number => '`'.length,
    postTransform: () => replaceBacktick()
  },
  {
    match: ({lastKey, key}: {lastKey: BeforeInputKey | undefined; key: BeforeInputKey}) =>
      lastKey?.key === '*' && key.key === '*',
    transform: (): HTMLElement => {
      const span: HTMLSpanElement = document.createElement('span');
      span.style.fontWeight = 'bold';
      return span;
    },
    active: (parent: HTMLElement) => {
      const {fontWeight}: CSSStyleDeclaration = window.getComputedStyle(parent);

      return parseInt(fontWeight) > 400 || fontWeight === 'bold';
    },
    shouldTrim: ({nodeValue}: Node) => nodeValue.charAt(nodeValue.length - 1) === '*',
    trim: (): number => '*'.length
  },
  {
    match: ({lastKey, key}: {lastKey: BeforeInputKey | undefined; key: BeforeInputKey}) =>
      lastKey?.key === ' ' && key.key === '_',
    transform: (): HTMLElement => {
      const span: HTMLSpanElement = document.createElement('span');
      span.style.fontStyle = 'italic';
      return span;
    },
    active: (parent: HTMLElement) => {
      const {fontStyle}: CSSStyleDeclaration = window.getComputedStyle(parent);

      return fontStyle === 'italic';
    },
    shouldTrim: (_target: Node) => false,
    trim: (): number => ''.length
  }
];

export const transformInput = async ({
  $event,
  transformInput
}: {
  $event: KeyboardEvent | InputEvent;
  transformInput: TransformInput;
}) => {
  const selection: Selection | null = getSelection(containerStore.state.ref);

  if (!selection) {
    return;
  }

  const {focusNode: target} = selection;

  if (!target) {
    return;
  }

  const parent: HTMLElement = toHTMLElement(target);

  // Check if we can transform or end tag
  if (!canTransform({target, parent, transformInput})) {
    return;
  }

  $event.preventDefault();

  // Disable undo-redo observer as we are about to play with the DOM
  undoRedoStore.state.observe = false;

  // We might remove the last character, a * or ` if present in text
  await updateText({target, transformInput});

  // We had fun, we can observe again the undo redo store to stack the next bold element we are about to create
  undoRedoStore.state.observe = true;

  await createNode({target, parent, transformInput});
};

const replaceBacktick = (): Promise<void> => {
  if (isSafari()) {
    return Promise.resolve();
  }

  return replaceBacktickText();
};

/**
 * - Chrome renders the backtick in the new mark therefore we have to delete it the new element
 * - Firefox renders the new mark and renders the backtick at the begin of the previous text element
 */
const replaceBacktickText = (): Promise<void> => {
  return new Promise<void>((resolve) => {
    const changeObserver: MutationObserver = new MutationObserver(
      async (mutations: MutationRecord[]) => {
        changeObserver.disconnect();

        const target: Node = mutations[0].target;

        undoRedoStore.state.observe = false;

        await replaceChar({target, searchValue: '`', replaceValue: ''});

        undoRedoStore.state.observe = true;

        if (isFirefox()) {
          // Firefox acts a bit weirdly
          const parent: HTMLElement | undefined | null = toHTMLElement(target);
          moveCursorToEnd(
            parent?.nodeName.toLowerCase() === 'mark' ? parent.nextSibling : target.nextSibling
          );

          resolve();
          return;
        }

        moveCursorToEnd(target);

        resolve();
      }
    );

    changeObserver.observe(containerStore.state.ref, {characterData: true, subtree: true});
  });
};

const replaceChar = ({
  target,
  searchValue,
  replaceValue
}: {
  target: Node;
  searchValue: string;
  replaceValue: string;
}): Promise<Node> => {
  return new Promise<Node>((resolve) => {
    const changeObserver: MutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
      changeObserver.disconnect();

      resolve(mutations[0].target);
    });

    changeObserver.observe(containerStore.state.ref, {characterData: true, subtree: true});

    target.nodeValue = target.nodeValue.replace(searchValue, replaceValue);
  });
};

const createNode = ({
  target,
  parent,
  transformInput
}: {
  target: Node;
  parent: HTMLElement;
  transformInput: TransformInput;
}): Promise<void> => {
  return new Promise<void>(async (resolve) => {
    const changeObserver: MutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
      changeObserver.disconnect();

      moveCursorToEnd(mutations[0]?.addedNodes[0]);

      resolve();
    });

    changeObserver.observe(containerStore.state.ref, {childList: true, subtree: true});

    const {active, transform} = transformInput;

    if (active(parent)) {
      // We are in a bold node, therefore we want to exit it
      const newText: Text = document.createTextNode('\u200B');
      parent.after(newText);
    } else {
      // We create the new node
      const newNode: HTMLElement = transform();
      newNode.innerHTML = '\u200B';

      if (target.nextSibling) {
        parent.insertBefore(newNode, target.nextSibling);
      } else {
        parent.appendChild(newNode);
      }
    }
  });
};

const canTransform = ({
  target,
  parent,
  transformInput
}: {
  target: Node;
  parent: HTMLElement;
  transformInput: TransformInput;
}): boolean => {
  const index: number = caretPosition({target});

  // We are typing at the end of the node text, we can transform it
  if (target.nodeValue.length === index) {
    return true;
  }

  // We are typing in the middle of a text node, we can transform it or end it only if not yet transformed
  const {active} = transformInput;
  return !active(parent);
};

const updateText = ({
  target,
  transformInput: {trim, shouldTrim}
}: {
  target: Node;
  transformInput: TransformInput;
}): Promise<void> => {
  return new Promise<void>(async (resolve) => {
    if (!shouldTrim(target)) {
      resolve();
      return;
    }

    const changeObserver: MutationObserver = new MutationObserver(() => {
      changeObserver.disconnect();

      resolve();
    });

    changeObserver.observe(containerStore.state.ref, {characterData: true, subtree: true});

    target.nodeValue = target.nodeValue.substring(
      0,
      target.nodeValue.length - trim()
    );
  });
};
