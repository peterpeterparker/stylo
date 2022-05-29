import {moveCursorToEnd} from '@deckdeckgo/utils';
import configStore from '../stores/config.store';
import containerStore from '../stores/container.store';
import {isTextNode, toHTMLElement} from '../utils/node.utils';
import {addParagraphs, findParagraph} from '../utils/paragraph.utils';
import {getRange} from '../utils/selection.utils';

export class PasteEvents {
  init() {
    containerStore.state.ref?.addEventListener('paste', this.onPaste);
  }

  destroy() {
    containerStore.state.ref?.removeEventListener('paste', this.onPaste);
  }

  private onPaste = async ($event: ClipboardEvent) => {
    const pasteHTML: string = $event.clipboardData.getData('text/html');

    const div = document.createElement('div');
    div.innerHTML = pasteHTML;

    // User either paste a non-html content or paste text with adapt style - i.e. paste text/plain within a paragraph
    if (div.children.length <= 0) {
      return;
    }

    const {range, selection} = getRange(containerStore.state.ref);

    if (!range) {
      return;
    }

    const anchor: HTMLElement | undefined = toHTMLElement(selection?.anchorNode);

    // No anchor so we let the browser deals with it
    if (!anchor) {
      return;
    }

    $event.preventDefault();

    // Undefined if user has removed all paragraphs of the container previously
    const paragraph: HTMLElement | undefined = toHTMLElement(
      findParagraph({element: anchor, container: containerStore.state.ref})
    );

    // Extract the rest of the "line" (the paragraph) form the cursor position to end
    const moveFragment: DocumentFragment | undefined = this.splitCurrentParagraph({
      range,
      paragraph
    });

    this.cleanAttributes(div);

    const last: Node | undefined = await addParagraphs({
      paragraph,
      container: containerStore.state.ref,
      nodes: [
        ...this.preventLeaves(div).filter(
          ({nodeName}: HTMLElement) => nodeName.toLowerCase() !== 'meta'
        ),
        ...(moveFragment !== undefined ? [moveFragment] : [])
      ]
    });

    moveCursorToEnd(last);
  };

  private splitCurrentParagraph({
    range,
    paragraph
  }: {
    range: Range;
    paragraph: HTMLElement | undefined;
  }): DocumentFragment | undefined {
    if (!paragraph) {
      return undefined;
    }

    range.collapse(true);
    range.setEndAfter(paragraph);

    return range.extractContents();
  }

  private cleanAttributes(div: HTMLDivElement) {
    const attributes: string[] = [
      ...new Set([...configStore.state.attributes.exclude, 'class', 'style'])
    ];

    const cleanAttr = ({element, attributes}: {element: HTMLElement; attributes: string[]}) => {
      for (const attr of attributes) {
        element.removeAttribute(attr);
      }
    };

    const children: NodeListOf<HTMLElement> = div.querySelectorAll(
      attributes.map((attr: string) => `[${attr}]`).join(',')
    );
    for (const child of Array.from(children)) {
      cleanAttr({element: child, attributes});
    }

    return div;
  }

  private preventLeaves(div: HTMLDivElement): HTMLElement[] {
    return Array.from(div.childNodes).reduce((acc: HTMLElement[], node: Node) => {
      const {nodeType} = node;

      if (nodeType === Node.ELEMENT_NODE) {
        return [...acc, node as HTMLElement];
      }

      if (isTextNode(node)) {
        const child: HTMLDivElement = document.createElement('div');
        child.appendChild(node.cloneNode(true));
        return [...acc, child];
      }

      return acc;
    }, []);
  }
}
