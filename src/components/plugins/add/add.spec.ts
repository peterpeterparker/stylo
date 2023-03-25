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
            <svg fill="currentColor" height="24px" viewBox="0 0 24 24" width="24px" xmlns="http://www.w3.org/2000/svg">
               <path d="M0 0h24v24H0z" fill="none"></path>
               <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
            </svg>
          </button>
       </mock:shadow-root>
     </stylo-add>
    `);
  });
});
