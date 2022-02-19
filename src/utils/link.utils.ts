import {getSelection, isFirefox} from '@deckdeckgo/utils';
import {toHTMLElement} from './node.utils';
import {getRange} from './selection.utils';

export const createLink = ({range, linkUrl}: {range: Range; linkUrl: string}) => {
  const fragment: DocumentFragment = range.extractContents();
  const a: HTMLAnchorElement = createLinkElement({fragment, linkUrl});

  range.insertNode(a);
};

export const removeLink = (container?: HTMLElement) => {
  if (isFirefox()) {
    removeFirefoxLink();
    return;
  }

  const {range, selection} = getRange(container);

  if (!range) {
    return;
  }

  const anchor: HTMLElement = toHTMLElement(selection.anchorNode);

  const fragment: DocumentFragment = range.extractContents();

  anchor.parentElement.replaceChild(fragment, anchor);
};

const removeFirefoxLink = () => {
  const selection: Selection | null = getSelection();
  const container: HTMLElement | undefined = toHTMLElement(selection?.anchorNode);

  if (!container || container.nodeName.toLowerCase() !== 'a') {
    return;
  }

  container.parentElement.insertBefore(document.createTextNode(container.textContent), container);
  container.parentElement.removeChild(container);
};

const createLinkElement = ({
  fragment,
  linkUrl
}: {
  fragment: DocumentFragment;
  linkUrl: string;
}): HTMLAnchorElement => {
  const a: HTMLAnchorElement = document.createElement('a');
  a.appendChild(fragment);
  a.href = linkUrl;

  a.rel = 'noopener noreferrer';

  return a;
};
