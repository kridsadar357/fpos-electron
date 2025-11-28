import React, { useState } from 'react';
import { FaCalendarAlt, FaSearch, FaPrint } from 'react-icons/fa';
import toast from 'react-hot-toast';

const DailyReports = () => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/api/reports/daily?startDate=${filters.startDate}&endDate=${filters.endDate}`);
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
                <FaCalendarAlt className="mr-3" /> รายงานปิดวัน (Daily Reports)
            </h1>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">เลือกช่วงเวลา (Quick Select)</label>
                        <select
                            onChange={(e) => {
                                const val = e.target.value;
                                const today = new Date();
                                let start = new Date();
                                let end = new Date();

                                if (val === 'today') {
                                    // default
                                } else if (val === 'yesterday') {
                                    start.setDate(today.getDate() - 1);
                                    end.setDate(today.getDate() - 1);
                                } else if (val === 'this_week') {
                                    const day = today.getDay();
                                    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                                    start.setDate(diff);
                                } else if (val === 'this_month') {
                                    start = new Date(today.getFullYear(), today.getMonth(), 1);
                                } else if (val === 'last_month') {
                                    start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                                    end = new Date(today.getFullYear(), today.getMonth(), 0);
                                }

                                setFilters({
                                    startDate: start.toISOString().split('T')[0],
                                    endDate: end.toISOString().split('T')[0]
                                });
                            }}
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                        >
                            <option value="today">วันนี้ (Today)</option>
                            <option value="yesterday">เมื่อวาน (Yesterday)</option>
                            <option value="this_week">สัปดาห์นี้ (This Week)</option>
                            <option value="this_month">เดือนนี้ (This Month)</option>
                            <option value="last_month">เดือนที่แล้ว (Last Month)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">วันที่เริ่มต้น (Start Date)</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">วันที่สิ้นสุด (End Date)</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
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
                    <div className="text-center py-10 text-gray-500">กรุณาเลือกช่วงวันที่เพื่อดูรายงาน</div>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">สรุปยอดขายรายวัน</h2>
                            <button className="text-gray-600 hover:text-gray-800 flex items-center">
                                <FaPrint className="mr-2" /> พิมพ์รายงาน
                            </button>
                        </div>

                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="p-4 font-bold text-gray-600">วันที่</th>
                                    <th className="p-4 font-bold text-gray-600 text-right">ยอดขายเงินสด</th>
                                    <th className="p-4 font-bold text-gray-600 text-right">ยอดขายรวม</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((item, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="p-4 font-bold text-gray-800">
                                            {new Date(item.date).toLocaleDateString('th-TH')}
                                        </td>
                                        <td className="p-4 text-right text-green-600">฿{parseFloat(item.cash_sales).toLocaleString()}</td>
                                        <td className="p-4 text-right font-bold text-blue-600">฿{parseFloat(item.total_sales).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 font-bold">
                                <tr>
                                    <td className="p-4">รวมทั้งสิ้น</td>
                                    <td className="p-4 text-right text-green-800">
                                        ฿{reportData.reduce((sum, item) => sum + parseFloat(item.cash_sales), 0).toLocaleString()}
                                    </td>
                                    <td className="p-4 text-right text-blue-800">
                                        ฿{reportData.reduce((sum, item) => sum + parseFloat(item.total_sales), 0).toLocaleString()}
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

export default DailyReports;
