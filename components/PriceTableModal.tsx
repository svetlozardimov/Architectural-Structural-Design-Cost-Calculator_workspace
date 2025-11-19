
import React, { useRef } from 'react';
import Button from './common/Button';
import { XIcon, PrinterIcon } from './icons';

interface PriceTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: { name: string, color: string, items: string[][] }[];
  type: 'structural' | 'architectural';
}

const PriceTableModal: React.FC<PriceTableModalProps> = ({ isOpen, onClose, data, type }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
      if (!contentRef.current) return;
      
      const content = contentRef.current.innerHTML;
      const win = window.open('', '', 'height=800,width=1200');
      
      if (win) {
          win.document.write(`
              <html>
                  <head>
                      <title>Таблица за справка</title>
                      <style>
                          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                          h2, h3 { text-align: center; color: #000; margin-bottom: 15px; }
                          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px; page-break-inside: avoid; }
                          th, td { border: 1px solid #000; padding: 6px 8px; text-align: center; vertical-align: middle; }
                          th { background-color: #e0e0e0; font-weight: bold; }
                          .text-left { text-align: left; }
                          .text-bold { font-weight: bold; }
                          
                          /* Architectural Specific Colors */
                          .bg-cat-single-family { background-color: #fff2cc !important; }
                          .bg-cat-multi-family { background-color: #ffe699 !important; }
                          .bg-cat-standard-public { background-color: #f8cbad !important; }
                          .bg-cat-special-public { background-color: #f4b183 !important; }
                          .bg-cat-warehouse { background-color: #d9ead3 !important; }
                          .bg-cat-industrial { background-color: #cfe2f3 !important; }
                          .bg-cat-pup { background-color: #f3f3f3 !important; }
                          
                          /* Structural Header Colors */
                          .bg-struct-header { background-color: #f0f0f0 !important; }
                      </style>
                  </head>
                  <body>
                      ${content}
                  </body>
              </html>
          `);
          win.document.close();
          win.focus();
          setTimeout(() => {
            win.print();
            win.close();
          }, 250);
      }
  };

  // Original Colors from the provided source code (Architectural)
  const archColors = {
      singleFamily: '#fff2cc',
      multiFamily: '#ffe699',
      standardPublic: '#f8cbad',
      specialPublic: '#f4b183',
      warehouse: '#d9ead3',
      industrial: '#cfe2f3',
      pup: '#f3f3f3'
  };

  // Colors for Structural Categories (Headers)
  const structColors: { [key: string]: string } = {
      "blue": "#cfe2f3",          // Light Blue
      "green-light": "#d9ead3",   // Light Green
      "green-dark": "#b6d7a8",    // Slightly Darker Green
      "yellow": "#fff2cc",        // Light Yellow
      "pink": "#ead1dc",          // Light Pink
      "gray": "#f3f3f3",          // Light Gray
      "orange-light": "#fce5cd",  // Light Orange
      "purple": "#d9d2e9",        // Light Purple
      "blue-dark": "#9fc5e8",     // Medium Blue
      "orange-dark": "#f9cb9c",   // Medium Orange
      "red": "#f4cccc"            // Light Red
  };

  // NEW: Paler shades for Structural Subcategories (Rows)
  const structSubColors: { [key: string]: string } = {
      "blue": "#e8f3fc",
      "green-light": "#ecf6e8",
      "green-dark": "#dcedd3",
      "yellow": "#fff9e6",
      "pink": "#f4eef2",
      "gray": "#fafafa",
      "orange-light": "#fef6ec",
      "purple": "#eceaf3",
      "blue-dark": "#dbebf7",
      "orange-dark": "#fdebd9",
      "red": "#fceaea"
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-bunker-900 rounded-lg shadow-xl w-full max-w-[1200px] max-h-[90vh] flex flex-col border border-bunker-200 dark:border-bunker-700" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b border-bunker-200 dark:border-bunker-700 shrink-0 bg-gray-50 dark:bg-bunker-800 rounded-t-lg">
          <h2 className="text-xl font-bold text-bunker-800 dark:text-bunker-100">Таблица за справка (Минимални цени)</h2>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="primary" className="flex items-center gap-2">
                <PrinterIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Принтирай</span>
            </Button>
            <Button onClick={onClose} variant="secondary" className="p-2 h-auto w-auto rounded-full !shadow-none hover:bg-gray-200 dark:hover:bg-gray-700">
                <XIcon className="h-5 w-5"/>
            </Button>
          </div>
        </header>
        
        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-white text-black" ref={contentRef}>
            
            {/* --- STRUCTURAL TABLE --- */}
            {type === 'structural' && data && (
                <div className="space-y-8">
                     <h2 className="text-center font-bold text-xl mb-6 uppercase text-black">Минимални цени за конструктивно проектиране</h2>
                     <table className="w-full border-collapse border border-black text-sm text-black">
                        <thead className="bg-gray-200 text-black font-bold">
                            <tr>
                                <th className="border border-black p-3 text-left w-1/4 bg-gray-200">Раздел</th>
                                <th className="border border-black p-3 text-left w-1/2 bg-gray-200">Параметри</th>
                                <th className="border border-black p-3 text-left w-1/4 bg-gray-200">Цена</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((group, gIndex) => (
                                <React.Fragment key={gIndex}>
                                    {/* Category Header Row */}
                                    <tr className="font-bold" style={{ backgroundColor: structColors[group.color] || '#f0f0f0' }}>
                                        <td colSpan={3} className="border border-black p-2 text-base text-black font-bold">
                                            {group.name}
                                        </td>
                                    </tr>
                                    {/* Items - Now with SubColors */}
                                    {group.items.map((item, iIndex) => (
                                        <tr key={iIndex} style={{ backgroundColor: structSubColors[group.color] || '#ffffff' }} className="hover:brightness-95 transition-all">
                                            <td className="border border-black p-2 align-top text-black">{item[0]}</td>
                                            <td className="border border-black p-2 align-top text-black">{item[1]}</td>
                                            <td className="border border-black p-2 align-top font-semibold text-black">{item[2]}</td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- ARCHITECTURAL TABLES --- */}
            {type === 'architectural' && (
                <div className="space-y-8 text-xs sm:text-sm text-black">
                    
                    {/* Table 1: New Buildings */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-center uppercase border-b-2 border-black pb-2 text-black">МИНИМАЛНА СЕБЕСТОЙНОСТ ЗА ПРОЕКТИРАНЕ НА НОВИ СГРАДИ – ЧАСТ АРХИТЕКТУРА</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-black text-center text-black">
                                <thead className="bg-[#e9e9e9] font-bold text-black">
                                    <tr>
                                        <th className="border border-black p-2 bg-[#e9e9e9]">ВИД ОБЕКТ</th>
                                        <th className="border border-black p-2 bg-[#e9e9e9]">БР. РЗП (м²)</th>
                                        <th className="border border-black p-2 bg-[#e9e9e9]">ПРЕДПРОЕКТНО ПРОУЧВАНЕ<br/>(€ / лв.)</th>
                                        <th className="border border-black p-2 bg-[#e9e9e9]">ИДЕЕН ПРОЕКТ<br/>(€ / лв.)</th>
                                        <th className="border border-black p-2 bg-[#e9e9e9]">ТЕХНИЧЕСКИ ПРОЕКТ<br/>(€ / лв.)</th>
                                        <th className="border border-black p-2 bg-[#e9e9e9]">РАБОТЕН ПРОЕКТ<br/>(€ / лв.)</th>
                                        <th className="border border-black p-2 bg-[#e9e9e9]">МЯРКА</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Single Family */}
                                    <tr className="bg-cat-single-family" style={{ backgroundColor: archColors.singleFamily }}>
                                        <td rowSpan={5} className="border border-black p-2 font-bold align-middle">ЕДНОФАМИЛНА, ДВУФАМИЛНА ЖИЛИЩНА, ВИЛНА СГРАДА</td>
                                        <td className="border border-black p-2">≤ 100</td>
                                        <td className="border border-black p-2">150 / 293,37</td>
                                        <td className="border border-black p-2">750 / 1466,87</td>
                                        <td className="border border-black p-2">1500 / 2933,75</td>
                                        <td className="border border-black p-2">2250 / 4400,62</td>
                                        <td className="border border-black p-2">мин. цена</td>
                                    </tr>
                                    {[
                                        ['100-200', '1,5 / 2,93', '7,5 / 14,67', '15 / 29,34', '22,5 / 44,01'],
                                        ['200-300', '1,2 / 2,35', '6,0 / 11,73', '12 / 23,47', '18,0 / 35,20'],
                                        ['300-500', '1,1 / 2,15', '5,5 / 10,76', '11 / 21,51', '16,5 / 32,27'],
                                        ['> 500', '1,0 / 1,96', '5,0 / 9,78', '10 / 19,56', '15,0 / 29,34']
                                    ].map((row, i) => (
                                        <tr key={i} className="bg-cat-single-family" style={{ backgroundColor: archColors.singleFamily }}>
                                            <td className="border border-black p-2">{row[0]}</td>
                                            <td className="border border-black p-2">{row[1]}</td>
                                            <td className="border border-black p-2">{row[2]}</td>
                                            <td className="border border-black p-2">{row[3]}</td>
                                            <td className="border border-black p-2">{row[4]}</td>
                                            <td className="border border-black p-2">цена / м²</td>
                                        </tr>
                                    ))}

                                    {/* Multi Family */}
                                    <tr className="bg-cat-multi-family" style={{ backgroundColor: archColors.multiFamily }}>
                                        <td rowSpan={5} className="border border-black p-2 font-bold align-middle">МНОГОФАМИЛНА ЖИЛИЩНА СГРАДА</td>
                                        <td className="border border-black p-2">≤ 500</td>
                                        <td className="border border-black p-2">500 / 977,92</td>
                                        <td className="border border-black p-2">2500 / 4889,58</td>
                                        <td className="border border-black p-2">5000 / 9779,15</td>
                                        <td className="border border-black p-2">7500 / 14668,73</td>
                                        <td className="border border-black p-2">мин. цена</td>
                                    </tr>
                                    {[
                                        ['500-1000', '1,0 / 1,96', '5,0 / 9,78', '10 / 19,56', '15,0 / 29,34'],
                                        ['1000-2500', '0,8 / 1,56', '4,0 / 7,82', '8 / 15,65', '12,0 / 23,47'],
                                        ['2500-5000', '0,7 / 1,37', '3,5 / 6,85', '7 / 13,69', '10,5 / 20,54'],
                                        ['> 5000', '0,6 / 1,17', '3,0 / 5,87', '6 / 11,73', '9,0 / 17,60']
                                    ].map((row, i) => (
                                        <tr key={i} className="bg-cat-multi-family" style={{ backgroundColor: archColors.multiFamily }}>
                                            <td className="border border-black p-2">{row[0]}</td>
                                            <td className="border border-black p-2">{row[1]}</td>
                                            <td className="border border-black p-2">{row[2]}</td>
                                            <td className="border border-black p-2">{row[3]}</td>
                                            <td className="border border-black p-2">{row[4]}</td>
                                            <td className="border border-black p-2">цена / м²</td>
                                        </tr>
                                    ))}

                                    {/* Standard Public */}
                                    <tr className="bg-cat-standard-public" style={{ backgroundColor: archColors.standardPublic }}>
                                        <td rowSpan={5} className="border border-black p-2 font-bold align-middle">ОСД, ОФИСИ, СТАНДАРТНА ОБЩЕСТВЕНА СГРАДА</td>
                                        <td className="border border-black p-2">≤ 150</td>
                                        <td className="border border-black p-2">150 / 293,37</td>
                                        <td className="border border-black p-2">750 / 1466,87</td>
                                        <td className="border border-black p-2">1500 / 2933,75</td>
                                        <td className="border border-black p-2">2250 / 4400,62</td>
                                        <td className="border border-black p-2">мин. цена</td>
                                    </tr>
                                    {[
                                        ['150-500', '1,0 / 1,96', '5,0 / 9,78', '10 / 19,56', '15,0 / 29,34'],
                                        ['500-1000', '0,8 / 1,56', '4,0 / 7,82', '8 / 15,65', '12,0 / 23,47'],
                                        ['1000-2500', '0,7 / 1,37', '3,5 / 6,85', '7 / 13,69', '10,5 / 20,54'],
                                        ['> 2500', '0,6 / 1,17', '3,0 / 5,87', '6 / 11,73', '9,0 / 17,60']
                                    ].map((row, i) => (
                                        <tr key={i} className="bg-cat-standard-public" style={{ backgroundColor: archColors.standardPublic }}>
                                            <td className="border border-black p-2">{row[0]}</td>
                                            <td className="border border-black p-2">{row[1]}</td>
                                            <td className="border border-black p-2">{row[2]}</td>
                                            <td className="border border-black p-2">{row[3]}</td>
                                            <td className="border border-black p-2">{row[4]}</td>
                                            <td className="border border-black p-2">цена / м²</td>
                                        </tr>
                                    ))}

                                    {/* Specialized Public */}
                                    <tr className="bg-cat-special-public" style={{ backgroundColor: archColors.specialPublic }}>
                                        <td rowSpan={5} className="border border-black p-2 font-bold align-middle">СПЕЦИАЛИЗИРАНА ОБЩЕСТВЕНА СГРАДА</td>
                                        <td className="border border-black p-2">≤ 150</td>
                                        <td className="border border-black p-2">195 / 381,39</td>
                                        <td className="border border-black p-2">975 / 1906,93</td>
                                        <td className="border border-black p-2">1950 / 3813,87</td>
                                        <td className="border border-black p-2">2925 / 5720,80</td>
                                        <td className="border border-black p-2">мин. цена</td>
                                    </tr>
                                    {[
                                        ['150-500', '1,3 / 2,54', '6,5 / 12,71', '13 / 25,43', '19,5 / 38,14'],
                                        ['500-1000', '1,1 / 2,15', '5,5 / 10,76', '11 / 21,51', '16,5 / 32,27'],
                                        ['1000-2500', '1,0 / 1,96', '5,0 / 9,78', '10 / 19,56', '15,0 / 29,34'],
                                        ['> 2500', '0,9 / 1,76', '4,5 / 8,80', '9 / 17,60', '13,5 / 26,40']
                                    ].map((row, i) => (
                                        <tr key={i} className="bg-cat-special-public" style={{ backgroundColor: archColors.specialPublic }}>
                                            <td className="border border-black p-2">{row[0]}</td>
                                            <td className="border border-black p-2">{row[1]}</td>
                                            <td className="border border-black p-2">{row[2]}</td>
                                            <td className="border border-black p-2">{row[3]}</td>
                                            <td className="border border-black p-2">{row[4]}</td>
                                            <td className="border border-black p-2">цена / м²</td>
                                        </tr>
                                    ))}

                                    {/* Warehouse */}
                                    <tr className="bg-cat-warehouse" style={{ backgroundColor: archColors.warehouse }}>
                                        <td rowSpan={5} className="border border-black p-2 font-bold align-middle">НАВЕС, СКЛАД, ЕДНО-ПРОСТРАНСТВЕНА СГРАДА БЕЗ МТ</td>
                                        <td className="border border-black p-2">≤ 150</td>
                                        <td className="border border-black p-2">135 / 264,04</td>
                                        <td className="border border-black p-2">675 / 1320,19</td>
                                        <td className="border border-black p-2">1350 / 2640,37</td>
                                        <td className="border border-black p-2">2025 / 3960,56</td>
                                        <td className="border border-black p-2">мин. цена</td>
                                    </tr>
                                    {[
                                        ['150-500', '0,9 / 1,76', '4,5 / 8,80', '9 / 17,60', '13,5 / 26,40'],
                                        ['500-1000', '0,7 / 1,37', '3,5 / 6,85', '7 / 13,69', '10,5 / 20,54'],
                                        ['1000-2500', '0,6 / 1,17', '3,0 / 5,87', '6 / 11,73', '9,0 / 17,60'],
                                        ['> 2500', '0,5 / 0,98', '2,5 / 4,89', '5 / 9,78', '7,5 / 14,67']
                                    ].map((row, i) => (
                                        <tr key={i} className="bg-cat-warehouse" style={{ backgroundColor: archColors.warehouse }}>
                                            <td className="border border-black p-2">{row[0]}</td>
                                            <td className="border border-black p-2">{row[1]}</td>
                                            <td className="border border-black p-2">{row[2]}</td>
                                            <td className="border border-black p-2">{row[3]}</td>
                                            <td className="border border-black p-2">{row[4]}</td>
                                            <td className="border border-black p-2">цена / м²</td>
                                        </tr>
                                    ))}

                                    {/* Industrial */}
                                    <tr className="bg-cat-industrial" style={{ backgroundColor: archColors.industrial }}>
                                        <td rowSpan={5} className="border border-black p-2 font-bold align-middle">ПРОМИШЛЕНА, СЕЛСКОСТОПАНСКА СГРАДА С МТ</td>
                                        <td className="border border-black p-2">≤ 150</td>
                                        <td className="border border-black p-2">180 / 352,05</td>
                                        <td className="border border-black p-2">900 / 1760,25</td>
                                        <td className="border border-black p-2">1800 / 3520,49</td>
                                        <td className="border border-black p-2">2700 / 5280,74</td>
                                        <td className="border border-black p-2">мин. цена</td>
                                    </tr>
                                    {[
                                        ['150-500', '1,2 / 2,35', '6,0 / 11,73', '12 / 23,47', '18,0 / 35,20'],
                                        ['500-1000', '1,0 / 1,96', '5,0 / 9,78', '10 / 19,56', '15,0 / 29,34'],
                                        ['1000-2500', '0,9 / 1,76', '4,5 / 8,80', '9 / 17,60', '13,5 / 26,40'],
                                        ['> 2500', '0,8 / 1,56', '4,0 / 7,82', '8 / 15,65', '12,0 / 23,47']
                                    ].map((row, i) => (
                                        <tr key={i} className="bg-cat-industrial" style={{ backgroundColor: archColors.industrial }}>
                                            <td className="border border-black p-2">{row[0]}</td>
                                            <td className="border border-black p-2">{row[1]}</td>
                                            <td className="border border-black p-2">{row[2]}</td>
                                            <td className="border border-black p-2">{row[3]}</td>
                                            <td className="border border-black p-2">{row[4]}</td>
                                            <td className="border border-black p-2">цена / м²</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Table 2: PUP */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-center uppercase border-b-2 border-black pb-2 text-black">МИНИМАЛНА СЕБЕСТОЙНОСТ ЗА ПРОЕКТИРАНЕ НА ПОДРОБНИ УСТРОЙСТВЕНИ ПЛАНОВЕ – ЧАСТ АРХИТЕКТУРА</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-black text-center bg-[#f3f3f3] text-black">
                                <thead className="bg-[#e9e9e9] font-bold text-black">
                                    <tr>
                                        <th className="border border-black p-2 bg-[#e9e9e9]">ВИД ПУП</th>
                                        <th className="border border-black p-2 bg-[#e9e9e9]">БРОЙ (У)ПИ</th>
                                        <th className="border border-black p-2 bg-[#e9e9e9]">≤ 1 дка<br/>(€ / лв.)</th>
                                        <th className="border border-black p-2 bg-[#e9e9e9]">1 - 5 дка<br/>(€ / лв.)</th>
                                        <th className="border border-black p-2 bg-[#e9e9e9]">5 - 10 дка<br/>(€ / лв.)</th>
                                        <th className="border border-black p-2 bg-[#e9e9e9]">&gt; 10 дка<br/>(€ / лв.)</th>
                                        <th className="border border-black p-2 bg-[#e9e9e9]">МЯРКА</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-cat-pup" style={{ backgroundColor: archColors.pup }}>
                                    {/* Plan for Building */}
                                    <tr>
                                        <td rowSpan={3} className="border border-black p-2 font-bold align-middle">ПЛАН ЗА ЗАСТРОЯВАНЕ</td>
                                        <td className="border border-black p-2">1</td>
                                        <td className="border border-black p-2">500 / 977,92</td>
                                        <td className="border border-black p-2">750 / 1466,87</td>
                                        <td className="border border-black p-2">1000 / 1955,83</td>
                                        <td className="border border-black p-2">1250 / 2444,79</td>
                                        <td className="border border-black p-2">мин. цена</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2">2-4</td>
                                        <td className="border border-black p-2">300 / 586,75</td>
                                        <td className="border border-black p-2">450 / 880,12</td>
                                        <td className="border border-black p-2">600 / 1173,50</td>
                                        <td className="border border-black p-2">750 / 1466,87</td>
                                        <td className="border border-black p-2">цена / бр.</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2">≥ 5</td>
                                        <td className="border border-black p-2">250 / 488,96</td>
                                        <td className="border border-black p-2">375 / 733,44</td>
                                        <td className="border border-black p-2">500 / 977,92</td>
                                        <td className="border border-black p-2">625 / 1222,39</td>
                                        <td className="border border-black p-2">цена / бр.</td>
                                    </tr>
                                    
                                    {/* Plan for Regulation */}
                                    <tr>
                                        <td rowSpan={3} className="border border-black p-2 font-bold align-middle">ПЛАН ЗА РЕГУЛАЦИЯ И ЗАСТРОЯВАНЕ</td>
                                        <td className="border border-black p-2">1</td>
                                        <td className="border border-black p-2">600 / 1173,50</td>
                                        <td className="border border-black p-2">900 / 1760,25</td>
                                        <td className="border border-black p-2">1200 / 2347,00</td>
                                        <td className="border border-black p-2">1500 / 2933,75</td>
                                        <td className="border border-black p-2">мин. цена</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2">2-4</td>
                                        <td className="border border-black p-2">350 / 684,54</td>
                                        <td className="border border-black p-2">525 / 1026,81</td>
                                        <td className="border border-black p-2">700 / 1369,08</td>
                                        <td className="border border-black p-2">875 / 1711,35</td>
                                        <td className="border border-black p-2">цена / бр.</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2">≥ 5</td>
                                        <td className="border border-black p-2">300 / 586,75</td>
                                        <td className="border border-black p-2">450 / 880,12</td>
                                        <td className="border border-black p-2">600 / 1173,50</td>
                                        <td className="border border-black p-2">750 / 1466,87</td>
                                        <td className="border border-black p-2">цена / бр.</td>
                                    </tr>

                                    {/* Working Development Plan */}
                                    <tr>
                                        <td rowSpan={3} className="border border-black p-2 font-bold align-middle">РАБОТЕН УСТРОЙСТВЕН ПЛАН</td>
                                        <td className="border border-black p-2">1</td>
                                        <td className="border border-black p-2">800 / 1564,66</td>
                                        <td className="border border-black p-2">1200 / 2347,00</td>
                                        <td className="border border-black p-2">1600 / 3129,33</td>
                                        <td className="border border-black p-2">2000 / 3911,66</td>
                                        <td className="border border-black p-2">мин. цена</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2">2-4</td>
                                        <td className="border border-black p-2">450 / 880,12</td>
                                        <td className="border border-black p-2">675 / 1320,19</td>
                                        <td className="border border-black p-2">900 / 1760,25</td>
                                        <td className="border border-black p-2">1125 / 2200,31</td>
                                        <td className="border border-black p-2">цена / бр.</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-black p-2">≥ 5</td>
                                        <td className="border border-black p-2">400 / 782,33</td>
                                        <td className="border border-black p-2">600 / 1173,50</td>
                                        <td className="border border-black p-2">800 / 1564,66</td>
                                        <td className="border border-black p-2">1000 / 1955,83</td>
                                        <td className="border border-black p-2">цена / бр.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Table 3 & 4: Hourly and Coefficients */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold text-lg mb-4 text-center uppercase border-b-2 border-black pb-2 text-black">ЧАСОВА СТАВКА</h3>
                            <table className="w-full border-collapse border border-black text-center bg-cat-pup text-black" style={{ backgroundColor: archColors.pup }}>
                                <thead className="bg-[#e9e9e9] font-bold text-black">
                                    <tr>
                                        <th className="border border-black p-2 bg-[#e9e9e9]">ПРОЕКТАНТ</th>
                                        <th className="border border-black p-2 bg-[#e9e9e9]">€ / ЧАС</th>
                                        <th className="border border-black p-2 bg-[#e9e9e9]">ЛВ / ЧАС</th>
                                        <th className="border border-black p-2 bg-[#e9e9e9]">ЦЕНА/ЧАС БЕЗ ДДС</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td className="border border-black p-2 text-left">С ПЪЛНА ПРАВОСПОСОБНОСТ</td><td className="border border-black p-2">102,26</td><td className="border border-black p-2">200,00</td><td className="border border-black p-2"></td></tr>
                                    <tr><td className="border border-black p-2 text-left">С ОГРАНИЧЕНА ПРАВОСПОСОБНОСТ</td><td className="border border-black p-2">83,08</td><td className="border border-black p-2">162,50</td><td className="border border-black p-2"></td></tr>
                                    <tr><td className="border border-black p-2 text-left">ЗА ТЕХНИЧЕСКИ СЪТРУДНИК</td><td className="border border-black p-2">51,13</td><td className="border border-black p-2">100,00</td><td className="border border-black p-2"></td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4 text-center uppercase border-b-2 border-black pb-2 text-black">ДОПЪЛНИТЕЛНИ КОЕФИЦИЕНТИ</h3>
                            <table className="w-full border-collapse border border-black text-center bg-white text-black">
                                <thead className="bg-[#e9e9e9] font-bold text-black">
                                    <tr>
                                        <th className="border border-black p-2 bg-[#e9e9e9]">ДОПЪЛНИТЕЛНИ КОЕФИЦИЕНТИ ЗА СПЕЦИАЛНИ УСЛОВИЯ</th>
                                        <th className="border border-black p-2 bg-[#e9e9e9]">КОЕФИЦИЕНТ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td className="border border-black p-2 text-left">РАЗРАБОТВАНЕ НА ВАРИАНТИ (ЗА ВСЕКИ СЛЕДВАЩ)</td><td className="border border-black p-2">0.5</td></tr>
                                    <tr><td className="border border-black p-2 text-left">ДОПЪЛНИТЕЛНИ ПОВТОРЕНИЯ НА ПРОЕКТА (2-5 ПОВТОРЕНИЯ / ОГЛЕДАЛЕН ОБРАЗ)</td><td className="border border-black p-2">0.5</td></tr>
                                    <tr><td className="border border-black p-2 text-left">ДОПЪЛНИТЕЛНИ ПОВТОРЕНИЯ НА ПРОЕКТА (≥ 6 ПОВТОРЕНИЯ)</td><td className="border border-black p-2">0.4</td></tr>
                                    <tr><td className="border border-black p-2 text-left">РЕКОНСТРУКЦИИ И ПРЕУСТРОЙСТВА (С НАЛИЧНА ДОКУМЕНТАЦИЯ)</td><td className="border border-black p-2">1.5</td></tr>
                                    <tr><td className="border border-black p-2 text-left">РЕКОНСТРУКЦИИ И ПРЕУСТРОЙСТВА (БЕЗ НАЛИЧНА ДОКУМЕНТАЦИЯ)</td><td className="border border-black p-2">2.0</td></tr>
                                    <tr><td className="border border-black p-2 text-left">СЪКРАТЕНИ СРОКОВЕ (УСКОРЕНО ПРОЕКТИРАНЕ)</td><td className="border border-black p-2">1.5</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default PriceTableModal;
