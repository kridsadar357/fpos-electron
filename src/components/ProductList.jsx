import React, { useState, useEffect } from 'react';

const ProductList = ({ onAddProduct, searchTerm = '' }) => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/api/products?type=goods')
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error('Error fetching products:', err));
    }, []);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grid grid-cols-3 gap-3 h-full overflow-y-auto p-1">
            {filteredProducts.map(product => (
                <button
                    key={product.id}
                    onClick={() => onAddProduct(product)}
                    disabled={product.stock <= 0}
                    className={`bg-white p-2 rounded-xl shadow-sm hover:shadow-md border border-gray-200 flex flex-col items-center justify-between transition-all hover:scale-105 h-[160px] ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <div className="w-20 h-20 bg-gray-50 rounded-lg mb-1 overflow-hidden flex items-center justify-center shrink-0">
                        {product.image_url ? (
                            <img
                                src={product.image_url.startsWith('http') ? product.image_url : `http://localhost:3001${product.image_url}`}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <i className="fas fa-box text-2xl text-gray-300"></i>
                        )}
                    </div>
                    <div className="w-full text-center flex flex-col justify-between flex-grow overflow-hidden">
                        <h4 className="font-bold text-xs text-gray-800 line-clamp-2 mb-0.5 leading-tight">{product.name}</h4>
                        <div className="mt-auto">
                            <p className="text-blue-600 font-bold text-sm">฿{product.price}</p>
                            <p className={`text-[10px] ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {product.stock > 0 ? `เหลือ ${product.stock}` : 'หมด'}
                            </p>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default ProductList;
