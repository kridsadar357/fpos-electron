import React, { useState, useEffect } from 'react';

const ProductModal = ({ isOpen, onClose, onSave, product, type }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        type: type || 'goods',
        stock_qty: '0',
        image_url: '',
        color: '#3B82F6',
        imageFile: null
    });
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                price: product.price,
                type: product.type,
                stock_qty: product.stock_qty || '0',
                image_url: product.image_url || '',
                color: product.color || '#3B82F6',
                imageFile: null
            });
            setPreviewUrl(product.image_url ? `http://localhost:3001${product.image_url}` : '');
        } else {
            setFormData({
                name: '',
                price: '',
                type: type || 'goods',
                stock_qty: '0',
                image_url: '',
                color: '#3B82F6',
                imageFile: null
            });
            setPreviewUrl('');
        }
    }, [product, isOpen, type]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, imageFile: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4 text-gray-800">{product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">ชื่อสินค้า</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">ราคา (บาท)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">ประเภท</label>
                        <select
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="goods">สินค้าทั่วไป (Goods)</option>
                            <option value="fuel">น้ำมัน (Fuel)</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">จำนวนคงเหลือ</label>
                        <input
                            type="number"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.stock_qty}
                            onChange={(e) => setFormData({ ...formData, stock_qty: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">รูปภาพสินค้า</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={handleFileChange}
                        />
                        {previewUrl && (
                            <div className="mt-2">
                                <img src={previewUrl} alt="Preview" className="h-32 w-32 object-cover rounded border" />
                            </div>
                        )}
                    </div>
                    {formData.type === 'fuel' && (
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">สี (สำหรับแสดงผล)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    className="h-10 w-20 p-1 border rounded cursor-pointer"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                />
                                <span className="text-sm text-gray-500">{formData.color}</span>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 font-bold"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold"
                        >
                            บันทึก
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
