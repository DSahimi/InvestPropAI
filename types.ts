export interface PropertyData {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  imageUrl: string;
  description: string;
}

export interface FinancialSettings {
  purchasePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
  nightlyRate: number;
  occupancyRate: number; // 0-100
}

export interface Expenses {
  propertyTaxYearly: number;
  insuranceYearly: number;
  hoaMonthly: number;
  utilitiesMonthly: number;
  maintenanceMonthly: number;
  managementFeePercent: number;
  otherMonthly: number;
}

export interface AnalysisResult {
  monthlyIncome: number;
  monthlyMortgage: number;
  totalMonthlyExpenses: number;
  cashFlow: number;
  capRate: number;
  cashOnCashRoi: number;
  initialInvestment: number;
}

export type ToolTab = 'details' | 'image-editor' | 'veo-animator' | 'market-research';
