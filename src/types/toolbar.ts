import {StyloPalette} from './palette';

export interface StyloConfigToolbar {
  /**
   * The list of selectable colors
   */
  palette?: StyloPalette[];
  /**
   * Use `document.execCommand` (= "native") to modify the document or, alternatively use the `custom` implementation
   * Ultimately 'native' should / will be replaced by custom which still need improvements
   */
  command: 'native' | 'custom';
  /**
   * Configure some actions of the toolbar
   */
  style: {
    /**
     * Enable actions to manipulate list. Disabled per default.
     */
    list: boolean;
    /**
     * Actions to manipulate the alignment enabled?
     */
    align: boolean;
    /**
     * Actions to modify the selection font-size enabled?
     */
    fontSize: boolean;
    /**
     * To hide the option to select a background-color
     */
    backgroundColor: boolean;
  };
}

export enum ToolbarActions {
  STYLE,
  LINK,
  COLOR,
  ALIGNMENT,
  LIST,
  FONT_SIZE,
  BACKGROUND_COLOR
}

export enum ToolbarList {
  ORDERED = 'insertOrderedList',
  UNORDERED = 'insertUnorderedList'
}

export enum ToolbarAlign {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right'
}

export enum ToolbarFontSize {
  X_SMALL = '1',
  SMALL = '2',
  MEDIUM = '3',
  LARGE = '4',
  X_LARGE = '5',
  XX_LARGE = '6',
  XXX_LARGE = '7'
}

export interface ToolbarAnchorLink {
  range: Range;
  text: string;
}
