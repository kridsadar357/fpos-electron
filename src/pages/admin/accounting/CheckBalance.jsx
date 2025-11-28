import React, { useState, useEffect } from 'react';
import { FaWallet, FaMoneyBillWave, FaCreditCard, FaExchangeAlt, FaSync } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CheckBalance = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchSummary();
    }, [currentDate]);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/api/daily-summary?date=${currentDate}`);
            const data = await res.json();
            setSummary(data);
        } catch (err) {
            console.error('Error fetching summary:', err);
            toast.error('ไม่สามารถโหลดข้อมูลสรุปยอดได้');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaWallet className="mr-3" /> ตรวจสอบยอด (Check Balance)
                </h1>
                <div className="flex items-center space-x-4">
                    <input
                        type="date"
                        value={currentDate}
                        onChange={(e) => setCurrentDate(e.target.value)}
                        className="p-2 border rounded-lg shadow-sm"
                    />
                    <button
                        onClick={fetchSummary}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow transition-transform active:rotate-180"
                    >
                        <FaSync />
                    </button>
                </div>
            </div>

            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Sales */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-blue-100 font-bold mb-1">ยอดขายรวม (Total Sales)</p>
                                <h2 className="text-3xl font-bold">฿{parseFloat(summary.total_sales).toLocaleString()}</h2>
                                <div className="mt-2 text-sm text-blue-200">
                                    <p>ปิดกะแล้ว: ฿{parseFloat(summary.closed_shift_sales || 0).toLocaleString()}</p>
                                    <p>ยังไม่ปิดกะ: ฿{parseFloat(summary.open_shift_sales || 0).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                                <FaWallet className="text-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* Cash Sales */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 font-bold mb-1">เงินสด (Cash)</p>
                                <h2 className="text-3xl font-bold text-green-600">฿{parseFloat(summary.cash_sales).toLocaleString()}</h2>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg text-green-600">
                                <FaMoneyBillWave className="text-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* Transfer Sales */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 font-bold mb-1">เงินโอน (Transfer)</p>
                                <h2 className="text-3xl font-bold text-purple-600">฿{parseFloat(summary.transfer_sales).toLocaleString()}</h2>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                                <FaExchangeAlt className="text-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* Credit Sales */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-500 font-bold mb-1">เงินเชื่อ (Credit)</p>
                                <h2 className="text-3xl font-bold text-orange-600">฿{parseFloat(summary.credit_sales).toLocaleString()}</h2>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                                <FaCreditCard className="text-2xl" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">สรุปรายรับ-รายจ่ายวันนี้</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="font-bold text-gray-700">รายรับรวม (Total Income)</span>
                            <span className="font-bold text-green-600 text-xl">
                                +฿{parseFloat(summary?.total_sales || 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                            <span className="font-bold text-gray-700">รายจ่ายรวม (Total Expenses)</span>
                            <span className="font-bold text-red-600 text-xl">
                                -฿{parseFloat(summary?.total_expenses || 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="border-t pt-4 flex justify-between items-center">
                            <span className="font-bold text-gray-800 text-lg">กำไรสุทธิ (Net Income)</span>
                            <span className={`font-bold text-2xl ${(summary?.net_income || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                ฿{parseFloat(summary?.net_income || 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Shift Breakdown Table */}
                <div className="bg-white rounded-xl shadow p-6 md:col-span-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">รายละเอียดกะ (Shift Details)</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-gray-700">
                                    <th className="p-3 rounded-tl-lg">กะ (Shift)</th>
                                    <th className="p-3">พนักงาน (User)</th>
                                    <th className="p-3 text-right">เงินเปิดกะ (Start Cash)</th>
                                    <th className="p-3 text-right text-green-600">เงินสด (Cash)</th>
                                    <th className="p-3 text-right text-purple-600">โอน (Transfer)</th>
                                    <th className="p-3 text-right text-orange-600">เชื่อ (Credit)</th>
                                    <th className="p-3 text-right">เงินปิดกะ (End Cash)</th>
                                    <th className="p-3 text-right font-bold rounded-tr-lg">รวม (Total)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary?.shifts?.length > 0 ? (
                                    summary.shifts.map((shift, index) => (
                                        <tr key={shift.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${shift.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                                                    {shift.status === 'open' ? 'OPEN' : 'CLOSED'}
                                                </span>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {new Date(shift.start_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                                    {shift.end_time && ` - ${new Date(shift.end_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`}
                                                </div>
                                            </td>
                                            <td className="p-3 font-medium">{shift.username}</td>
                                            <td className="p-3 text-right">฿{parseFloat(shift.start_cash || 0).toLocaleString()}</td>
                                            <td className="p-3 text-right text-green-600">฿{parseFloat(shift.cash_sales || 0).toLocaleString()}</td>
                                            <td className="p-3 text-right text-purple-600">฿{parseFloat(shift.transfer_sales || 0).toLocaleString()}</td>
                                            <td className="p-3 text-right text-orange-600">฿{parseFloat(shift.credit_sales || 0).toLocaleString()}</td>
                                            <td className="p-3 text-right">
                                                {shift.end_cash ? `฿${parseFloat(shift.end_cash).toLocaleString()}` : '-'}
                                            </td>
                                            <td className="p-3 text-right font-bold">฿{parseFloat(shift.total_sales || 0).toLocaleString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="p-8 text-center text-gray-500">ไม่พบข้อมูลกะสำหรับวันนี้ (No shifts found)</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckBalance;
