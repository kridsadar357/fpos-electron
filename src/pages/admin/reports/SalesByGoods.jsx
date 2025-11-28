import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReportViewer from '../../../components/admin/ReportViewer';

const SalesByGoods = () => {
    const location = useLocation();
    const isDaily = location.pathname.includes('/daily');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Date Range State
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Shift Range State
    const [shifts, setShifts] = useState([]);
    const [startShift, setStartShift] = useState('');
    const [endShift, setEndShift] = useState('');

    const [companyInfo, setCompanyInfo] = useState(null);

    useEffect(() => {
        fetchSettings();
        if (!isDaily) {
            fetchShifts();
        }
    }, [isDaily]);

    useEffect(() => {
        if (isDaily) {
            fetchData();
        } else {
            if (startShift && endShift) {
                fetchData();
            }
        }
    }, [startDate, endDate, startShift, endShift, isDaily]);

    const fetchSettings = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/settings');
            const data = await res.json();
            setCompanyInfo(data);
        } catch (err) {
            console.error('Error fetching settings:', err);
        }
    };

    const fetchShifts = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/shifts');
            const data = await res.json();
            setShifts(data);
            if (data.length > 0) {
                setStartShift(data[0].id);
                setEndShift(data[0].id);
            }
        } catch (err) {
            console.error('Error fetching shifts:', err);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            let url = 'http://localhost:3001/api/reports/sales-by-goods?';
            if (isDaily) {
                url += `startDate=${startDate}&endDate=${endDate}`;
            } else {
                url += `startShiftId=${startShift}&endShiftId=${endShift}`;
            }

            const res = await fetch(url);
            const result = await res.json();
            setData(result);
        } catch (err) {
            console.error('Error fetching report data:', err);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { header: 'สินค้า (Product)', accessor: 'product_name', width: '40%' },
        { header: 'ราคาต่อหน่วย (Price)', accessor: 'unit_price', width: '20%', align: 'right', render: (row) => parseFloat(row.unit_price).toFixed(2) },
        { header: 'จำนวนรายการ (Transactions)', accessor: 'transaction_count', width: '20%', align: 'right' },
        { header: 'จำนวนเงิน (Amount)', accessor: 'total_amount', width: '20%', align: 'right', render: (row) => parseFloat(row.total_amount).toFixed(2) }
    ];

    const totalAmount = data.reduce((sum, row) => sum + parseFloat(row.total_amount || 0), 0);
    const totalTx = data.reduce((sum, row) => sum + parseInt(row.transaction_count || 0), 0);

    const summary = {
        product_name: 'รวมทั้งหมด (Total)',
        transaction_count: totalTx,
        total_amount: totalAmount.toFixed(2)
    };

    return (
        <div className="h-full flex flex-col">
            <div className="bg-white p-4 shadow mb-4 flex flex-wrap gap-4 items-center print:hidden">
                {isDaily ? (
                    <>
                        <div>
                            <label className="mr-2 font-bold">ตั้งแต่วันที่:</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border p-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="mr-2 font-bold">ถึงวันที่:</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border p-2 rounded"
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label className="mr-2 font-bold">ตั้งแต่กะที่:</label>
                            <select
                                value={startShift}
                                onChange={(e) => setStartShift(e.target.value)}
                                className="border p-2 rounded w-48"
                            >
                                {shifts.map(shift => (
                                    <option key={shift.id} value={shift.id}>
                                        #{shift.id} - {new Date(shift.start_time).toLocaleString('th-TH')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mr-2 font-bold">ถึงกะที่:</label>
                            <select
                                value={endShift}
                                onChange={(e) => setEndShift(e.target.value)}
                                className="border p-2 rounded w-48"
                            >
                                {shifts.map(shift => (
                                    <option key={shift.id} value={shift.id}>
                                        #{shift.id} - {new Date(shift.start_time).toLocaleString('th-TH')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                )}
                <button
                    onClick={fetchData}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    แสดงรายงาน (Refresh)
                </button>
            </div>

            <ReportViewer
                title={`รายงานยอดขายสินค้าอื่นๆ (${isDaily ? 'รายวัน' : 'รายกะ'})`}
                subtitle={isDaily ? `วันที่: ${new Date(startDate).toLocaleDateString('th-TH')} - ${new Date(endDate).toLocaleDateString('th-TH')}` : `กะที่: ${startShift} ถึง ${endShift}`}
                data={data}
                columns={columns}
                summary={summary}
                companyInfo={companyInfo}
            />
        </div>
    );
};

export default SalesByGoods;
