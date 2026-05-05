import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/admin';

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkConnection() {
      try {
        const res = await fetch(
          "https://dynamate-promo-price-change.onrender.com/status"
        );
        const data = await res.json();

        if (!data.connected) {
          window.location.href =
            "https://dynamate-promo-price-change.onrender.com/auth?shop=hh-dynamic-sports-hub.myshopify.com";
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Connection check failed:", err);
      }
    }

    checkConnection();
  }, []);

  // 👇 Prevent UI from flashing before check finishes
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
