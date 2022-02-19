export interface I18nPlugins {
  huge_title: string;
  large_title: string;
  small_title: string;
  paragraph: string;
  separator: string;
  list: string;
  image: string;
  code: string;
}

export interface I18nAdd {
  placeholder: string;
  add_element: string;
}

export interface I18Toolbar {
  align_left: string;
  align_center: string;
  align_right: string;
  font_size: string;
  list_ol: string;
  list_ul: string;
  style_list: string;
  style_align: string;
  style_font_size: string;
  style_color: string;
  style_background: string;
  link: string;
  bold: string;
  italic: string;
  underline: string;
  strikethrough: string;
}

export interface I18Menus {
  img_width_original: string;
  img_width_large: string;
  img_width_medium: string;
  img_width_small: string;
  img_delete: string;
}

export type Languages = 'en' | 'es' | 'de' | 'nl';

export interface I18n {
  lang: Languages;
  plugins: I18nPlugins;
  add: I18nAdd;
  toolbar: I18Toolbar;
  menus: I18Menus;
}
