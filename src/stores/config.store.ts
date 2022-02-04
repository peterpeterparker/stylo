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
import {StyloToolbar} from '../types/toolbar';

interface ConfigStore {
  plugins: StyloPlugin[];
  toolbar: StyloToolbar;
  menus: StyloMenu[] | undefined;
  placeholders: string[] | undefined;
  excludeAttributes: string[];
}

export const DEFAULT_PLUGINS: StyloPlugin[] = [h1, h2, h3, ul, img, code, hr];

export const DEFAULT_TOOLBAR: StyloToolbar = {
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

export const DEFAULT_EXCLUDE_ATTRIBUTES = ['placeholder', 'data-gramm', 'class', 'spellcheck', 'contenteditable'];

const {state, onChange} = createStore<ConfigStore>({
  plugins: DEFAULT_PLUGINS,
  toolbar: DEFAULT_TOOLBAR,
  placeholders: DEFAULT_PLACEHOLDERS,
  menus: undefined,
  excludeAttributes: DEFAULT_EXCLUDE_ATTRIBUTES
});

export default {state, onChange};
