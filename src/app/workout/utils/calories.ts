export const METS_VALUES = {
  Running: {
    calculate: (speedKmH: number) => {
      if (speedKmH < 8) return 8;
      if (speedKmH < 11) return 10;
      if (speedKmH < 14) return 12;
      return 14;
    }
  },
  Cycling: {
    calculate: (speedKmH: number) => {
      if (speedKmH < 16) return 4;
      if (speedKmH < 20) return 6;
      if (speedKmH < 25) return 8;
      return 10;
    }
  },
  Walking: {
    calculate: (speedKmH: number) => {
      if (speedKmH < 4) return 2.5;
      if (speedKmH < 6) return 3.5;
      return 4.5;
    }
  }
};

export const DEFAULT_WEIGHT = 70;

export const calculateCalories = (mets: number, durationMinutes: number, weightKg: number = DEFAULT_WEIGHT) => {
  return Math.round(mets * weightKg * (durationMinutes / 60));
}; 