import React, { useState } from 'react';

const LockNozzleModal = ({ isOpen, onClose, onConfirm, nozzle }) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(nozzle, reason);
        setReason('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4 text-gray-800">ระบุเหตุผลการล็อคหัวจ่าย</h2>
                <div className="mb-4">
                    <p className="text-gray-600 mb-2">หัวจ่าย: <span className="font-bold">{nozzle?.nozzle_number}</span> ({nozzle?.product_name})</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">เหตุผล</label>
                        <textarea
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                            rows="3"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="เช่น ซ่อมบำรุง, น้ำมันหมด"
                            required
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 font-bold"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-bold"
                        >
                            ล็อคหัวจ่าย
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LockNozzleModal;
