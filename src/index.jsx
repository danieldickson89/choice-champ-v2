import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.Fragment>
        <App />
    </React.Fragment>
);

// Remove the inline splash painted by index.html once React has had a
// chance to render. Min-display of ~450ms keeps it from flashing on
// fast loads; we then fade out via the .cc-splash-hide class and drop
// the node entirely after the transition.
const SPLASH_MIN_MS = 450;
const startedAt = performance.now();
requestAnimationFrame(() => {
    const splash = document.getElementById('cc-splash');
    if (!splash) return;
    const elapsed = performance.now() - startedAt;
    const wait = Math.max(0, SPLASH_MIN_MS - elapsed);
    setTimeout(() => {
        splash.classList.add('cc-splash-hide');
        setTimeout(() => splash.remove(), 350);
    }, wait);
});
