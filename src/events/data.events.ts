import {debounce} from '@deckdeckgo/utils';
import configStore from '../stores/config.store';
import containerStore from '../stores/container.store';
import {emitAddParagraphs, emitDeleteParagraphs, emitUpdateParagraphs} from '../utils/events.utils';
import {isTextNode, toHTMLElement} from '../utils/node.utils';
import {
  filterAttributesMutations,
  findAddedNodesParagraphs,
  findAddedParagraphs,
  findRemovedNodesParagraphs,
  findUpdatedParagraphs
} from '../utils/paragraphs.utils';

export class DataEvents {
  private editorRef: HTMLElement | undefined;

  private treeObserver: MutationObserver | undefined;
  private attributesObserver: MutationObserver | undefined;
  private dataObserver: MutationObserver | undefined;

  private stackDataMutations: MutationRecord[] = [];

  private readonly debounceUpdateInput: () => void = debounce(() => this.updateData(), 500);

  init({editorRef}: {editorRef: HTMLElement}) {
    this.editorRef = editorRef;

    this.treeObserver = new MutationObserver(this.onTreeMutation);
    this.treeObserver.observe(containerStore.state.ref, {childList: true, subtree: true});

    this.attributesObserver = new MutationObserver(this.onAttributesMutation);
    this.attributesObserver.observe(containerStore.state.ref, {attributes: true, subtree: true});

    this.dataObserver = new MutationObserver(this.onDataMutation);
    this.dataObserver.observe(containerStore.state.ref, {characterData: true, subtree: true});
  }

  destroy() {
    this.treeObserver?.disconnect();
    this.attributesObserver?.disconnect();
    this.dataObserver?.disconnect();
  }

  private onTreeMutation = (mutations: MutationRecord[]) => {
    this.addParagraphs(mutations);
    this.deleteParagraphs(mutations);
    this.updateAddedNodesParagraphs(mutations);
  };

  private onAttributesMutation = (mutations: MutationRecord[]) => {
    this.updateParagraphs(
      filterAttributesMutations({
        mutations,
        excludeAttributes: configStore.state.excludeAttributes
      })
    );
  };

  private onDataMutation = (mutations: MutationRecord[]) => {
    this.stackDataMutations.push(...mutations);
    this.debounceUpdateInput();
  };

  private addParagraphs(mutations: MutationRecord[]) {
    if (!containerStore.state.ref) {
      return;
    }

    const addedParagraphs: HTMLElement[] = findAddedParagraphs({
      mutations,
      container: containerStore.state.ref
    });

    if (addedParagraphs.length <= 0) {
      return;
    }

    emitAddParagraphs({editorRef: this.editorRef, addedParagraphs});
  }

  private deleteParagraphs(mutations: MutationRecord[]) {
    if (!containerStore.state.ref) {
      return;
    }

    if (!mutations || mutations.length <= 0) {
      return;
    }

    // Only those the target is the container are paragraphs
    const removedNodes: Node[] = mutations.reduce(
      (acc: Node[], {removedNodes, target}: MutationRecord) => {
        if (!target.isEqualNode(containerStore.state.ref)) {
          return acc;
        }

        return [...acc, ...Array.from(removedNodes)];
      },
      []
    );

    // We remove text node, should not happen we only want elements as children of the container
    const removedParagraphs: HTMLElement[] = removedNodes
      .filter((node: Node) => !isTextNode(node))
      .map((node: Node) => toHTMLElement(node));

    if (removedParagraphs.length <= 0) {
      return;
    }

    emitDeleteParagraphs({editorRef: this.editorRef, removedParagraphs});
  }

  private updateAddedNodesParagraphs(mutations: MutationRecord[]) {
    if (!containerStore.state.ref) {
      return;
    }

    if (!mutations || mutations.length <= 0) {
      return;
    }

    const addedNodesMutations: MutationRecord[] = findAddedNodesParagraphs({
      mutations,
      container: containerStore.state.ref
    });
    const removedNodesMutations: MutationRecord[] = findRemovedNodesParagraphs({
      mutations,
      container: containerStore.state.ref
    });

    this.updateParagraphs([...addedNodesMutations, ...removedNodesMutations]);
  }

  private updateData() {
    if (!this.stackDataMutations || this.stackDataMutations.length <= 0) {
      return;
    }

    const mutations: MutationRecord[] = [...this.stackDataMutations];
    this.stackDataMutations = [];

    this.updateParagraphs(mutations);
  }

  private updateParagraphs(mutations: MutationRecord[]) {
    if (!containerStore.state.ref) {
      return;
    }

    const updatedParagraphs: HTMLElement[] = findUpdatedParagraphs({
      mutations,
      container: containerStore.state.ref
    });

    if (updatedParagraphs.length <= 0) {
      return;
    }

    emitUpdateParagraphs({editorRef: this.editorRef, updatedParagraphs});
  }
}
