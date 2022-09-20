import {isFirefox} from '@deckdeckgo/utils';
import {toHTMLElement} from './node.utils';
import {getRange} from './selection.utils';

export const createLink = ({range, linkUrl}: {range: Range; linkUrl: string}) => {
  const fragment: DocumentFragment = range.extractContents();
  const a: HTMLAnchorElement = createLinkElementForFragment({fragment, linkUrl});

  range.insertNode(a);
};

export const removeLink = (container?: HTMLElement) => {
  const {range, selection} = getRange(container);

  if (!range) {
    return;
  }

  if (isFirefox()) {
    removeFirefoxLink(selection);
    return;
  }

  const anchor: HTMLElement = toHTMLElement(selection.anchorNode);

  const fragment: DocumentFragment = range.extractContents();

  anchor.parentElement.replaceChild(fragment, anchor);
};

const removeFirefoxLink = (selection: Selection) => {
  const container: HTMLElement | undefined = toHTMLElement(selection.anchorNode);

  if (!container || container.nodeName.toLowerCase() !== 'a') {
    return;
  }

  container.parentElement.insertBefore(document.createTextNode(container.textContent), container);
  container.parentElement.removeChild(container);
};

const createLinkElementForFragment = ({
  fragment,
  linkUrl
}: {
  fragment: DocumentFragment;
  linkUrl: string;
}): HTMLAnchorElement => {
  const a: HTMLAnchorElement = createLinkElement({linkUrl});
  a.appendChild(fragment);
  return a;
};

export const createLinkElement = ({linkUrl}: {linkUrl: string}): HTMLAnchorElement => {
  const a: HTMLAnchorElement = document.createElement('a');
  a.href = linkUrl;
  a.rel = 'noopener noreferrer';
  a.target = '_blank';

  return a;
};
