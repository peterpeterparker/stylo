import {newE2EPage} from '@stencil/core/testing';

describe('editor', () => {
  let page;

  beforeEach(async () => {
    page = await newE2EPage();

    await page.setContent(
      `<article style="width: 200px; height: 200px; margin: 64px; padding: 8px;">
          <div>${'\u200B'}</div>
        </article>
        <stylo-editor></stylo-editor>
        <aside>${'\u200B'}</aside>`
    );

    await page.$eval('stylo-editor', (el) => {
      const container = document.querySelector('article');
      (el as HTMLStyloEditorElement).containerRef = container;
    });

    await page.waitForChanges();
  });

  it('renders', async () => {
    const element = await page.find('stylo-editor');
    expect(element).toHaveClass('hydrated');
  });

  describe('add', () => {
    it('should display add', async () => {
      const div = await page.find('div');
      await div.click();

      await page.waitForChanges();

      const styleTop: string | undefined = await page.$eval('stylo-add', ({style}: HTMLElement) =>
        style.getPropertyValue('--actions-top')
      );

      const styleLeft: string | undefined = await page.$eval('stylo-add', ({style}: HTMLElement) =>
        style.getPropertyValue('--actions-left')
      );

      expect(styleTop).toEqual('72px');
      expect(styleLeft).toEqual('');
    });

    it('should not display add', async () => {
      const aside = await page.find('aside');
      await aside.click();

      await page.waitForChanges();

      const styleTop: string | undefined = await page.$eval('stylo-add', ({style}: HTMLElement) =>
        style.getPropertyValue('--actions-top')
      );

      const styleLeft: string | undefined = await page.$eval('stylo-add', ({style}: HTMLElement) =>
        style.getPropertyValue('--actions-left')
      );

      expect(styleTop).toEqual('');
      expect(styleLeft).toEqual('');
    });
  });

  describe('transform', () => {
    it('should display transform', async () => {
      const div = await page.find('div');
      await div.click();

      await page.waitForChanges();

      const add = await page.find('stylo-add >>> button');
      await add.click();

      await page.waitForChanges();

      const styleTop: string | undefined = await page.$eval(
        'stylo-plugins',
        ({style}: HTMLElement) => style.getPropertyValue('--actions-top')
      );

      const styleLeft: string | undefined = await page.$eval(
        'stylo-plugins',
        ({style}: HTMLElement) => style.getPropertyValue('--actions-left')
      );

      expect(styleTop).toEqual('109.5px');
      expect(styleLeft).toEqual('80px');

      const transform = await page.find('stylo-plugins');
      expect(transform).toHaveClasses(['display', 'hydrated']);
    });
  });
});
