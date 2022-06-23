import {moveCursorToEnd} from '@deckdeckgo/utils';
import configStore from '../stores/config.store';
import containerStore from '../stores/container.store';
import {findNodeAtDepths, toHTMLElement} from '../utils/node.utils';
import {createNewParagraph, findParagraph, isStartNode} from '../utils/paragraph.utils';
import {getRange} from '../utils/selection.utils';
import {
  BeforeInputKey,
  beforeInputTransformer,
  transformInput,
  TransformInput
} from '../utils/transform.utils';

export class InputEvents {
  private lastBeforeInput: BeforeInputKey | undefined = undefined;

  init() {
    containerStore.state.ref?.addEventListener('beforeinput', this.onBeforeInput);
    containerStore.state.ref?.addEventListener('keydown', this.onKeyDown);
  }

  destroy() {
    containerStore.state.ref?.removeEventListener('beforeinput', this.onBeforeInput);
    containerStore.state.ref?.removeEventListener('keydown', this.onKeyDown);
  }

  private onBeforeInput = async ($event: InputEvent) => {
    await this.preventTextLeaves($event);

    await this.transformInput($event);
  };

  private onKeyDown = ($event: KeyboardEvent) => {
    // This should be an on keydown listener because Firefox do not provide the same range in before input
    this.deleteSelection($event);
  };

  private async preventTextLeaves($event: InputEvent) {
    const {range, selection} = getRange(containerStore.state.ref);

    if (!range) {
      return;
    }

    const anchorNode: Node | undefined | null = selection?.anchorNode;

    if (!containerStore.state.ref.isEqualNode(anchorNode)) {
      return;
    }

    const {data} = $event;

    // User is not typing, for example an image is moved
    if (data === null) {
      return;
    }

    const {startOffset} = range;

    const target: Node | undefined = findNodeAtDepths({
      parent: containerStore.state.ref,
      indexDepths: [startOffset]
    });

    // We create a div - i.e. new HTML element - only if the actual target is not an editable paragraph that accepts text
    if (configStore.state.textParagraphs?.includes(target?.nodeName.toLowerCase())) {
      // We set the range to the start of the target because if we don't, the browser might create a text element before the target anyway
      range.setStart(target, 0);
      return;
    }

    // User is typing text at the root of the container therefore the browser will create a text node a direct descendant of the contenteditable
    // This can happen when user types for example before or after an image

    $event.preventDefault();

    const div: Node | undefined = await createNewParagraph({
      container: containerStore.state.ref,
      range,
      text: data
    });

    moveCursorToEnd(div);
  }

  private async transformInput($event: InputEvent) {
    const {data} = $event;

    const transformer: TransformInput | undefined = beforeInputTransformer.find(
      ({match}: TransformInput) => match({key: {key: data}, lastKey: this.lastBeforeInput})
    );

    if (transformer !== undefined) {
      await transformInput({$event, transformInput: transformer});

      await transformer.postTransform?.();

      this.lastBeforeInput = undefined;
      return;
    }

    this.lastBeforeInput = {key: data};
  }

  private deleteSelection($event: KeyboardEvent) {
    const {key} = $event;

    if (!['Delete', 'Backspace'].includes(key)) {
      return;
    }

    const {range} = getRange(containerStore.state.ref);

    if (!range) {
      return;
    }

    // If the commonAncestorContainer is the container then we have selected multiple paragraphs
    if (!containerStore.state.ref.isEqualNode(range?.commonAncestorContainer)) {
      return;
    }

    // If first char is a zeroWidthSpace and the offset start at the second character, reset range to begin
    const zeroWidthSpace: boolean =
      range.startOffset === 1 && range.startContainer.textContent.charAt(0) === '\u200B';
    if (zeroWidthSpace) {
      range.setStart(range.startContainer, 0);
    }

    // We don't have a selection that starts at the beginning of an element and paragraph
    if (range.startOffset > 0) {
      return;
    }

    // We don't have a selection that starts at the beginning of a paragraph
    if (!isStartNode({element: range.startContainer, container: containerStore.state.ref})) {
      return;
    }

    const paragraph: HTMLElement | undefined = toHTMLElement(
      findParagraph({element: range.startContainer, container: containerStore.state.ref})
    );

    if (!paragraph) {
      return;
    }

    // Reset range to begin of the paragraph in case it contains children
    range.setStartBefore(paragraph);

    $event.preventDefault();
    $event.stopImmediatePropagation();

    range.deleteContents();
  }
}
