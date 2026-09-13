import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Ensure IntersectionObserver exists for iframe / constrained webview safety
if (typeof window !== 'undefined') {
  if (!('IntersectionObserver' in window)) {
    (window as any).IntersectionObserver = class {
      constructor(private cb: any) {}
      observe(target: any) {
        setTimeout(() => this.cb([{ isIntersecting: true, target }]), 0);
      }
      unobserve() {}
      disconnect() {}
    };
  }

  if (!('ResizeObserver' in window)) {
    (window as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
