import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';
import './styles/cinematic.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary label="Application core">
    <App />
  </ErrorBoundary>
);
