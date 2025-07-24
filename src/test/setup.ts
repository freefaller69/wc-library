// Global test setup for Vitest
import { beforeEach } from 'vitest';

// Clean up DOM after each test
beforeEach(() => {
  document.body.innerHTML = '';
});

// Add custom matchers if needed in the future
// expect.extend({
//   // Custom matchers here
// });
