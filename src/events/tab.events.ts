import {moveCursorToEnd} from '@deckdeckgo/utils';
import containerStore from '../stores/container.store';
import {isTextNode} from '../utils/node.utils';
import {findParagraph, isParagraph, isParagraphList} from '../utils/paragraph.utils';
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

    if (paragraph && isParagraphList({paragraph})) {
      await this.createSublist({$event, paragraph, node, range, shiftKey});
      return;
    }

    // Shiftkey only useful to replace sublist
    if (shiftKey) {
      return;
    }

    this.createTabulation({range, $event, node, paragraph});
  }

  private createTabulation({
    range,
    $event,
    node,
    paragraph
  }: {
    range: Range;
    $event: KeyboardEvent;
    node: Node | undefined;
    paragraph: Node | undefined;
  }) {
    $event.preventDefault();

    if (!isTextNode(node)) {
      if (paragraph !== undefined) {
        this.insertSpanTabulation({range});
        return;
      }

      return;
    }

    this.insertSpanTabulation({range});
  }

  private insertSpanTabulation({range}: {range: Range}) {
    const span: HTMLSpanElement = document.createElement('span');
    span.innerHTML = '\u0009';

    range?.insertNode(span);

    moveCursorToEnd(span);
  }

  private async createSublist({
    paragraph,
    node,
    range,
    shiftKey,
    $event
  }: {
    $event: KeyboardEvent;
    paragraph: Node;
    node: Node | undefined;
    range: Range;
    shiftKey: boolean;
  }): Promise<void> {
    // If list contains a single child that is just text then browser returns the list as focus node
    const focusNodeIsList: boolean = node !== undefined && isParagraphList({paragraph: node});

    const li: Node | undefined = focusNodeIsList
      ? node.firstChild
      : this.findParentElement({
          element: node,
          paragraph,
          nodeName: 'li'
        });

    if (!li) {
      this.createTabulation({range, $event, node, paragraph});
      return;
    }

    const ul: Node | undefined = focusNodeIsList
      ? node
      : this.findParentElement({
          element: node,
          paragraph,
          nodeName: 'ul'
        });

    if (!ul) {
      this.createTabulation({range, $event, node, paragraph});
      return;
    }

    if (shiftKey) {
      // We do not want to remove the top ul
      if (isParagraph({element: ul, container: containerStore.state.ref})) {
        return;
      }

      // Li is the sole child element, we can replace the ul
      if (ul.childNodes.length === 1) {
        $event.preventDefault();

        // Extract li
        const newRange: Range = new Range();
        newRange.selectNode(li);

        const contents: DocumentFragment = newRange.cloneContents();

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

    const {endOffset, commonAncestorContainer} = range;

    const cursorEnd: boolean = endOffset === commonAncestorContainer.textContent.length;
    const lastChild: boolean = commonAncestorContainer.isSameNode(this.findLastChild(li));

    if (!cursorEnd || !lastChild) {
      this.createTabulation({range, $event, node, paragraph});
      return;
    }

    // We do not want to index list that has a single element
    if (ul.childNodes.length === 1) {
      this.createTabulation({range, $event, node, paragraph});
      return;
    }

    $event.preventDefault();

    // Clone li and append it to a new sublist, a new ul
    const newRange: Range = new Range();
    newRange.selectNode(li);

    const contents: DocumentFragment = newRange.cloneContents();
    const newUl: HTMLUListElement = document.createElement('ul');
    newUl.append(contents);

    // Move cursor end to newly created list
    const observer: MutationObserver = new MutationObserver(() => {
      observer.disconnect();

      // Move cursor to new li
      moveCursorToEnd(newUl.firstChild);
    });

    observer.observe(paragraph, {childList: true, subtree: true});

    // Replace li with new ul
    li.parentElement.replaceChild(newUl, li);
  }

  private findParentElement({
    element,
    paragraph,
    nodeName
  }: {
    element: Node;
    paragraph: Node;
    nodeName: string;
  }): Node | undefined {
    const {nodeName: elementNodeName, parentElement} = element;

    if (elementNodeName.toLowerCase() === nodeName) {
      return element;
    }

    // We iterated till the paragraph and even the paragraph is not the nodeName we are looking for
    if (isParagraph({element, container: containerStore.state.ref})) {
      return undefined;
    }

    return this.findParentElement({element: parentElement, paragraph, nodeName});
  }

  private findLastChild(element: Node): Node {
    if (element.lastChild !== null) {
      return this.findLastChild(element.lastChild);
    }

    return element;
  }
}
