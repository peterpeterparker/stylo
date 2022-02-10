import containerStore from '../stores/container.store';
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
    await this.transformInput($event);
  };

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
