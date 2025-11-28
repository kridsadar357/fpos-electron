import React from 'react';

const Numpad = ({ onInput, onClear, onEnter, enterLabel = 'ตกลง' }) => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'Enter'];

    return (
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-4 rounded-xl shadow-2xl border-2 border-blue-500/50 h-full">
            <div className="grid grid-cols-3 gap-2 h-full">
                {keys.map((key) => (
                    <button
                        key={key}
                        className={`p-2 text-xl font-bold rounded shadow transition-colors h-16 ${key === 'Enter' ? 'bg-blue-600 text-white hover:bg-blue-700 col-span-1' :
                            key === 'C' ? 'bg-red-100 text-red-600 hover:bg-red-200' :
                                'bg-white hover:bg-gray-100'
                            }`}
                        onClick={() => {
                            if (key === 'C') onClear();
                            else if (key === 'Enter') onEnter();
                            else onInput(key);
                        }}
                    >
                        {key === 'Enter' ? enterLabel : key === 'C' ? 'ลบ' : key}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Numpad;
