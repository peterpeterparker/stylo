import {StyloPlugin, StyloPluginCreateParagraphsParams} from '../types/plugin';
import {createEmptyElement} from '../utils/create-element.utils';
import {transformParagraph} from '../utils/paragraph.utils';

export const h2: StyloPlugin = {
  text: 'large_title',
  icon: `<span class='placeholder'>H2</span>`,
  createParagraphs: async ({container, paragraph}: StyloPluginCreateParagraphsParams) =>
    transformParagraph({
      elements: [createEmptyElement({nodeName: 'h2'})],
      paragraph,
      container
    })
};
