import {ToolbarAlign} from '../types/toolbar';
import {toHTMLElement} from './node.utils';
import {findParagraph} from './paragraph.utils';

export const execCommandAlign = (
  anchorEvent: MouseEvent | TouchEvent,
  container: HTMLElement,
  align: ToolbarAlign
) => {
  const anchorElement: HTMLElement = toHTMLElement(anchorEvent.target as Node);
  const paragraph: HTMLElement | undefined = toHTMLElement(
    findParagraph({element: anchorElement, container})
  );

  if (!paragraph) {
    return;
  }

  paragraph.style.textAlign = paragraph?.style.textAlign === align ? '' : align;
};
