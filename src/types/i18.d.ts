interface I18nPlugins {
  huge_title: string;
  large_title: string;
  small_title: string;
  paragraph: string;
  separator: string;
  list: string;
  image: string;
  code: string;
}

interface I18nAdd {
  placeholder: string;
  add_element: string;
}

type Languages = 'en' | 'es' | 'de' | 'nl';

interface I18n {
  lang: Languages;
  plugins: I18nPlugins;
  add: I18nAdd;
}
