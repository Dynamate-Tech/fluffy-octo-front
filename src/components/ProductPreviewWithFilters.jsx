import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProductPreviewWithFilters() {
  const [collections, setCollections] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/collections').then(res => setCollections(res.data));
    axios.get('/tags').then(res => setTags(res.data));
  }, []);

  useEffect(() => {
    const fetchPreview = async () => {
      if (!selectedTag && !selectedCollection) return;

      setLoading(true);
      try {
        const params = selectedTag
          ? { tag: selectedTag }
          : { collectionId: selectedCollection };

        const res = await axios.get('/preview', { params });
        setVariants(res.data);
      } catch (err) {
        console.error('Failed to load preview:', err.message);
      }
      setLoading(false);
    };

    fetchPreview();
  }, [selectedTag, selectedCollection]);

  const resetFilters = () => {
    setSelectedTag('');
    setSelectedCollection('');
    setVariants([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <select
          value={selectedCollection}
          onChange={e => {
            setSelectedCollection(e.target.value);
            setSelectedTag('');
          }}
          className="border p-2 rounded"
        >
          <option value="">📁 Filter by Collection</option>
          {collections.map(col => (
            <option key={col.id} value={col.id}>
              {col.title}
            </option>
          ))}
        </select>

        <select
          value={selectedTag}
          onChange={e => {
            setSelectedTag(e.target.value);
            setSelectedCollection('');
          }}
          className="border p-2 rounded"
        >
          <option value="">🏷️ Filter by Tag</option>
          {tags.map(tag => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>

        <button onClick={resetFilters} className="bg-gray-200 p-2 rounded">
          Reset
        </button>
      </div>

      {loading && <p>⏳ Loading products...</p>}

      {!loading && variants.length > 0 && (
        <table className="w-full border mt-4 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Product Title</th>
              <th className="p-2 border">SKU</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Compare At</th>
              <th className="p-2 border">Inventory</th>
              <th className="p-2 border">Size</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v, i) => (
              <tr key={`${v.variant_id}_${i}`}>
                <td className="p-2 border">{v.title}</td>
                <td className="p-2 border">{v.sku}</td>
                <td className="p-2 border">{v.price}</td>
                <td className="p-2 border">{v.compare_at_price}</td>
                <td className="p-2 border">{v.quantity}</td>
                <td className="p-2 border">{v.size}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && variants.length === 0 && (
        <p className="text-gray-500">No variants found. Select a tag or collection.</p>
      )}
    </div>
  );
}
