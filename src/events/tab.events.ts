import {moveCursorToEnd} from '@deckdeckgo/utils';
import containerStore from '../stores/container.store';
import {isTextNode} from '../utils/node.utils';
import {findParagraph, isParagraphList} from '../utils/paragraph.utils';
import {getRange} from '../utils/selection.utils';

export class TabEvents {
  init() {
    containerStore.state.ref?.addEventListener('keydown', this.onKeyDown);
  }

  destroy() {
    containerStore.state.ref?.removeEventListener('keydown', this.onKeyDown);
  }

  private onKeyDown = async ($event: KeyboardEvent) => {
    const {key} = $event;

    if (!['Tab'].includes(key)) {
      return;
    }

    await this.catchTab($event);
  };

  private async catchTab($event: KeyboardEvent) {
    const {range, selection} = getRange(containerStore.state.ref);

    if (!range) {
      return;
    }

    const {shiftKey} = $event;

    const node: Node | undefined = selection?.focusNode;

    const paragraph: Node | undefined = findParagraph({
      element: node,
      container: containerStore.state.ref
    });

    const {listCreated} = await this.createSublist({paragraph, node, range, shiftKey});

    if (listCreated) {
      $event.preventDefault();
      return;
    }

    // Shiftkey only useful to replace sublist
    if (shiftKey) {
      return;
    }

    $event.preventDefault();

    if (!isTextNode(node)) {
      if (paragraph !== undefined) {
        this.createTabulation({range});
        return;
      }

      return;
    }

    this.createTabulation({range});
  }

  private createTabulation({range}: {range: Range}) {
    const span: HTMLSpanElement = document.createElement('span');
    span.innerHTML = '\u0009';

    range?.insertNode(span);

    moveCursorToEnd(span);
  }

  private async createSublist({
    paragraph,
    node,
    range: {endOffset, commonAncestorContainer},
    shiftKey
  }: {
    paragraph: Node | undefined;
    node: Node | undefined;
    range: Range;
    shiftKey: boolean;
  }): Promise<{listCreated: boolean}> {
    if (!paragraph) {
      return {listCreated: false};
    }

    if (!isParagraphList({paragraph})) {
      return {listCreated: false};
    }

    const li: Node | undefined = this.findParentElement({
      element: node,
      paragraph,
      nodeName: 'li'
    });

    if (!li) {
      return {listCreated: false};
    }

    if (shiftKey) {
      const cursorStart: boolean = endOffset === 0;
      const firstChild: boolean = commonAncestorContainer.isSameNode(li.firstChild);

      if (!cursorStart || !firstChild) {
        return {listCreated: false};
      }

      const ul: Node | undefined = this.findParentElement({
        element: node,
        paragraph,
        nodeName: 'ul'
      });

      if (!ul) {
        return {listCreated: false};
      }

      // Li is the sole child element, we can replace the ul
      if (ul.childNodes.length === 1) {
        // Extract li
        const range: Range = new Range();
        range.selectNode(li);

        const contents: DocumentFragment = range.cloneContents();

        ul.parentElement.replaceChild(contents, ul);
        return;
      }

      // Ul has many children so we m
      // TODO:
      // ul
      //   li
      //   li <- we tab here
      //   li

      return;
    }

    const cursorEnd: boolean = endOffset === commonAncestorContainer.textContent.length;
    const lastChild: boolean = commonAncestorContainer.isSameNode(li.lastChild);

    if (!cursorEnd || !lastChild) {
      return {listCreated: false};
    }

    // Clone li and append it to a new sublist, a new ul
    const range: Range = new Range();
    range.selectNode(li);

    const contents: DocumentFragment = range.cloneContents();
    const ul: HTMLUListElement = document.createElement('ul');
    ul.append(contents);

    // Move cursor end to newly created list
    const observer: MutationObserver = new MutationObserver(() => {
      observer.disconnect();

      moveCursorToEnd(ul);
    });

    observer.observe(paragraph, {childList: true, subtree: true});

    // Replace li with new ul
    li.parentElement.replaceChild(ul, li);

    return {listCreated: true};
  }

  private findParentElement({element, paragraph, nodeName}: {element: Node; paragraph: Node; nodeName: string}): Node | undefined {
    if (element.isEqualNode(paragraph)) {
      return undefined;
    }

    const {nodeName: elementNodeName, parentElement} = element;

    if (elementNodeName.toLowerCase() === 'li') {
      return element;
    }

    return this.findParentElement({element: parentElement, paragraph, nodeName});
  }
}
