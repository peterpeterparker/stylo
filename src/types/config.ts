import {StyloMenu} from './menu';
import {StyloPlugin} from './plugin';
import {StyloToolbar} from './toolbar';

export interface StyloConfig {
  lang?: Languages;
  plugins?: StyloPlugin[];
  toolbar?: Partial<StyloToolbar>;
  menus?: StyloMenu[];
  /**
   * In which type of nodes the placeholder "Press "/" for plugins" should be displayed
   */
  placeholders?: string[];
}
