import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaDatabase, FaBuilding, FaGasPump, FaCheck, FaArrowRight, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';

const SetupWizard = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Step 1: Database
    const [dbConfig, setDbConfig] = useState({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'fuel_pos_electron'
    });

    // Step 2: Company
    const [company, setCompany] = useState({
        company_name: '',
        company_address: '',
        tax_id: '',
        phone: ''
    });

    // Step 3: Fuels
    const [fuels, setFuels] = useState([
        { name: 'Gasohol 95', price: '40.00', color: '#EF4444' },
        { name: 'Gasohol 91', price: '38.00', color: '#10B981' },
        { name: 'Diesel', price: '30.00', color: '#3B82F6' }
    ]);

    // Step 4: Tanks
    const [tanks, setTanks] = useState([
        { name: 'Tank 1', capacity: '10000', fuel_index: 0 }
    ]);

    // Step 5: Dispensers
    const [dispensers, setDispensers] = useState([
        { name: 'Dispenser 1' }
    ]);

    // Step 6: Nozzles
    const [nozzles, setNozzles] = useState([
        { dispenser_index: 0, nozzle_number: 1, tank_index: 0 }
    ]);

    const handleDbTest = async () => {
        if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
            setError('Please fill in all required database fields.');
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/setup/db-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dbConfig)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Connection successful!');
                // Save config immediately to allow subsequent steps to use DB
                await fetch('http://localhost:3001/api/setup/db-save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dbConfig)
                });
                setStep(2);
            } else {
                setError('Connection failed: ' + data.error);
                toast.error('Connection failed');
            }
        } catch (err) {
            setError('Network Error: ' + err.message + '. Ensure the backend is running.');
            toast.error('Network Error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCompany = async () => {
        if (!company.company_name) {
            setError('Company Name is required.');
            return;
        }
        setError(null);
        try {
            await fetch('http://localhost:3001/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(company)
            });
            setStep(3);
        } catch (err) {
            setError('Error saving company info: ' + err.message);
        }
    };

    const handleSaveFuels = async () => {
        if (fuels.some(f => !f.name || !f.price)) {
            setError('All fuels must have a name and price.');
            return;
        }
        setError(null);
        try {
            for (const fuel of fuels) {
                await fetch('http://localhost:3001/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...fuel, type: 'fuel', stock: 0 })
                });
            }
            setStep(4);
        } catch (err) {
            setError('Error saving fuels: ' + err.message);
        }
    };

    const handleSaveTanks = async () => {
        if (tanks.some(t => !t.name || !t.capacity)) {
            setError('All tanks must have a name and capacity.');
            return;
        }
        setError(null);
        try {
            // Need to fetch products first to get IDs
            const res = await fetch('http://localhost:3001/api/products');
            const products = await res.json();
            const fuelProducts = products.filter(p => p.type === 'fuel');

            for (const tank of tanks) {
                // Find fuel name from index
                const fuelName = fuels[tank.fuel_index].name;
                // Find product ID
                const product = fuelProducts.find(p => p.name === fuelName);

                await fetch('http://localhost:3001/api/tanks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: tank.name,
                        capacity: tank.capacity,
                        fuel_type: fuelName, // Legacy field, maybe not needed if we link ID
                        color: product?.color || '#EF4444'
                    })
                });
            }
            setStep(5);
        } catch (err) {
            setError('Error saving tanks: ' + err.message);
        }
    };

    const handleSaveDispensers = async () => {
        if (dispensers.some(d => !d.name)) {
            setError('All dispensers must have a name.');
            return;
        }
        setError(null);
        try {
            for (const d of dispensers) {
                await fetch('http://localhost:3001/api/dispensers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(d)
                });
            }
            setStep(6);
        } catch (err) {
            setError('Error saving dispensers: ' + err.message);
        }
    };

    const handleFinish = async () => {
        setError(null);
        try {
            // Fetch IDs for linking
            const [pRes, dRes, tRes] = await Promise.all([
                fetch('http://localhost:3001/api/products'),
                fetch('http://localhost:3001/api/dispensers'),
                fetch('http://localhost:3001/api/tanks')
            ]);
            const products = await pRes.json();
            const dispensersList = await dRes.json();
            const tanksList = await tRes.json();

            for (const n of nozzles) {
                const dispenser = dispensersList[n.dispenser_index]; // Assuming order is preserved
                const tank = tanksList[n.tank_index];

                // Find product from tank (we need to know which product is in which tank)
                // In this simplified wizard, we assume tank.fuel_type matches product.name
                const product = products.find(p => p.name === tank.fuel_type);

                if (dispenser && tank && product) {
                    await fetch('http://localhost:3001/api/nozzles', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            dispenser_id: dispenser.id,
                            nozzle_number: n.nozzle_number,
                            product_id: product.id,
                            tank_id: tank.id
                        })
                    });
                }
            }

            toast.success('Setup Complete!');
            navigate('/login');
        } catch (err) {
            setError('Error saving nozzles: ' + err.message);
        }
    };

    // --- Render Steps ---

    const renderStep1 = () => (
        <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><FaDatabase /> Database Connection</h2>
            <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 flex items-start gap-2">
                <FaInfoCircle className="mt-1" />
                <div>
                    Enter your MySQL database credentials. If the database doesn't exist, we will try to create it.
                    <br />Default XAMPP/Laragon user is usually <b>root</b> with no password.
                </div>
            </div>
            <input className="border p-2 w-full rounded" placeholder="Host (e.g. localhost)" value={dbConfig.host} onChange={e => setDbConfig({ ...dbConfig, host: e.target.value })} />
            <input className="border p-2 w-full rounded" placeholder="User (e.g. root)" value={dbConfig.user} onChange={e => setDbConfig({ ...dbConfig, user: e.target.value })} />
            <input className="border p-2 w-full rounded" type="password" placeholder="Password" value={dbConfig.password} onChange={e => setDbConfig({ ...dbConfig, password: e.target.value })} />
            <input className="border p-2 w-full rounded" placeholder="Database Name (e.g. fuel_pos)" value={dbConfig.database} onChange={e => setDbConfig({ ...dbConfig, database: e.target.value })} />
            <button onClick={handleDbTest} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition">
                {loading ? 'Connecting...' : 'Test & Save Connection'}
            </button>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><FaBuilding /> Company Settings</h2>
            <input className="border p-2 w-full rounded" placeholder="Company Name *" value={company.company_name} onChange={e => setCompany({ ...company, company_name: e.target.value })} />
            <input className="border p-2 w-full rounded" placeholder="Address" value={company.company_address} onChange={e => setCompany({ ...company, company_address: e.target.value })} />
            <input className="border p-2 w-full rounded" placeholder="Tax ID" value={company.tax_id} onChange={e => setCompany({ ...company, tax_id: e.target.value })} />
            <input className="border p-2 w-full rounded" placeholder="Phone" value={company.phone} onChange={e => setCompany({ ...company, phone: e.target.value })} />
            <button onClick={handleSaveCompany} className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition">Next <FaArrowRight className="inline ml-1" /></button>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><FaGasPump /> Fuel Products</h2>
            {fuels.map((f, i) => (
                <div key={i} className="flex gap-2">
                    <input className="border p-2 flex-1 rounded" placeholder="Fuel Name" value={f.name} onChange={e => { const newFuels = [...fuels]; newFuels[i].name = e.target.value; setFuels(newFuels); }} />
                    <input className="border p-2 w-24 rounded" placeholder="Price" value={f.price} onChange={e => { const newFuels = [...fuels]; newFuels[i].price = e.target.value; setFuels(newFuels); }} />
                </div>
            ))}
            <button onClick={() => setFuels([...fuels, { name: '', price: '', color: '#000000' }])} className="text-blue-600 text-sm hover:underline">+ Add Fuel</button>
            <button onClick={handleSaveFuels} className="bg-blue-600 text-white px-4 py-2 rounded w-full mt-4 hover:bg-blue-700 transition">Next <FaArrowRight className="inline ml-1" /></button>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Tanks</h2>
            {tanks.map((t, i) => (
                <div key={i} className="flex gap-2 items-center">
                    <input className="border p-2 flex-1 rounded" placeholder="Tank Name" value={t.name} onChange={e => { const newTanks = [...tanks]; newTanks[i].name = e.target.value; setTanks(newTanks); }} />
                    <input className="border p-2 w-24 rounded" placeholder="Capacity" value={t.capacity} onChange={e => { const newTanks = [...tanks]; newTanks[i].capacity = e.target.value; setTanks(newTanks); }} />
                    <select className="border p-2 rounded" value={t.fuel_index} onChange={e => { const newTanks = [...tanks]; newTanks[i].fuel_index = parseInt(e.target.value); setTanks(newTanks); }}>
                        {fuels.map((f, fi) => <option key={fi} value={fi}>{f.name}</option>)}
                    </select>
                </div>
            ))}
            <button onClick={() => setTanks([...tanks, { name: `Tank ${tanks.length + 1}`, capacity: '10000', fuel_index: 0 }])} className="text-blue-600 text-sm hover:underline">+ Add Tank</button>
            <button onClick={handleSaveTanks} className="bg-blue-600 text-white px-4 py-2 rounded w-full mt-4 hover:bg-blue-700 transition">Next <FaArrowRight className="inline ml-1" /></button>
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Dispensers</h2>
            {dispensers.map((d, i) => (
                <div key={i} className="flex gap-2">
                    <input className="border p-2 flex-1 rounded" placeholder="Dispenser Name" value={d.name} onChange={e => { const newDispensers = [...dispensers]; newDispensers[i].name = e.target.value; setDispensers(newDispensers); }} />
                </div>
            ))}
            <button onClick={() => setDispensers([...dispensers, { name: `Dispenser ${dispensers.length + 1}` }])} className="text-blue-600 text-sm hover:underline">+ Add Dispenser</button>
            <button onClick={handleSaveDispensers} className="bg-blue-600 text-white px-4 py-2 rounded w-full mt-4 hover:bg-blue-700 transition">Next <FaArrowRight className="inline ml-1" /></button>
        </div>
    );

    const renderStep6 = () => (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Nozzles</h2>
            {nozzles.map((n, i) => (
                <div key={i} className="border p-2 rounded bg-gray-50 space-y-2">
                    <div className="flex gap-2">
                        <label className="w-24 font-medium">Dispenser:</label>
                        <select className="border p-1 rounded flex-1" value={n.dispenser_index} onChange={e => { const newNozzles = [...nozzles]; newNozzles[i].dispenser_index = parseInt(e.target.value); setNozzles(newNozzles); }}>
                            {dispensers.map((d, di) => <option key={di} value={di}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <label className="w-24 font-medium">Nozzle #:</label>
                        <input className="border p-1 rounded w-20" type="number" value={n.nozzle_number} onChange={e => { const newNozzles = [...nozzles]; newNozzles[i].nozzle_number = parseInt(e.target.value); setNozzles(newNozzles); }} />
                    </div>
                    <div className="flex gap-2">
                        <label className="w-24 font-medium">Tank (Fuel):</label>
                        <select className="border p-1 rounded flex-1" value={n.tank_index} onChange={e => { const newNozzles = [...nozzles]; newNozzles[i].tank_index = parseInt(e.target.value); setNozzles(newNozzles); }}>
                            {tanks.map((t, ti) => <option key={ti} value={ti}>{t.name} ({fuels[t.fuel_index]?.name})</option>)}
                        </select>
                    </div>
                </div>
            ))}
            <button onClick={() => setNozzles([...nozzles, { dispenser_index: 0, nozzle_number: nozzles.length + 1, tank_index: 0 }])} className="text-blue-600 text-sm hover:underline">+ Add Nozzle</button>
            <button onClick={handleFinish} className="bg-green-600 text-white px-4 py-2 rounded w-full mt-4 hover:bg-green-700 transition font-bold">Finish Setup <FaCheck className="inline ml-1" /></button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <div className="mb-6 flex justify-between items-center border-b pb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Initial Setup</h1>
                    <span className="text-sm font-medium bg-gray-200 px-2 py-1 rounded text-gray-700">Step {step} of 6</span>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
                {step === 6 && renderStep6()}
            </div>
        </div>
    );
};

export default SetupWizard;
