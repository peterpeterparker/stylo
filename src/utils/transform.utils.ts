import {caretPosition, isFirefox, isIOS, isSafari, moveCursorToEnd} from '@deckdeckgo/utils';
import containerStore from '../stores/container.store';
import undoRedoStore from '../stores/undo-redo.store';
import {toHTMLElement} from './node.utils';

export interface InputKey {
  key: string;
}

export interface TransformInput {
  match: ({
    lastBeforeInput,
    lastKey,
    key
  }: {
    lastBeforeInput: InputKey | undefined;
    key: InputKey;
    lastKey: InputKey | undefined;
  }) => boolean;
  transform: () => HTMLElement;
  postTransform?: () => Promise<void>;
  active: (parent: HTMLElement) => boolean;
  shouldTrim: (target: Node) => boolean;
  trim: () => number;
}

export const beforeInputTransformer: TransformInput[] = [
  {
    match: ({
      key,
      lastKey,
      lastBeforeInput
    }: {
      lastKey: InputKey | undefined;
      key: InputKey;
      lastBeforeInput: InputKey | undefined;
    }) => {
      if (isIOS()) {
        return ['‘', '’', '´'].includes(lastBeforeInput?.key) && key.key === ' ';
      }

      return key.key === '`' && [' ', 'Dead'].includes(lastKey?.key);
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
    match: ({
      lastKey,
      key
    }: {
      lastKey: InputKey | undefined;
      key: InputKey;
      lastBeforeInput: InputKey | undefined;
    }) => lastKey?.key === '*' && key.key === '*',
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
    match: ({
      lastBeforeInput,
      key
    }: {
      lastKey: InputKey | undefined;
      key: InputKey;
      lastBeforeInput: InputKey | undefined;
    }) => lastBeforeInput?.key === ' ' && key.key === '_',
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
  transformInput,
  target,
  parent
}: {
  $event: KeyboardEvent | InputEvent;
  transformInput: TransformInput;
  target: Node;
  parent: HTMLElement;
}) => {
  // Check if we can transform or end tag
  if (!canTransform({target, parent, transformInput})) {
    return;
  }

  $event.preventDefault();

  // Disable undo-redo observer as we are about to play with the DOM
  undoRedoStore.state.observe = false;

  // We might remove the character, a * or `, if present
  await updateText({target, parent, transformInput});

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
 * On Swiss French keyboard - i.e. when backtick is entered with "Shift + key":
 *
 * - Chrome renders the backtick in the new mark therefore we have to delete it the new element
 * - Firefox renders the new mark and renders the backtick at the begin of the previous text element
 */
const replaceBacktickText = (): Promise<void> => {
  return new Promise<void>((resolve) => {
    const changeObserver: MutationObserver = new MutationObserver(
      async (mutations: MutationRecord[]) => {
        changeObserver.disconnect();

        const target: Node = mutations[0].target;

        // On us keyboard, the backtick is already removed
        if (!target.nodeValue.includes('`')) {
          resolve();
          return;
        }

        undoRedoStore.state.observe = false;

        await replaceChar({target, searchValue: '`', replaceValue: ''});

        undoRedoStore.state.observe = true;

        const parent: HTMLElement | undefined | null = toHTMLElement(target);
        const mark: boolean = parent?.nodeName.toLowerCase() === 'mark';

        if (isFirefox()) {
          moveCursorToEnd(mark ? parent.nextSibling : target.nextSibling);

          resolve();
          return;
        }

        moveCursorToEnd(mark ? target : target.nextSibling);

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
      return;
    }

    // We create the new node and a node afterwards if last node of the paragraph so user can escape by clicking the arrow right
    const newNode: HTMLElement = transform();
    newNode.innerHTML = '\u200B';

    const newText: Text = document.createTextNode('\u200B');

    if (target.nextSibling) {
      parent.insertBefore(newNode, target.nextSibling);
    } else {
      parent.append(newNode, newText);
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
  transformInput,
  parent
}: {
  target: Node;
  parent: HTMLElement;
  transformInput: TransformInput;
}): Promise<void> => {
  return new Promise<void>(async (resolve) => {
    const index: number = caretPosition({target});

    // Exact same length, so we remove the last characters
    if (target.nodeValue.length === index) {
      if (!transformInput.shouldTrim(target)) {
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
        target.nodeValue.length - transformInput.trim()
      );

      return;
    }

    // The end results will be text followed by a span bold and then the remaining text
    const newText: Node = await splitText({target, index, transformInput});

    const changeObserver: MutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
      changeObserver.disconnect();

      moveCursorToEnd(mutations[1]?.addedNodes[0]);

      resolve();
    });

    changeObserver.observe(containerStore.state.ref, {childList: true, subtree: true});

    if (target.nextSibling) {
      parent.insertBefore(newText, target.nextSibling);
    } else {
      parent.appendChild(newText);
    }
  });
};

const splitText = ({
  target,
  index,
  transformInput
}: {
  target: Node;
  index: number;
  transformInput: TransformInput;
}): Promise<Node> => {
  return new Promise<Node>((resolve) => {
    const changeObserver: MutationObserver = new MutationObserver(async () => {
      changeObserver.disconnect();

      const node: Node = await removeChar({target: newText, index: 1});

      resolve(node);
    });

    changeObserver.observe(containerStore.state.ref, {childList: true, subtree: true});

    const newText: Text = (target as Text).splitText(index - transformInput.trim());
  });
};

const removeChar = ({target, index}: {target: Node; index: number}): Promise<Node> => {
  return new Promise<Node>((resolve) => {
    const changeObserver: MutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
      changeObserver.disconnect();

      resolve(mutations[0].target);
    });

    changeObserver.observe(containerStore.state.ref, {characterData: true, subtree: true});

    target.nodeValue = target.nodeValue.slice(index);
  });
};
