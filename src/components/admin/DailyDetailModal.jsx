import React, { useState, useEffect } from 'react';
import { FaTimes, FaList, FaTachometerAlt, FaTags } from 'react-icons/fa';

const DailyDetailModal = ({ isOpen, onClose, date }) => {
    const [activeTab, setActiveTab] = useState('transactions');
    const [data, setData] = useState({ transactions: [], meter_summary: [], promotion_summary: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && date) {
            fetchDetails();
        }
    }, [isOpen, date]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            // Format date to YYYY-MM-DD to ensure backend queries the correct day
            // Use en-CA for YYYY-MM-DD format
            const formattedDate = new Date(date).toLocaleDateString('en-CA');
            console.log(`Fetching details for date: ${formattedDate} (Original: ${date})`);

            const res = await fetch(`http://localhost:3001/api/daily-details?date=${formattedDate}`);
            if (res.ok) {
                const result = await res.json();
                setData(result);
            }
        } catch (err) {
            console.error('Error fetching details:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">
                        รายละเอียดประจำวัน (Daily Details) - {new Date(date).toLocaleDateString('th-TH')}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
                        <FaTimes size={24} />
                    </button>
                </div>

                <div className="flex border-b bg-gray-50">
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`flex-1 py-4 px-6 font-bold flex items-center justify-center transition-colors ${activeTab === 'transactions' ? 'bg-white text-blue-600 border-t-2 border-blue-600' : 'text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        <FaList className="mr-2" /> รายการขาย (Transactions)
                    </button>
                    <button
                        onClick={() => setActiveTab('meter')}
                        className={`flex-1 py-4 px-6 font-bold flex items-center justify-center transition-colors ${activeTab === 'meter' ? 'bg-white text-blue-600 border-t-2 border-blue-600' : 'text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        <FaTachometerAlt className="mr-2" /> มิเตอร์ (Meter Readings)
                    </button>
                    <button
                        onClick={() => setActiveTab('promotion')}
                        className={`flex-1 py-4 px-6 font-bold flex items-center justify-center transition-colors ${activeTab === 'promotion' ? 'bg-white text-blue-600 border-t-2 border-blue-600' : 'text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        <FaTags className="mr-2" /> โปรโมชั่น (Promotions)
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {loading ? (
                        <div className="text-center py-12">กำลังโหลดข้อมูล...</div>
                    ) : (
                        <>
                            {activeTab === 'transactions' && (
                                <div className="bg-white rounded-lg shadow overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-100 border-b">
                                            <tr>
                                                <th className="p-3 text-sm font-bold text-gray-600">เวลา</th>
                                                <th className="p-3 text-sm font-bold text-gray-600">หัวจ่าย</th>
                                                <th className="p-3 text-sm font-bold text-gray-600">สินค้า</th>
                                                <th className="p-3 text-sm font-bold text-gray-600 text-right">จำนวนเงิน</th>
                                                <th className="p-3 text-sm font-bold text-gray-600 text-right">ลิตร</th>
                                                <th className="p-3 text-sm font-bold text-gray-600">การชำระเงิน</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.transactions.length > 0 ? (
                                                data.transactions.map(t => (
                                                    <tr key={t.id} className="border-b hover:bg-gray-50">
                                                        <td className="p-3 text-sm">{new Date(t.created_at).toLocaleTimeString('th-TH')}</td>
                                                        <td className="p-3 text-sm">{t.dispenser_name}</td>
                                                        <td className="p-3 text-sm">{t.product_name}</td>
                                                        <td className="p-3 text-sm text-right font-bold">฿{parseFloat(t.amount).toLocaleString()}</td>
                                                        <td className="p-3 text-sm text-right">{parseFloat(t.liters).toFixed(2)}</td>
                                                        <td className="p-3 text-sm">
                                                            <span className={`px-2 py-1 rounded text-xs font-bold ${t.payment_type === 'cash' ? 'bg-green-100 text-green-800' :
                                                                t.payment_type === 'promptpay' ? 'bg-purple-100 text-purple-800' :
                                                                    'bg-orange-100 text-orange-800'
                                                                }`}>
                                                                {t.payment_type === 'cash' ? 'เงินสด' : t.payment_type === 'promptpay' ? 'โอน' : 'เครดิต'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">ไม่มีรายการขาย</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'meter' && (
                                <div className="bg-white rounded-lg shadow overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-100 border-b">
                                            <tr>
                                                <th className="p-3 text-sm font-bold text-gray-600">ตู้จ่าย</th>
                                                <th className="p-3 text-sm font-bold text-gray-600">สินค้า</th>
                                                <th className="p-3 text-sm font-bold text-gray-600 text-right">มิเตอร์เริ่มต้น</th>
                                                <th className="p-3 text-sm font-bold text-gray-600 text-right">มิเตอร์สิ้นสุด</th>
                                                <th className="p-3 text-sm font-bold text-gray-600 text-right">ปริมาณรวม (ลิตร)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.meter_summary.length > 0 ? (
                                                data.meter_summary.map((m, idx) => (
                                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                                        <td className="p-3 text-sm">{m.dispenser_name}</td>
                                                        <td className="p-3 text-sm">{m.product_name}</td>
                                                        <td className="p-3 text-sm text-right">{parseFloat(m.start_meter).toLocaleString()}</td>
                                                        <td className="p-3 text-sm text-right">{parseFloat(m.end_meter).toLocaleString()}</td>
                                                        <td className="p-3 text-sm text-right font-bold text-blue-600">{parseFloat(m.total_volume).toFixed(2)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="5" className="p-8 text-center text-gray-500">ไม่มีข้อมูลมิเตอร์</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'promotion' && (
                                <div className="bg-white rounded-lg shadow overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-100 border-b">
                                            <tr>
                                                <th className="p-3 text-sm font-bold text-gray-600">โปรโมชั่น</th>
                                                <th className="p-3 text-sm font-bold text-gray-600 text-center">จำนวนครั้งที่ใช้</th>
                                                <th className="p-3 text-sm font-bold text-gray-600 text-right">ส่วนลดรวม</th>
                                                <th className="p-3 text-sm font-bold text-gray-600 text-right">ของแถมรวม</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.promotion_summary.length > 0 ? (
                                                data.promotion_summary.map((p, idx) => (
                                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                                        <td className="p-3 text-sm">{p.promotion_name}</td>
                                                        <td className="p-3 text-sm text-center">{p.usage_count}</td>
                                                        <td className="p-3 text-sm text-right text-red-600">฿{parseFloat(p.total_discount || 0).toLocaleString()}</td>
                                                        <td className="p-3 text-sm text-right text-green-600">{p.total_giveaway || 0}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="4" className="p-8 text-center text-gray-500">ไม่มีการใช้โปรโมชั่น</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="p-4 border-t bg-white flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 font-bold shadow transition-transform active:scale-95"
                    >
                        ปิด (Close)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DailyDetailModal;
