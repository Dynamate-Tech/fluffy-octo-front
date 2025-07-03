import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductFilter = ({ onFilterChange }) => {
  const [tags, setTags] = useState([]);
  const [collections, setCollections] = useState([]);
  const [filterType, setFilterType] = useState('tag');
  const [selectedValue, setSelectedValue] = useState('');

  useEffect(() => {
    // Fetch available tags
    axios.get('http://localhost:3001/tags')
      .then(res => setTags(res.data))
      .catch(err => console.error('Error fetching tags:', err));

    // Fetch available collections
    axios.get('http://localhost:3001/collections')
      .then(res => setCollections(res.data))
      .catch(err => console.error('Error fetching collections:', err));
  }, []);

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setSelectedValue('');
    onFilterChange(null); // reset filter on switch
  };

  const handleSelectChange = (e) => {
    const value = e.target.value;
    setSelectedValue(value);
    onFilterChange({ type: filterType, value });
  };

  return (
    <div>
      <label>Filter by: </label>
      <select value={filterType} onChange={handleFilterTypeChange}>
        <option value="tag">Tag</option>
        <option value="collection">Collection</option>
      </select>

      <select value={selectedValue} onChange={handleSelectChange}>
        <option value="">-- Select --</option>
        {filterType === 'tag'
          ? tags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))
          : collections.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
      </select>
    </div>
  );
};

export default ProductFilter;
