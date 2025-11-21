import React from 'react';
import { FinancialSettings, Expenses } from '../types';

interface Props {
  financials: FinancialSettings;
  expenses: Expenses;
  setFinancials: (f: FinancialSettings) => void;
  setExpenses: (e: Expenses) => void;
}

const Calculators: React.FC<Props> = ({ financials, expenses, setFinancials, setExpenses }) => {
  
  const updateFinancial = (key: keyof FinancialSettings, value: number) => {
    setFinancials({ ...financials, [key]: value });
  };

  const updateExpense = (key: keyof Expenses, value: number) => {
    setExpenses({ ...expenses, [key]: value });
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8">
      {/* Purchase & Loan */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg text-sm">💰</span> Purchase & Loan
        </h3>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-slate-600 font-medium">Purchase Price</span>
              <span className="font-bold text-slate-900">{formatCurrency(financials.purchasePrice)}</span>
            </div>
            <input 
              type="range" 
              min="100000" max="2000000" step="5000" 
              value={financials.purchasePrice}
              onChange={(e) => updateFinancial('purchasePrice', Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-slate-600 font-medium">Down Payment ({financials.downPaymentPercent}%)</span>
              <span className="font-bold text-slate-900">{formatCurrency(financials.purchasePrice * (financials.downPaymentPercent / 100))}</span>
            </div>
            <input 
              type="range" 
              min="0" max="100" step="1" 
              value={financials.downPaymentPercent}
              onChange={(e) => updateFinancial('downPaymentPercent', Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-slate-600 font-medium">Interest Rate</span>
              <span className="font-bold text-slate-900">{financials.interestRate}%</span>
            </div>
            <input 
              type="range" 
              min="1" max="12" step="0.1" 
              value={financials.interestRate}
              onChange={(e) => updateFinancial('interestRate', Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* Income Assumptions */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
         <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg text-sm">📈</span> Income Assumptions
        </h3>
        <div className="space-y-6">
           <div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-slate-600 font-medium">Occupancy Rate</span>
              <span className="font-bold text-indigo-600">{financials.occupancyRate}%</span>
            </div>
            <input 
              type="range" 
              min="0" max="100" step="1" 
              value={financials.occupancyRate}
              onChange={(e) => updateFinancial('occupancyRate', Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
          <div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-slate-600 font-medium">Nightly Rate</span>
              <span className="font-bold text-indigo-600">${financials.nightlyRate}</span>
            </div>
            <input 
              type="range" 
              min="50" max="1000" step="10" 
              value={financials.nightlyRate}
              onChange={(e) => updateFinancial('nightlyRate', Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* Expenses Grid */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg text-sm">🧾</span> Operating Expenses
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Property Tax (Yr)', key: 'propertyTaxYearly' },
            { label: 'Home Insurance (Yr)', key: 'insuranceYearly' },
            { label: 'HOA Fees (Mo)', key: 'hoaMonthly' },
            { label: 'Utilities (Mo)', key: 'utilitiesMonthly' },
            { label: 'Maintenance (Mo)', key: 'maintenanceMonthly' },
            { label: 'Other (Mo)', key: 'otherMonthly' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{field.label}</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
                <input 
                  type="number" 
                  value={(expenses as any)[field.key]}
                  onChange={(e) => updateExpense(field.key as keyof Expenses, Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg py-2 pl-7 pr-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calculators;
