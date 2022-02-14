import {injectHeadCSS} from './css.utils';

describe('css', () => {
  it('should inject global css in head', () => {
    injectHeadCSS(document);

    let style: HTMLStyleElement | null = document.head.querySelector('style[stylo-editor]');
    expect(style).not.toBeNull();
  });

  it('should not inject twice global css in head', () => {
    injectHeadCSS(document);
    injectHeadCSS(document);

    let styles: NodeListOf<HTMLStyleElement> =
      document.head.querySelectorAll('style[stylo-editor]');
    expect(styles.length).toEqual(1);
  });
});
