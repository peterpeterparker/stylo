import {newSpecPage} from '@stencil/core/testing';
import {List} from './list';

describe('list', () => {
  it('renders', async () => {
    const {root} = await newSpecPage({
      components: [List],
      html: '<stylo-list></stylo-list>'
    });

    expect(root).toEqualHtml(`
       <stylo-list>
       <mock:shadow-root>
         <button>
           <div class="icon">
             <span class="placeholder">
               H1
             </span>
           </div>
           Huge title
         </button>
         <button>
           <div class="icon">
             <span class="placeholder">
               H2
             </span>
           </div>
           Large title
         </button>
         <button>
           <div class="icon">
             <span class="placeholder">
               H3
             </span>
           </div>
           Small title
         </button>
         <button>
           <svg fill="currentColor" height="24px" viewBox="0 0 24 24" width="24px" xmlns="http://www.w3.org/2000/svg">
             <path d="M0 0h24v24H0V0z" fill="none" />
             <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
           </svg>
           Bulleted list
         </button>
         <button>
           <svg fill="currentColor" height="24px" viewBox="0 0 24 24" width="24px" xmlns="http://www.w3.org/2000/svg">
             <path d="M0 0h24v24H0z" fill="none" />
             <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
           </svg>
           Numbered list
         </button>
         <button>
          <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
             <path d="M0 0h24v24H0V0z" fill="none"></path>
             <path d="M18.62 18h-5.24l2-4H13V6h8v7.24L18.62 18zm-2-2h.76L19 12.76V8h-4v4h3.62l-2 4zm-8 2H3.38l2-4H3V6h8v7.24L8.62 18zm-2-2h.76L9 12.76V8H5v4h3.62l-2 4z"></path>
           </svg>
           Blockquote
         </button>
         <button>
           <svg fill="currentColor" height="24px" viewBox="0 0 24 24" width="24px" xmlns="http://www.w3.org/2000/svg">
             <path d="M0 0h24v24H0V0z" fill="none" />
             <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" />
           </svg>
           Image
         </button>
         <button>
           <svg fill="currentColor" height="24px" viewBox="0 0 24 24" width="24px" xmlns="http://www.w3.org/2000/svg">
             <path d="M0 0h24v24H0V0z" fill="none" />
             <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
           </svg>
           Code
         </button>
         <button>
           <svg fill="currentColor" height="24px" viewBox="0 0 24 24" width="24px" xmlns="http://www.w3.org/2000/svg">
             <path d="M0 0h24v24H0z" fill="none"></path>
             <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
           </svg>
           Separator
       </mock:shadow-root>
     </stylo-list>
    `);
  });
});
