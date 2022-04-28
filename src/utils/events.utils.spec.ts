import {MockHTMLElement} from '@stencil/core/mock-doc';
import {emitAddParagraphs, emitDeleteElements, emitUpdateParagraphs} from './events.utils';

describe('event', () => {
  let editorRef, element, dispatchEventSpy;

  beforeEach(() => {
    editorRef = document.createElement('div');

    element = document.createElement('div');
    element.setAttribute('test', 'test');

    dispatchEventSpy = jest.spyOn(editorRef, 'dispatchEvent');
  });

  const expectDispatched = ({eventName}: {eventName: string}) => {
    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));

    const event = dispatchEventSpy.mock.calls[0][0];

    expect(event.bubbles).toBeTruthy();
    expect(event.type).toBe(eventName);

    const detail = (event as unknown as {detail: MockHTMLElement[]}).detail[0];
    expect(detail.getAttribute('test')).toEqual('test');
  };

  it('should emit addParagraphs', () => {
    const addedParagraphs = [element];

    emitAddParagraphs({
      editorRef,
      addedParagraphs
    });

    expectDispatched({eventName: 'addParagraphs'});
  });

  it('should emit deleteElements', () => {
    const removedElements = [element];

    emitDeleteElements({
      editorRef,
      removedElements
    });

    expectDispatched({eventName: 'deleteElements'});
  });

  it('should emit updateParagraphs', () => {
    const updatedParagraphs = [element];

    emitUpdateParagraphs({
      editorRef,
      updatedParagraphs
    });

    expectDispatched({eventName: 'updateParagraphs'});
  });
});
