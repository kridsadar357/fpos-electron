import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSales } from '../contexts/SalesContext';
import HeldSalesModal from './HeldSalesModal';
import toast from 'react-hot-toast';

const DispenserCard = ({ dispenser, onNozzleSelect }) => {
    const { getSales, addSale } = useSales();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNozzle, setSelectedNozzle] = useState(null);

    const handleNozzleClick = async (nozzle) => {
        const sales = getSales(nozzle.id);

        if (sales.length === 0) {
            // No active sales, start new one directly
            if (nozzle.status === 'locked') {
                // If locked but no sales in context, it might be a ghost state or just starting.
                // But usually locked means busy. 
                // Let's assume we start a new sale.
                const saleId = await addSale(nozzle.id, { step: 'fuel', nozzleData: nozzle });
                if (saleId) navigate(`/sales/${nozzle.id}/${saleId}`);
            } else {
                // Idle, start new
                const saleId = await addSale(nozzle.id, { step: 'fuel', nozzleData: nozzle });
                if (saleId) navigate(`/sales/${nozzle.id}/${saleId}`);
            }
        } else {
            // Has active sales, open modal
            setSelectedNozzle(nozzle);
            setIsModalOpen(true);
        }
    };

    const handleSelectSale = (sale) => {
        navigate(`/sales/${selectedNozzle.id}/${sale.id}`);
        setIsModalOpen(false);
    };

    const handleNewSale = async () => {
        if (selectedNozzle) {
            const saleId = await addSale(selectedNozzle.id, { step: 'fuel', nozzleData: selectedNozzle });
            if (saleId) navigate(`/sales/${selectedNozzle.id}/${saleId}`);
            setIsModalOpen(false);
        }
    };

    return (
        <>
            <div className="bg-gray-900 rounded-xl p-4 shadow-2xl border-4 border-gray-700 relative overflow-hidden w-full">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-3 rounded-t-lg text-center font-bold text-2xl border-b-2 border-gray-600 shadow-md">
                    {dispenser.name}
                </div>

                <div className="p-4 bg-gray-800 min-h-[250px] flex flex-col justify-between relative rounded-b-lg">
                    {/* Nozzles */}
                    <div className="grid grid-cols-2 gap-4">
                        {dispenser.nozzles.map((nozzle) => {
                            const sales = getSales(nozzle.id);
                            const salesCount = sales.length;
                            const isLocked = nozzle.status === 'locked';

                            const totalHeldAmount = sales.reduce((sum, sale) => {
                                const fuel = parseFloat(sale.fuelAmount) || 0;
                                const goods = (sale.cart || []).reduce((acc, item) => acc + parseFloat(item.price), 0);
                                return sum + fuel + goods;
                            }, 0);

                            return (
                                <button
                                    key={nozzle.id}
                                    onClick={() => (!isLocked || salesCount > 0) && handleNozzleClick(nozzle)}
                                    disabled={isLocked && salesCount === 0}
                                    style={{
                                        backgroundColor: !isLocked && nozzle.product_color ? nozzle.product_color : undefined,
                                        color: !isLocked && nozzle.product_color ? '#fff' : undefined // Ensure text is readable
                                    }}
                                    className={`
                                        flex flex-col items-center justify-center p-4 rounded-lg transition-all transform active:scale-95
                                        ${isLocked
                                            ? (salesCount > 0
                                                ? 'bg-yellow-900 border-2 border-yellow-500 animate-pulse cursor-pointer'
                                                : 'bg-red-900 border-2 border-red-700 opacity-50 cursor-not-allowed grayscale')
                                            : 'border-2 border-gray-500 shadow-lg hover:shadow-xl cursor-pointer hover:brightness-110'} 
                                    `}
                                >
                                    <div className="flex flex-col items-center mb-2">
                                        <span className={`font-bold text-xl ${isLocked ? 'text-red-400' : 'text-white'}`}>
                                            {nozzle.product_name}
                                        </span>
                                        <span className="text-sm text-gray-300">
                                            {parseFloat(nozzle.product_price).toFixed(2)} บาท/ลิตร
                                        </span>
                                    </div>

                                    {/* LED Display Effect */}
                                    <div className="bg-black border-2 border-gray-600 rounded p-2 w-full text-right shadow-inner">
                                        {salesCount > 0 ? (
                                            <>
                                                <div className="text-[10px] text-yellow-500 font-mono flex justify-between">
                                                    <span>รอชำระ ({salesCount})</span>
                                                    <span>บาท</span>
                                                </div>
                                                <div className="text-2xl font-mono text-green-400 font-bold tracking-widest glow-text truncate">
                                                    {totalHeldAmount.toFixed(2)}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-2xl font-mono text-red-900 font-bold tracking-widest opacity-30">
                                                ว่าง
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer / Hose decoration */}
                <div className="absolute bottom-0 left-0 w-full h-2 bg-black opacity-50"></div>
            </div>

            <HeldSalesModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                sales={selectedNozzle ? getSales(selectedNozzle.id) : []}
                onSelectSale={handleSelectSale}
                onNewSale={handleNewSale}
                nozzleName={selectedNozzle?.product_name}
            />

            <style>{`
                .glow-text {
                    text-shadow: 0 0 5px #4ade80;
                }
            `}</style>
        </>
    );
};

export default DispenserCard;
