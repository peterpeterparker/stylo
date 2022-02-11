import {moveCursorToEnd} from '@deckdeckgo/utils';
import containerStore from '../stores/container.store';
import {createNewParagraph, isStartNode} from '../utils/paragraph.utils';
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
  }

  destroy() {
    containerStore.state.ref?.removeEventListener('beforeinput', this.onBeforeInput);
  }

  private onBeforeInput = async ($event: InputEvent) => {
    await this.preventTextLeaves($event);

    await this.deleteContentBackward($event);

    await this.transformInput($event);
  };

  private async preventTextLeaves($event: InputEvent) {
    const anchorNode: Node | undefined | null = getSelection()?.anchorNode;

    if (!containerStore.state.ref.isEqualNode(anchorNode)) {
      return;
    }

    const range: Range | undefined | null = getSelection()?.getRangeAt(0);

    if (!range) {
      return;
    }

    const {data} = $event;

    // User is not typing, for example an image is moved
    if (data === null) {
      return;
    }

    // User is typing text at the root of the container therefore the browser will create a text node a direct descendant of the contenteditable
    // This can happen when user types for example before or after an image

    $event.preventDefault();

    const div: Node | undefined = await createNewParagraph({
      container: containerStore.state.ref,
      range,
      text: $event.data
    });

    moveCursorToEnd(div);
  }

  private async deleteContentBackward($event: InputEvent) {
    const {inputType} = $event;

    if (!['deleteContentBackward'].includes(inputType)) {
      return;
    }

    const range: Range | undefined | null = getSelection()?.getRangeAt(0);

    // If the commonAncestorContainer is the container then we have selected multiple paragraphs
    if (!containerStore.state.ref.isEqualNode(range?.commonAncestorContainer)) {
      return;
    }

    // We don't have a selection that starts at the begin of an element and paragraph
    if (range.startOffset > 0) {
      return;
    }

    // We don't have a selection that starts at the begin of an paragraph
    if (!isStartNode({element: range.startContainer, container: containerStore.state.ref})) {
      return;
    }

    range.deleteContents();
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
}
