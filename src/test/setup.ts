import { vi, expect, afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
Object.entries(matchers).forEach(([matcherName, matcher]) => {
  // @ts-ignore - we know these matchers exist
  expect.extend({
    [matcherName]: matcher,
  });
});

// Add type declarations for Vitest + Testing Library
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vi {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface JestAssertion<T = any>
      extends jest.Matchers<void, T>,
        TestingLibraryMatchers<T, void> {}
  }
}

// Mock global objects
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Cleanup after each test case
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock console methods to reduce test noise
const consoleError = console.error;
const consoleWarn = console.warn;

beforeAll(() => {
  vi.stubGlobal('expect', expect);
  
  console.error = (message) => {
    if (typeof message === 'string' && !message.includes('Error: Could not parse CSS stylesheet')) {
      consoleError(message);
    }
  };
  
  console.warn = (message) => {
    consoleWarn(message);
  };
});

afterAll(() => {
  console.error = consoleError;
  console.warn = consoleWarn;
});
