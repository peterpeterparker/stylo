import {createStore} from '@stencil/store';
import {code} from '../plugins/code.plugin';
import {h1} from '../plugins/h1.plugin';
import {h2} from '../plugins/h2.plugin';
import {h3} from '../plugins/h3.plugin';
import {hr} from '../plugins/hr.plugin';
import {img} from '../plugins/img.plugin';
import {ul} from '../plugins/ul.plugin';
import {StyloMenu} from '../types/menu';
import {DEFAULT_PALETTE} from '../types/palette';
import {StyloPlugin} from '../types/plugin';
import {StyloConfigToolbar} from '../types/toolbar';

interface ConfigStore {
  plugins: StyloPlugin[];
  toolbar: StyloConfigToolbar;
  menus: StyloMenu[] | undefined;
  placeholders: string[] | undefined;
  textParagraphs: string[] | undefined;
  excludeAttributes: string[];
  dontInjectHeadCss: boolean;
}

export const DEFAULT_PLUGINS: StyloPlugin[] = [h1, h2, h3, ul, img, code, hr];

export const DEFAULT_TOOLBAR: StyloConfigToolbar = {
  palette: DEFAULT_PALETTE,
  command: 'native',
  style: {
    list: false,
    align: true,
    fontSize: true,
    backgroundColor: true
  }
};

export const DEFAULT_PLACEHOLDERS = ['div', 'p', 'span'];

export const DEFAULT_TEXT_PARAGRAPHS = ['h1', 'h2', 'h3', 'div', 'p'];

export const DEFAULT_EXCLUDE_ATTRIBUTES = [
  'placeholder',
  'data-gramm',
  'class',
  'spellcheck',
  'contenteditable'
];

export const DEFAULT_DONT_INJECT_HEAD_CSS = false;

const {state, onChange} = createStore<ConfigStore>({
  plugins: DEFAULT_PLUGINS,
  toolbar: DEFAULT_TOOLBAR,
  placeholders: DEFAULT_PLACEHOLDERS,
  textParagraphs: DEFAULT_TEXT_PARAGRAPHS,
  menus: undefined,
  excludeAttributes: DEFAULT_EXCLUDE_ATTRIBUTES,
  dontInjectHeadCss: DEFAULT_DONT_INJECT_HEAD_CSS
});

export default {state, onChange};
