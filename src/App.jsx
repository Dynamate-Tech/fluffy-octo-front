import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/admin';

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Check if redirected after successful connect
    const params = new URLSearchParams(window.location.search);

    if (params.get("connected")) {
      alert("Shopify connected successfully!");

      // Optional: clean URL (remove ?connected=true)
      window.history.replaceState({}, document.title, window.location.pathname);
    }

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
        setLoading(false);
      }
    }

    checkConnection();
  }, []);

  if (loading) return <div>Loading...</div>;

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
