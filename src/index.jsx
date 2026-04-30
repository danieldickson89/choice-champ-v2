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

// Splash dismissal is driven by App.jsx — it waits for the initial
// auth state to resolve and then hides the splash. This safety net
// just guarantees the splash is gone after 10s in case loading never
// resolves (auth hung, unhandled error, etc.) so the user is never
// stuck on it forever.
window.__ccSplashStart = performance.now();
setTimeout(() => {
    const splash = document.getElementById('cc-splash');
    if (!splash) return;
    splash.classList.add('cc-splash-hide');
    setTimeout(() => splash.remove(), 350);
}, 10000);
