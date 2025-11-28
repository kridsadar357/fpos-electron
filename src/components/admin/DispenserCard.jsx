import React, { useState } from 'react';
import { FaEdit, FaSave, FaTimes, FaLock, FaUnlock, FaTrash, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

const DispenserCard = ({ dispenser, products, onRename, onDeleteNozzle, onAddNozzle, onUpdateNozzle, onDeleteDispenser, onLock, onUnlock }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(dispenser.name);
    const [isAddingNozzle, setIsAddingNozzle] = useState(false);
    const [newNozzleData, setNewNozzleData] = useState({ nozzle_number: '', product_id: '', meter_reading: '' });

    // State for editing existing nozzle
    const [editingNozzleId, setEditingNozzleId] = useState(null);
    const [editNozzleData, setEditNozzleData] = useState({ nozzle_number: '', product_id: '', meter_reading: '' });

    // Sync editName when dispenser prop changes
    React.useEffect(() => {
        setEditName(dispenser.name);
    }, [dispenser.name]);

    const handleSaveName = () => {
        onRename(dispenser.id, editName);
        setIsEditing(false);
    };

    const handleSaveNozzle = () => {
        if (!newNozzleData.nozzle_number || !newNozzleData.product_id || !newNozzleData.meter_reading) {
            toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        onAddNozzle(dispenser.id, newNozzleData);
        setIsAddingNozzle(false);
        setNewNozzleData({ nozzle_number: '', product_id: '', meter_reading: '' });
    };

    const startEditNozzle = (nozzle) => {
        setEditingNozzleId(nozzle.id);
        setEditNozzleData({
            nozzle_number: nozzle.nozzle_number,
            product_id: nozzle.product_id,
            meter_reading: nozzle.meter_reading
        });
    };

    const cancelEditNozzle = () => {
        setEditingNozzleId(null);
        setEditNozzleData({ nozzle_number: '', product_id: '', meter_reading: '' });
    };

    const saveEditNozzle = (id) => {
        if (!editNozzleData.nozzle_number || !editNozzleData.product_id) {
            toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        // Ensure meter_reading is a number or 0
        const dataToUpdate = {
            ...editNozzleData,
            meter_reading: editNozzleData.meter_reading === '' ? 0 : parseFloat(editNozzleData.meter_reading)
        };
        onUpdateNozzle(id, dataToUpdate);
        setEditingNozzleId(null);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
                {isEditing ? (
                    <div className="flex items-center w-full gap-2">
                        <input
                            type="text"
                            className="text-black px-2 py-1 rounded w-full"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            autoFocus
                        />
                        <button onClick={handleSaveName} className="text-green-400 hover:text-green-200"><FaSave /></button>
                        <button onClick={() => setIsEditing(false)} className="text-red-400 hover:text-red-200"><FaTimes /></button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-bold">{dispenser.name}</h2>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsEditing(true)} className="text-gray-300 hover:text-white"><FaEdit /></button>
                            {dispenser.nozzles.length === 0 && (
                                <button
                                    onClick={() => onDeleteDispenser(dispenser.id)}
                                    className="text-red-300 hover:text-red-100"
                                    title="ลบตู้จ่าย"
                                >
                                    <FaTrash />
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-bold mb-3 text-gray-600 border-b pb-2">รายการหัวจ่าย (Nozzles)</h3>
                <div className="space-y-3">
                    {dispenser.nozzles.map((nozzle) => (
                        <div key={nozzle.id} className="flex flex-col bg-gray-50 p-3 rounded border hover:shadow-sm transition-shadow">
                            {editingNozzleId === nozzle.id ? (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        className="w-full p-1 border rounded text-sm"
                                        value={editNozzleData.nozzle_number}
                                        onChange={(e) => setEditNozzleData({ ...editNozzleData, nozzle_number: e.target.value })}
                                        placeholder="เลขหัวจ่าย"
                                    />
                                    <select
                                        className="w-full p-1 border rounded text-sm"
                                        value={editNozzleData.product_id}
                                        onChange={(e) => setEditNozzleData({ ...editNozzleData, product_id: e.target.value })}
                                    >
                                        <option value="">เลือกน้ำมัน</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        className="w-full p-1 border rounded text-sm"
                                        value={editNozzleData.meter_reading}
                                        onChange={(e) => setEditNozzleData({ ...editNozzleData, meter_reading: e.target.value })}
                                        placeholder="มิเตอร์ปัจจุบัน"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={cancelEditNozzle} className="text-xs text-gray-500">ยกเลิก</button>
                                        <button onClick={() => saveEditNozzle(nozzle.id)} className="text-xs bg-green-600 text-white px-2 py-1 rounded">บันทึก</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-bold text-lg text-gray-800">หัวจ่ายที่ {nozzle.nozzle_number}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: nozzle.product_color || '#3B82F6' }}
                                            ></div>
                                            <div className="text-sm font-semibold" style={{ color: nozzle.product_color || '#3B82F6' }}>
                                                {nozzle.product_name}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            มิเตอร์: {parseFloat(nozzle.meter_reading || 0).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => startEditNozzle(nozzle)} className="text-blue-400 hover:text-blue-600 p-1" title="แก้ไข">
                                            <FaEdit />
                                        </button>
                                        {nozzle.status === 'locked' ? (
                                            <button
                                                onClick={() => onUnlock(nozzle)}
                                                className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded"
                                                title="ปลดล็อค"
                                            >
                                                <FaLock />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => onLock(nozzle)}
                                                className="text-green-500 hover:text-green-700 p-1 bg-green-50 rounded"
                                                title="ล็อคหัวจ่าย"
                                            >
                                                <FaUnlock />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onDeleteNozzle(nozzle.id)}
                                            className="text-gray-400 hover:text-red-600 p-1"
                                            title="ลบหัวจ่าย"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            )}
                            {nozzle.status === 'locked' && !editingNozzleId && (
                                <div className="text-xs text-red-600 bg-red-50 p-2 rounded mt-1">
                                    <span className="font-bold">เหตุผล:</span> {nozzle.lock_reason || '-'}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add Nozzle Form */}
                    {isAddingNozzle ? (
                        <div className="bg-blue-50 p-3 rounded border border-blue-200 mt-2">
                            <div className="mb-2 space-y-2">
                                <input
                                    type="text"
                                    placeholder="เลขหัวจ่าย"
                                    className="w-full p-1 border rounded text-sm"
                                    value={newNozzleData.nozzle_number}
                                    onChange={(e) => setNewNozzleData({ ...newNozzleData, nozzle_number: e.target.value })}
                                />
                                <select
                                    className="w-full p-1 border rounded text-sm"
                                    value={newNozzleData.product_id}
                                    onChange={(e) => setNewNozzleData({ ...newNozzleData, product_id: e.target.value })}
                                >
                                    <option value="">เลือกน้ำมัน</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    placeholder="มิเตอร์เริ่มต้น"
                                    className="w-full p-1 border rounded text-sm"
                                    value={newNozzleData.meter_reading}
                                    onChange={(e) => setNewNozzleData({ ...newNozzleData, meter_reading: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setIsAddingNozzle(false)}
                                    className="text-xs text-gray-500 hover:text-gray-700"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleSaveNozzle}
                                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                >
                                    บันทึก
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingNozzle(true)}
                            className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2 text-sm font-bold transition-colors"
                        >
                            <FaPlus /> เพิ่มหัวจ่าย
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DispenserCard;
