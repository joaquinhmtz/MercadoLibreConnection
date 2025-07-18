import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import SuccessPage from './components/SuccessPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>MercadoLibre OAuth Integration</h1>
        </header>
        <main className="App-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/success" element={<SuccessPage />} />
          </Routes>
        </main>
        <footer className="App-footer">
          <p>&copy; 2025 MercadoLibre OAuth App</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;