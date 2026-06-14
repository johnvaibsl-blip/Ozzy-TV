// Polyfill check to prevent read-only fetch assignment crashes (e.g. in sandboxed JS environments/crawlers)
try {
  const g = (typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {}) as any;
  if (g && g.fetch) {
    const desc = Object.getOwnPropertyDescriptor(g, 'fetch');
    if (desc) {
      const isReadOnly = (desc.writable === false) || (desc.get !== undefined && desc.set === undefined);
      if (isReadOnly && desc.configurable !== false) {
        let currentFetch = g.fetch;
        Object.defineProperty(g, 'fetch', {
          get: () => currentFetch,
          set: (val) => {
            console.warn("Intercepted fetch reassignment to prevent crash on client:", val);
            currentFetch = val;
          },
          configurable: true,
          enumerable: true
        });
      }
    }
  }
} catch (err) {
  console.warn("Warning: Could not patch global fetch descriptor on client:", err);
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
