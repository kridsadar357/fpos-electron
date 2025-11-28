import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductList from '../components/ProductList';
import Numpad from '../components/Numpad';
import { useSales } from '../contexts/SalesContext';
import toast from 'react-hot-toast';
import { FaUser, FaGasPump, FaShoppingCart, FaMoneyBillWave, FaTimes, FaArrowLeft, FaBoxOpen, FaCreditCard, FaMoneyBillAlt, FaQrcode, FaEdit, FaTrash, FaMinus, FaPlus, FaSearch } from 'react-icons/fa';

const Sales = () => {
    const { nozzleId, saleId } = useParams();
    const navigate = useNavigate();
    const { getSale, updateSale, clearSale, loading } = useSales();
    const isCompleted = useRef(false);
    const isGeneralSale = nozzleId === 'general';

    // Fetch specific sale data
    const savedSale = !isGeneralSale ? getSale(nozzleId, parseInt(saleId)) || {} : {};

    // Initialize state
    const [cart, setCart] = useState([]);
    const [fuelAmount, setFuelAmount] = useState('0');
    const [receivedAmount, setReceivedAmount] = useState('0');
    const [memberId, setMemberId] = useState('');
    const [step, setStep] = useState(isGeneralSale ? 'summary' : 'fuel');
    const [nozzleData, setNozzleData] = useState(null);
    const [memberData, setMemberData] = useState(null);
    const [activeInput, setActiveInput] = useState(isGeneralSale ? 'received' : 'fuel');
    // const [showGoods, setShowGoods] = useState(isGeneralSale); // Removed toggle
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Sync state from context when loaded
    useEffect(() => {
        if (isGeneralSale) {
            setIsInitialized(true);
            return;
        }

        if (!loading && savedSale && savedSale.id && !isInitialized) {
            setCart(savedSale.cart || []);
            setFuelAmount(savedSale.fuelAmount || '0');
            setReceivedAmount(savedSale.receivedAmount || '0');
            setMemberId(savedSale.memberId || '');
            setStep(savedSale.step || 'fuel');
            setNozzleData(savedSale.nozzleData || null);
            setMemberData(savedSale.memberData || null);
            setPaymentMethod(savedSale.paymentMethod || null);
            setIsInitialized(true);
        } else if (!loading && !savedSale.id && !isInitialized) {
            setIsInitialized(true);
        }
    }, [loading, savedSale, isInitialized, isGeneralSale]);

    // Fetch nozzle data
    useEffect(() => {
        if (!isGeneralSale && !nozzleData) {
            const fetchNozzle = async () => {
                try {
                    const res = await fetch('http://localhost:3001/api/dispensers');
                    const dispensers = await res.json();
                    let foundNozzle = null;
                    dispensers.forEach(d => {
                        const n = d.nozzles.find(n => n.id === parseInt(nozzleId));
                        if (n) foundNozzle = n;
                    });
                    if (foundNozzle) {
                        setNozzleData(foundNozzle);
                        if (!savedSale.step) {
                            await fetch(`http://localhost:3001/api/nozzles/${nozzleId}/lock`, { method: 'POST' });
                        }
                    }
                } catch (err) {
                    console.error('Error fetching nozzle:', err);
                    toast.error('ไม่สามารถโหลดข้อมูลหัวจ่ายได้');
                }
            };
            fetchNozzle();
        }
    }, [nozzleId, nozzleData, savedSale?.step, isGeneralSale]);

    // Save state
    useEffect(() => {
        if (!isGeneralSale && nozzleData && !isCompleted.current && isInitialized) {
            updateSale(nozzleId, parseInt(saleId), {
                cart,
                fuelAmount,
                receivedAmount,
                memberId,
                step,
                nozzleData,
                memberData,
                paymentMethod
            });
        }
    }, [cart, fuelAmount, receivedAmount, memberId, step, nozzleData, memberData, nozzleId, saleId, updateSale, paymentMethod, isInitialized, isGeneralSale]);

    const handleAddProduct = (product) => {
        const currentQtyInCart = cart.filter(item => item.id === product.id).length;
        if (currentQtyInCart + 1 > product.stock) {
            toast.error('สินค้าหมดสต็อก');
            return;
        }
        setCart(prev => [...prev, { ...product, type: 'goods' }]);
    };

    const handleDecreaseProduct = (product) => {
        const index = cart.findIndex(item => item.id === product.id);
        if (index !== -1) {
            const newCart = [...cart];
            newCart.splice(index, 1);
            setCart(newCart);
        }
    };

    const handleRemoveProduct = (product) => {
        setCart(cart.filter(item => item.id !== product.id));
    };

    const calculateTotal = () => {
        const goodsTotal = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);
        return parseFloat(fuelAmount) + goodsTotal;
    };

    const handleInput = (key) => {
        if (activeInput === 'fuel') {
            setFuelAmount(prev => prev === '0' ? key : prev + key);
        } else if (activeInput === 'received') {
            setReceivedAmount(prev => prev === '0' ? key : prev + key);
        } else if (activeInput === 'member') {
            setMemberId(prev => prev + key);
        }
    };

    const handleClear = () => {
        if (activeInput === 'fuel') setFuelAmount('0');
        else if (activeInput === 'received') setReceivedAmount('0');
        else if (activeInput === 'member') setMemberId('');
    };

    const handleBackspace = () => {
        if (activeInput === 'fuel') {
            setFuelAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
        } else if (activeInput === 'received') {
            setReceivedAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
        } else if (activeInput === 'member') {
            setMemberId(prev => prev.length > 0 ? prev.slice(0, -1) : '');
        }
    };

    // Keyboard Event Listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Handle global shortcuts or step-specific logic
            if (step === 'summary' && e.key === 'Enter') {
                handleFinalConfirm();
                return;
            }

            if (step === 'payment_method') {
                if (e.key === '1') handlePaymentMethodClick('cash');
                if (e.key === '2') handlePaymentMethodClick('promptpay');
                if (e.key === '3') handlePaymentMethodClick('credit');
                return;
            }

            // Input steps logic
            if (!activeInput) return;

            if (e.key >= '0' && e.key <= '9') {
                handleInput(e.key);
            } else if (e.key === 'Enter') {
                handleEnter();
            } else if (e.key === 'Backspace') {
                handleBackspace();
            } else if (e.key === 'Delete' || e.key === 'Escape') {
                handleClear();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeInput, fuelAmount, receivedAmount, memberId, step, paymentMethod]); // Add step and paymentMethod dependencies

    const handleEnter = async () => {
        if (activeInput === 'fuel') {
            if (parseFloat(fuelAmount) > 0) {
                setStep('received');
                setActiveInput('received');
                setReceivedAmount(fuelAmount);
            }
        } else if (activeInput === 'received') {
            if (parseFloat(receivedAmount) < netTotal) {
                toast.error('ยอดเงินที่รับต้องมากกว่าหรือเท่ากับยอดรวม');
                return;
            }
            setStep('member_check');
            setActiveInput(null);
        } else if (activeInput === 'member') {
            if (memberId.length > 0) {
                try {
                    const res = await fetch(`http://localhost:3001/api/members?search=${memberId}`);
                    const data = await res.json();
                    if (data.length > 0) {
                        setMemberData(data[0]);
                        toast.success(`พบข้อมูลสมาชิก: ${data[0].name}`);
                        setStep('payment_method');
                        setActiveInput(null);
                    } else {
                        toast.error('ไม่พบข้อมูลสมาชิก');
                        setMemberData(null);
                    }
                } catch (err) {
                    console.error('Error fetching member:', err);
                    toast.error('เกิดข้อผิดพลาดในการค้นหาสมาชิก');
                }
            }
        }
    };

    const handleMemberCheck = (isMember) => {
        if (isMember) {
            setStep('member_input');
            setActiveInput('member');
        } else {
            setStep('payment_method');
            setActiveInput(null);
        }
    };

    const handlePaymentMethodClick = (method) => {
        setPaymentMethod(method);
        setStep('summary');
    };

    const handleFinalConfirm = async () => {
        if (!paymentMethod) {
            toast.error('กรุณาเลือกวิธีการชำระเงิน');
            return;
        }

        if (parseFloat(receivedAmount) < netTotal) {
            toast.error('ยอดเงินที่รับต้องมากกว่าหรือเท่ากับยอดรวม');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dispenser_id: nozzleData?.dispenser_id || 1,
                    product_id: nozzleData?.product_id || 1,
                    amount: calculateTotal(),
                    liters: isGeneralSale ? 0 : parseFloat(fuelAmount) / (nozzleData?.product_price || 35.50),
                    payment_type: paymentMethod,
                    status: 'completed',
                    member_id: memberData ? memberData.id : null,
                    received_amount: parseFloat(receivedAmount),
                    change_amount: parseFloat(receivedAmount) - netTotal,
                    cart: cart.reduce((acc, item) => {
                        const existing = acc.find(i => i.id === item.id);
                        if (existing) {
                            existing.qty += 1;
                        } else {
                            acc.push({ ...item, qty: 1 });
                        }
                        return acc;
                    }, [])
                }),
            });

            if (response.ok) {
                const data = await response.json();
                isCompleted.current = true;
                toast.success(`ทำรายการสำเร็จ! ได้รับ ${data.pointsEarned || 0} คะแนน`);
                if (!isGeneralSale) {
                    await fetch(`http://localhost:3001/api/nozzles/${nozzleId}/unlock`, { method: 'POST' });
                    clearSale(nozzleId, parseInt(saleId));
                }
                navigate('/');
            } else {
                const errorData = await response.json();
                toast.error(`เกิดข้อผิดพลาด: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('เกิดข้อผิดพลาดในการชำระเงิน');
        }
    };

    const handleCancel = async () => {
        toast((t) => (
            <div className="flex flex-col items-center">
                <span className="font-bold text-lg mb-2">ต้องการยกเลิกรายการใช่หรือไม่?</span>
                <div className="flex space-x-2">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            isCompleted.current = true;
                            if (!isGeneralSale) {
                                await fetch(`http://localhost:3001/api/nozzles/${nozzleId}/unlock`, { method: 'POST' });
                                clearSale(nozzleId, parseInt(saleId));
                            }
                            navigate('/');
                            toast.success('ยกเลิกรายการแล้ว');
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        ใช่, ยกเลิก
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                    >
                        ไม่
                    </button>
                </div>
            </div>
        ), { duration: 5000, icon: '⚠️' });
    };

    const [promotions, setPromotions] = useState([]);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/promotions');
                const data = await res.json();
                setPromotions(data.filter(p => p.active === 1));
            } catch (err) {
                console.error('Error fetching promotions:', err);
            }
        };
        fetchPromotions();
    }, []);

    const total = calculateTotal();
    const liters = nozzleData ? (parseFloat(fuelAmount) / nozzleData.product_price).toFixed(2) : '0.00';

    // Calculate Discount (Dynamic Logic)
    let discount = 0;
    let appliedPromotion = null;

    if (promotions.length > 0) {
        // Find best applicable discount
        promotions.forEach(promo => {
            if (promo.type === 'discount' && total >= promo.condition_amount) {
                // Check if product specific
                if (!promo.product_id || (nozzleData && promo.product_id === nozzleData.product_id)) {
                    let currentDiscount = parseFloat(promo.value);

                    // If fuel sale, calculate discount per liter
                    if (!isGeneralSale && nozzleData) {
                        currentDiscount = Math.ceil(currentDiscount * parseFloat(liters));
                    }

                    if (currentDiscount > discount) {
                        discount = currentDiscount;
                        appliedPromotion = promo;
                    }
                }
            }
        });
    }

    const netTotal = total - discount;
    const change = parseFloat(receivedAmount) - netTotal;

    // Group cart items
    const groupedCart = cart.reduce((acc, item) => {
        const existing = acc.find(i => i.id === item.id);
        if (existing) {
            existing.qty += 1;
        } else {
            acc.push({ ...item, qty: 1 });
        }
        return acc;
    }, []);

    return (
        <div className="h-screen flex bg-gray-100 overflow-hidden font-sans">
            {/* Left Column: Workflow Steps */}
            <div className="w-7/12 p-4 flex flex-col space-y-4">
                {/* Header */}
                <div className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-blue-900 flex items-center">
                            {isGeneralSale ? <FaShoppingCart className="mr-3" /> : <FaGasPump className="mr-3" />}
                            {isGeneralSale ? 'ขายสินค้าทั่วไป' : `หัวจ่ายที่ ${nozzleId}`}
                            {!isGeneralSale && (
                                <span className="text-xl text-gray-500 ml-2 font-normal">
                                    ({nozzleData?.product_name})
                                </span>
                            )}
                        </h2>
                        {!isGeneralSale && <p className="text-gray-500">รายการ #{saleId}</p>}
                    </div>
                    <div className="flex space-x-3">
                        <button onClick={() => navigate('/')} className="bg-gray-500 text-white px-6 py-3 rounded-lg font-bold text-xl hover:bg-gray-600 active:scale-95 transition">
                            <FaArrowLeft className="inline mr-2" /> พักรายการ
                        </button>
                        <button onClick={handleCancel} className="bg-red-100 text-red-600 px-6 py-3 rounded-lg font-bold text-xl hover:bg-red-200 active:scale-95 transition">
                            <FaTimes className="inline mr-2" /> ยกเลิก
                        </button>
                    </div>
                </div>

                {/* Main Content Area based on Step */}
                <div className="bg-white p-6 rounded-xl shadow-md flex-1 flex flex-col justify-center items-center space-y-6 relative">

                    {step === 'fuel' && !isGeneralSale && (
                        <div className="w-full text-center">
                            <h3 className="text-2xl text-gray-600 mb-4">ระบุจำนวนเงินเติมน้ำมัน</h3>
                            <div className="text-8xl font-bold text-blue-600 mb-2">{parseFloat(fuelAmount).toFixed(2)}</div>
                            <div className="text-3xl text-gray-400">บาท ({liters} ลิตร)</div>
                        </div>
                    )}

                    {step === 'received' && (
                        <div className="w-full text-center">
                            <h3 className="text-2xl text-gray-600 mb-4">ระบุจำนวนเงินที่รับมา</h3>
                            <div className={`text-8xl font-bold mb-2 ${parseFloat(receivedAmount) < netTotal ? 'text-red-500' : 'text-green-600'}`}>
                                {parseFloat(receivedAmount).toFixed(2)}
                            </div>
                            <div className="text-3xl text-gray-400">บาท</div>
                            <div className="mt-4 text-xl text-gray-500">ยอดรวม: {netTotal.toFixed(2)} บาท</div>
                            {parseFloat(receivedAmount) < netTotal && (
                                <div className="text-red-500 mt-2 font-bold">ยอดเงินไม่พอ</div>
                            )}
                        </div>
                    )}

                    {step === 'member_check' && (
                        <div className="w-full text-center">
                            <h3 className="text-4xl font-bold text-gray-800 mb-10">เป็นสมาชิกหรือไม่?</h3>
                            <div className="flex justify-center space-x-8">
                                <button onClick={() => handleMemberCheck(true)} className="bg-blue-600 text-white px-12 py-8 rounded-2xl text-4xl font-bold hover:bg-blue-700 shadow-lg active:scale-95 transition">
                                    เป็นสมาชิก
                                </button>
                                <button onClick={() => handleMemberCheck(false)} className="bg-gray-400 text-white px-12 py-8 rounded-2xl text-4xl font-bold hover:bg-gray-500 shadow-lg active:scale-95 transition">
                                    ไม่เป็นสมาชิก
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'member_input' && (
                        <div className="w-full text-center">
                            <h3 className="text-2xl text-gray-600 mb-4">ระบุเบอร์โทรศัพท์ / รหัสสมาชิก</h3>
                            <div className="text-6xl font-bold text-purple-600 mb-8 border-b-4 border-purple-200 inline-block px-8 py-2">
                                {memberId || <span className="text-gray-300">__________</span>}
                            </div>
                            <button onClick={() => setStep('member_check')} className="text-gray-500 underline text-xl">ย้อนกลับ</button>
                        </div>
                    )}

                    {step === 'payment_method' && (
                        <div className="w-full">
                            <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">เลือกวิธีการชำระเงิน</h3>
                            <div className="grid grid-cols-3 gap-6">
                                <button onClick={() => handlePaymentMethodClick('cash')} className={`p-8 rounded-xl flex flex-col items-center hover:bg-green-200 transition border-2 ${paymentMethod === 'cash' ? 'bg-green-200 border-green-500' : 'bg-green-100 border-green-300'}`}>
                                    <FaMoneyBillAlt className="text-6xl mb-4 text-green-800" />
                                    <span className="text-2xl font-bold text-green-900">เงินสด</span>
                                </button>
                                <button onClick={() => handlePaymentMethodClick('promptpay')} className={`p-8 rounded-xl flex flex-col items-center hover:bg-blue-200 transition border-2 ${paymentMethod === 'promptpay' ? 'bg-blue-200 border-blue-500' : 'bg-blue-100 border-blue-300'}`}>
                                    <FaQrcode className="text-6xl mb-4 text-blue-800" />
                                    <span className="text-2xl font-bold text-blue-900">โอนเงิน</span>
                                </button>
                                <button onClick={() => handlePaymentMethodClick('credit')} className={`p-8 rounded-xl flex flex-col items-center hover:bg-purple-200 transition border-2 ${paymentMethod === 'credit' ? 'bg-purple-200 border-purple-500' : 'bg-purple-100 border-purple-300'}`}>
                                    <FaCreditCard className="text-6xl mb-4 text-purple-800" />
                                    <span className="text-2xl font-bold text-purple-900">เงินเชื่อ (Credit)</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'summary' && (
                        <div className="w-full">
                            <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">สรุปรายการ</h3>
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4 text-xl">
                                {!isGeneralSale && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">น้ำมัน ({liters} ลิตร)</span>
                                        <div className="flex items-center">
                                            <span className="font-bold mr-3">{parseFloat(fuelAmount).toFixed(2)} บาท</span>
                                            <button onClick={() => { setStep('fuel'); setActiveInput('fuel'); }} className="text-blue-500 hover:text-blue-700 p-1">
                                                <FaEdit />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">สินค้าอื่นๆ ({cart.length} รายการ)</span>
                                    <span className="font-bold">{(total - parseFloat(fuelAmount)).toFixed(2)} บาท</span>
                                </div>

                                {/* Discount Display */}
                                {discount > 0 && (
                                    <div className="flex justify-between items-center text-green-600 text-sm">
                                        <span>* ส่วนลด {appliedPromotion?.name}</span>
                                        <span>-{discount} บาท</span>
                                    </div>
                                )}

                                {memberData ? (
                                    <div className="flex justify-between items-center text-purple-600">
                                        <span>สมาชิก</span>
                                        <div className="flex items-center">
                                            <span className="font-bold mr-3">{memberData.name}</span>
                                            <button onClick={() => { setStep('member_check'); setActiveInput(null); }} className="text-purple-500 hover:text-purple-700 p-1">
                                                <FaEdit />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center text-gray-400">
                                        <span>สมาชิก</span>
                                        <div className="flex items-center">
                                            <span className="mr-3">-</span>
                                            <button onClick={() => { setStep('member_check'); setActiveInput(null); }} className="text-blue-500 hover:text-blue-700 p-1">
                                                <FaEdit />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className="border-t border-gray-300 my-2"></div>
                                <div className="flex justify-between text-2xl font-bold">
                                    <span>ยอดรวมสุทธิ</span>
                                    <span className="text-blue-600">{netTotal.toFixed(2)} บาท</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>รับเงิน</span>
                                    <div className="flex items-center">
                                        <span className={`font-bold mr-3 ${parseFloat(receivedAmount) < netTotal ? 'text-red-500' : ''}`}>{parseFloat(receivedAmount).toFixed(2)} บาท</span>
                                        <button onClick={() => { setStep('received'); setActiveInput('received'); }} className="text-blue-500 hover:text-blue-700 p-1">
                                            <FaEdit />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between text-3xl font-bold text-orange-600 mt-4 bg-orange-50 p-4 rounded-lg">
                                    <span>เงินทอน</span>
                                    <span>{change.toFixed(2)} บาท</span>
                                </div>
                                <div className="text-center mt-2 text-gray-500 text-sm">
                                    ชำระโดย: {paymentMethod === 'cash' ? 'เงินสด' : paymentMethod === 'promptpay' ? 'โอนเงิน' : 'เงินเชื่อ'}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Right Column: Numpad & Cart Toggle */}
            <div className="w-5/12 p-4 flex flex-col space-y-4">

                {/* Goods List (Always Visible) */}
                <div className="bg-white p-4 rounded-xl shadow-md flex-1 overflow-hidden flex flex-col animate-fade-in-down h-1/3">
                    <h3 className="font-bold text-lg mb-2 flex justify-between items-center">
                        เลือกสินค้า
                        <div className="relative w-1/2">
                            <input
                                type="text"
                                placeholder="ค้นหา..."
                                className="w-full border rounded-full px-3 py-1 text-sm pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FaSearch className="absolute left-3 top-2 text-gray-400 text-xs" />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2 text-gray-400 hover:text-gray-600">
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    </h3>
                    <div className="flex-1 overflow-y-auto">
                        <ProductList onAddProduct={handleAddProduct} searchTerm={searchTerm} />
                    </div>
                    <div className="mt-2 pt-2 border-t">
                        <h4 className="font-bold">ตะกร้า ({cart.length})</h4>
                        <div className="max-h-40 overflow-y-auto text-sm space-y-2">
                            {groupedCart.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                    <div className="flex flex-col">
                                        <span className="font-bold">{item.name}</span>
                                        <span className="text-gray-500">{item.price} บ.</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleDecreaseProduct(item)} className="bg-red-100 text-red-600 p-1 rounded hover:bg-red-200"><FaMinus /></button>
                                        <span className="font-bold w-6 text-center">{item.qty}</span>
                                        <button onClick={() => handleAddProduct(item)} className="bg-green-100 text-green-600 p-1 rounded hover:bg-green-200"><FaPlus /></button>
                                        <button onClick={() => handleRemoveProduct(item)} className="text-gray-400 hover:text-red-500 ml-2"><FaTrash /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Numpad (Only visible in input steps) */}
                {['fuel', 'received', 'member_input'].includes(step) && (
                    <div className="bg-white p-4 rounded-xl shadow-md flex-1">
                        <Numpad
                            onInput={handleInput}
                            onClear={handleClear}
                            onEnter={handleEnter}
                            enterLabel="ตกลง"
                        />
                    </div>
                )}

                {/* Confirm Button (Only in Summary step) */}
                {step === 'summary' && (
                    <div className="flex-1 flex flex-col justify-end">
                        <button
                            onClick={handleFinalConfirm}
                            className="bg-green-600 text-white py-6 rounded-xl text-3xl font-bold hover:bg-green-700 shadow-xl w-full active:scale-95 transition-transform flex justify-center items-center"
                        >
                            <FaMoneyBillWave className="mr-4" /> ยืนยันการชำระเงิน
                        </button>
                    </div>
                )}

                {/* Placeholder for other steps to keep layout stable */}
                {!['fuel', 'received', 'member_input', 'summary'].includes(step) && (
                    <div className="flex-1 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                        เลือกตัวเลือกทางซ้ายมือ
                    </div>
                )}

            </div>

            <style>{`
                @keyframes fade-in-down {
                    0% { opacity: 0; transform: translateY(-10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default Sales;
