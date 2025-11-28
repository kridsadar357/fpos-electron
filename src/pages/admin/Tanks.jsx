import React, { useState, useEffect } from 'react';
import { FaPlus, FaDatabase, FaTimes, FaSave } from 'react-icons/fa';
import TankCard from '../../components/admin/TankCard';
import { toast } from 'react-hot-toast';

const Tanks = () => {
    const [tanks, setTanks] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTank, setEditingTank] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        product_id: '',
        capacity: '',
        current_volume: '',
        min_level: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tanksRes, productsRes] = await Promise.all([
                fetch('http://localhost:3001/api/tanks'),
                fetch('http://localhost:3001/api/products')
            ]);

            const tanksData = await tanksRes.json();
            const productsData = await productsRes.json();

            // Handle pagination wrapper if present in products response
            const productsList = Array.isArray(productsData) ? productsData : (productsData.data || []);

            setTanks(tanksData);
            setProducts(productsList);
        } catch (err) {
            console.error('Error fetching data:', err);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (tank = null) => {
        if (tank) {
            setEditingTank(tank);
            setFormData({
                name: tank.name,
                product_id: tank.product_id,
                capacity: tank.capacity,
                current_volume: tank.current_volume,
                min_level: tank.min_level
            });
        } else {
            setEditingTank(null);
            setFormData({
                name: '',
                product_id: '',
                capacity: '',
                current_volume: '',
                min_level: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingTank
                ? `http://localhost:3001/api/tanks/${editingTank.id}`
                : 'http://localhost:3001/api/tanks';

            const method = editingTank ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(editingTank ? 'บันทึกข้อมูลเรียบร้อย' : 'เพิ่มถังน้ำมันเรียบร้อย');
                setIsModalOpen(false);
                fetchData();
            } else {
                throw new Error('Failed to save tank');
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบถังน้ำมันนี้?')) return;
        try {
            const res = await fetch(`http://localhost:3001/api/tanks/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success('ลบถังน้ำมันเรียบร้อย');
                fetchData();
            }
        } catch (err) {
            toast.error('Failed to delete tank');
        }
    };

    if (loading) return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaDatabase className="mr-3" /> จัดการถังน้ำมัน (Fuel Tanks)
                </h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center shadow-lg transition-transform active:scale-95 font-bold"
                >
                    <FaPlus className="mr-2" /> เพิ่มถังน้ำมัน (Add Tank)
                </button>
            </div>

            {tanks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow text-gray-500">
                    <FaDatabase className="mx-auto text-4xl mb-4 opacity-30" />
                    <p>ยังไม่มีข้อมูลถังน้ำมัน</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {tanks.map(tank => (
                        <TankCard
                            key={tank.id}
                            tank={tank}
                            onEdit={handleOpenModal}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingTank ? 'แก้ไขถังน้ำมัน (Edit Tank)' : 'เพิ่มถังน้ำมัน (Add Tank)'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-red-500 transition-colors">
                                <FaTimes size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อถัง (Tank Name)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="เช่น Tank 1, Diesel Tank"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">สินค้า (Product)</label>
                                <select
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={formData.product_id}
                                    onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                                >
                                    <option value="">เลือกสินค้า (Select Product)</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">ความจุ (Liters)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        value={formData.capacity}
                                        onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">ปริมาณปัจจุบัน</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        value={formData.current_volume}
                                        onChange={e => setFormData({ ...formData, current_volume: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">แจ้งเตือนเมื่อต่ำกว่า (Min Level)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={formData.min_level}
                                    onChange={e => setFormData({ ...formData, min_level: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center mt-6 shadow-md active:scale-95"
                            >
                                <FaSave className="mr-2" /> บันทึก (Save)
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tanks;
