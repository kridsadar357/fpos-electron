import React, { useState, useEffect, useMemo } from 'react';
import {
    FaTruckMoving, FaSave, FaHistory, FaPlus, FaTrash, FaTimes,
    FaCheckCircle, FaCalculator, FaEye, FaSearch, FaFilter,
    FaSort, FaSortUp, FaSortDown, FaCalendarAlt, FaUndo,
    FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const FuelImport = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [tanks, setTanks] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [batchDetails, setBatchDetails] = useState([]);

    // Form State
    const [supplierId, setSupplierId] = useState('');
    const [shippingCost, setShippingCost] = useState('');
    const [importItems, setImportItems] = useState([]);

    // List Management State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'import_date', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [suppliersRes, productsRes, tanksRes, batchesRes] = await Promise.all([
                fetch('http://localhost:3001/api/suppliers'),
                fetch('http://localhost:3001/api/products'),
                fetch('http://localhost:3001/api/tanks'),
                fetch('http://localhost:3001/api/fuel-imports/batches')
            ]);

            const suppliersData = await suppliersRes.json();
            const productsData = await productsRes.json();
            const tanksData = await tanksRes.json();
            const batchesData = await batchesRes.json();

            setSuppliers(suppliersData);
            // Filter only fuel products (type = 'fuel')
            setProducts(productsData.filter(p => p.type === 'fuel'));
            setTanks(tanksData);
            setBatches(batchesData);
        } catch (err) {
            console.error('Error fetching data:', err);
            toast.error('ไม่สามารถโหลดข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    // --- List Logic (Filter & Sort) ---

    const filteredBatches = useMemo(() => {
        return batches.filter(batch => {
            // Search (Supplier Name or ID)
            const searchLower = searchTerm.toLowerCase();
            const supplierName = (batch.supplier_name || '').toLowerCase();
            const batchId = String(batch.id);
            const matchesSearch = supplierName.includes(searchLower) || batchId.includes(searchLower);

            // Filter Status
            const matchesStatus = filterStatus === 'all' || batch.status === filterStatus;

            // Filter Date
            let matchesDate = true;
            if (startDate || endDate) {
                const batchDate = new Date(batch.import_date).setHours(0, 0, 0, 0);
                if (startDate) {
                    matchesDate = matchesDate && batchDate >= new Date(startDate).setHours(0, 0, 0, 0);
                }
                if (endDate) {
                    matchesDate = matchesDate && batchDate <= new Date(endDate).setHours(0, 0, 0, 0);
                }
            }

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [batches, searchTerm, filterStatus, startDate, endDate]);

    const sortedBatches = useMemo(() => {
        let sortableItems = [...filteredBatches];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle numeric values
                if (['shipping_cost', 'total_fuel_cost', 'net_profit', 'item_count'].includes(sortConfig.key)) {
                    aValue = parseFloat(aValue || 0);
                    bValue = parseFloat(bValue || 0);
                }
                // Handle dates
                if (sortConfig.key === 'import_date') {
                    aValue = new Date(aValue).getTime();
                    bValue = new Date(bValue).getTime();
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredBatches, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (name) => {
        if (sortConfig.key !== name) return <FaSort className="text-gray-300" />;
        return sortConfig.direction === 'asc' ? <FaSortUp className="text-blue-600" /> : <FaSortDown className="text-blue-600" />;
    };

    const resetFilters = () => {
        setSearchTerm('');
        setFilterStatus('all');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    // --- Pagination Logic ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedBatches.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedBatches.length / itemsPerPage);

    // --- Form Handlers ---

    const handleAddItem = () => {
        setImportItems([
            ...importItems,
            { product_id: '', tank_id: '', amount: '', price_per_unit: '' }
        ]);
    };

    const handleRemoveItem = (index) => {
        const newItems = [...importItems];
        newItems.splice(index, 1);
        setImportItems(newItems);
    };

    const handleItemChange = (index, field, value) => {
        setImportItems(prevItems => {
            const newItems = prevItems.map((item, i) => {
                if (i === index) {
                    const updatedItem = { ...item, [field]: value };
                    // Reset tank if product changes
                    if (field === 'product_id') {
                        updatedItem.tank_id = '';
                    }
                    return updatedItem;
                }
                return item;
            });
            return newItems;
        });
    };

    const calculateItemTotal = (item) => {
        const amount = parseFloat(item.amount) || 0;
        const price = parseFloat(item.price_per_unit) || 0;
        return amount * price;
    };

    const calculateGrandTotal = () => {
        const itemsTotal = importItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
        const shipping = parseFloat(shippingCost) || 0;
        return itemsTotal + shipping;
    };

    const handleSubmit = async () => {
        if (!supplierId) {
            toast.error('กรุณาเลือกผู้จำหน่าย');
            return;
        }
        if (importItems.length === 0) {
            toast.error('กรุณาเพิ่มรายการสินค้า');
            return;
        }

        // Validation
        const productIds = new Set();
        for (const item of importItems) {
            if (!item.product_id || !item.amount || !item.price_per_unit) {
                toast.error('กรุณากรอกข้อมูลให้ครบถ้วนทุกรายการ');
                return;
            }
            if (item.product_id && item.tank_id) {
                // Check duplicate product (Fuel Type)
                if (productIds.has(item.product_id)) {
                    toast.error('ไม่สามารถเพิ่มชนิดน้ำมันซ้ำกันได้ในครั้งเดียว');
                    return;
                }
                productIds.add(item.product_id);

                // Check Capacity
                const tank = tanks.find(t => t.id == item.tank_id);
                if (tank) {
                    const remaining = parseFloat(tank.capacity) - parseFloat(tank.current_volume);
                    if (parseFloat(item.amount) > remaining) {
                        toast.error(`Tank ${tank.name}: ปริมาณเกินความจุ(เหลือ ${remaining.toLocaleString()} L)`);
                        return;
                    }
                }
            }
        }

        const payload = {
            supplier_id: supplierId,
            shipping_cost: shippingCost,
            items: importItems.map(item => ({
                ...item,
                total_price: calculateItemTotal(item)
            }))
        };

        try {
            const res = await fetch('http://localhost:3001/api/fuel-imports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success('บันทึกการนำเข้าสำเร็จ (รอการยืนยันรับของ)');
                setShowModal(false);
                setSupplierId('');
                setShippingCost('');
                setImportItems([]);
                fetchData();
            } else {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save');
            }
        } catch (err) {
            console.error('Error saving import:', err);
            toast.error(err.message);
        }
    };

    const handleReceiveBatch = async (batchId) => {
        if (!window.confirm('ยืนยันการรับน้ำมันเข้าถัง? (สต็อกและปริมาณถังจะถูกอัปเดต)')) return;

        try {
            const res = await fetch(`http://localhost:3001/api/fuel-imports/receive/${batchId}`, {
                method: 'POST'
            });
            if (res.ok) {
                toast.success('ยืนยันรับของเรียบร้อย');
                fetchData();
            } else {
                const data = await res.json();
                throw new Error(data.error || 'Failed to receive');
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleCalculateProfit = async (batchId) => {
        try {
            const res = await fetch(`http://localhost:3001/api/fuel-imports/calculate-profit/${batchId}`, {
                method: 'POST'
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`คำนวณกำไรเรียบร้อย: ฿${data.netProfit.toLocaleString()}`);
                fetchData();
            } else {
                throw new Error(data.error || 'Failed to calculate');
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleViewDetails = async (batch) => {
        setSelectedBatch(batch);
        try {
            const res = await fetch(`http://localhost:3001/api/fuel-imports/batches/${batch.id}`);
            const data = await res.json();
            setBatchDetails(data);
            setShowDetailModal(true);
        } catch (err) {
            toast.error('ไม่สามารถโหลดรายละเอียดได้');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaTruckMoving className="mr-3" /> นำเข้าน้ำมัน (Fuel Import)
                </h1>
                <button
                    onClick={() => {
                        setShowModal(true);
                        setSupplierId('');
                        setShippingCost('');
                        setImportItems([{ product_id: '', tank_id: '', amount: '', price_per_unit: '' }]);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center shadow-lg"
                >
                    <FaPlus className="mr-2" /> เพิ่มรายการนำเข้า
                </button>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-bold text-gray-700 mb-1">ค้นหา (ชื่อผู้จำหน่าย / ID)</label>
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="ค้นหา..."
                            className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div className="w-40">
                    <label className="block text-sm font-bold text-gray-700 mb-1">สถานะ</label>
                    <div className="relative">
                        <FaFilter className="absolute left-3 top-3 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        >
                            <option value="all">ทั้งหมด</option>
                            <option value="pending">รอรับของ</option>
                            <option value="received">รับของแล้ว</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">ตั้งแต่วันที่</label>
                    <div className="relative">
                        <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">ถึงวันที่</label>
                    <div className="relative">
                        <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center h-[42px]"
                >
                    <FaUndo className="mr-2" /> รีเซ็ต
                </button>
            </div>

            {/* Batches List */}
            <div className="bg-white rounded-xl shadow overflow-hidden flex flex-col">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <FaHistory className="mr-2" /> ประวัติการนำเข้า (Import Batches)
                    </h2>
                    <span className="text-sm text-gray-500">
                        แสดง {currentItems.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, sortedBatches.length)} จาก {sortedBatches.length} รายการ
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th
                                    className="p-4 font-bold text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                                    onClick={() => requestSort('import_date')}
                                >
                                    <div className="flex items-center">วันที่ {getSortIcon('import_date')}</div>
                                </th>
                                <th
                                    className="p-4 font-bold text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors select-none"
                                    onClick={() => requestSort('supplier_name')}
                                >
                                    <div className="flex items-center">ผู้จำหน่าย {getSortIcon('supplier_name')}</div>
                                </th>
                                <th
                                    className="p-4 font-bold text-gray-600 text-center cursor-pointer hover:bg-gray-200 transition-colors select-none"
                                    onClick={() => requestSort('item_count')}
                                >
                                    <div className="flex items-center justify-center">รายการ {getSortIcon('item_count')}</div>
                                </th>
                                <th
                                    className="p-4 font-bold text-gray-600 text-right cursor-pointer hover:bg-gray-200 transition-colors select-none"
                                    onClick={() => requestSort('shipping_cost')}
                                >
                                    <div className="flex items-center justify-end">ค่าขนส่ง {getSortIcon('shipping_cost')}</div>
                                </th>
                                <th
                                    className="p-4 font-bold text-gray-600 text-right cursor-pointer hover:bg-gray-200 transition-colors select-none"
                                    onClick={() => requestSort('total_fuel_cost')}
                                >
                                    <div className="flex items-center justify-end">รวมต้นทุน {getSortIcon('total_fuel_cost')}</div>
                                </th>
                                <th
                                    className="p-4 font-bold text-gray-600 text-center cursor-pointer hover:bg-gray-200 transition-colors select-none"
                                    onClick={() => requestSort('status')}
                                >
                                    <div className="flex items-center justify-center">สถานะ {getSortIcon('status')}</div>
                                </th>
                                <th
                                    className="p-4 font-bold text-gray-600 text-center cursor-pointer hover:bg-gray-200 transition-colors select-none"
                                    onClick={() => requestSort('net_profit')}
                                >
                                    <div className="flex items-center justify-center">กำไร/ขาดทุน {getSortIcon('net_profit')}</div>
                                </th>
                                <th className="p-4 font-bold text-gray-600 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="p-8 text-center text-gray-500">กำลังโหลด...</td></tr>
                            ) : currentItems.length === 0 ? (
                                <tr><td colSpan="8" className="p-8 text-center text-gray-500">ไม่พบข้อมูล</td></tr>
                            ) : (
                                currentItems.map(batch => (
                                    <tr key={batch.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4 text-gray-600">
                                            {new Date(batch.import_date).toLocaleString('th-TH')}
                                        </td>
                                        <td className="p-4 font-bold text-gray-800">{batch.supplier_name || '-'}</td>
                                        <td className="p-4 text-center">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                                                {batch.item_count} รายการ
                                            </span>
                                        </td>
                                        <td className="p-4 text-right text-gray-600">฿{parseFloat(batch.shipping_cost).toLocaleString()}</td>
                                        <td className="p-4 text-right font-bold text-blue-800">
                                            ฿{(parseFloat(batch.total_fuel_cost) + parseFloat(batch.shipping_cost)).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            {batch.status === 'received' ? (
                                                <span className="text-green-600 flex items-center justify-center font-bold">
                                                    <FaCheckCircle className="mr-1" /> รับของแล้ว
                                                </span>
                                            ) : (
                                                <span className="text-orange-500 font-bold">รอรับของ</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {batch.profit_status === 'calculated' ? (
                                                <div className={`font-bold ${parseFloat(batch.net_profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {parseFloat(batch.net_profit) >= 0 ? '+' : ''}
                                                    ฿{parseFloat(batch.net_profit).toLocaleString()}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center space-x-2">
                                            <button
                                                onClick={() => handleViewDetails(batch)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="ดูรายละเอียด"
                                            >
                                                <FaEye size={18} />
                                            </button>

                                            {batch.status === 'pending' && (
                                                <button
                                                    onClick={() => handleReceiveBatch(batch.id)}
                                                    className="text-green-600 hover:text-green-800"
                                                    title="ยืนยันรับของ"
                                                >
                                                    <FaCheckCircle size={18} />
                                                </button>
                                            )}

                                            {batch.status === 'received' && batch.profit_status === 'pending' && (
                                                <button
                                                    onClick={() => handleCalculateProfit(batch.id)}
                                                    className="text-purple-600 hover:text-purple-800"
                                                    title="คำนวณกำไร (จากรอบก่อนหน้า)"
                                                >
                                                    <FaCalculator size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Advanced Pagination Controls */}
                <div className="p-4 border-t flex flex-col md:flex-row justify-between items-center bg-gray-50 gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">แสดง</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border rounded p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className="text-sm text-gray-600">รายการต่อหน้า</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
                            title="หน้าแรก"
                        >
                            <FaAngleDoubleLeft />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
                            title="ก่อนหน้า"
                        >
                            <FaChevronLeft />
                        </button>

                        <span className="px-4 font-bold text-gray-600">
                            หน้า {currentPage} จาก {totalPages || 1}
                        </span>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
                            title="ถัดไป"
                        >
                            <FaChevronRight />
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
                            title="หน้าสุดท้าย"
                        >
                            <FaAngleDoubleRight />
                        </button>
                    </div>
                </div>
            </div>

            {/* Import Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b flex justify-between items-center bg-blue-600 text-white rounded-t-xl">
                            <h2 className="text-xl font-bold flex items-center">
                                <FaTruckMoving className="mr-3" /> บันทึกการนำเข้า (New Import)
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-200">
                                <FaTimes size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            {/* Supplier Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">ผู้จำหน่าย (Supplier)</label>
                                    <select
                                        value={supplierId}
                                        onChange={e => setSupplierId(e.target.value)}
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    >
                                        <option value="">-- เลือกผู้จำหน่าย --</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">ค่าขนส่ง (Shipping Cost)</label>
                                    <input
                                        type="number"
                                        value={shippingCost}
                                        onChange={e => setShippingCost(e.target.value)}
                                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="space-y-4">
                                {importItems.map((item, index) => (
                                    <div key={index} className="border rounded-lg p-4 bg-gray-50 relative">
                                        <button
                                            onClick={() => handleRemoveItem(index)}
                                            className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                                            title="ลบรายการ"
                                        >
                                            <FaTrash />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-600 mb-1">ชนิดน้ำมัน</label>
                                                <select
                                                    value={item.product_id}
                                                    onChange={e => handleItemChange(index, 'product_id', e.target.value)}
                                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">-- เลือกชนิดน้ำมัน --</option>
                                                    {products.map(p => {
                                                        // Check if this product is selected in any OTHER row
                                                        const isSelectedInOtherRow = importItems.some((i, iIndex) =>
                                                            iIndex !== index && String(i.product_id) === String(p.id)
                                                        );
                                                        return (
                                                            <option
                                                                key={p.id}
                                                                value={p.id}
                                                                disabled={isSelectedInOtherRow}
                                                                className={isSelectedInOtherRow ? 'text-gray-400 bg-gray-100' : ''}
                                                            >
                                                                {p.name} {isSelectedInOtherRow ? '(เลือกแล้ว)' : ''}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                            {item.product_id && (
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-600 mb-1">ถังน้ำมัน</label>
                                                    <select
                                                        value={item.tank_id}
                                                        onChange={e => handleItemChange(index, 'tank_id', e.target.value)}
                                                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="">-- เลือกถังน้ำมัน --</option>
                                                        {tanks
                                                            .filter(t => t.product_id == item.product_id)
                                                            .map(t => {
                                                                const remaining = parseFloat(t.capacity) - parseFloat(t.current_volume);
                                                                return (
                                                                    <option key={t.id} value={t.id}>
                                                                        {t.name} (เหลือ: {remaining.toLocaleString()} L)
                                                                    </option>
                                                                );
                                                            })}
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-600 mb-1">ปริมาณ (ลิตร)</label>
                                                <input
                                                    type="number"
                                                    value={item.amount}
                                                    onChange={e => handleItemChange(index, 'amount', e.target.value)}
                                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-600 mb-1">ราคา/หน่วย</label>
                                                <input
                                                    type="number"
                                                    value={item.price_per_unit}
                                                    onChange={e => handleItemChange(index, 'price_per_unit', e.target.value)}
                                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-600 mb-1">รวม (บาท)</label>
                                                <div className="w-full p-2 bg-white border rounded text-right font-bold text-green-600">
                                                    {calculateItemTotal(item).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleAddItem}
                                className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center font-bold"
                            >
                                <FaPlus className="mr-2" /> เพิ่มรายการสินค้า
                            </button>
                        </div>

                        <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-between items-center">
                            <div className="text-xl font-bold text-gray-800">
                                ยอดรวมทั้งสิ้น: <span className="text-blue-600">฿{calculateGrandTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-bold"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg flex items-center"
                                >
                                    <FaSave className="mr-2" /> บันทึกทั้งหมด
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedBatch && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-800 text-white rounded-t-xl">
                            <h2 className="text-xl font-bold">รายละเอียดการนำเข้า #{selectedBatch.id}</h2>
                            <button onClick={() => setShowDetailModal(false)} className="text-white hover:text-gray-300">
                                <FaTimes size={24} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="mb-4 grid grid-cols-2 gap-4">
                                <div>
                                    <span className="block text-gray-500 text-sm">ผู้จำหน่าย</span>
                                    <span className="font-bold text-gray-800">{selectedBatch.supplier_name}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-sm">วันที่นำเข้า</span>
                                    <span className="font-bold text-gray-800">{new Date(selectedBatch.import_date).toLocaleString('th-TH')}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-sm">ค่าขนส่ง</span>
                                    <span className="font-bold text-gray-800">฿{parseFloat(selectedBatch.shipping_cost).toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-sm">สถานะ</span>
                                    <span className={`font-bold ${selectedBatch.status === 'received' ? 'text-green-600' : 'text-orange-500'}`}>
                                        {selectedBatch.status === 'received' ? 'รับของแล้ว' : 'รอรับของ'}
                                    </span>
                                </div>
                            </div>

                            <h3 className="font-bold text-gray-700 mb-2 border-b pb-2">รายการสินค้า</h3>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-sm text-gray-500">
                                        <th className="pb-2">สินค้า</th>
                                        <th className="pb-2 text-right">ปริมาณ</th>
                                        <th className="pb-2 text-right">ราคา/หน่วย</th>
                                        <th className="pb-2 text-right">รวม</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {batchDetails.map(item => (
                                        <tr key={item.id} className="border-b last:border-0">
                                            <td className="py-2">
                                                <div className="font-bold">{item.product_name}</div>
                                                <div className="text-xs text-gray-500">{item.tank_name || '-'}</div>
                                            </td>
                                            <td className="py-2 text-right">{parseFloat(item.amount).toLocaleString()} L</td>
                                            <td className="py-2 text-right">฿{parseFloat(item.price_per_unit).toFixed(2)}</td>
                                            <td className="py-2 text-right font-bold">฿{parseFloat(item.total_price).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FuelImport;
