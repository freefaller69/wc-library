/**
 * Development playground for web component library
 */

import './style.css';

// Import our minimal ui-heading component
import './components/primitives/ui-heading/ui-heading.js';

// Initialize the development environment
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main>
    <h1>Web Component Library</h1>
    <p>Development playground for testing components</p>
    
    <section id="component-demo">
      <h2>Minimal UI-Heading Demo</h2>
      
      <!-- Basic headings with semantic levels -->
      <ui-heading level="1">Heading Level 1</ui-heading>
      <ui-heading level="2">Heading Level 2</ui-heading>
      <ui-heading level="3">Heading Level 3</ui-heading>
      
      <!-- Default headings (no variants - keeping it minimal) -->
      <ui-heading level="4">Heading Level 4</ui-heading>
      <ui-heading level="5">Heading Level 5</ui-heading>
      <ui-heading level="6">Heading Level 6</ui-heading>
      
      <!-- Test strict validation - this will throw an error -->
      <!-- 
      <ui-heading level="7">This will throw an error!</ui-heading>
      <ui-heading level="invalid">This will also throw an error!</ui-heading>
      -->
    </section>
  </main>
`;

// Development: Test component functionality
console.log('Web Component Library - Development Mode');
console.log('Testing minimal ui-heading component...');
