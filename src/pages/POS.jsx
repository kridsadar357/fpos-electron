import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DispenserCard from '../components/DispenserCard';
import OpenShiftModal from '../components/OpenShiftModal';
import CloseShiftModal from '../components/CloseShiftModal';
import { useAuth } from '../context/AuthContext';
import { useShift } from '../context/ShiftContext';
import { useSales } from '../contexts/SalesContext';
import toast from 'react-hot-toast';

const POS = () => {
    const [dispensers, setDispensers] = useState([]);
    const { logout, user } = useAuth();
    const { currentShift, openShift, closeShift, loading } = useShift();
    const { getSale, loading: salesLoading } = useSales();
    const navigate = useNavigate();
    const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false);
    const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);
    const [posStatus, setPosStatus] = useState('open');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    setPosStatus(data.pos_status || 'open');
                }
            } catch (err) {
                console.error('Error fetching settings:', err);
            }
        };

        fetchSettings();
        const fetchDispensers = () => {
            fetch('http://localhost:3001/api/dispensers')
                .then(res => res.json())
                .then(data => setDispensers(data))
                .catch(err => console.error('Error fetching dispensers:', err));
        };

        fetchDispensers();
        const interval = setInterval(() => {
            fetchDispensers();
            fetchSettings(); // Poll settings too to catch status changes
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleOpenShift = async (startCash) => {
        const result = await openShift(startCash);
        if (result.success) {
            setIsOpenShiftModalOpen(false);
            toast.success('เปิดกะสำเร็จ (Shift Opened)');
        } else {
            toast.error('เปิดกะไม่สำเร็จ (Failed to open shift): ' + result.error);
        }
    };

    const handleCloseShift = async (endCash) => {
        const result = await closeShift(endCash);
        if (result.success) {
            setIsCloseShiftModalOpen(false);
            toast.success('ปิดกะสำเร็จ (Shift Closed)');
        } else {
            toast.error('ปิดกะไม่สำเร็จ (Failed to close shift): ' + result.error);
        }
    };

    const handleNozzleSelect = (nozzle) => {
        if (!currentShift) {
            toast.error('กรุณาเปิดกะก่อนทำรายการ! (Please open a shift first!)');
            return;
        }
        // Allow navigation if nozzle is held (check context)
        if (nozzle.status === 'locked' && !getSale(nozzle.id)) return;
        navigate(`/sales/${nozzle.id}`);
    };

    if (loading || salesLoading) return <div className="p-8">กำลังโหลด... (Loading...)</div>;

    if (posStatus === 'closed') {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8 font-sans text-center">
                <div className="bg-white p-12 rounded-xl shadow-2xl max-w-2xl">
                    <div className="text-red-500 mb-6">
                        <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">ระบบปิดปรับปรุงชั่วคราว</h1>
                    <h2 className="text-2xl text-gray-600 mb-8">POS System is Closed for Maintenance</h2>
                    <p className="text-gray-500 mb-8">กรุณาติดต่อผู้ดูแลระบบเพื่อเปิดใช้งาน (Please contact admin to open the system)</p>
                    <button
                        onClick={logout}
                        className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 font-bold shadow-lg active:scale-95 transition-transform"
                    >
                        ออกจากระบบ (Logout)
                    </button>

                    {/* Admin backdoor/login link could go here if needed, but for now just logout */}
                    <div className="mt-8 pt-6 border-t">
                        <button
                            onClick={() => navigate('/login')} // Or navigate to admin login if different
                            className="text-blue-500 hover:underline text-sm"
                        >
                            สำหรับผู้ดูแลระบบ (Admin Login)
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-blue-800">สถานีบริการน้ำมัน (Fuel POS)</h1>
                    <p className="text-gray-600">
                        ยินดีต้อนรับ (Welcome), {user?.username} |
                        สถานะ (Status): <span className={`font-bold ${currentShift ? 'text-green-600' : 'text-red-600'}`}>
                            {currentShift ? 'เปิดกะ (OPEN)' : 'ปิดกะ (CLOSED)'}
                        </span>
                    </p>
                </div>
                <div className="flex gap-4">
                    {!currentShift ? (
                        <button
                            onClick={() => setIsOpenShiftModalOpen(true)}
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-bold shadow active:scale-95 transition-transform"
                        >
                            เปิดกะ
                        </button>
                    ) : (
                        <div className="flex">
                            <button
                                onClick={() => navigate('/sales/general')}
                                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-bold shadow active:scale-95 transition-transform mr-2"
                            >
                                ขายสินค้าทั่วไป
                            </button>
                            <button
                                onClick={() => setIsCloseShiftModalOpen(true)}
                                className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 font-bold shadow active:scale-95 transition-transform"
                            >
                                ปิดกะ
                            </button>
                            <button
                                onClick={() => navigate('/menu')}
                                className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 font-bold shadow ml-2 active:scale-95 transition-transform"
                            >
                                เมนู
                            </button>
                        </div>
                    )}
                    <button
                        onClick={logout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 active:scale-95 transition-transform"
                    >
                        ออกจากระบ
                    </button>
                </div>
            </header>

            <div className={`grid grid-cols-3 gap-6 ${!currentShift ? 'opacity-50 pointer-events-none' : ''}`}>
                {dispensers.map(dispenser => (
                    <DispenserCard
                        key={dispenser.id}
                        dispenser={dispenser}
                        onNozzleSelect={handleNozzleSelect}
                    />
                ))}
            </div>

            <OpenShiftModal
                isOpen={isOpenShiftModalOpen}
                onClose={() => setIsOpenShiftModalOpen(false)}
                onConfirm={handleOpenShift}
            />

            <CloseShiftModal
                isOpen={isCloseShiftModalOpen}
                onClose={() => setIsCloseShiftModalOpen(false)}
                onConfirm={handleCloseShift}
            />
        </div>
    );
};

export default POS;
