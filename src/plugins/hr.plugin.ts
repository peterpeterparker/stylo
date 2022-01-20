import {StyloPlugin, StyloPluginCreateParagraphsParams} from '../types/plugin';
import {createEmptyElement, createUneditableDiv} from '../utils/create-element.utils';
import {transformParagraph} from '../utils/paragraph.utils';

export const hr: StyloPlugin = {
  text: 'separator',
  icon: 'hr',
  createParagraphs: async ({container, paragraph}: StyloPluginCreateParagraphsParams) => {
    const hr: HTMLHRElement = document.createElement('hr');

    const element: HTMLDivElement = createUneditableDiv();
    element.append(hr);

    transformParagraph({
      elements: [element, createEmptyElement({nodeName: 'div'})],
      paragraph,
      container,
      focus: 'last'
    });
  }
};
