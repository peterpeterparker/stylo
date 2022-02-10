export const createLink = ({range, linkUrl}: {range: Range; linkUrl: string}) => {
  const fragment: DocumentFragment = range.extractContents();
  const a: HTMLAnchorElement = createLinkElement({fragment, linkUrl});

  range.insertNode(a);
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
