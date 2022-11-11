import {StyloPlugin, StyloPluginCreateParagraphsParams} from '../types/plugin';
import {createEmptyElement} from '../utils/create-element.utils';
import {transformParagraph} from '../utils/paragraph.utils';

export const blockquote: StyloPlugin = {
  text: 'blockquote',
  icon: `<span class='placeholder'>Blockquote</span>`,
  createParagraphs: async ({container, paragraph}: StyloPluginCreateParagraphsParams) =>
    transformParagraph({
      elements: [createEmptyElement({nodeName: 'blockquote'})],
      paragraph,
      container
    })
};
