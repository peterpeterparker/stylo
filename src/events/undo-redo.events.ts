import {caretPosition, debounce} from '@deckdeckgo/utils';
import containerStore from '../stores/container.store';
import undoRedoStore from '../stores/undo-redo.store';
import {
  UndoRedoAddRemoveParagraph,
  UndoRedoInput,
  UndoRedoUpdateParagraph
} from '../types/undo-redo';
import {elementIndex, nodeIndex, toHTMLElement} from '../utils/node.utils';
import {findParagraph} from '../utils/paragraph.utils';
import {
  findAddedNodesParagraphs,
  findAddedParagraphs,
  findRemovedNodesParagraphs,
  findRemovedParagraphs,
  findSelectionParagraphs,
  findUpdatedParagraphs,
  RemovedParagraph
} from '../utils/paragraphs.utils';
import {
  nextRedoChange,
  nextUndoChange,
  redo,
  stackUndoInput,
  stackUndoParagraph,
  stackUndoUpdate,
  undo
} from '../utils/undo-redo.utils';

interface UndoUpdateParagraphs extends UndoRedoUpdateParagraph {
  paragraph: HTMLElement;
}

export class UndoRedoEvents {
  private inputObserver: MutationObserver | undefined;
  private treeObserver: MutationObserver | undefined;
  private attributesObserver: MutationObserver | undefined;

  private undoInput: UndoRedoInput | undefined = undefined;
  private undoUpdateParagraphs: UndoUpdateParagraphs[] = [];

  private readonly debounceUpdateInput: () => void = debounce(() => this.stackUndoInput(), 350);

  private unsubscribe;

  init() {
    this.undoInput = undefined;
    this.undoUpdateParagraphs = [];

    this.inputObserver = new MutationObserver(this.onCharacterDataMutation);
    this.treeObserver = new MutationObserver(this.onTreeMutation);
    this.attributesObserver = new MutationObserver(this.onAttributesMutation);

    this.observe();

    containerStore.state.ref.addEventListener('keydown', this.onKeydown);
    containerStore.state.ref.addEventListener('focusin', this.onFocusIn);

    document.addEventListener('toolbarActivated', this.onSelectionChange);

    this.unsubscribe = undoRedoStore.onChange('observe', (observe: boolean) => {
      if (observe) {
        // We re-active the selection as if we would have selected a paragraphs because we might need to record next update
        this.copySelectedParagraphs({filterEmptySelection: false});
        this.undoInput = undefined;

        this.observe();
        return;
      }

      this.disconnect();
    });
  }

  destroy() {
    this.disconnect();

    containerStore.state.ref?.removeEventListener('keydown', this.onKeydown);
    containerStore.state.ref?.removeEventListener('focusin', this.onFocusIn);
    containerStore.state.ref?.removeEventListener('focusout', this.onFocusOut);

    document.removeEventListener('toolbarActivated', this.onSelectionChange);

    this.unsubscribe?.();
  }

  private observeKeydown() {
    containerStore.state.ref?.addEventListener('keydown', this.onKeydown);
  }

  private disconnectKeydown() {
    containerStore.state.ref?.removeEventListener('keydown', this.onKeydown);
  }

  private onKeydown = async ($event: KeyboardEvent) => {
    const {key, ctrlKey, metaKey, shiftKey} = $event;

    if (key === 'Enter') {
      this.stackUndoInput();
      return;
    }

    if (key === 'z' && (ctrlKey || metaKey) && !shiftKey) {
      await this.undo($event);
      return;
    }

    if (key === 'z' && (ctrlKey || metaKey) && shiftKey) {
      await this.redo($event);
      return;
    }
  };

  private async undo($event: KeyboardEvent) {
    $event.preventDefault();

    if (nextUndoChange() === undefined) {
      return;
    }

    await this.undoRedo({undoRedo: undo});
  }

  private async redo($event: KeyboardEvent) {
    $event.preventDefault();

    if (nextRedoChange() === undefined) {
      return;
    }

    await this.undoRedo({undoRedo: redo});
  }

  private onFocusIn = ({target}: FocusEvent) => {
    const focusedElement: HTMLElement | undefined | null = toHTMLElement(target as Node);

    // TODO: implement undo-redo for highlight-code too
    if (!focusedElement || focusedElement.nodeName.toLowerCase() !== 'deckgo-highlight-code') {
      return;
    }

    // We use the browser capability when editing a code block and once done, we stack in the custom undo-redo store the all modification
    this.disconnectKeydown();
    this.disconnect();

    containerStore.state.ref.addEventListener('focusout', this.onFocusOut, {once: true});

    this.undoUpdateParagraphs = [
      {
        outerHTML: focusedElement.outerHTML,
        index: elementIndex(focusedElement),
        paragraph: focusedElement
      }
    ];
  };

  private onFocusOut = ({target}: FocusEvent) => {
    // Should not happen
    if (this.undoUpdateParagraphs.length <= 0) {
      this.observeKeydown();
      this.observe();
      return;
    }

    const focusedElement: HTMLElement | undefined | null = toHTMLElement(target as Node);

    // Should not happen neither
    if (!focusedElement || focusedElement.nodeName.toLowerCase() !== 'deckgo-highlight-code') {
      this.observeKeydown();
      this.observe();
      return;
    }

    if (focusedElement.outerHTML === this.undoUpdateParagraphs[0].outerHTML) {
      this.observeKeydown();
      this.observe();
      return;
    }

    stackUndoUpdate({paragraphs: this.undoUpdateParagraphs, container: containerStore.state.ref});

    this.observeKeydown();
    this.observe();
  };

  private stackUndoInput() {
    if (!this.undoInput || this.undoUpdateParagraphs.length > 0) {
      return;
    }

    stackUndoInput({
      data: this.undoInput,
      container: containerStore.state.ref
    });

    this.undoInput = undefined;
  }

  private async undoRedo({undoRedo}: {undoRedo: () => Promise<void>}) {
    // We skip mutations when we process undo redo
    this.disconnect();

    await undoRedo();

    this.observe();
  }

  private observe() {
    this.treeObserver.observe(containerStore.state.ref, {childList: true, subtree: true});
    this.inputObserver.observe(containerStore.state.ref, {
      characterData: true,
      subtree: true,
      characterDataOldValue: true
    });
    this.attributesObserver.observe(containerStore.state.ref, {attributes: true, subtree: true});
  }

  private disconnect() {
    this.treeObserver?.disconnect();
    this.inputObserver?.disconnect();
    this.attributesObserver?.disconnect();
  }

  private onSelectionChange = () => {
    this.copySelectedParagraphs({filterEmptySelection: true});
  };

  // Copy current paragraphs value to a local state so we can add it to the undo redo global store in case of modifications
  private copySelectedParagraphs({filterEmptySelection}: {filterEmptySelection: boolean}) {
    const paragraphs: HTMLElement[] | undefined = findSelectionParagraphs({
      container: containerStore.state.ref,
      filterEmptySelection
    });

    if (!paragraphs) {
      return;
    }

    this.undoUpdateParagraphs = this.toUpdateParagraphs(paragraphs);
  }

  private toUpdateParagraphs(paragraphs: HTMLElement[]): UndoUpdateParagraphs[] {
    return paragraphs.map((paragraph: HTMLElement) => ({
      outerHTML: paragraph.outerHTML,
      index: elementIndex(paragraph),
      paragraph
    }));
  }

  private onCharacterDataMutation = (mutations: MutationRecord[]) => {
    if (!this.undoInput) {
      const mutation: MutationRecord = mutations[0];

      const target: Node = mutation.target;

      const newValue: string = target.nodeValue;

      const paragraph: HTMLElement | undefined = toHTMLElement(
        findParagraph({element: target, container: containerStore.state.ref})
      );

      if (!paragraph || !target.parentNode) {
        return;
      }

      // We find the list of node indexes of the parent of the modified text
      const depths: number[] = [nodeIndex(target)];

      let parentElement: HTMLElement = target.parentElement;
      while (!parentElement.isSameNode(paragraph)) {
        depths.push(nodeIndex(parentElement));
        parentElement = parentElement.parentElement;
      }

      this.undoInput = {
        oldValue: mutation.oldValue,
        offset: caretPosition({target}) + (mutation.oldValue.length - newValue.length),
        index: elementIndex(paragraph),
        indexDepths: depths.reverse()
      };
    }

    this.debounceUpdateInput();
  };

  private onTreeMutation = (mutations: MutationRecord[]) => {
    this.onParagraphsMutations(mutations);
    this.onNodesParagraphsMutation(mutations);
  };

  /**
   * Paragraphs added and removed
   */
  private onParagraphsMutations(mutations: MutationRecord[]) {
    const changes: UndoRedoAddRemoveParagraph[] = [];

    // New paragraph
    const addedParagraphs: HTMLElement[] = findAddedParagraphs({
      mutations,
      container: containerStore.state.ref
    });
    addedParagraphs.forEach((paragraph: HTMLElement) =>
      changes.push({
        outerHTML: this.cleanOuterHTML(paragraph),
        mutation: 'add',
        index: paragraph.previousElementSibling
          ? elementIndex(toHTMLElement(paragraph.previousElementSibling)) + 1
          : 0
      })
    );

    // Paragraphs removed
    const removedParagraphs: RemovedParagraph[] = findRemovedParagraphs({
      mutations,
      container: containerStore.state.ref
    });

    const lowerIndex: number = Math.min(
      ...removedParagraphs.map(({previousSibling}: RemovedParagraph) =>
        previousSibling ? elementIndex(toHTMLElement(previousSibling)) + 1 : 0
      )
    );

    removedParagraphs.forEach(({paragraph}: RemovedParagraph, index: number) =>
      changes.push({
        outerHTML: this.cleanOuterHTML(paragraph),
        mutation: 'remove',
        index: index + lowerIndex
      })
    );

    if (changes.length <= 0) {
      return;
    }

    stackUndoParagraph({
      container: containerStore.state.ref,
      changes
    });
  }

  /**
   * Nodes within paragraphs added and removed
   */
  private onNodesParagraphsMutation(mutations: MutationRecord[]) {
    const addedNodesMutations: MutationRecord[] = findAddedNodesParagraphs({
      mutations,
      container: containerStore.state.ref
    });
    const removedNodesMutations: MutationRecord[] = findRemovedNodesParagraphs({
      mutations,
      container: containerStore.state.ref
    });

    const needsUpdate: boolean = addedNodesMutations.length > 0 || removedNodesMutations.length > 0;

    if (!needsUpdate) {
      return;
    }

    if (this.undoUpdateParagraphs.length <= 0) {
      return;
    }

    const addedParagraphs: HTMLElement[] = findAddedParagraphs({
      mutations,
      container: containerStore.state.ref
    });

    // Check that the nodes of the paragraphs to update were not already been added to the undoRedo store in `onParagraphsMutations`
    const filterUndoUpdateParagraphs: UndoUpdateParagraphs[] = this.undoUpdateParagraphs.filter(
      ({paragraph}: UndoUpdateParagraphs) =>
        paragraph.isConnected &&
        addedParagraphs.find((element: HTMLElement) => element.isEqualNode(paragraph)) === undefined
    );

    if (filterUndoUpdateParagraphs.length <= 0) {
      this.copySelectedParagraphs({filterEmptySelection: true});
      return;
    }

    stackUndoUpdate({
      paragraphs: filterUndoUpdateParagraphs,
      container: containerStore.state.ref
    });

    this.copySelectedParagraphs({filterEmptySelection: true});
  }

  private cleanOuterHTML(paragraph: HTMLElement): string {
    const clone: HTMLElement = paragraph.cloneNode(true) as HTMLElement;
    clone.removeAttribute('placeholder');
    return clone.outerHTML;
  }

  private onAttributesMutation = async (mutations: MutationRecord[]) => {
    // Only "style" changes are interesting at the moment. If we need more attributes, we should add a config because "placeholder" and "paragraph_id" need to be skipped.
    const updateParagraphs: HTMLElement[] = findUpdatedParagraphs({
      mutations: mutations.filter(({attributeName}: MutationRecord) =>
        ['style'].includes(attributeName)
      ),
      container: containerStore.state.ref
    });

    if (updateParagraphs.length <= 0) {
      return;
    }

    stackUndoUpdate({
      paragraphs: this.undoUpdateParagraphs,
      container: containerStore.state.ref
    });

    this.copySelectedParagraphs({filterEmptySelection: false});
  };
}
