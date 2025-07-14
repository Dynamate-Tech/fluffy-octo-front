import { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [collections, setCollections] = useState([]);
  const [tags, setTags] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [tagOptions, setTagOptions] = useState([]);
  const [ruleType, setRuleType] = useState('');
  const [discountValue, setDiscountValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [batchTitle, setBatchTitle] = useState('');


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch collections
useEffect(() => {
  axios.get(`${API_BASE_URL}/collections`)
    .then(res => {
      const sorted = res.data.sort((a, b) => a.title.localeCompare(b.title));
      setCollections(sorted);
    })
    .catch(err => console.error("❌ Failed to load collections:", err));
}, []);


// Fetch tags
useEffect(() => {
  axios.get(`${API_BASE_URL}/tags`)
    .then(res => {
      const sorted = res.data.sort((a, b) => a.localeCompare(b));
      setTagOptions(sorted);
    })
    .catch(err => {
      console.error("❌ Failed to load tags:", err.message || err);
    });
}, []);


// ✅ Put this once near the top of your component (before fetchPreview)
  const selectedFilter = selectedTag
    ? { type: "tag", value: selectedTag }
    : selectedCollection
    ? { type: "collection", value: selectedCollection }
    : null;


// ✅ Fetch preview (tag or collection)
  const fetchPreview = async () => {
  try {
    setLoading(true);

    const params = selectedFilter?.type === "tag"
      ? { tag: selectedFilter.value }
      : selectedFilter?.type === "collection"
      ? { collectionId: selectedFilter.value }
      : {};

    if (!Object.keys(params).length) return;

    const res = await axios.get(`${API_BASE_URL}/preview`, { params });

  // 🧠 Simulate price preview here!
    const updated = res.data.map((variant) => {
      const base = parseFloat(variant.price);
      const compare = parseFloat(variant.compare_at_price);
      let newPrice = null;

      switch (ruleType) {
        case 'base_percentage':
          newPrice = (base * (1 - discountValue / 100)).toFixed(2);
          break;
        case 'base_fixed':
          newPrice = parseFloat(discountValue).toFixed(2);
          break;
        case 'copy_to_compare':
          newPrice = base.toFixed(2);
          break;
        case 'compare_percentage':
          if (compare) newPrice = (compare * (1 - discountValue / 100)).toFixed(2);
          break;
        case 'compare_fixed':
          if (compare) newPrice = (compare - discountValue).toFixed(2);
          break;
        default:
          newPrice = base.toFixed(2);
      }

      return {
        ...variant,
        preview_price: newPrice,
      };
    });

    setProducts(updated);
  } catch (err) {
    console.error("❌ Failed to fetch preview:", err);
  } finally {
    setLoading(false);
  }
};



// ✅ Trigger preview when filter changes
  useEffect(() => {
	if (selectedTag || selectedCollection) {
      fetchPreview();
	}
  }, [selectedTag, selectedCollection]);



//  Apply Price Handler
const handleApplyPrices = async () => {
  try {
    const payload = {
      title: batchTitle,
      filterType: selectedFilter.type,
      filterValue: selectedFilter.value,
      ruleType,
      discountValue: ruleType !== 'copy_to_compare' ? parseFloat(discountValue) : undefined,
      startDate: startDate || null,
      endDate: endDate || null,
    };

    console.log("🚀 Sending payload to backend:", payload);

    const res = await axios.post(`${API_BASE_URL}/apply-schedule`, payload);
    alert('🎉 Price logic scheduled successfully!');
  } catch (err) {
    console.error("❌ Failed to schedule:", err);
    alert('Failed to schedule');
  }
};

// Apply Scheduled...
const applyScheduled = async () => {
  try {
    const payload = {
      title: batchTitle,
      filterType: selectedFilter.type,
      filterValue: selectedFilter.value,
      ruleType,
      discountValue: parseFloat(discountValue),
      startDate: startDate || null,
      endDate: endDate || null,
    };

    console.log("📤 Scheduling price change:", payload);

    const res = await axios.post(`${API_BASE_URL}/apply-schedule`, payload);

    alert('🎉 Price logic scheduled successfully!');
  } catch (err) {
    console.error("❌ Failed to schedule apply/revert:", err);
    alert('Failed to schedule. Check console for errors.');
  }
};


// Run price simulations..
const runSimulation = async () => {
  try {
    const res = await axios.post(`${API_BASE_URL}/simulate`, {
      filterType: selectedTag ? 'tag' : 'collection',
      filterValue: selectedTag || selectedCollection,
      ruleType,
      discountValue: parseFloat(discountValue),
    });
    setProducts(res.data); // Simulated products with `simulated_price` and `explanation`
  } catch (err) {
    console.error("❌ Simulation failed:", err);
  }
};

// Revert price now...
const revertNow = async () => {
  try {
    const res = await axios.post(`${API_BASE_URL}/revert-now`, {
      filterType: selectedFilter.type,
      filterValue: selectedFilter.value,
    });
    alert('🔄 Revert applied successfully!');
  } catch (err) {
    console.error("❌ Revert failed:", err);
    alert('Revert failed');
  }
};


// ✅ Return JSX...
  return (
	  
  <div style={{
    minHeight: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    <div style={{
      padding: '20px',
      background: '#414141',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      borderRadius: '8px',
    }}>
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Dynamate Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label>
        Batch Title:
        <input
          type="text"
          value={batchTitle}
          onChange={(e) => setBatchTitle(e.target.value)}
          className="block mt-1 p-2 border rounded w-full"
          placeholder="e.g. Nike Footwear 20% Off"
          required
        />
      </label>
      <br />
        <label>
          Filter by Collection:
          <select
			value={selectedCollection}
			onChange={(e) => {
			  setSelectedCollection(e.target.value);
			  setSelectedTag(""); // clear tag filter if collection selected
			}}
		  >
			<option value="">-- Select Collection --</option>
			{collections.map(col => (
			  <option key={col.id} value={col.id}>{col.title}</option>
			))}
		  </select>
        </label>
		<br />
        <label>
          Filter by Tag:
          <select
			value={selectedTag}
			onChange={(e) => {
			  setSelectedTag(e.target.value);
			  setSelectedCollection(""); // clear collection filter if tag selected
			}}
		  >
			<option value="">-- Select Tag --</option>
			{tagOptions.map((tag, index) => (
			  <option key={index} value={tag}>{tag}</option>
			))}
		  </select>
        </label>
		<br />
		<label>
		  Select Price Rule:
		  <select
			value={ruleType}
			onChange={(e) => setRuleType(e.target.value)}
			className="block mt-1 p-2 border rounded w-full"
		  >
			<option value="">-- Choose a Price Rule --</option>
			<option value="base_percentage">Base Price = Base - % Off</option>
			<option value="base_fixed">Base Price = Fixed Amount</option>
			<option value="copy_to_compare">If Compare-At empty → Copy Base</option>
			<option value="compare_percentage">Base Price = Compare-At - % Off</option>
			<option value="compare_fixed">Base Price = Compare-At - Fixed Amount</option>
		  </select>
		</label>
		<br />
		{ruleType !== 'copy_to_compare' && (
		<label>
		  Discount Value:
		  <input
			type="number"
			value={discountValue}
			onChange={(e) => setDiscountValue(e.target.value)}
			className="block mt-1 p-2 border rounded w-full"
			placeholder={ruleType.includes('percentage') ? 'e.g. 20 for 20%' : 'e.g. 49.99'}
		  />
		</label>
		)}
		<br />
		<label>
		  Start Date (Apply):
		  <input
			type="datetime-local"
			value={startDate}
			onChange={(e) => setStartDate(e.target.value)}
			className="block mt-1 p-2 border rounded w-full"
		  />
		</label>
		<br />
		<label>
		  End Date (Revert):
		<input
		  type="datetime-local"
		  value={endDate}
		  onChange={(e) => setEndDate(e.target.value)}
		  className="block mt-1 p-2 border rounded w-full"
		/>
		</label>
      </div>

      <button
		className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
		onClick={runSimulation}
		disabled={!selectedFilter || !selectedFilter.value}
	  >
		{loading ? 'Loading...' : 'Preview with Simulation'}
	  </button>

	  <button
		className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2"
		onClick={handleApplyPrices}
		disabled={!selectedFilter || !ruleType || (ruleType !== 'copy_to_compare' && !discountValue)}
	  >
		Apply Prices
	  </button>

	  <button
		className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
		onClick={applyScheduled}
		disabled={!selectedFilter || !selectedFilter.value || !ruleType}
	  >
		Apply with Schedule
	  </button>

	  <button
		className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
		onClick={revertNow}
		disabled={!selectedFilter || !selectedFilter.value}
	  >
		Revert Now
	  </button>

      <div className="mt-6">
	<br />
	<hr>
        {products.length > 0 ? (
          <table className="w-full border-collapse border text-sm">
            <thead className="bg-gray-100">
              <tr>
		<th className="border p-2">Vendor</th>
                <th className="border p-2">Product</th>
                <th className="border p-2">SKU</th>
                <th className="border p-2">Size</th>
                <th className="border p-2">Price</th>
                <th className="border p-2">Compare At</th>
                <th className="border p-2">Qty</th>
		<th className="border p-2" style={{ color: 'cyan', fontWeight: 'bold' }}>Simulated Price</th>
		<th className="border p-2">Explanation</th>
              </tr>
            </thead>
            <tbody>
              {products.map((variant, idx) => (
                <tr key={idx}>
		  <td className="border p-2">{variant.vendor}</td>
                  <td className="border p-2">{variant.title}</td>
                  <td className="border p-2">{variant.sku}</td>
                  <td className="border p-2">{variant.size}</td>
                  <td className="border p-2">${variant.price}</td>
                  <td className="border p-2">${variant.compare_at_price || '-'}</td>
                  <td className="border p-2">{variant.quantity}</td>
		  <td className="border p-2" style={{ color: 'cyan', fontWeight: 'bold' }}>
			${variant.simulated_price || '-'}
		  </td>
		  <td className="border p-2">{variant.explanation || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-sm">
            No preview data. Select a filter and click Preview.
          </p>
        )}
	  </div>
  	</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
