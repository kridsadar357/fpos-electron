import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaGasPump } from 'react-icons/fa';
import LockNozzleModal from '../../components/admin/LockNozzleModal';
import DispenserCard from '../../components/admin/DispenserCard';

const Dispensers = () => {
    const [dispensers, setDispensers] = useState([]);
    const [products, setProducts] = useState([]);
    const [isLockModalOpen, setIsLockModalOpen] = useState(false);
    const [selectedNozzle, setSelectedNozzle] = useState(null);

    useEffect(() => {
        fetchDispensers();
        fetchProducts();
    }, []);

    const fetchDispensers = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/dispensers');
            const data = await res.json();
            setDispensers(data);
        } catch (err) {
            console.error('Error fetching dispensers:', err);
            toast.error('ไม่สามารถโหลดข้อมูลตู้จ่ายได้');
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/products?type=fuel');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    };

    const handleLock = (nozzle) => {
        setSelectedNozzle(nozzle);
        setIsLockModalOpen(true);
    };

    const handleUnlock = async (nozzle) => {
        if (!window.confirm(`ต้องการปลดล็อคหัวจ่าย ${nozzle.nozzle_number} ใช่หรือไม่?`)) return;
        try {
            const res = await fetch(`http://localhost:3001/api/nozzles/${nozzle.id}/unlock`, { method: 'POST' });
            if (res.ok) {
                toast.success('ปลดล็อคหัวจ่ายเรียบร้อย');
                fetchDispensers();
            } else {
                toast.error('ปลดล็อคไม่สำเร็จ');
            }
        } catch (err) {
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    const confirmLock = async (nozzle, reason) => {
        try {
            const res = await fetch(`http://localhost:3001/api/nozzles/${nozzle.id}/lock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });
            if (res.ok) {
                toast.success('ล็อคหัวจ่ายเรียบร้อย');
                setIsLockModalOpen(false);
                fetchDispensers();
            } else {
                toast.error('ล็อคไม่สำเร็จ');
            }
        } catch (err) {
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    const handleDeleteNozzle = async (id) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบหัวจ่ายนี้?')) return;
        try {
            const res = await fetch(`http://localhost:3001/api/nozzles/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('ลบหัวจ่ายเรียบร้อย');
                fetchDispensers();
            } else {
                toast.error('ลบไม่สำเร็จ');
            }
        } catch (err) {
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    const handleAddNozzle = async (dispenserId, nozzleData) => {
        try {
            const res = await fetch('http://localhost:3001/api/nozzles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...nozzleData, dispenser_id: dispenserId })
            });
            if (res.ok) {
                toast.success('เพิ่มหัวจ่ายเรียบร้อย');
                fetchDispensers();
            } else {
                toast.error('เพิ่มหัวจ่ายไม่สำเร็จ');
            }
        } catch (err) {
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    const handleRenameDispenser = async (id, newName) => {
        try {
            const res = await fetch(`http://localhost:3001/api/dispensers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            });
            if (res.ok) {
                toast.success('เปลี่ยนชื่อตู้จ่ายเรียบร้อย');
                fetchDispensers();
            } else {
                toast.error('บันทึกไม่สำเร็จ');
            }
        } catch (err) {
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    const handleUpdateNozzle = async (id, nozzleData) => {
        try {
            const res = await fetch(`http://localhost:3001/api/nozzles/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nozzleData)
            });
            if (res.ok) {
                toast.success('อัปเดตหัวจ่ายเรียบร้อย');
                fetchDispensers();
            } else {
                toast.error('อัปเดตไม่สำเร็จ');
            }
        } catch (err) {
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    const handleDeleteDispenser = async (id) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบตู้จ่ายนี้?')) return;
        try {
            const res = await fetch(`http://localhost:3001/api/dispensers/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('ลบตู้จ่ายเรียบร้อย');
                fetchDispensers();
            } else {
                const data = await res.json();
                toast.error(data.error || 'ลบไม่สำเร็จ');
            }
        } catch (err) {
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaGasPump className="mr-3" /> จัดการตู้จ่ายและหัวจ่าย (Dispenser Management)
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dispensers.map((dispenser) => (
                    <DispenserCard
                        key={dispenser.id}
                        dispenser={dispenser}
                        products={products}
                        onRename={handleRenameDispenser}
                        onDeleteNozzle={handleDeleteNozzle}
                        onAddNozzle={handleAddNozzle}
                        onUpdateNozzle={handleUpdateNozzle}
                        onDeleteDispenser={handleDeleteDispenser}
                        onLock={handleLock}
                        onUnlock={handleUnlock}
                    />
                ))}
            </div>

            <LockNozzleModal
                isOpen={isLockModalOpen}
                onClose={() => setIsLockModalOpen(false)}
                onConfirm={confirmLock}
                nozzle={selectedNozzle}
            />
        </div>
    );
};

export default Dispensers;
