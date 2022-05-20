import containerStore from '../stores/container.store';
import {isTextNode} from '../utils/node.utils';
import {findParagraph} from '../utils/paragraph.utils';

export class PlaceHolderEvents {
  private editorRef: HTMLElement | undefined;

  init({editorRef}: {editorRef: HTMLElement | undefined}) {
    this.editorRef = editorRef;

    this.editorRef?.addEventListener('selectParagraph', this.onSelectParagraph);

    this.classesEmpty();
  }

  destroy() {
    this.editorRef?.removeEventListener('selectParagraph', this.onSelectParagraph);
  }

  private onSelectParagraph = ({detail}: CustomEvent<HTMLElement>) => {
    const firstParagraph: Element | undefined = containerStore.state.ref?.firstElementChild;
    const secondParagraph: Element | undefined = containerStore.state.ref?.children[1];

    const first: boolean = firstParagraph && detail.isEqualNode(firstParagraph);
    const second: boolean = secondParagraph && detail.isEqualNode(secondParagraph);

    containerStore.state.ref?.removeEventListener('keydown', this.onKeyChange);
    containerStore.state.ref?.removeEventListener('keyup', this.onKeyChange);

    if (first || second) {
      containerStore.state.ref?.addEventListener('keydown', this.onKeyChange);
      containerStore.state.ref?.addEventListener('keyup', this.onKeyChange);
    }

    this.classesEmpty();
  };

  private onKeyChange = () => {
    const paragraph: Node | undefined = findParagraph({
      element: getSelection()?.anchorNode,
      container: containerStore.state.ref
    });

    if (!paragraph || isTextNode(paragraph)) {
      return;
    }

    this.toggleClassEmpty(paragraph as HTMLElement);
  };

  private classesEmpty() {
    const firstParagraph: Element | undefined = containerStore.state.ref?.firstElementChild;
    const secondParagraph: Element | undefined = containerStore.state.ref?.children[1];

    this.classEmpty(firstParagraph);
    this.classEmpty(secondParagraph);
  }

  private classEmpty(element: Element | undefined) {
    if (!element) {
      return;
    }

    const paragraph: Node | undefined = findParagraph({
      element,
      container: containerStore.state.ref
    });

    if (!paragraph || isTextNode(paragraph)) {
      return;
    }

    this.toggleClassEmpty(paragraph as HTMLElement);
  }

  private toggleClassEmpty(paragraph: HTMLElement) {
    if (
      paragraph.textContent === '' ||
      (paragraph.textContent.charAt(0) === '\u200B' && paragraph.textContent.length === 1)
    ) {
      paragraph.classList.add('empty');
      return;
    }

    paragraph.classList.remove('empty');
  }
}
