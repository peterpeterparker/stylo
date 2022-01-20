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
           <span class="placeholder">
             H1
           </span>
           Huge title
         </button>
         <button>
           <span class="placeholder">
             H2
           </span>
           Large title
         </button>
         <button>
           <span class="placeholder">
             H3
           </span>
           Small title
         </button>
         <button>
           <svg height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg">
             <line x1="160" x2="448" y1="144" y2="144" style="fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 32px;"></line>
             <line x1="160" x2="448" y1="256" y2="256" style="fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 32px;"></line>
             <line x1="160" x2="448" y1="368" y2="368" style="fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 32px;"></line>
             <circle cx="80" cy="144" r="16" style="fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 32px;"></circle>
             <circle cx="80" cy="256" r="16" style="fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 32px;"></circle>
             <circle cx="80" cy="368" r="16" style="fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 32px;"></circle>
           </svg>
           List
         </button>
              <button>
           <svg height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg">
             <path d="M432,112V96a48.14,48.14,0,0,0-48-48H64A48.14,48.14,0,0,0,16,96V352a48.14,48.14,0,0,0,48,48H80" style="fill: none; stroke: currentColor; stroke-linejoin: round; stroke-width: 32px;"></path>
             <rect height="336" rx="45.99" ry="45.99" width="400" x="96" y="128" style="fill: none; stroke: currentColor; stroke-linejoin: round; stroke-width: 32px;"></rect>
             <ellipse cx="372.92" cy="219.64" rx="30.77" ry="30.55" style="fill: none; stroke: currentColor; stroke-miterlimit: 10; stroke-width: 32px;"></ellipse>
             <path d="M342.15,372.17,255,285.78a30.93,30.93,0,0,0-42.18-1.21L96,387.64" style="fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 32px;"></path>
             <path d="M265.23,464,383.82,346.27a31,31,0,0,1,41.46-1.87L496,402.91" style="fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 32px;"></path>
           </svg>
           Image
         </button>
         <button>
           <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
             <path d="M160 368L32 256l128-112M352 368l128-112-128-112M304 96l-96 320" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></path>
           </svg>
           Code
         </button>
         <button>
           <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
             <circle cx="256" cy="256" r="48"></circle>
             <circle cx="416" cy="256" r="48"></circle>
             <circle cx="96" cy="256" r="48"></circle>
           </svg>
           Separator
         </button>
       </mock:shadow-root>
     </stylo-list>
    `);
  });
});
