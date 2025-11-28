import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaFileInvoiceDollar } from 'react-icons/fa';
import toast from 'react-hot-toast';

const TaxInvoice = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (err) {
                console.error('Error fetching settings:', err);
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:3001/api/transactions?page=${page}&limit=10`);
                const data = await res.json();
                setTransactions(data.data);
                setFilteredTransactions(data.data);
                setTotalPages(data.totalPages);
            } catch (err) {
                console.error('Error fetching transactions:', err);
                toast.error('ไม่สามารถโหลดข้อมูลได้');
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [page]);

    useEffect(() => {
        const results = transactions.filter(t =>
            t.id.toString().includes(searchTerm) ||
            t.amount.toString().includes(searchTerm) ||
            (t.member_name && t.member_name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredTransactions(results);
    }, [searchTerm, transactions]);

    const handlePrevPage = () => {
        if (page > 1) setPage(prev => prev - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(prev => prev + 1);
    };

    const handlePrintTaxInvoice = (transaction) => {
        if (!settings) {
            toast.error('ไม่พบข้อมูลการตั้งค่าบริษัท (Settings not found)');
            return;
        }

        // Mock print functionality with settings
        console.log('Printing Tax Invoice:', {
            header: {
                company: settings.company_name,
                address: settings.company_address,
                taxId: settings.tax_id,
                branch: settings.branch_id,
                phone: settings.phone
            },
            transaction: transaction,
            footer: settings.footer_text
        });

        toast.success(`กำลังออกใบกำกับภาษีสำหรับรายการ #${transaction.id}\nโดย: ${settings.company_name}`);
        // In a real app, you would generate a PDF or send to printer here
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <header className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-orange-800 flex items-center">
                    <FaFileInvoiceDollar className="mr-3" /> ใบกำกับภาษี (Tax Invoice)
                </h1>
                <div className="flex space-x-4">
                    <input
                        type="text"
                        placeholder="ค้นหา ID, ยอดเงิน, หรือลูกค้า..."
                        className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        onClick={() => navigate('/menu')}
                        className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 font-bold shadow active:scale-95 transition-transform"
                    >
                        <FaArrowLeft className="inline mr-2" /> กลับ (Back)
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
                {loading ? (
                    <p className="text-center text-gray-500 text-xl py-10">กำลังโหลด...</p>
                ) : filteredTransactions.length === 0 ? (
                    <p className="text-center text-gray-500 text-xl py-10">ไม่พบข้อมูล</p>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-orange-50 border-b">
                                <th className="p-4 font-bold text-gray-600">ID</th>
                                <th className="p-4 font-bold text-gray-600">เวลา</th>
                                <th className="p-4 font-bold text-gray-600">ลูกค้า/สมาชิก</th>
                                <th className="p-4 font-bold text-gray-600">ยอดรวม</th>
                                <th className="p-4 font-bold text-gray-600">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map(t => (
                                <tr key={t.id} className="border-b hover:bg-gray-50 transition">
                                    <td className="p-4 text-gray-800">#{t.id}</td>
                                    <td className="p-4 text-gray-600">{new Date(t.created_at).toLocaleString('th-TH')}</td>
                                    <td className="p-4 text-gray-800">
                                        {t.member_name || '-'}
                                    </td>
                                    <td className="p-4 font-bold text-orange-600">{parseFloat(t.amount).toFixed(2)}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handlePrintTaxInvoice(t)}
                                            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 font-bold flex items-center shadow-sm active:scale-95 transition"
                                        >
                                            <FaFileInvoiceDollar className="mr-2" /> ออกใบกำกับภาษี
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
                    className={`px-4 py-2 rounded font-bold ${page === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
                >
                    ก่อนหน้า
                </button>
                <span className="text-gray-600 font-bold">
                    หน้า {page} จาก {totalPages}
                </span>
                <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className={`px-4 py-2 rounded font-bold ${page === totalPages ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
                >
                    ถัดไป
                </button>
            </div>
        </div>
    );
};

export default TaxInvoice;
