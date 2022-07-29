import {moveCursorToEnd, moveCursorToStart} from '@deckdeckgo/utils';
import containerStore from '../stores/container.store';
import {isNodeList, isTextNode, nodeIndex} from '../utils/node.utils';
import {findParagraph, isParagraph} from '../utils/paragraph.utils';
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

    $event.preventDefault();

    await this.catchTab($event);
  };

  private async catchTab({shiftKey}: KeyboardEvent) {
    const {range, selection} = getRange(containerStore.state.ref);

    if (!range) {
      return;
    }

    const node: Node | undefined = selection?.focusNode;

    const paragraph: Node | undefined = findParagraph({
      element: node,
      container: containerStore.state.ref
    });

    if (paragraph && isNodeList({node: paragraph})) {
      await this.createSublist({paragraph, node, range, shiftKey});
      return;
    }

    // Shiftkey only useful to replace sublist
    if (shiftKey) {
      return;
    }

    this.createTabulation({range, node, paragraph});
  }

  private createTabulation({
    range,
    node,
    paragraph
  }: {
    range: Range;
    node: Node | undefined;
    paragraph: Node | undefined;
  }) {
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
    shiftKey
  }: {
    paragraph: Node;
    node: Node | undefined;
    range: Range;
    shiftKey: boolean;
  }): Promise<void> {
    // If list contains a single child that is just text then browser returns the list as focus node
    const focusNodeIsList: boolean = node !== undefined && isNodeList({node: node});

    const paragraphListNodeName: 'ul' | 'ol' | 'dl' = paragraph.nodeName.toLowerCase() as
      | 'ul'
      | 'ol'
      | 'dl';

    const li: Node | undefined = focusNodeIsList
      ? node.firstChild
      : this.findParentElement({
          element: node,
          paragraph,
          nodeName: 'li'
        });

    if (!li) {
      this.createTabulation({range, node, paragraph});
      return;
    }

    const ul: Node | undefined = focusNodeIsList
      ? node
      : this.findParentElement({
          element: node,
          paragraph,
          nodeName: paragraphListNodeName
        });

    if (!ul) {
      this.createTabulation({range, node, paragraph});
      return;
    }

    if (shiftKey) {
      // We do not want to remove the top ul
      if (isParagraph({element: ul, container: containerStore.state.ref})) {
        return;
      }

      // Move cursor end to newly created list
      const observer: MutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
        observer.disconnect();

        const addedFirstNode: Node | undefined = mutations.find(
          ({addedNodes}: MutationRecord) => addedNodes.length > 0
        )?.addedNodes[0];

        // Move cursor to new li
        moveCursorToStart(addedFirstNode);
      });

      observer.observe(paragraph, {childList: true, subtree: true});

      const newRange: Range = new Range();
      newRange.setStartBefore(li);
      newRange.setEndAfter(ul.lastChild);

      const liIndex: number = nodeIndex(li);

      const contents: DocumentFragment = newRange.extractContents();

      // If we shift-tab first li of the ul, we want to replace the all ul
      if (liIndex === 0) {
        ul.parentElement.replaceChild(contents, ul);
        return;
      }

      // Else we want to bring the other li from the selected to end of this ul one level higher
      ul.parentElement.insertBefore(contents, ul.nextSibling);

      return;
    }

    const {endOffset, commonAncestorContainer} = range;

    const empty: boolean = commonAncestorContainer.textContent.length === 0;
    const cursorEnd: boolean = endOffset === commonAncestorContainer.textContent.length;
    const lastChild: boolean = commonAncestorContainer.isSameNode(this.findLastChild(li));

    if ((!cursorEnd || !lastChild) && !empty) {
      this.createTabulation({range, node, paragraph});
      return;
    }

    // We do not want to index list that has a single element
    if (ul.childNodes.length === 1) {
      this.createTabulation({range, node, paragraph});
      return;
    }

    // Move cursor end or start to added child
    const observer: MutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
      observer.disconnect();

      const addedFirstNode: Node | undefined = mutations.find(
        ({addedNodes}: MutationRecord) => addedNodes.length > 0
      )?.addedNodes[0];

      if (!addedFirstNode) {
        return;
      }

      const focusNode: Node | null = isNodeList({node: addedFirstNode})
        ? addedFirstNode.firstChild
        : addedFirstNode;

      // Move cursor to new li. If empty we move to start because maybe it contains a br a last child.
      if (addedFirstNode.textContent.length === 0) {
        moveCursorToStart(focusNode);
        return;
      }

      moveCursorToEnd(focusNode);
    });

    observer.observe(paragraph, {childList: true, subtree: true});

    // Previous sibling is a list so, we can move the li there
    if (li.previousSibling && isNodeList({node: li.previousSibling})) {
      li.previousSibling.appendChild(li);
      return;
    }

    // Clone li and append it to a new sublist, a new ul
    const newRange: Range = new Range();
    newRange.selectNode(li);

    const contents: DocumentFragment = newRange.cloneContents();
    const newUl: HTMLElement = document.createElement(paragraphListNodeName);
    newUl.append(contents);

    // Replace li with new ul
    ul.replaceChild(newUl, li);
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
