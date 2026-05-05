import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/admin';

const App = () => {
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  async function checkConnection() {
    try {
      console.log("Checking connection...");

      const res = await fetch(
        "https://dynamate-promo-price-change.onrender.com/status"
      );

      console.log("Response received:", res);

      const data = await res.json();
      console.log("Data:", data);

      if (!data.connected) {
        console.log("Not connected → redirecting");
        window.location.href =
          "https://dynamate-promo-price-change.onrender.com/auth?shop=hh-dynamic-sports-hub.myshopify.com";
      } else {
        console.log("Connected!");
        setLoading(false);
      }
    } catch (err) {
      console.error("Connection check failed:", err);
      setLoading(false); // 👈 prevent infinite loading
    }
  }

  checkConnection();
}, []);

  // 👇 Prevent UI from flashing before check finishes
  if (loading) {
    return <div>Loading...</div>;
  }

  const params = new URLSearchParams(window.location.search);

if (params.get("connected")) {
  alert("Shopify connected successfully!");
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
