/**
 * index.js — Punto de entrada de React
 * React monta la aplicación en el elemento con id="root" del HTML
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
