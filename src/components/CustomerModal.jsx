import React, { useState } from 'react';

const CustomerModal = ({ isOpen, onClose, onConfirm }) => {
    const [memberId, setMemberId] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleMemberConfirm = () => {
        if (!memberId.trim()) {
            setError('กรุณากรอกรหัสสมาชิก (Please enter Member ID)');
            return;
        }
        onConfirm({ type: 'member', id: memberId });
        setMemberId('');
        setError('');
    };

    const handleGeneralConfirm = () => {
        onConfirm({ type: 'general', id: null });
        setMemberId('');
        setError('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">ข้อมูลลูกค้า (Customer)</h2>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        รหัสสมาชิก (Member ID / Phone)
                    </label>
                    <input
                        type="text"
                        value={memberId}
                        onChange={(e) => setMemberId(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-lg"
                        placeholder="08X-XXX-XXXX"
                        autoFocus
                    />
                    {error && <p className="text-red-500 text-xs italic mt-2">{error}</p>}
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleMemberConfirm}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline w-full active:scale-95 transition-transform"
                    >
                        ยืนยันสมาชิก (Confirm Member)
                    </button>
                    <button
                        onClick={handleGeneralConfirm}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline w-full active:scale-95 transition-transform"
                    >
                        ลูกค้าทั่วไป (General Customer)
                    </button>
                    <button
                        onClick={onClose}
                        className="mt-2 text-gray-500 hover:text-gray-700 text-sm underline text-center"
                    >
                        ยกเลิก (Cancel)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerModal;
