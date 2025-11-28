import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaTruck, FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [formData, setFormData] = useState({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        tax_id: ''
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/suppliers');
            const data = await res.json();
            setSuppliers(data);
        } catch (err) {
            toast.error('ไม่สามารถโหลดข้อมูลผู้จัดจำหน่ายได้');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingSupplier
                ? `http://localhost:3001/api/suppliers/${editingSupplier.id}`
                : 'http://localhost:3001/api/suppliers';

            const method = editingSupplier ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(editingSupplier ? 'แก้ไขผู้จัดจำหน่ายสำเร็จ' : 'เพิ่มผู้จัดจำหน่ายสำเร็จ');
                fetchSuppliers();
                setIsModalOpen(false);
                setEditingSupplier(null);
                setFormData({
                    name: '',
                    contact_person: '',
                    phone: '',
                    email: '',
                    address: '',
                    tax_id: ''
                });
            } else {
                toast.error('การดำเนินการล้มเหลว');
            }
        } catch (err) {
            toast.error('เกิดข้อผิดพลาดในการบันทึก');
        }
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setFormData(supplier);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบผู้จัดจำหน่ายนี้?')) {
            try {
                await fetch(`http://localhost:3001/api/suppliers/${id}`, { method: 'DELETE' });
                toast.success('ลบผู้จัดจำหน่ายเรียบร้อย');
                fetchSuppliers();
            } catch (err) {
                toast.error('ลบไม่สำเร็จ');
            }
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = suppliers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(suppliers.length / itemsPerPage);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaTruck className="mr-3" /> จัดการผู้จัดจำหน่าย (Suppliers)
                </h1>
                <button
                    onClick={() => {
                        setEditingSupplier(null);
                        setFormData({
                            name: '',
                            contact_person: '',
                            phone: '',
                            email: '',
                            address: '',
                            tax_id: ''
                        });
                        setIsModalOpen(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700 shadow"
                >
                    <FaPlus className="mr-2" /> เพิ่มผู้จัดจำหน่าย
                </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-4 font-bold text-gray-600">ชื่อบริษัท/ร้านค้า</th>
                            <th className="p-4 font-bold text-gray-600">ผู้ติดต่อ</th>
                            <th className="p-4 font-bold text-gray-600">เบอร์โทรศัพท์</th>
                            <th className="p-4 font-bold text-gray-600">เลขประจำตัวผู้เสียภาษี</th>
                            <th className="p-4 font-bold text-gray-600 text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.map((supplier) => (
                            <tr key={supplier.id} className="hover:bg-gray-50">
                                <td className="p-4 font-bold text-gray-800">{supplier.name}</td>
                                <td className="p-4">{supplier.contact_person}</td>
                                <td className="p-4">{supplier.phone}</td>
                                <td className="p-4">{supplier.tax_id || '-'}</td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => handleEdit(supplier)} className="text-indigo-600 hover:text-indigo-900 p-2 rounded hover:bg-indigo-50"><FaEdit /></button>
                                    <button onClick={() => handleDelete(supplier.id)} className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"><FaTrash /></button>
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
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">{editingSupplier ? 'แก้ไขผู้จัดจำหน่าย' : 'เพิ่มผู้จัดจำหน่าย'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อบริษัท/ร้านค้า</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">ผู้ติดต่อ</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.contact_person}
                                    onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">เลขประจำตัวผู้เสียภาษี</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.tax_id}
                                        onChange={e => setFormData({ ...formData, tax_id: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">อีเมล</label>
                                <input
                                    type="email"
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">ที่อยู่</label>
                                <textarea
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                ></textarea>
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

export default Suppliers;
