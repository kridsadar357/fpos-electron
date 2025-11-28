import React, { useState, useEffect } from 'react';
import { FaClipboardList, FaSearch, FaPrint } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ShiftReports = () => {
    const [shifts, setShifts] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        startShiftId: '',
        endShiftId: ''
    });

    useEffect(() => {
        fetchShifts();
    }, []);

    const fetchShifts = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/shifts');
            const data = await res.json();
            setShifts(data);
            // Default to latest shift if available
            if (data.length > 0) {
                setFilters({
                    startShiftId: data[0].id,
                    endShiftId: data[0].id
                });
            }
        } catch (err) {
            console.error('Error fetching shifts:', err);
            toast.error('ไม่สามารถโหลดข้อมูลกะได้');
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!filters.startShiftId || !filters.endShiftId) {
            toast.error('กรุณาระบุรหัสกะเริ่มต้นและสิ้นสุด');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/api/reports/shift?startShiftId=${filters.startShiftId}&endShiftId=${filters.endShiftId}`);
            const data = await res.json();
            setReportData(data);
        } catch (err) {
            console.error('Error fetching report:', err);
            toast.error('ไม่สามารถโหลดรายงานได้');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center mb-6">
                <FaClipboardList className="mr-3" /> รายงานปิดกะ (Shift Reports)
            </h1>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">กะเริ่มต้น (Start Shift)</label>
                        <select
                            value={filters.startShiftId}
                            onChange={e => setFilters({ ...filters, startShiftId: e.target.value })}
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        >
                            <option value="">เลือกกะเริ่มต้น</option>
                            {shifts.map(shift => (
                                <option key={shift.id} value={shift.id}>
                                    #{shift.id} - {new Date(shift.start_time).toLocaleString('th-TH')} ({shift.username})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">กะสิ้นสุด (End Shift)</label>
                        <select
                            value={filters.endShiftId}
                            onChange={e => setFilters({ ...filters, endShiftId: e.target.value })}
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        >
                            <option value="">เลือกกะสิ้นสุด</option>
                            {shifts.map(shift => (
                                <option key={shift.id} value={shift.id}>
                                    #{shift.id} - {new Date(shift.start_time).toLocaleString('th-TH')} ({shift.username})
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-bold shadow flex items-center"
                    >
                        <FaSearch className="mr-2" /> ค้นหา
                    </button>
                </form>
            </div>

            {/* Report Content */}
            <div className="bg-white rounded-xl shadow overflow-hidden p-6">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">กำลังประมวลผล...</div>
                ) : reportData.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">กรุณาเลือกช่วงกะเพื่อดูรายงาน</div>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">สรุปยอดขายตามประเภทการชำระเงิน</h2>
                            <button className="text-gray-600 hover:text-gray-800 flex items-center">
                                <FaPrint className="mr-2" /> พิมพ์รายงาน
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {reportData.map((item, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <h3 className="text-gray-500 font-bold uppercase text-sm mb-2">
                                        {item.payment_type === 'cash' ? 'เงินสด (Cash)' :
                                            item.payment_type === 'transfer' ? 'เงินโอน (Transfer)' :
                                                item.payment_type === 'credit' ? 'เงินเชื่อ (Credit)' : item.payment_type}
                                    </h3>
                                    <p className="text-2xl font-bold text-gray-800">฿{parseFloat(item.total_amount).toLocaleString()}</p>
                                    <p className="text-sm text-gray-500">{item.transaction_count} รายการ</p>
                                </div>
                            ))}
                        </div>

                        {/* Detailed Table Placeholder - In a real app, this would be more detailed */}
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="p-4 font-bold text-gray-600">ประเภทการชำระ</th>
                                    <th className="p-4 font-bold text-gray-600 text-right">จำนวนรายการ</th>
                                    <th className="p-4 font-bold text-gray-600 text-right">ยอดรวม</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((item, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="p-4 font-bold text-gray-800 capitalize">{item.payment_type}</td>
                                        <td className="p-4 text-right">{item.transaction_count}</td>
                                        <td className="p-4 text-right font-bold text-blue-600">฿{parseFloat(item.total_amount).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 font-bold">
                                <tr>
                                    <td className="p-4">รวมทั้งสิ้น</td>
                                    <td className="p-4 text-right">
                                        {reportData.reduce((sum, item) => sum + item.transaction_count, 0)}
                                    </td>
                                    <td className="p-4 text-right text-blue-800">
                                        ฿{reportData.reduce((sum, item) => sum + parseFloat(item.total_amount), 0).toLocaleString()}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShiftReports;
