import {newSpecPage} from '@stencil/core/testing';
import {Add} from './add';

describe('add', () => {
  it('renders', async () => {
    const {root} = await newSpecPage({
      components: [Add],
      html: '<stylo-add></stylo-add>'
    });

    expect(root).toEqualHtml(`
      <stylo-add style="display: none;">
       <mock:shadow-root>
         <button aria-label="Add a new part" type="button">
            <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
               <path d="M256 112v288M400 256H112" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></path>
            </svg>
          </button>
       </mock:shadow-root>
     </stylo-add>
    `);
  });
});
