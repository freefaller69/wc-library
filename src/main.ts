/**
 * Development playground for web component library
 */

import './style.css';

// Import our components
import './components/primitives/ui-heading-legacy/ui-heading.js';
import './components/primitives/ui-heading/ui-heading.js'; // The Next Generation!
import './components/primitives/ui-button/ui-button.js';
import type { UIButtonClickEventDetail } from './components/primitives/ui-button/ui-button.js';

// Initialize the development environment
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main>
    <h1>Web Component Library</h1>
    <p>Development playground for testing components</p>
    
    <section id="legacy-demo">
      <h2>Legacy UI-Heading Demo</h2>
      
      <!-- Basic headings with semantic levels -->
      <ui-heading-legacy level="1">Legacy Heading Level 1</ui-heading-legacy>
      <ui-heading-legacy level="2">Legacy Heading Level 2</ui-heading-legacy>
      <ui-heading-legacy level="3">Legacy Heading Level 3</ui-heading-legacy>
    </section>

    <section id="next-gen-demo">
      <h2>UI Heading - The Next Generation! 🚀</h2>
      
      <!-- Modern mixin-based headings -->
      <ui-heading level="1">The Next Generation Level 1</ui-heading>
      <ui-heading level="2">Modern Mixin Composition Level 2</ui-heading>
      <ui-heading level="3">StyleHandler + Accessibility Level 3</ui-heading>
      <ui-heading level="4">Semantic with Enhanced ARIA Level 4</ui-heading>
      <ui-heading level="5">Responsive Design Tokens Level 5</ui-heading>
      <ui-heading level="6">adoptedStyleSheets API Level 6</ui-heading>
    </section>

    <section id="button-demo">
      <h2>Interactive UI-Button Demo</h2>
      
      <!-- Basic buttons -->
      <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <ui-button>Default Button</ui-button>
        <ui-button variant="primary">Primary Button</ui-button>
        <ui-button variant="secondary">Secondary Button</ui-button>
        <ui-button variant="success">Success Button</ui-button>
        <ui-button variant="warning">Warning Button</ui-button>
        <ui-button variant="danger">Danger Button</ui-button>
        <ui-button variant="ghost">Ghost Button</ui-button>
      </div>

      <!-- Size variants -->
      <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
        <ui-button size="small" variant="primary">Small</ui-button>
        <ui-button variant="primary">Medium (Default)</ui-button>
        <ui-button size="large" variant="primary">Large</ui-button>
      </div>

      <!-- State variants -->
      <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <ui-button disabled>Disabled Button</ui-button>
        <ui-button loading variant="primary">Loading Button</ui-button>
        <ui-button aria-pressed="true" variant="secondary">Toggle Button (Pressed)</ui-button>
      </div>

      <!-- Interactive examples -->
      <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <ui-button id="click-test" variant="primary">Click Me!</ui-button>
        <ui-button id="keyboard-test" variant="secondary">Keyboard Test</ui-button>
        <ui-button id="toggle-test" aria-pressed="false" variant="ghost">Toggle Me</ui-button>
      </div>

      <!-- Slotted content examples -->
      <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <ui-button variant="primary">
          <span slot="start">📧</span>
          Send Email
        </ui-button>
        <ui-button variant="secondary">
          Download
          <span slot="end">⬇️</span>
        </ui-button>
        <ui-button variant="success" aria-label="Save document">
          💾
        </ui-button>
      </div>
    </section>
  </main>
`;

// Development: Test component functionality
console.log('Web Component Library - Development Mode');
console.log('Testing components...');

// Setup button event listeners for demo
document.addEventListener('DOMContentLoaded', () => {
  // Click test button
  const clickTestButton = document.getElementById('click-test');
  if (clickTestButton) {
    clickTestButton.addEventListener('ui-button-click', (event: Event) => {
      const customEvent = event as CustomEvent<UIButtonClickEventDetail>;
      console.log('Button clicked!', customEvent.detail);

      window.alert('Button clicked! Check console for event details.');
    });
  }

  // Keyboard test button
  const keyboardTestButton = document.getElementById('keyboard-test');
  if (keyboardTestButton) {
    keyboardTestButton.addEventListener('ui-button-click', (event: Event) => {
      const customEvent = event as CustomEvent<UIButtonClickEventDetail>;
      if (customEvent.detail.triggeredBy === 'keyboard') {
        console.log('Keyboard activation detected!', customEvent.detail);

        window.alert('Great! Keyboard accessibility is working. Try Enter or Space keys.');
      } else {
        console.log('Mouse click detected!', customEvent.detail);

        window.alert('Try using Enter or Space keys for keyboard navigation!');
      }
    });
  }

  // Toggle test button
  const toggleTestButton = document.getElementById('toggle-test');
  if (toggleTestButton) {
    toggleTestButton.addEventListener('ui-button-click', () => {
      const isPressed = toggleTestButton.getAttribute('aria-pressed') === 'true';
      const newPressed = !isPressed;
      toggleTestButton.setAttribute('aria-pressed', newPressed.toString());
      toggleTestButton.textContent = newPressed ? 'Toggle Me (ON)' : 'Toggle Me (OFF)';
      console.log('Toggle button state changed:', newPressed);
    });
  }

  // Test programmatic API
  setTimeout(() => {
    console.log('Testing programmatic button API...');
    const testButton = document.getElementById('click-test') as HTMLElement & {
      disabled: boolean;
      loading: boolean;
      variant: string | null;
      size: string | null;
    };
    if (testButton) {
      console.log('Button disabled state:', testButton.disabled);
      console.log('Button loading state:', testButton.loading);
      console.log('Button variant:', testButton.variant);
      console.log('Button size:', testButton.size);
    }
  }, 1000);
});
