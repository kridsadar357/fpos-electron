import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ReportViewer = ({ title, subtitle, data, columns, summary, date, companyInfo }) => {
    const currentDate = new Date().toLocaleString('th-TH');
    const reportRef = useRef(null);

    const handleExportPDF = async () => {
        const element = reportRef.current;
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${title}.pdf`);
    };

    return (
        <div className="min-h-screen bg-gray-500 p-8 overflow-auto flex justify-center print:p-0 print:bg-white print:overflow-visible">
            <div ref={reportRef} className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[15mm] relative print:shadow-none print:w-full print:h-auto print:p-0">
                {/* Header */}
                <div className="border-b-2 border-gray-800 pb-4 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wider">{companyInfo?.company_name || 'Fuel POS System'}</h1>
                            <p className="text-sm text-gray-600">{companyInfo?.company_address || '123 Station Road, City, Country'}</p>
                            <p className="text-sm text-gray-600">เลขประจำตัวผู้เสียภาษี: {companyInfo?.tax_id || '-'}</p>
                            <p className="text-sm text-gray-600">โทร: {companyInfo?.phone || '-'}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                            {subtitle && <p className="text-md text-gray-600 mt-1">{subtitle}</p>}
                            <p className="text-xs text-gray-500 mt-2">พิมพ์เมื่อ: {currentDate}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="mb-8">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-gray-400">
                                {columns.map((col, index) => (
                                    <th
                                        key={index}
                                        className={`py-2 px-2 font-bold text-gray-800 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                                        style={{ width: col.width }}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="py-8 text-center text-gray-500 italic">
                                        ไม่พบข้อมูล (No data available)
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="border-b border-gray-200 hover:bg-gray-50 print:hover:bg-transparent">
                                        {columns.map((col, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className={`py-2 px-2 text-gray-700 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                                            >
                                                {col.render ? col.render(row) : row[col.accessor]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {summary && (
                            <tfoot>
                                <tr className="border-t-2 border-gray-400 font-bold bg-gray-100 print:bg-transparent">
                                    {columns.map((col, index) => (
                                        <td
                                            key={index}
                                            className={`py-3 px-2 text-gray-900 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                                        >
                                            {summary[col.accessor] || ''}
                                        </td>
                                    ))}
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                {/* Footer */}
                <div className="absolute bottom-[10mm] left-[15mm] right-[15mm] border-t border-gray-300 pt-2 flex justify-between text-xs text-gray-500 print:relative print:bottom-0 print:left-0 print:right-0 print:mt-8">
                    <p>{companyInfo?.footer_text || 'Generated by Fuel POS System'}</p>
                    <p>หน้า 1 ของ 1</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="fixed bottom-8 right-8 flex flex-col gap-4 print:hidden z-50">
                <button
                    onClick={handleExportPDF}
                    className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 flex items-center gap-2 font-bold"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export PDF
                </button>
                <button
                    onClick={() => window.print()}
                    className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 flex items-center gap-2 font-bold"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                </button>
            </div>
        </div>
    );
};

export default ReportViewer;
