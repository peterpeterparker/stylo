import {getSelection, isFirefox} from '@deckdeckgo/utils';
import {toHTMLElement} from './node.utils';

export const createLink = ({range, linkUrl}: {range: Range; linkUrl: string}) => {
  const fragment: DocumentFragment = range.extractContents();
  const a: HTMLAnchorElement = createLinkElement({fragment, linkUrl});

  range.insertNode(a);
};

export const removeLink = () => {
  if (isFirefox()) {
    removeFirefoxLink();
    return;
  }

  const selection: Selection | null = getSelection();
  const range: Range | undefined = selection?.getRangeAt(0);

  if (!range) {
    return;
  }

  const container: HTMLElement = toHTMLElement(selection.anchorNode);

  const fragment: DocumentFragment = range.extractContents();

  container.parentElement.replaceChild(fragment, container);
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
