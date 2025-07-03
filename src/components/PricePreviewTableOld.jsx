export default function PricePreviewTable({ products, mode = 'toggle', discount = 10 }) {
  const calculateNewPrices = (price, compare) => {
    if (mode === 'toggle') return [compare, price];
    const numericPrice = parseFloat(price);
    const discounted = numericPrice * (1 - discount / 100);
    return [discounted.toFixed(2), numericPrice.toFixed(2)];
  };

  if (!products.length) return null;

  return (
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
          <th className="p-2 border">New Base</th>
          <th className="p-2 border">New Compare</th>		  
        </tr>
      </thead>
      <tbody>
        {products.map((variant, index) => {
          const [newPrice, newCompare] = calculateNewPrices(variant.price, variant.compare_at_price);
          return (
            <tr key={index} className="border-t">
			  <td className="p-2 border">{variant.vendor}</td>
              <td className="p-2 border">{variant.title}</td>
              <td className="p-2 border">{variant.sku}</td>              
			  <td className="p-2 border">{variant.size}</td>
			  <td className="p-2 border">{variant.quantity}</td>
			  <td className="p-2 border">${variant.price}</td>
              <td className="p-2 border">${variant.compare_at_price || '-'}</td>
              <td className="p-2 border" style={{ color: 'green', fontWeight: 'bold' }}>${newPrice}</td>
			  <td className="p-2 border" style={{ color: 'crimson', fontWeight: 'bold' }}>${newCompare}</td>		  
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
