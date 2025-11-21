import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Home, Search as SearchIcon, MapPin, 
  BedDouble, Bath, Ruler, TrendingUp, DollarSign, Percent,
  Image as ImageIcon, Wand2, Video
} from 'lucide-react';
import Calculators from './components/Calculators';
import VoiceAssistant from './components/VoiceAssistant';
import GeminiTools from './components/GeminiTools';
import { PropertyData, FinancialSettings, Expenses, AnalysisResult, ToolTab } from './types';

// --- Mock Data ---
const MOCK_PROPERTY: PropertyData = {
  id: '1',
  address: '1204 Willow Creek Dr',
  city: 'Austin',
  state: 'TX',
  zip: '78741',
  price: 450000,
  beds: 4,
  baths: 3,
  sqft: 2400,
  imageUrl: 'https://images.unsplash.com/photo-1600596542815-37a9a22110dl?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
  description: 'Beautiful modern home in the heart of Austin, perfect for short term rentals with pool access and spacious living areas.'
};

const DEFAULT_FINANCIALS: FinancialSettings = {
  purchasePrice: 450000,
  downPaymentPercent: 20,
  interestRate: 6.5,
  loanTermYears: 30,
  nightlyRate: 250,
  occupancyRate: 65,
};

const DEFAULT_EXPENSES: Expenses = {
  propertyTaxYearly: 8000,
  insuranceYearly: 2000,
  hoaMonthly: 50,
  utilitiesMonthly: 300,
  maintenanceMonthly: 150,
  managementFeePercent: 0,
  otherMonthly: 0,
};

// --- Helper ---
const calculateAnalysis = (fin: FinancialSettings, exp: Expenses): AnalysisResult => {
  const loanAmount = fin.purchasePrice * (1 - fin.downPaymentPercent / 100);
  const monthlyRate = fin.interestRate / 100 / 12;
  const numPayments = fin.loanTermYears * 12;
  
  // Mortgage
  const monthlyMortgage = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  // Income
  const monthlyIncome = (fin.nightlyRate * 30) * (fin.occupancyRate / 100);
  
  // Expenses
  const monthlyTax = exp.propertyTaxYearly / 12;
  const monthlyInsurance = exp.insuranceYearly / 12;
  const monthlyMgmt = monthlyIncome * (exp.managementFeePercent / 100);
  
  const totalMonthlyExpenses = monthlyMortgage + monthlyTax + monthlyInsurance + exp.hoaMonthly + exp.utilitiesMonthly + exp.maintenanceMonthly + monthlyMgmt + exp.otherMonthly;
  
  const cashFlow = monthlyIncome - totalMonthlyExpenses;
  const annualCashFlow = cashFlow * 12;
  const initialInvestment = (fin.purchasePrice * (fin.downPaymentPercent / 100)) + 3500; // + closing costs estimate
  
  const cashOnCashRoi = (annualCashFlow / initialInvestment) * 100;
  
  // Cap Rate = Net Operating Income / Current Market Value
  // NOI = Income - Operating Expenses (Excluding Mortgage)
  const operatingExpenses = totalMonthlyExpenses - monthlyMortgage;
  const annualNOI = (monthlyIncome - operatingExpenses) * 12;
  const capRate = (annualNOI / fin.purchasePrice) * 100;

  return {
    monthlyIncome,
    monthlyMortgage,
    totalMonthlyExpenses,
    cashFlow,
    capRate,
    cashOnCashRoi,
    initialInvestment
  };
};

export default function App() {
  const [view, setView] = useState<'search' | 'dashboard'>('search');
  const [property, setProperty] = useState<PropertyData>(MOCK_PROPERTY);
  const [financials, setFinancials] = useState<FinancialSettings>(DEFAULT_FINANCIALS);
  const [expenses, setExpenses] = useState<Expenses>(DEFAULT_EXPENSES);
  const [activeToolTab, setActiveToolTab] = useState<ToolTab>('details');

  const analysis = useMemo(() => calculateAnalysis(financials, expenses), [financials, expenses]);

  // --- Search View ---
  if (view === 'search') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <LayoutDashboard className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">PropVest AI</h1>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Find your next <span className="text-indigo-600">rental investment</span>.
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Instantly analyze cash flow, cap rates, and visualize renovations with Gemini AI models.
          </p>
        </div>

        <div className="w-full max-w-2xl bg-white rounded-full shadow-xl p-2 flex items-center border border-slate-100 hover:border-indigo-200 transition-colors">
          <MapPin className="ml-4 text-slate-400 w-6 h-6" />
          <input 
            type="text" 
            placeholder="Enter City, Address, or paste a Listing URL..." 
            className="flex-1 px-4 py-3 text-lg outline-none text-slate-700 bg-transparent"
            onKeyDown={(e) => e.key === 'Enter' && setView('dashboard')}
          />
          <button 
            onClick={() => setView('dashboard')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-medium transition-all transform hover:scale-105 active:scale-95"
          >
            Search
          </button>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
                { icon: <Wand2 className="w-6 h-6 text-amber-600"/>, title: "AI Image Editing", desc: "Visualize renovations instantly with Nano Banana" },
                { icon: <Video className="w-6 h-6 text-purple-600"/>, title: "Veo Animation", desc: "Turn static photos into engaging video tours" },
                { icon: <TrendingUp className="w-6 h-6 text-green-600"/>, title: "Real-time Analysis", desc: "Voice-powered ROI & Cashflow calculation" }
            ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        {item.icon}
                    </div>
                    <h3 className="font-bold text-slate-800">{item.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                </div>
            ))}
        </div>
      </div>
    );
  }

  // --- Dashboard View ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('search')}>
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-900">PropVest AI</span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="#" className="hover:text-indigo-600 flex items-center gap-1"><Home className="w-4 h-4"/> Home</a>
              <a href="#" className="hover:text-indigo-600">Favorites</a>
              <a href="#" className="hover:text-indigo-600">Account</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Visuals & Tools */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button 
                    onClick={() => setActiveToolTab('details')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeToolTab === 'details' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <ImageIcon className="w-4 h-4" /> Photos
                </button>
                <button 
                    onClick={() => setActiveToolTab('image-editor')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeToolTab === 'image-editor' ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Wand2 className="w-4 h-4" /> AI Editor
                </button>
                <button 
                    onClick={() => setActiveToolTab('veo-animator')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeToolTab === 'veo-animator' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Video className="w-4 h-4" /> Veo Animator
                </button>
                 <button 
                    onClick={() => setActiveToolTab('market-research')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeToolTab === 'market-research' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <SearchIcon className="w-4 h-4" /> Research
                </button>
            </div>

            {/* Content Area */}
            {activeToolTab === 'details' ? (
                <div className="relative group">
                    <img src={property.imageUrl} alt="Property" className="w-full aspect-[16/10] object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
                        <h1 className="text-3xl font-bold text-white mb-1">{property.address}</h1>
                        <p className="text-white/90 text-lg">{property.city}, {property.state} {property.zip}</p>
                        <div className="flex items-center gap-6 mt-4 text-white/80">
                            <span className="flex items-center gap-2"><BedDouble className="w-5 h-5"/> {property.beds} Beds</span>
                            <span className="flex items-center gap-2"><Bath className="w-5 h-5"/> {property.baths} Baths</span>
                            <span className="flex items-center gap-2"><Ruler className="w-5 h-5"/> {property.sqft.toLocaleString()} SqFt</span>
                        </div>
                    </div>
                </div>
            ) : (
                <GeminiTools originalImage={property.imageUrl} activeTab={activeToolTab} address={property.address} />
            )}
          </div>
          
          {/* Description Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-2">About this property</h3>
            <p className="text-slate-600 leading-relaxed">{property.description}</p>
          </div>
        </div>

        {/* Right Column: Financials */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl border ${analysis.cashFlow > 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                <p className="text-sm font-medium text-slate-500 mb-1">Est. Cash Flow</p>
                <p className={`text-2xl font-bold ${analysis.cashFlow > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {analysis.cashFlow > 0 ? '+' : ''}{Math.round(analysis.cashFlow).toLocaleString()}/mo
                </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500 mb-1">Cap Rate</p>
                <p className="text-2xl font-bold text-indigo-600">{analysis.capRate.toFixed(2)}%</p>
            </div>
             <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500 mb-1">Cash on Cash</p>
                <p className="text-2xl font-bold text-blue-600">{analysis.cashOnCashRoi.toFixed(2)}%</p>
            </div>
             <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500 mb-1">Total Investment</p>
                <p className="text-2xl font-bold text-slate-700">${Math.round(analysis.initialInvestment / 1000)}k</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
             <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                <div className="text-center">
                    <p className="text-xs text-slate-500 uppercase font-bold">Income</p>
                    <p className="text-lg font-bold text-slate-800">${Math.round(analysis.monthlyIncome)}</p>
                </div>
                <span className="text-slate-300 text-2xl">-</span>
                <div className="text-center">
                    <p className="text-xs text-slate-500 uppercase font-bold">Expenses</p>
                    <p className="text-lg font-bold text-red-600">${Math.round(analysis.totalMonthlyExpenses)}</p>
                </div>
                <span className="text-slate-300 text-2xl">=</span>
                <div className="text-center">
                    <p className="text-xs text-slate-500 uppercase font-bold">Net</p>
                    <p className={`text-lg font-bold ${analysis.cashFlow > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.round(analysis.cashFlow)}
                    </p>
                </div>
             </div>
             
             <Calculators 
                financials={financials}
                expenses={expenses}
                setFinancials={setFinancials}
                setExpenses={setExpenses}
             />
          </div>

        </div>
      </main>
      
      <VoiceAssistant />
    </div>
  );
}
