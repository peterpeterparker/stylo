import {StyloPlugin, StyloPluginCreateParagraphsParams} from '../types/plugin';
import {createEmptyElement} from '../utils/create-element.utils';
import {transformParagraph} from '../utils/paragraph.utils';

export const code: StyloPlugin = {
  text: 'code',
  icon: 'code',
  createParagraphs: async ({container, paragraph}: StyloPluginCreateParagraphsParams) => {
    transformParagraph({
      elements: [createEmptyElement({nodeName: 'code'}), createEmptyElement({nodeName: 'div'})],
      paragraph,
      container
    });
  }
};
