import React, { useEffect, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import axios from 'axios';

export default function PricePreviewTable() {
  const [filterType, setFilterType] = useState('tag');
  const [tags, setTags] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedValue, setSelectedValue] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [ruleType, setRuleType] = useState('toggle');
  const [valueInput, setValueInput] = useState(10);
  const [scheduleType, setScheduleType] = useState('now');
  const [futureDate, setFutureDate] = useState('');
  const [revertDate, setRevertDate] = useState('');

   useEffect(() => {
    // Fetch available tags
    axios.get('http://localhost:3001/tags')
    .then(res => {
      console.log('📦 Tags fetched:', res.data); // ← does this print?
      setTags(res.data);
    })
    .catch(err => console.error('Error fetching tags:', err));


    // Fetch available collections
    axios.get('http://localhost:3001/collections')
      .then(res => setCollections(res.data))
      .catch(err => console.error('Error fetching collections:', err));
  }, []);

  const fetchPreview = () => {
    if (!selectedValue) return;

    const paramKey = filterType === 'tag' ? 'tag' : 'collectionId';

    axios
      .get(`http://localhost:3001/preview?${paramKey}=${encodeURIComponent(selectedValue)}`)
      .then(res => {
        console.log("🎯 Filtered preview:", res.data);
        setPreviewData(res.data);
      })
      .catch(err => {
        console.error("❌ Preview fetch error:", err.response?.data || err.message);
        alert("Failed to load preview for selected filter.");
      });
  };

	const buildScheduledPayload = () => {
	  const actionDate = scheduleType === 'future' ? futureDate : new Date().toISOString();
	  const revertAt = scheduleType === 'revert' ? revertDate : null;

	  return {
		filterType,
		filterValue: selectedValue,
		ruleType,
		value: valueInput,
		applyAt: actionDate,
		revertAt,
	  };
	};

	console.log('📦 Scheduled Payload:', buildScheduledPayload());

  const calculateNewPrices = (price, compare) => {
  const numericPrice = parseFloat(price);
  const numericCompare = compare ? parseFloat(compare) : null;

  let fallbackUsed = false;
  let newPrice, newCompare;

  switch (ruleType) {
    case 'toggle':
      newPrice = numericCompare;
      newCompare = numericPrice;
      break;

    case 'percent-of-compare':
      if (!numericCompare) {
        fallbackUsed = true;
        newCompare = numericPrice;
      } else {
        newCompare = numericCompare;
      }
      newPrice = (newCompare * (1 - valueInput / 100)).toFixed(2);
      newCompare = newCompare.toFixed(2);
      break;

    case 'fixed-of-compare':
      if (!numericCompare) {
        fallbackUsed = true;
        newCompare = numericPrice;
      } else {
        newCompare = numericCompare;
      }
      newPrice = (newCompare - valueInput).toFixed(2);
      newCompare = newCompare.toFixed(2);
      break;

    case 'match-compare-if-empty':
      newPrice = numericPrice.toFixed(2);
      newCompare = compare ? parseFloat(compare).toFixed(2) : (fallbackUsed = true, numericPrice.toFixed(2));
      break;

    case 'percent-of-base':
      newPrice = (numericPrice * (1 - valueInput / 100)).toFixed(2);
      newCompare = compare;
      break;

    case 'fixed-of-base':
      newPrice = (numericPrice - valueInput).toFixed(2);
      newCompare = compare;
      break;

    default:
      newPrice = numericPrice.toFixed(2);
      newCompare = compare;
  }

  return [newPrice, newCompare, fallbackUsed];
};


  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <select className="border rounded p-2" value={filterType} onChange={e => { setFilterType(e.target.value); setSelectedValue(''); }}>
          <option value="tag">Filter by Tag</option>
          <option value="collection">Filter by Collection</option>
        </select>

        {filterType === 'tag' ? (
          <select className="border rounded p-2" value={selectedValue} onChange={e => setSelectedValue(e.target.value)}>
            <option value="">Select a tag</option>
            {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
          </select>
        ) : (
          <select className="border rounded p-2" value={selectedValue} onChange={e => setSelectedValue(e.target.value)}>
            <option value="">Select a collection</option>
            {collections.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        )}

        <select className="border rounded p-2" value={ruleType} onChange={e => setRuleType(e.target.value)}>
          <option value="toggle">Toggle</option>
          <option value="percent-of-compare">% of Compare-at Price</option>
          <option value="fixed-of-compare">Fixed Off Compare-at Price</option>
          <option value="match-compare-if-empty">Match Compare-at if Empty</option>
          <option value="percent-of-base">% of Base Price</option>
          <option value="fixed-of-base">Fixed Off Base Price</option>
        </select>

        {(ruleType !== 'toggle' && ruleType !== 'match-compare-if-empty') && (
          <input
            type="number"
            value={valueInput}
            className="border rounded p-2 w-24"
            onChange={(e) => {
			  const value = Number(e.target.value);
			  if (!isNaN(value)) setValueInput(value);
			}}
          />
        )}

        <div className="flex flex-col gap-2">
		  <div>
			<label className="flex items-center gap-2">
			  <input
				type="checkbox"
				checked={!!futureDate}
				onChange={(e) =>
				  setFutureDate(e.target.checked ? new Date().toISOString().slice(0, 16) : '')
				}
			  />
			  Apply at
			</label>
			{futureDate && (
			  <input
				type="datetime-local"
				className="mt-1 border rounded p-2"
				value={futureDate}
				onChange={(e) => setFutureDate(e.target.value)}
			  />
			)}
		</div>

		<div>
		  <label className="flex items-center gap-2">
			<input
			  type="checkbox"
			  checked={!!revertDate}
			  onChange={(e) =>
				setRevertDate(e.target.checked ? new Date().toISOString().slice(0, 16) : '')
			  }
			/>
			Revert at
		  </label>
		  {revertDate && (
			<input
			  type="datetime-local"
			  className="mt-1 border rounded p-2"
			  value={revertDate}
			  onChange={(e) => setRevertDate(e.target.value)}
			/>
		  )}
		</div>
	  </div>


        <button
		  className={`px-4 py-2 rounded text-white ${selectedValue ? 'bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}
		  onClick={fetchPreview}
		  disabled={!selectedValue}
		>
		  Preview
		</button>
		
		<button
		  className="bg-green-600 text-white px-4 py-2 rounded"
		  onClick={async () => {
  const payload = {
    filterType,
    filterValue: selectedValue,
    ruleType,
    valueInput, // match backend naming
    applyNow: !futureDate, // true if no futureDate
    applyDate: futureDate || null,
    revertDate: revertDate || null
  };
console.log("📦 Payload sent to backend:", payload);

  try {
    const res = await fetch('http://localhost:3001/apply-schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('✅ Apply Schedule Response:', data);
    alert(data.message || 'Change scheduled!');
  } catch (err) {
    console.error('❌ Failed to apply schedule:', err.message);
    alert('Failed to apply changes.');
  }
}}

		>
		  Apply Change
		</button>


      </div>

      {previewData.length > 0 && (
        <table className="w-full mt-4 border text-sm">
          <thead>
			<tr className="bg-gray-200">
			  <th className="p-2 border">Vendor</th>
			  <th className="p-2 border">Name</th>
			  <th className="p-2 border">SKU</th>
			  <th className="p-2 border">Size</th>
			  <th className="p-2 border">Quantity</th>
			  <th className="p-2 border">Base Price</th>
			  <th className="p-2 border">Compare-at Price</th>
			  <th className="p-2 border" style={{ color: 'green', fontWeight: 'bold' }}>New Base</th>
			  <th className="p-2 border" style={{ color: 'crimson', fontWeight: 'bold' }}>New Compare</th>	
			  <th className="p-2 border">Apply Date</th>
			  <th className="p-2 border">Revert Date</th>
			</tr>
		  </thead>
          <tbody>
            {previewData.map((variant, index) => {
			  const [newPrice, newCompare, fallbackUsed] = calculateNewPrices(variant.price, variant.compare_at_price);

			  const formatPrice = (value) => {
				if (value === null || value === undefined || value === '') return '-';
				return `$${parseFloat(value).toFixed(2)}`;
			  };
			  
              return (
                <tr key={index} className="border-t">
                  <td className="p-2 border">{variant.vendor}</td>
				  <td className="p-2 border">{variant.title}</td>
				  <td className="p-2 border">{variant.sku}</td>              
				  <td className="p-2 border">{variant.size}</td>
				  <td className="p-2 border">{variant.quantity}</td>
				  <td className="p-2 border">{formatPrice(variant.price)}</td>
				  <td className="p-2 border">{formatPrice(variant.compare_at_price)}
					{fallbackUsed && <span className="ml-1 text-xs text-orange-600">*</span>}
				  </td>
				  <td className="p-2 border" style={{ color: 'green', fontWeight: 'bold' }}>{formatPrice(newPrice)}</td>
				  <td className="p-2 border" style={{ color: 'crimson', fontWeight: 'bold' }}>{formatPrice(newCompare)}</td>
				  <td className="p-2 border">
					{futureDate ? `${format(new Date(futureDate), 'PPpp')} (${formatDistanceToNow(new Date(futureDate), { addSuffix: true })})` : 'null'}
				  </td>
				  <td className="p-2 border">
					{revertDate ? `${format(new Date(revertDate), 'PPpp')} (${formatDistanceToNow(new Date(revertDate), { addSuffix: true })})` : 'null'}
				  </td>
				</tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
	
  );
}
		<p className="text-xs text-gray-500 mt-2">
		  <span className="text-orange-600">*</span> Compare-at price was auto-filled (fallback from base).
		</p>