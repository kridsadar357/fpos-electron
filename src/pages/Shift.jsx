import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useShift } from '../context/ShiftContext';
import { useAuth } from '../context/AuthContext';

const Shift = () => {
    const { currentShift, loading } = useShift();
    const { user } = useAuth();
    const navigate = useNavigate();

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <header className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-blue-800">จัดการกะ (Shift Management)</h1>
                <button
                    onClick={() => navigate('/menu')}
                    className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 font-bold shadow active:scale-95 transition-transform"
                >
                    กลับ (Back)
                </button>
            </header>

            <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-4 border-b pb-2">สถานะกะปัจจุบัน (Current Shift Status)</h2>

                {currentShift ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-600">พนักงาน (Staff):</p>
                                <p className="font-bold text-lg">{user?.username}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">สถานะ (Status):</p>
                                <p className="font-bold text-lg text-green-600">เปิดอยู่ (Open)</p>
                            </div>
                            <div>
                                <p className="text-gray-600">เวลาเริ่ม (Start Time):</p>
                                <p className="font-bold text-lg">{new Date(currentShift.start_time).toLocaleString('th-TH')}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">เงินทอนเริ่มต้น (Start Cash):</p>
                                <p className="font-bold text-lg">{parseFloat(currentShift.start_cash).toFixed(2)} บาท</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t flex justify-end">
                            {/* We can add more actions here later */}
                            <p className="text-sm text-gray-500">
                                * สามารถปิดกะได้จากหน้าเมนูหลัก (You can close the shift from the main menu)
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-xl text-red-600 font-bold mb-4">ยังไม่ได้เปิดกะ (No Active Shift)</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-bold shadow-lg"
                        >
                            ไปที่หน้าขายเพื่อเปิดกะ (Go to POS to Open Shift)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Shift;
