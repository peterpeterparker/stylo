export const emitAddParagraphs = ({
  editorRef,
  addedParagraphs
}: {
  editorRef: HTMLElement | undefined;
  addedParagraphs: HTMLElement[];
}) => emit<HTMLElement[]>({editorRef, detail: addedParagraphs, message: 'addParagraphs'});

export const emitDeleteParagraphs = ({
  editorRef,
  removedParagraphs
}: {
  editorRef: HTMLElement | undefined;
  removedParagraphs: HTMLElement[];
}) => emit<HTMLElement[]>({editorRef, detail: removedParagraphs, message: 'deleteParagraphs'});

export const emitUpdateParagraphs = ({
  editorRef,
  updatedParagraphs
}: {
  editorRef: HTMLElement | undefined;
  updatedParagraphs: HTMLElement[];
}) => emit<HTMLElement[]>({editorRef, detail: updatedParagraphs, message: 'updateParagraphs'});

const emit = <T>({
  editorRef,
  message,
  detail
}: {
  editorRef: HTMLElement | undefined;
  message: string;
  detail?: T;
}) => {
  const $event: CustomEvent<T> = new CustomEvent<T>(message, {detail, bubbles: true});
  editorRef?.dispatchEvent($event);
};
