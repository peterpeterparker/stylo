import {moveCursorToEnd} from '@deckdeckgo/utils';
import configStore from '../stores/config.store';
import containerStore from '../stores/container.store';
import {isMetaContent, isPhrasingContent, isTextNode, toHTMLElement} from '../utils/node.utils';
import {
  addParagraphs,
  findParagraph,
  insertNodeInRange,
  isParagraphEmpty,
  transformParagraph
} from '../utils/paragraph.utils';
import {deleteRange, getRange} from '../utils/selection.utils';
import {createLinkElement} from "../utils/link.utils";

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

    console.log(
      $event.clipboardData.getData('text/plain'),
      '---',
      $event.clipboardData.getData('text/html')
    );

    // User either paste a non-html content or paste text with adapt style - i.e. paste text/plain within a paragraph
    const plainText: boolean = div.children.length <= 0;

    if (plainText) {
      const text: string = $event.clipboardData.getData('text/plain');

      const isUrl = (text: string): boolean => {
        try {
          const {protocol} = new URL(text);
          return ['http:', 'https:'].includes(protocol);
        } catch (_) {
          return false;
        }
      };

      // If user paste a link as plain text we convert it to link
      if (isUrl(text)) {
        const a: HTMLAnchorElement = createLinkElement({linkUrl: text});
        a.innerHTML = text;
        div.append(a);
      }
    }

    // It's still plain text and we did not extract any urls
    if (plainText && div.children.length <= 0) {
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

    this.cleanAttributes(div);
    this.cleanMetas(div);

    const notOnlyText: boolean =
      Array.from(div.childNodes).find((node: Node) => !isPhrasingContent(node)) !== undefined;

    deleteRange(range);

    // If there is only text nodes and span, we consider the paste content as part of a paragraph. e.g. copy/paste a text and a link
    if (!notOnlyText) {
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

    const elements: [HTMLElement, ...HTMLElement[]] = Array.from(div.childNodes).map(
      (node: Node) => {
        if (isTextNode(node) || node.nodeName.toLowerCase().trim() === 'span') {
          const div: HTMLDivElement = document.createElement('div');
          div.appendChild(node);
          return div;
        }

        return node as HTMLElement;
      }
    ) as [HTMLElement, ...HTMLElement[]];

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

  // clean all meta, style and title pasted tags
  private cleanMetas(div: HTMLDivElement): HTMLDivElement {
    const metas: Element[] = Array.from(div.children).filter((node: HTMLElement) =>
      isMetaContent(node)
    );
    for (const element of metas) {
      element.parentElement.removeChild(element);
    }
    return div;
  }
}
