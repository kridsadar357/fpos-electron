import React, { useState, useEffect } from 'react';

const OpenShiftModal = ({ isOpen, onClose, onConfirm }) => {
    const [denominations, setDenominations] = useState({
        1000: 0, 500: 0, 100: 0, 50: 0, 20: 0,
        10: 0, 5: 0, 2: 0, 1: 0
    });

    const [total, setTotal] = useState(0);

    useEffect(() => {
        let sum = 0;
        Object.entries(denominations).forEach(([denom, count]) => {
            sum += parseInt(denom) * count;
        });
        setTotal(sum);
    }, [denominations]);

    const handleChange = (denom, value) => {
        setDenominations(prev => ({
            ...prev,
            [denom]: parseInt(value) || 0
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-sans">
            <div className="bg-white rounded-lg p-8 w-[600px] max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">เปิดกะ - นับเงินในลิ้นชัก (Open Shift)</h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    {[1000, 500, 100, 50, 20, 10, 5, 2, 1].map(denom => (
                        <div key={denom} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                            <label className="font-bold text-gray-700 w-24">฿{denom}</label>
                            <input
                                type="number"
                                min="0"
                                value={denominations[denom]}
                                onChange={(e) => handleChange(denom, e.target.value)}
                                className="border rounded p-2 w-32 text-right"
                            />
                            <span className="text-gray-500 w-24 text-right">
                                = {(denominations[denom] * denom).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-6 flex justify-between items-center">
                    <span className="text-xl font-bold text-blue-800">รวมเป็นเงิน (Total):</span>
                    <span className="text-3xl font-bold text-green-600">฿{total.toLocaleString()}</span>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400 font-bold"
                    >
                        ยกเลิก (Cancel)
                    </button>
                    <button
                        onClick={() => onConfirm(total)}
                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold"
                    >
                        ยืนยันเปิดกะ (Open Shift)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OpenShiftModal;
