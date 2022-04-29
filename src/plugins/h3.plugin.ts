import {StyloPlugin, StyloPluginCreateParagraphsParams} from '../types/plugin';
import {createEmptyElement} from '../utils/create-element.utils';
import {transformParagraph} from '../utils/paragraph.utils';

export const h3: StyloPlugin = {
  text: 'small_title',
  icon: `<span class='placeholder'>H3</span>`,
  createParagraphs: async ({container, paragraph}: StyloPluginCreateParagraphsParams) =>
    transformParagraph({
      elements: [createEmptyElement({nodeName: 'h3'})],
      paragraph,
      container
    })
};
