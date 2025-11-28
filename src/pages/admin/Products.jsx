import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaBox, FaGasPump, FaPlus, FaEdit, FaTrash, FaSearch, FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import ProductModal from '../../components/admin/ProductModal';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('fuel'); // 'fuel' or 'goods'
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, [activeTab]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/api/products?type=${activeTab}`);
            const data = await res.json();
            // If backend returns array directly (as per code check)
            setProducts(Array.isArray(data) ? data : data.data || []);
        } catch (err) {
            console.error('Error fetching products:', err);
            toast.error('ไม่สามารถโหลดข้อมูลสินค้าได้');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?')) return;
        try {
            const res = await fetch(`http://localhost:3001/api/products/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success('ลบสินค้าเรียบร้อยแล้ว');
                fetchProducts();
            } else {
                toast.error('ลบสินค้าไม่สำเร็จ');
            }
        } catch (err) {
            console.error('Error deleting product:', err);
            toast.error('เกิดข้อผิดพลาดในการลบสินค้า');
        }
    };

    const handleSave = async (formData) => {
        try {
            const url = editingProduct
                ? `http://localhost:3001/api/products/${editingProduct.id}`
                : 'http://localhost:3001/api/products';
            const method = editingProduct ? 'PUT' : 'POST';

            let imageUrl = formData.image_url;

            if (formData.imageFile) {
                const uploadData = new FormData();
                uploadData.append('image', formData.imageFile);

                const uploadRes = await fetch('http://localhost:3001/api/upload', {
                    method: 'POST',
                    body: uploadData
                });

                if (uploadRes.ok) {
                    const uploadResult = await uploadRes.json();
                    imageUrl = uploadResult.url;
                } else {
                    toast.error('อัปโหลดรูปภาพไม่สำเร็จ');
                    return;
                }
            }

            const productData = {
                ...formData,
                image_url: imageUrl,
                type: activeTab
            };
            // Remove file object before sending to API
            delete productData.imageFile;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            if (res.ok) {
                toast.success(editingProduct ? 'แก้ไขสินค้าสำเร็จ' : 'เพิ่มสินค้าสำเร็จ');
                setIsModalOpen(false);
                fetchProducts();
            } else {
                toast.error('บันทึกสินค้าไม่สำเร็จ');
            }
        } catch (err) {
            console.error('Error saving product:', err);
            toast.error('เกิดข้อผิดพลาดในการบันทึกสินค้า');
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    {activeTab === 'fuel' ? <FaGasPump className="mr-3" /> : <FaBox className="mr-3" />}
                    จัดการสินค้า ({activeTab === 'fuel' ? 'น้ำมัน' : 'สินค้าทั่วไป'})
                </h1>
                <button
                    onClick={handleAdd}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold flex items-center shadow"
                >
                    <FaPlus className="mr-2" /> เพิ่มสินค้า
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => { setActiveTab('fuel'); setCurrentPage(1); }}
                    className={`px-6 py-3 rounded-lg font-bold flex items-center transition-colors ${activeTab === 'fuel'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <FaGasPump className="mr-2" /> น้ำมัน (Fuel)
                </button>
                <button
                    onClick={() => { setActiveTab('goods'); setCurrentPage(1); }}
                    className={`px-6 py-3 rounded-lg font-bold flex items-center transition-colors ${activeTab === 'goods'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <FaBox className="mr-2" /> สินค้าทั่วไป (Goods)
                </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-4 font-bold text-gray-600">ชื่อสินค้า</th>
                            <th className="p-4 font-bold text-gray-600 text-right">ราคา</th>
                            <th className="p-4 font-bold text-gray-600 text-right">คงเหลือ</th>
                            <th className="p-4 font-bold text-gray-600 text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500">กำลังโหลด...</td></tr>
                        ) : currentItems.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500">ไม่พบสินค้า</td></tr>
                        ) : (
                            currentItems.map((product) => (
                                <tr key={product.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-bold text-gray-800 flex items-center gap-3">
                                        {product.image_url ? (
                                            <img src={`http://localhost:3001${product.image_url}`} alt={product.name} className="w-10 h-10 rounded object-cover border" />
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-gray-400">
                                                <FaBox />
                                            </div>
                                        )}
                                        {product.name}
                                    </td>
                                    <td className="p-4 text-right text-blue-600 font-bold">฿{parseFloat(product.price).toFixed(2)}</td>
                                    <td className="p-4 text-right font-bold">
                                        <span className={`${product.stock_qty < 10 ? 'text-red-600' : 'text-green-600'}`}>
                                            {product.stock_qty}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="p-4 border-t flex flex-col md:flex-row justify-between items-center bg-gray-50 gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">แสดง</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border rounded p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className="text-sm text-gray-600">รายการต่อหน้า</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
                            title="หน้าแรก"
                        >
                            <FaAngleDoubleLeft />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
                            title="ก่อนหน้า"
                        >
                            <FaChevronLeft />
                        </button>

                        <span className="px-4 font-bold text-gray-600">
                            หน้า {currentPage} จาก {totalPages || 1}
                        </span>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
                            title="ถัดไป"
                        >
                            <FaChevronRight />
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
                            title="หน้าสุดท้าย"
                        >
                            <FaAngleDoubleRight />
                        </button>
                    </div>
                </div>
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                product={editingProduct}
                type={activeTab} // Pass active tab to modal to set default type
            />
        </div>
    );
};

export default Products;
