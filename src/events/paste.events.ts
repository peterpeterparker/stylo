import {moveCursorToEnd} from '@deckdeckgo/utils';
import configStore from '../stores/config.store';
import containerStore from '../stores/container.store';
import {isTextNode, toHTMLElement} from '../utils/node.utils';
import {
  addParagraphs,
  findParagraph,
  insertNodeInRange,
  isParagraphEmpty,
  transformParagraph
} from '../utils/paragraph.utils';
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

    console.log(div.outerHTML);

    // Undefined if user has removed all paragraphs of the container previously
    const paragraph: HTMLElement | undefined = toHTMLElement(
      findParagraph({element: anchor, container: containerStore.state.ref})
    );

    this.cleanAttributes(div);
    this.cleanMeta(div);

    const textNodes: boolean =
      Array.from(div.childNodes).find((node: Node) => isTextNode(node)) !== undefined;

    const spanNodes: boolean =
      Array.from(div.children).find(
        ({nodeName}: HTMLElement) => nodeName.toLowerCase().trim() === 'span'
      ) !== undefined;

    // If there is a text node or some span, we consider the paste content as part of a paragraph. e.g. copy/paste a text and a link
    if (textNodes || spanNodes) {
      // addParagraphs fallbacks to container append - this happens in case user delete all the content before parsing
      if (!paragraph) {
        addParagraphs({
          paragraph,
          container: containerStore.state.ref,
          nodes: [div]
        });
        return;
      }

      await this.insertNodes({range, div});
      return;
    }

    const elements: [HTMLElement, ...HTMLElement[]] = Array.from(div.children) as [
      HTMLElement,
      ...HTMLElement[]
    ];

    const empty: boolean = isParagraphEmpty({paragraph});

    if (empty) {
      transformParagraph({
        elements,
        paragraph,
        container: containerStore.state.ref
      });
      return;
    }

    // Extract the rest of the "line" (the paragraph) form the cursor position to end
    const moveFragment: DocumentFragment | undefined = this.splitCurrentParagraph({
      range,
      paragraph
    });

    addParagraphs({
      paragraph,
      container: containerStore.state.ref,
      nodes: [...elements, ...(moveFragment !== undefined ? [moveFragment] : [])]
    });
  };

  private async insertNodes({range, div}: {range: Range; div: HTMLDivElement}) {
    // convert to fragment to add all nodes at the range position
    const fragment: DocumentFragment = document.createDocumentFragment();
    fragment.append(...Array.from(div.childNodes));

    const last: Node | undefined = await insertNodeInRange({
      observerRoot: containerStore.state.ref,
      range,
      element: fragment
    });

    moveCursorToEnd(last);
  }

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

  private cleanMeta(div: HTMLDivElement): HTMLDivElement {
    const meta: HTMLElement | null = div.querySelector('meta');
    meta?.parentElement.removeChild(meta);
    return div;
  }
}
