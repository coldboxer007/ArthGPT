export interface TaxInput {
  baseSalary: number;
  hraReceived: number;
  rentPaid: number;
  section80C: number;
  section80CCD1B: number;
  section80D: number;
  homeLoanInterest: number;
  isMetro: boolean;
}

export interface TaxResult {
  grossSalary: number;
  standardDeduction: number;
  hraExemption: number;
  section80C: number;
  section80CCD1B: number;
  homeLoanInterest: number;
  section80D: number;
  taxableIncome: number;
  taxOnSlab: number;
  cess: number;
  totalTaxLiability: number;
}

export interface TaxComparison {
  oldRegime: TaxResult;
  newRegime: TaxResult;
  winner: 'old' | 'new';
  savings: number;
  missedDeductions: {
    section80D: number;
    section80CCD1B: number;
  };
  hraBreakdown: {
    hraReceived: number;
    metroLimit: number;
    rentMinus10Percent: number;
  };
}

export function calculateTax(input: TaxInput): TaxComparison {
  // --- Old Regime ---
  const oldStandardDeduction = 50000;
  
  // HRA Exemption
  const hra1 = input.hraReceived;
  const hra2 = input.isMetro ? input.baseSalary * 0.5 : input.baseSalary * 0.4;
  const hra3 = Math.max(0, input.rentPaid - (input.baseSalary * 0.1));
  const oldHraExemption = Math.min(hra1, hra2, hra3);

  // Deductions
  const old80C = Math.min(input.section80C, 150000);
  const old80CCD1B = Math.min(input.section80CCD1B, 50000);
  const old80D = Math.min(input.section80D, 25000); // Assuming non-senior
  const oldHomeLoan = Math.min(input.homeLoanInterest, 200000);

  const oldTaxableIncome = Math.max(0, input.baseSalary + input.hraReceived - oldStandardDeduction - oldHraExemption - old80C - old80CCD1B - old80D - oldHomeLoan);

  let oldTaxOnSlab = 0;
  if (oldTaxableIncome > 250000) {
    if (oldTaxableIncome <= 500000) {
      oldTaxOnSlab = (oldTaxableIncome - 250000) * 0.05;
    } else if (oldTaxableIncome <= 1000000) {
      oldTaxOnSlab = 12500 + (oldTaxableIncome - 500000) * 0.2;
    } else {
      oldTaxOnSlab = 112500 + (oldTaxableIncome - 1000000) * 0.3;
    }
  }

  // Rebate 87A (Old Regime)
  if (oldTaxableIncome <= 500000) {
    oldTaxOnSlab = Math.max(0, oldTaxOnSlab - 12500);
  }

  const oldCess = oldTaxOnSlab * 0.04;
  const oldTotalTax = oldTaxOnSlab + oldCess;

  // --- New Regime ---
  const newStandardDeduction = 75000;
  const newTaxableIncome = Math.max(0, input.baseSalary + input.hraReceived - newStandardDeduction);

  let newTaxOnSlab = 0;
  if (newTaxableIncome > 400000) {
    if (newTaxableIncome <= 800000) {
      newTaxOnSlab = (newTaxableIncome - 400000) * 0.05;
    } else if (newTaxableIncome <= 1200000) {
      newTaxOnSlab = 20000 + (newTaxableIncome - 800000) * 0.1;
    } else if (newTaxableIncome <= 1600000) {
      newTaxOnSlab = 60000 + (newTaxableIncome - 1200000) * 0.15;
    } else if (newTaxableIncome <= 2000000) {
      newTaxOnSlab = 120000 + (newTaxableIncome - 1600000) * 0.2;
    } else if (newTaxableIncome <= 2400000) {
      newTaxOnSlab = 200000 + (newTaxableIncome - 2000000) * 0.25;
    } else {
      newTaxOnSlab = 300000 + (newTaxableIncome - 2400000) * 0.3;
    }
  }

  // Rebate 87A (New Regime)
  if (newTaxableIncome <= 1200000) {
    newTaxOnSlab = Math.max(0, newTaxOnSlab - 60000);
  }

  const newCess = newTaxOnSlab * 0.04;
  const newTotalTax = newTaxOnSlab + newCess;

  const winner = newTotalTax <= oldTotalTax ? 'new' : 'old';
  const savings = Math.abs(oldTotalTax - newTotalTax);

  return {
    oldRegime: {
      grossSalary: input.baseSalary + input.hraReceived,
      standardDeduction: oldStandardDeduction,
      hraExemption: oldHraExemption,
      section80C: old80C,
      section80CCD1B: old80CCD1B,
      homeLoanInterest: oldHomeLoan,
      section80D: old80D,
      taxableIncome: oldTaxableIncome,
      taxOnSlab: oldTaxOnSlab,
      cess: oldCess,
      totalTaxLiability: oldTotalTax,
    },
    newRegime: {
      grossSalary: input.baseSalary + input.hraReceived,
      standardDeduction: newStandardDeduction,
      hraExemption: 0,
      section80C: 0,
      section80CCD1B: 0,
      homeLoanInterest: 0,
      section80D: 0,
      taxableIncome: newTaxableIncome,
      taxOnSlab: newTaxOnSlab,
      cess: newCess,
      totalTaxLiability: newTotalTax,
    },
    winner,
    savings,
    missedDeductions: {
      section80D: Math.max(0, 25000 - input.section80D),
      section80CCD1B: Math.max(0, 50000 - input.section80CCD1B),
    },
    hraBreakdown: {
      hraReceived: hra1,
      metroLimit: hra2,
      rentMinus10Percent: hra3
    }
  };
}
