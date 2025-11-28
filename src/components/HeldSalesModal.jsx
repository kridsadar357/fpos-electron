import React from 'react';

const HeldSalesModal = ({ isOpen, onClose, sales, onSelectSale, onNewSale, nozzleName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-sans">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4 text-blue-800">รายการที่พักไว้ (Held Sales) - {nozzleName}</h2>

                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {sales.map((sale, index) => {
                        const fuel = parseFloat(sale.fuelAmount) || 0;
                        const goods = (sale.cart || []).reduce((acc, item) => acc + parseFloat(item.price), 0);
                        const total = fuel + goods;
                        return (
                            <button
                                key={sale.id || index}
                                onClick={() => onSelectSale(sale)}
                                className="w-full bg-yellow-50 border border-yellow-200 p-3 rounded hover:bg-yellow-100 flex justify-between items-center"
                            >
                                <span className="font-bold text-gray-700">รายการที่ {index + 1}</span>
                                <span className="font-bold text-blue-600">฿{total.toFixed(2)}</span>
                            </button>
                        );
                    })}
                </div>

                {sales.length < 5 ? (
                    <button
                        onClick={onNewSale}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 mb-2"
                    >
                        + รายการใหม่ (New Sale)
                    </button>
                ) : (
                    <div className="text-center text-red-500 text-sm mb-2">
                        ครบกำหนด 5 รายการแล้ว (Limit Reached)
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
                >
                    ปิด (Close)
                </button>
            </div>
        </div>
    );
};

export default HeldSalesModal;
