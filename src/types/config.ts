import {StyloPlugin} from './plugin';
import {StyloToolbar} from './toolbar';

export interface StyloConfig {
  lang?: Languages;
  plugins?: StyloPlugin[];
  toolbar?: Partial<StyloToolbar>;
  /**
   * In which type of nodes the placeholder "Press "/" for plugins" should be displayed
   */
  placeholders?: string[];
}
