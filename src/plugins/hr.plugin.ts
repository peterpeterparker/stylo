import {StyloPlugin, StyloPluginCreateParagraphsParams} from '../types/plugin';
import {createEmptyElement} from '../utils/create-element.utils';
import {transformParagraph} from '../utils/paragraph.utils';

export const hr: StyloPlugin = {
  text: 'separator',
  icon: 'hr',
  createParagraphs: async ({container, paragraph}: StyloPluginCreateParagraphsParams) => {
    const hr: HTMLHRElement = document.createElement('hr');

    transformParagraph({
      elements: [hr, createEmptyElement({nodeName: 'div'})],
      paragraph,
      container,
      focus: 'last'
    });
  }
};
