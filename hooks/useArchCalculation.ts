
import { useMemo } from 'react';
import { ArchFormState, CalculationResult } from '../types';
import { calculateArch } from '../services/archCalculatorService';

export const useArchCalculation = (inputs: ArchFormState): CalculationResult => {
  return useMemo(() => {
    return calculateArch(inputs);
  }, [inputs]);
};
