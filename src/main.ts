/**
 * Development playground for web component library
 */

import './style.css';

// Initialize the development environment
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="ui-reset">
    <h1>Web Component Library</h1>
    <p>Development playground for testing components</p>
    
    <div id="component-demo">
      <!-- Components will be demonstrated here -->
    </div>
  </div>
`;

// Development: Register and test components here
console.log('Web Component Library - Development Mode');
