import React from 'react';
import ReactDOM from 'react-dom/client';


import AppWrapper from './App'; // <-- AppWrapper is fine

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppWrapper /> {/* Render your main App */}
  </React.StrictMode>
);
