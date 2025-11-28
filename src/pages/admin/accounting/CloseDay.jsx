import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaSave, FaHistory, FaPrint, FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CloseDay = () => {
    const [today, setToday] = useState(new Date().toISOString().split('T')[0]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        total_sales: 0,
        total_liters: 0,
        total_expenses: 0,
        net_income: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchHistory();
        fetchTodaySummary();
    }, [today]);

    const fetchHistory = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/daily-closings');
            const data = await res.json();
            setHistory(data);
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTodaySummary = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/daily-summary?date=${today}`);
            const data = await res.json();
            setSummary(data);
        } catch (err) {
            console.error('Error fetching summary:', err);
        }
    };

    const handleCloseDay = async () => {
        if (!window.confirm('คุณต้องการปิดยอดประจำวันใช่หรือไม่? เมื่อปิดยอดแล้วจะไม่สามารถแก้ไขรายการของวันนี้ได้')) return;

        try {
            const res = await fetch('http://localhost:3001/api/close-day', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: today })
            });

            if (res.ok) {
                toast.success('ปิดยอดประจำวันเรียบร้อยแล้ว');
                fetchHistory();
            } else {
                const error = await res.json();
                toast.error(error.message || 'ปิดยอดไม่สำเร็จ');
            }
        } catch (err) {
            console.error('Error closing day:', err);
            toast.error('เกิดข้อผิดพลาดในการปิดยอด');
        }
    };

    const handlePrint = async (id) => {
        const item = history.find(h => h.id === id);
        if (!item) return;

        const toastId = toast.loading('กำลังสร้างรายงาน...');
        try {
            // Fetch details
            const dateStr = new Date(item.date).toISOString().split('T')[0];
            const res = await fetch(`http://localhost:3001/api/daily-details?date=${dateStr}`);
            const details = await res.json();

            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.text('Daily Closing Report', 14, 22);

            doc.setFontSize(10);
            doc.text(`Date: ${new Date(item.date).toLocaleDateString('th-TH')}`, 14, 30);
            doc.text(`Printed: ${new Date().toLocaleString('th-TH')}`, 14, 35);

            // Summary Table
            autoTable(doc, {
                startY: 45,
                head: [['Summary Item', 'Amount']],
                body: [
                    ['Total Sales', `THB ${parseFloat(item.total_sales || 0).toLocaleString()}`],
                    ['Total Expenses', `THB ${parseFloat(item.total_expenses || 0).toLocaleString()}`],
                    ['Net Income', `THB ${parseFloat(item.net_income || 0).toLocaleString()}`],
                ],
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185] },
                columnStyles: {
                    0: { fontStyle: 'bold' },
                    1: { halign: 'right' }
                }
            });

            // Transactions Table
            if (details.transactions && details.transactions.length > 0) {
                doc.text('Transactions List', 14, doc.lastAutoTable.finalY + 10);

                const tableData = details.transactions.map(t => [
                    new Date(t.created_at).toLocaleTimeString('th-TH'),
                    t.product_name || '-',
                    `${parseFloat(t.liters || 0).toFixed(2)} L`,
                    `THB ${parseFloat(t.amount).toLocaleString()}`,
                    t.payment_type
                ]);

                autoTable(doc, {
                    startY: doc.lastAutoTable.finalY + 15,
                    head: [['Time', 'Product', 'Volume', 'Amount', 'Payment']],
                    body: tableData,
                    theme: 'striped',
                    headStyles: { fillColor: [52, 73, 94] },
                    columnStyles: {
                        2: { halign: 'right' },
                        3: { halign: 'right' }
                    }
                });
            } else {
                doc.text('No transactions found for this date.', 14, doc.lastAutoTable.finalY + 10);
            }

            doc.save(`daily_report_${dateStr}.pdf`);
            toast.success('สร้างรายงานสำเร็จ', { id: toastId });
        } catch (err) {
            console.error('Print error:', err);
            toast.error('เกิดข้อผิดพลาดในการสร้างรายงาน', { id: toastId });
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(history.length / itemsPerPage);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaSave className="mr-3" /> ปิดยอดประจำวัน (Daily Closing)
            </h1>

            {/* Today's Summary */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-700">สรุปยอดวันนี้ ({new Date(today).toLocaleDateString('th-TH')})</h2>
                    <button
                        onClick={handleCloseDay}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 shadow flex items-center"
                    >
                        <FaSave className="mr-2" /> ยืนยันปิดยอด
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="text-sm text-gray-600 mb-1">ยอดขายรวม</p>
                        <p className="text-2xl font-bold text-blue-600">฿{parseFloat(summary.total_sales || 0).toLocaleString()}</p>
                        <p className="text-sm text-gray-500 mt-1">{parseFloat(summary.total_liters || 0).toLocaleString()} ลิตร</p>
                    </div>
                    {/* Removed "Other Income" as it's not supported by backend yet */}
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <p className="text-sm text-gray-600 mb-1">รายจ่าย</p>
                        <p className="text-2xl font-bold text-red-600">฿{parseFloat(summary.total_expenses || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <p className="text-sm text-gray-600 mb-1">ยอดสุทธิ (Net Balance)</p>
                        <p className={`text-2xl font-bold ${summary.net_income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ฿{parseFloat(summary.net_income || 0).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Closing History */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-700 flex items-center">
                        <FaHistory className="mr-2" /> ประวัติการปิดยอด
                    </h2>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-4 font-bold text-gray-600">วันที่</th>
                            <th className="p-4 font-bold text-gray-600 text-right">ยอดขาย</th>
                            <th className="p-4 font-bold text-gray-600 text-right">รายจ่าย</th>
                            <th className="p-4 font-bold text-gray-600 text-right">ยอดสุทธิ</th>
                            <th className="p-4 font-bold text-gray-600 text-center">พิมพ์</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">กำลังโหลด...</td></tr>
                        ) : currentItems.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">ไม่พบประวัติการปิดยอด</td></tr>
                        ) : (
                            currentItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-bold text-gray-800">
                                        {new Date(item.date).toLocaleDateString('th-TH')}
                                    </td>
                                    <td className="p-4 text-right text-blue-600 font-bold">฿{parseFloat(item.total_sales || 0).toLocaleString()}</td>
                                    <td className="p-4 text-right text-red-600">฿{parseFloat(item.total_expenses || 0).toLocaleString()}</td>
                                    <td className="p-4 text-right font-bold">
                                        <span className={(item.net_income || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            ฿{parseFloat(item.net_income || 0).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handlePrint(item.id)}
                                            className="text-gray-600 hover:text-gray-800 p-2 rounded hover:bg-gray-100"
                                            title="พิมพ์รายงาน"
                                        >
                                            <FaPrint />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

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
    );
};

export default CloseDay;
