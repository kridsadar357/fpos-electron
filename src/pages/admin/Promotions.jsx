import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaTag, FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

const Promotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [formData, setFormData] = useState({
        name: '',
        type: 'discount',
        condition_amount: '',
        value: '',
        product_id: '',
        start_date: '',
        end_date: '',
        active: true
    });

    useEffect(() => {
        fetchPromotions();
        fetchProducts();
    }, []);

    const fetchPromotions = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/promotions');
            const data = await res.json();
            setPromotions(data);
        } catch (err) {
            toast.error('ไม่สามารถโหลดข้อมูลโปรโมชั่นได้');
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/products?type=goods');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingPromo
                ? `http://localhost:3001/api/promotions/${editingPromo.id}`
                : 'http://localhost:3001/api/promotions';

            const method = editingPromo ? 'PUT' : 'POST';

            // Prepare data: ensure value is 0 if type is freebie, and handle empty strings
            const payload = {
                ...formData,
                value: formData.type === 'freebie' ? 0 : (formData.value || 0),
                condition_amount: formData.condition_amount || 0
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(editingPromo ? 'แก้ไขโปรโมชั่นสำเร็จ' : 'สร้างโปรโมชั่นสำเร็จ');
                fetchPromotions();
                setIsModalOpen(false);
                setEditingPromo(null);
                setFormData({
                    name: '',
                    type: 'discount',
                    condition_amount: '',
                    value: '',
                    product_id: '',
                    start_date: '',
                    end_date: '',
                    active: true
                });
            } else {
                toast.error('การดำเนินการล้มเหลว');
            }
        } catch (err) {
            toast.error('เกิดข้อผิดพลาดในการบันทึก');
        }
    };

    const handleEdit = (promo) => {
        setEditingPromo(promo);
        setFormData({
            ...promo,
            start_date: promo.start_date.split('T')[0],
            end_date: promo.end_date.split('T')[0],
            active: Boolean(promo.active)
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบโปรโมชั่นนี้?')) {
            try {
                await fetch(`http://localhost:3001/api/promotions/${id}`, { method: 'DELETE' });
                toast.success('ลบโปรโมชั่นเรียบร้อย');
                fetchPromotions();
            } catch (err) {
                toast.error('ลบไม่สำเร็จ');
            }
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = promotions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(promotions.length / itemsPerPage);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaTag className="mr-3" /> จัดการโปรโมชั่น (Promotion Management)
                </h1>
                <button
                    onClick={() => {
                        setEditingPromo(null);
                        setFormData({
                            name: '',
                            type: 'discount',
                            condition_amount: '',
                            value: '',
                            product_id: '',
                            start_date: '',
                            end_date: '',
                            active: true
                        });
                        setIsModalOpen(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700 shadow"
                >
                    <FaPlus className="mr-2" /> เพิ่มโปรโมชั่น
                </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-4 font-bold text-gray-600">ชื่อโปรโมชั่น</th>
                            <th className="p-4 font-bold text-gray-600">ประเภท</th>
                            <th className="p-4 font-bold text-gray-600">เงื่อนไข (บาท)</th>
                            <th className="p-4 font-bold text-gray-600">มูลค่า/ของแถม</th>
                            <th className="p-4 font-bold text-gray-600">ระยะเวลา</th>
                            <th className="p-4 font-bold text-gray-600">สถานะ</th>
                            <th className="p-4 font-bold text-gray-600 text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.map((promo) => (
                            <tr key={promo.id} className="hover:bg-gray-50">
                                <td className="p-4 font-bold text-gray-800">{promo.name}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${promo.type === 'discount' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                                        {promo.type === 'discount' ? 'ส่วนลด' : 'ของแถม'}
                                    </span>
                                </td>
                                <td className="p-4">฿{promo.condition_amount}</td>
                                <td className="p-4">
                                    {promo.type === 'freebie' && promo.product_id
                                        ? products.find(p => p.id === promo.product_id)?.name || 'สินค้า'
                                        : promo.value}
                                </td>
                                <td className="p-4 text-sm text-gray-500">
                                    {new Date(promo.start_date).toLocaleDateString('th-TH')} - {new Date(promo.end_date).toLocaleDateString('th-TH')}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${promo.active ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {promo.active ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                                    </span>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => handleEdit(promo)} className="text-indigo-600 hover:text-indigo-900 p-2 rounded hover:bg-indigo-50"><FaEdit /></button>
                                    <button onClick={() => handleDelete(promo.id)} className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="p-4 border-t flex flex-col md:flex-row justify-between items-center bg-white rounded-b-xl shadow mt-[-1rem] mb-6">
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
                            หน้า {currentPage} จาก {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
                            title="ถัดไป"
                        >
                            <FaChevronRight />
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
                            title="หน้าสุดท้าย"
                        >
                            <FaAngleDoubleRight />
                        </button>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">{editingPromo ? 'แก้ไขโปรโมชั่น' : 'เพิ่มโปรโมชั่น'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อโปรโมชั่น</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">ประเภท</label>
                                    <select
                                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="discount">ส่วนลด (Discount)</option>
                                        <option value="freebie">ของแถม (Freebie)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">ยอดซื้อขั้นต่ำ (บาท)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.condition_amount}
                                        onChange={e => setFormData({ ...formData, condition_amount: e.target.value })}
                                    />
                                </div>
                            </div>

                            {formData.type === 'freebie' ? (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">เลือกสินค้าของแถม</label>
                                    <select
                                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.product_id}
                                        onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                                        required
                                    >
                                        <option value="">-- เลือกสินค้า --</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">มูลค่าส่วนลด (บาท หรือ %)</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.value}
                                        onChange={e => setFormData({ ...formData, value: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">วันที่เริ่ม</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.start_date}
                                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">วันที่สิ้นสุด</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.end_date}
                                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="promo-active"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    checked={formData.active}
                                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                />
                                <label htmlFor="promo-active" className="ml-2 block text-sm font-bold text-gray-900">ใช้งาน (Active)</label>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
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
            )}
        </div>
    );
};

export default Promotions;
