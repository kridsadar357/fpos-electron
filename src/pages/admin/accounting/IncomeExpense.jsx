import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaPlus, FaTrash, FaList, FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import toast from 'react-hot-toast';

const IncomeExpense = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'general',
        note: '',
        date: new Date().toISOString().slice(0, 16) // Default to now
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/expenses');
            const data = await res.json();
            setExpenses(data);
        } catch (err) {
            console.error('Error fetching expenses:', err);
            toast.error('ไม่สามารถโหลดข้อมูลรายจ่ายได้');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.amount) {
            toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        try {
            const res = await fetch('http://localhost:3001/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('บันทึกรายจ่ายสำเร็จ');
                setFormData({ title: '', amount: '', category: 'general', note: '', date: new Date().toISOString().slice(0, 16) });
                fetchExpenses();
            } else {
                throw new Error('Failed to save');
            }
        } catch (err) {
            console.error('Error saving expense:', err);
            toast.error('บันทึกข้อมูลไม่สำเร็จ');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) return;
        try {
            const res = await fetch(`http://localhost:3001/api/expenses/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('ลบข้อมูลสำเร็จ');
                fetchExpenses();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (err) {
            console.error('Error deleting expense:', err);
            toast.error('ลบข้อมูลไม่สำเร็จ');
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = expenses.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(expenses.length / itemsPerPage);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center mb-6">
                <FaMoneyBillWave className="mr-3" /> รายรับ-รายจ่าย (Income/Expense)
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Expense Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-xl font-bold mb-4 text-red-600">บันทึกรายจ่าย</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-bold mb-2">รายการ (Title)</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="เช่น ค่าไฟฟ้า, ค่าขนส่ง"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-2">จำนวนเงิน (Amount)</label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="0.00"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-2">หมวดหมู่ (Category)</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    <option value="general">ทั่วไป (General)</option>
                                    <option value="utilities">สาธารณูปโภค (Utilities)</option>
                                    <option value="salary">เงินเดือน (Salary)</option>
                                    <option value="maintenance">ซ่อมบำรุง (Maintenance)</option>
                                    <option value="other">อื่นๆ (Other)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-2">หมายเหตุ (Note)</label>
                                <textarea
                                    value={formData.note}
                                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-24"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-2">วันที่ (Date)</label>
                                <input
                                    type="datetime-local"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center"
                            >
                                <FaPlus className="mr-2" /> บันทึกรายจ่าย
                            </button>
                        </form>
                    </div>
                </div>

                {/* Expenses List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                <FaList className="mr-2" /> รายการรายจ่ายล่าสุด
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        <th className="p-4 font-bold text-gray-600">วันที่</th>
                                        <th className="p-4 font-bold text-gray-600">รายการ</th>
                                        <th className="p-4 font-bold text-gray-600">หมวดหมู่</th>
                                        <th className="p-4 font-bold text-gray-600 text-right">จำนวนเงิน</th>
                                        <th className="p-4 font-bold text-gray-600 text-right">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="5" className="p-8 text-center text-gray-500">กำลังโหลด...</td></tr>
                                    ) : currentItems.length === 0 ? (
                                        <tr><td colSpan="5" className="p-8 text-center text-gray-500">ไม่พบข้อมูล</td></tr>
                                    ) : (
                                        currentItems.map(item => (
                                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                                <td className="p-4 text-gray-600">
                                                    {new Date(item.date).toLocaleString('th-TH')}
                                                </td>
                                                <td className="p-4 font-bold text-gray-800">{item.title}</td>
                                                <td className="p-4 text-gray-600">
                                                    <span className="bg-gray-200 px-2 py-1 rounded text-sm">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right font-bold text-red-600">
                                                    -฿{parseFloat(item.amount || 0).toLocaleString()}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
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
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncomeExpense;
