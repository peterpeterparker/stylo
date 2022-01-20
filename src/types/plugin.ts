export type StyloPluginIcon = 'code' | 'ul' | 'hr' | 'img' | string;

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
  icon: StyloPluginIcon;
  files?: StyloPluginFiles;
  createParagraphs: (params: StyloPluginCreateParagraphsParams) => Promise<void>;
}
