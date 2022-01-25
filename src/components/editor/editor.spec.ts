import {newSpecPage} from '@stencil/core/testing';
import {h1} from '../../plugins/h1.plugin';
import configStore from '../../stores/config.store';
import {StyloConfig} from '../../types/config';
import {Editor} from './editor';

describe('editor', () => {
  const container = document.createElement('div');
  container.setAttribute('contenteditable', 'true');

  it('renders', async () => {
    const {root} = await newSpecPage({
      components: [Editor],
      html: '<stylo-editor></stylo-editor>'
    });

    expect(root).toEqualHtml(`
      <stylo-editor>
       <stylo-add></stylo-add>
       <stylo-plugins></stylo-plugins>
       <stylo-toolbar></stylo-toolbar>
     </stylo-editor>
    `);
  });

  it('should render without shadow dom', async () => {
    const {root} = await newSpecPage({
      components: [Editor],
      html: '<stylo-editor></stylo-editor>',
      supportsShadowDom: false
    });
    expect(root.shadowRoot).toBeFalsy();
    expect(root.querySelector('stylo-toolbar')).toBeTruthy();
  });

  it('should init after container ref set', async () => {
    const page = await newSpecPage({
      components: [Editor],
      html: '<stylo-editor></stylo-editor>'
    });

    const spySize = spyOn(page.rootInstance, 'applySize');
    const spyEvents = spyOn(page.rootInstance, 'initEvents');

    page.root.containerRef = container;
    await page.waitForChanges();

    expect(spySize).toHaveBeenCalled();
    expect(spyEvents).toHaveBeenCalled();
  });

  it('should replace plugins', async () => {
    const page = await newSpecPage({
      components: [Editor],
      html: '<stylo-editor></stylo-editor>'
    });

    page.root.containerRef = container;
    await page.waitForChanges();

    page.root.config = {plugins: [h1]};

    await page.waitForChanges();

    expect(configStore.state.plugins).toEqual([h1]);
  });

  it('should merge toolbar config', async () => {
    const page = await newSpecPage({
      components: [Editor],
      html: '<stylo-editor></stylo-editor>'
    });

    page.root.containerRef = container;
    await page.waitForChanges();

    let config: StyloConfig = {
      toolbar: {
        actions: {
          img: {
            anchor: 'img',
            propertyCssFloat: 'float',
            propertyWidth: 'width'
          },
          list: false,
          align: true,
          backgroundColor: true,
          fontSize: true
        }
      }
    };

    const original = {...configStore.state.toolbar};

    page.root.config = config;

    await page.waitForChanges();

    expect(configStore.state.toolbar).toEqual({...original, ...config.toolbar});
  });
});
