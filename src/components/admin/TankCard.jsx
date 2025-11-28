import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TankCard = ({ tank, onEdit, onDelete }) => {
    const [period, setPeriod] = useState('today');
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Calculate percentage
    const percentage = Math.min(100, Math.max(0, (tank.current_volume / tank.capacity) * 100));
    const isLow = parseFloat(tank.current_volume) <= parseFloat(tank.min_level);

    useEffect(() => {
        fetchHistory();
    }, [period, tank.id]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/api/tanks/${tank.id}/history?period=${period}`);
            const data = await res.json();
            setChartData(data);
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6 relative overflow-hidden hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg text-gray-800">{tank.name}</h3>
                    <p className="text-sm text-gray-500">{tank.product_name}</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onEdit(tank)}
                        className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50"
                        title="แก้ไข (Edit)"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={() => onDelete(tank.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                        title="ลบ (Delete)"
                    >
                        <FaTrash />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Visual Tank */}
                <div className="flex items-center justify-center">
                    <div className="relative w-24 h-36 bg-gray-100 rounded-3xl border-4 border-gray-200 overflow-hidden shadow-inner">
                        {/* Liquid */}
                        <div
                            className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-in-out"
                            style={{
                                height: `${percentage}%`,
                                backgroundColor: tank.product_color || '#3B82F6',
                                opacity: 0.85
                            }}
                        >
                            {/* Surface Reflection */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-white opacity-30"></div>
                        </div>

                        {/* Percentage Text Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                            <span className="text-xl font-bold text-gray-800 drop-shadow-sm bg-white/50 px-1 rounded backdrop-blur-sm">
                                {percentage.toFixed(0)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex flex-col justify-center space-y-3">
                    <div>
                        <span className="text-xs text-gray-500 block">ปริมาณ (Current)</span>
                        <span className={`font-bold text-lg ${isLow ? 'text-red-600' : 'text-gray-800'}`}>
                            {parseFloat(tank.current_volume).toLocaleString()} L
                        </span>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 block">ความจุ (Capacity)</span>
                        <span className="font-bold text-gray-800">
                            {parseFloat(tank.capacity).toLocaleString()} L
                        </span>
                    </div>
                    {isLow && (
                        <div className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded animate-pulse border border-red-100 text-center">
                            ⚠️ Low Level
                        </div>
                    )}
                </div>
            </div>

            {/* Chart Section */}
            <div className="mt-4 border-t pt-4">
                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4 text-xs">
                    {['today', 'week', 'month', 'year'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`flex-1 py-1.5 rounded-md transition-all ${period === p
                                    ? 'bg-white text-blue-600 shadow-sm font-bold'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {p === 'today' ? 'วันนี้' :
                                p === 'week' ? 'สัปดาห์' :
                                    p === 'month' ? 'เดือน' : 'ปี'}
                        </button>
                    ))}
                </div>

                {/* Chart */}
                <div className="h-32 w-full">
                    {loading ? (
                        <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                            Loading...
                        </div>
                    ) : chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id={`color${tank.id}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={tank.product_color || '#3B82F6'} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={tank.product_color || '#3B82F6'} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="label"
                                    hide={true}
                                />
                                <Tooltip
                                    contentStyle={{ fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value) => [`${parseFloat(value).toFixed(0)} L`, 'Volume']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={tank.product_color || '#3B82F6'}
                                    fillOpacity={1}
                                    fill={`url(#color${tank.id})`}
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                            No Data
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TankCard;
