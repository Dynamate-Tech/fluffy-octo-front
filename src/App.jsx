// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/admin'; // make sure this path is correct
import BatchesPage from './pages/BatchesPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/batches" element={<BatchesPage />} />
      </Routes>
    </Router>
  );
};

export default App;

