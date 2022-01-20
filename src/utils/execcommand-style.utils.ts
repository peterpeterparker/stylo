import {getAnchorElement} from '@deckdeckgo/utils';
import {ExecCommandStyle} from '../types/execcommand';
import {isParagraph} from './paragraph.utils';
import {findStyleNode} from './toolbar.utils';

export function execCommandStyle(
  selection: Selection,
  action: ExecCommandStyle,
  container: HTMLElement
) {
  const anchor: HTMLElement | null = getAnchorElement(selection);

  if (!anchor) {
    return;
  }

  const sameSelection: boolean = anchor && anchor.innerText === selection.toString();

  if (
    sameSelection &&
    !isParagraph({element: anchor, container}) &&
    anchor.style[action.style] !== undefined
  ) {
    updateSelection(anchor, action, container);

    return;
  }

  replaceSelection(anchor, action, selection, container);
}

function updateSelection(anchor: HTMLElement, action: ExecCommandStyle, container: HTMLElement) {
  anchor.style[action.style] = getStyleValue(container, action, container);

  cleanChildren(action, anchor);
}

function replaceSelection(
  anchor: HTMLElement,
  action: ExecCommandStyle,
  selection: Selection,
  container: HTMLElement
) {
  const range: Range = selection.getRangeAt(0);

  // User selected a all list?
  if (
    range.commonAncestorContainer &&
    ['ol', 'ul', 'dl'].some(
      (listType) => listType === range.commonAncestorContainer.nodeName.toLowerCase()
    )
  ) {
    updateSelection(range.commonAncestorContainer as HTMLElement, action, container);
    return;
  }

  const fragment: DocumentFragment = range.extractContents();

  const span: HTMLSpanElement = createSpan(anchor, action, container);
  span.appendChild(fragment);

  cleanChildren(action, span);
  flattenChildren(action, span);

  range.insertNode(span);
  selection.selectAllChildren(span);
}

function cleanChildren(action: ExecCommandStyle, span: HTMLSpanElement) {
  if (!span.hasChildNodes()) {
    return;
  }

  // Clean direct (> *) children with same style
  const children: HTMLElement[] = Array.from(span.children).filter((element: HTMLElement) => {
    return element.style[action.style] !== undefined && element.style[action.style] !== '';
  }) as HTMLElement[];

  if (children && children.length > 0) {
    children.forEach((element: HTMLElement) => {
      element.style[action.style] = '';

      if (element.getAttribute('style') === '' || element.style === null) {
        element.removeAttribute('style');
      }
    });
  }

  // Direct children (> *) may have children (*) which need to be cleaned too
  Array.from(span.children).forEach((element: HTMLElement) => cleanChildren(action, element));
}

function createSpan(
  anchor: HTMLElement,
  action: ExecCommandStyle,
  container: HTMLElement
): HTMLSpanElement {
  const span: HTMLSpanElement = document.createElement('span');
  span.style[action.style] = getStyleValue(anchor, action, container);

  return span;
}

// We assume that if the same style is applied, user want actually to remove it (same behavior as in MS Word)
// Note: initial may have no effect on the background-color
function getStyleValue(
  anchor: HTMLElement,
  action: ExecCommandStyle,
  container: HTMLElement
): string {
  if (!anchor) {
    return action.value;
  }

  if (action.initial(anchor)) {
    return 'initial';
  }

  const style: Node | null = findStyleNode(anchor, action.style, container);

  if (action.initial(style as HTMLElement)) {
    return 'initial';
  }

  return action.value;
}

// We try to not keep <span/> in the tree if we can use text
function flattenChildren(action: ExecCommandStyle, span: HTMLSpanElement) {
  if (!span.hasChildNodes()) {
    return;
  }

  // Flatten direct (> *) children with no style
  const children: HTMLElement[] = Array.from(span.children).filter((element: HTMLElement) => {
    const style: string | null = element.getAttribute('style');
    return !style || style === '';
  }) as HTMLElement[];

  if (children && children.length > 0) {
    children.forEach((element: HTMLElement) => {
      // Can only be flattened if there is no other style applied to a children, like a color to part of a text with a background
      const styledChildren: NodeListOf<HTMLElement> = element.querySelectorAll('[style]');
      if (!styledChildren || styledChildren.length === 0) {
        const text: Text = document.createTextNode(element.textContent);
        element.parentElement.replaceChild(text, element);
      }
    });

    return;
  }

  // Direct children (> *) may have children (*) which need to be flattened too
  Array.from(span.children).forEach((element: HTMLElement) => flattenChildren(action, element));
}
