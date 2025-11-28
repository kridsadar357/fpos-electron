import React from 'react';

const PaymentModal = ({ isOpen, onClose, onConfirm, amount }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-sans">
            <div className="bg-white rounded-lg p-8 w-96 shadow-xl">
                <h2 className="text-2xl font-bold mb-4 text-center">เลือกวิธีการชำระเงิน</h2>
                <div className="text-center mb-6">
                    <p className="text-gray-600">ยอดรวมทั้งสิ้น (Total Amount)</p>
                    <p className="text-4xl font-bold text-blue-600">฿{parseFloat(amount).toFixed(2)}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={() => onConfirm('cash')}
                        className="flex flex-col items-center justify-center p-4 border-2 border-green-500 rounded-lg hover:bg-green-50 transition-colors"
                    >
                        <i className="fas fa-money-bill-wave text-3xl text-green-600 mb-2"></i>
                        <span className="font-bold text-green-700">เงินสด (Cash)</span>
                    </button>
                    <button
                        onClick={() => onConfirm('promptpay')}
                        className="flex flex-col items-center justify-center p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        <i className="fas fa-qrcode text-3xl text-blue-600 mb-2"></i>
                        <span className="font-bold text-blue-700">สแกน QR</span>
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                    ยกเลิก (Cancel)
                </button>
            </div>
        </div>
    );
};

export default PaymentModal;
