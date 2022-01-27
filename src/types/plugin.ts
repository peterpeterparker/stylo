import {StyloIcon} from './icon';

export interface StyloPluginCreateParagraphsParams {
  container: HTMLElement;
  paragraph: HTMLElement;
  files?: FileList;
}

export interface StyloPluginFiles {
  accept: string;
  multiple: boolean;
}

export interface StyloPlugin {
  text: string;
  icon: StyloIcon;
  files?: StyloPluginFiles;
  createParagraphs: (params: StyloPluginCreateParagraphsParams) => Promise<void>;
}
