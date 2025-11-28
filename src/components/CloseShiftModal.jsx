import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const CloseShiftModal = ({ isOpen, onClose, onConfirm }) => {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && user) {
            fetchSummary();
        }
    }, [isOpen, user]);

    const fetchSummary = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`http://localhost:3001/api/shifts/summary?user_id=${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setSummary(data);
            } else {
                const err = await response.json();
                setError(err.error || 'Failed to fetch summary');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-sans">
            <div className="bg-white rounded-lg p-8 w-[500px] shadow-xl">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">สรุปยอดปิดกะ (Close Shift Summary)</h2>

                {loading ? (
                    <div className="text-center py-8">กำลังโหลดข้อมูล... (Loading...)</div>
                ) : error ? (
                    <div className="text-red-600 text-center py-8">{error}</div>
                ) : summary ? (
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-gray-600">เงินเปิดกะ (Start Cash)</span>
                            <span className="font-bold text-lg">฿{summary.start_cash.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                            <span className="text-gray-600">ยอดขายเงินสด (Cash Sales)</span>
                            <span className="font-bold text-lg text-green-600">฿{summary.cash_sales.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                            <span className="text-gray-600">ยอดขายโอน (Transfer Sales)</span>
                            <span className="font-bold text-lg text-blue-600">฿{summary.transfer_sales.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                            <span className="text-gray-600">ยอดขายเชื่อ (Credit Sales)</span>
                            <span className="font-bold text-lg text-yellow-600">฿{summary.credit_sales.toLocaleString()}</span>
                        </div>

                        <div className="border-t-2 border-gray-200 pt-4 mt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-bold text-gray-800">ยอดขายรวม (Total Sales)</span>
                                <span className="text-2xl font-bold text-blue-800">฿{summary.total_sales.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-gray-500 text-right mt-1">* ไม่รวมเงินเปิดกะ (Excluding Start Cash)</p>
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 font-bold"
                    >
                        ยกเลิก (Cancel)
                    </button>
                    <button
                        onClick={() => onConfirm(summary ? summary.total_sales : 0)}
                        className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold"
                        disabled={loading || !!error}
                    >
                        ยืนยันปิดกะ (Confirm Close)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CloseShiftModal;
