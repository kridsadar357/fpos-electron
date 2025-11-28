import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaReceipt } from 'react-icons/fa';

const SalesHistory = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:3001/api/transactions?page=${page}&limit=10`);
                const data = await res.json();
                setTransactions(data.data);
                setTotalPages(data.totalPages);
            } catch (err) {
                console.error('Error fetching transactions:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [page]);

    const handlePrevPage = () => {
        if (page > 1) setPage(prev => prev - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans relative">
            <header className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-blue-800 flex items-center">
                    <FaReceipt className="mr-3" /> ประวัติการขาย (Sales History)
                </h1>
                <button
                    onClick={() => navigate('/menu')}
                    className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 font-bold shadow active:scale-95 transition-transform"
                >
                    <FaArrowLeft className="inline mr-2" /> กลับ (Back)
                </button>
            </header>

            <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
                {loading ? (
                    <p className="text-center text-gray-500 text-xl py-10">กำลังโหลด...</p>
                ) : transactions.length === 0 ? (
                    <p className="text-center text-gray-500 text-xl py-10">ยังไม่มีข้อมูลประวัติการขาย</p>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-4 font-bold text-gray-600">ID</th>
                                <th className="p-4 font-bold text-gray-600">เวลา</th>
                                <th className="p-4 font-bold text-gray-600">สินค้า</th>
                                <th className="p-4 font-bold text-gray-600">ยอดรวม</th>
                                <th className="p-4 font-bold text-gray-600">การชำระเงิน</th>
                                <th className="p-4 font-bold text-gray-600">สถานะ</th>
                                <th className="p-4 font-bold text-gray-600">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(t => (
                                <tr key={t.id} className="border-b hover:bg-gray-50 transition">
                                    <td className="p-4 text-gray-800">#{t.id}</td>
                                    <td className="p-4 text-gray-600">{new Date(t.created_at).toLocaleString('th-TH')}</td>
                                    <td className="p-4 text-gray-800">
                                        {t.product_name || 'สินค้าทั่วไป'}
                                        {parseFloat(t.liters) > 0 && <span className="text-gray-500 text-sm ml-2">({parseFloat(t.liters).toFixed(2)} L)</span>}
                                    </td>
                                    <td className="p-4 font-bold text-blue-600">{parseFloat(t.amount).toFixed(2)}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${t.payment_type === 'cash' ? 'bg-green-100 text-green-700' :
                                            t.payment_type === 'promptpay' ? 'bg-blue-100 text-blue-700' :
                                                'bg-purple-100 text-purple-700'
                                            }`}>
                                            {t.payment_type === 'cash' ? 'เงินสด' : t.payment_type === 'promptpay' ? 'โอนเงิน' : 'เครดิต'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                                            สำเร็จ
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => setSelectedTransaction(t)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                                        >
                                            รายละเอียด
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded font-bold ${page === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                    ก่อนหน้า
                </button>
                <span className="text-gray-600 font-bold">
                    หน้า {page} จาก {totalPages}
                </span>
                <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className={`px-4 py-2 rounded font-bold ${page === totalPages ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                    ถัดไป
                </button>
            </div>

            {/* Transaction Details Modal */}
            {selectedTransaction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-down">
                        <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
                            <h3 className="text-xl font-bold">รายละเอียดรายการ #{selectedTransaction.id}</h3>
                            <button onClick={() => setSelectedTransaction(null)} className="text-white hover:text-gray-300">
                                <FaReceipt />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-600">เวลา</span>
                                <span className="font-bold">{new Date(selectedTransaction.created_at).toLocaleString('th-TH')}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-600">สินค้า</span>
                                <span className="font-bold">{selectedTransaction.product_name || 'สินค้าทั่วไป'}</span>
                            </div>
                            {parseFloat(selectedTransaction.liters) > 0 && (
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">ปริมาณ</span>
                                    <span className="font-bold">{parseFloat(selectedTransaction.liters).toFixed(2)} ลิตร</span>
                                </div>
                            )}
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-600">ยอดรวม</span>
                                <span className="font-bold text-xl text-blue-600">{parseFloat(selectedTransaction.amount).toFixed(2)} บาท</span>
                            </div>
                            {parseFloat(selectedTransaction.total_discount) > 0 && (
                                <div className="flex justify-between border-b pb-2 text-green-600">
                                    <span>ส่วนลด</span>
                                    <span className="font-bold">-{parseFloat(selectedTransaction.total_discount).toFixed(2)} บาท</span>
                                </div>
                            )}
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-600">รับเงิน</span>
                                <span className="font-bold">{parseFloat(selectedTransaction.received_amount).toFixed(2)} บาท</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-600">เงินทอน</span>
                                <span className="font-bold text-orange-600">{parseFloat(selectedTransaction.change_amount).toFixed(2)} บาท</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-600">ชำระโดย</span>
                                <span className="font-bold">
                                    {selectedTransaction.payment_type === 'cash' ? 'เงินสด' : selectedTransaction.payment_type === 'promptpay' ? 'โอนเงิน' : 'เครดิต'}
                                </span>
                            </div>
                            {selectedTransaction.member_name && (
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">สมาชิก</span>
                                    <span className="font-bold text-purple-600">{selectedTransaction.member_name} ({selectedTransaction.points_earned} แต้ม)</span>
                                </div>
                            )}
                            {(parseFloat(selectedTransaction.start_meter) > 0 || parseFloat(selectedTransaction.end_meter) > 0) && (
                                <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>มิเตอร์เริ่มต้น:</span>
                                        <span>{parseFloat(selectedTransaction.start_meter).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>มิเตอร์สิ้นสุด:</span>
                                        <span>{parseFloat(selectedTransaction.end_meter).toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="bg-gray-100 p-4 flex justify-end">
                            <button
                                onClick={() => setSelectedTransaction(null)}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 font-bold"
                            >
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesHistory;
