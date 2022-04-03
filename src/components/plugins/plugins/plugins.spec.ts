import {newSpecPage} from '@stencil/core/testing';
import {Plugins} from './plugins';

describe('plugins', () => {
  it('renders', async () => {
    const {root} = await newSpecPage({
      components: [Plugins],
      html: '<stylo-plugins></stylo-plugins>'
    });

    expect(root).toEqualHtml(`
      <stylo-plugins class="hidden" style="visibility: hidden; height: 0px;">
       <mock:shadow-root>
         <stylo-list></stylo-list>
         <input accept="image/x-png,image/jpeg,image/gif,image/svg+xml,image/webp" type="file">
       </mock:shadow-root>
     </stylo-plugins>
    `);
  });
});
