export function useCurrency() {
  return {
    formatDollarAmount: (val: number) => `$${val.toFixed(2)}`,
    formatOfferAmount: (val: number) => `$${val.toFixed(2)}`,
    isDollarMode: true,
    formatBalance: (val: number) => `$${val.toFixed(2)}`,
    formatBalanceShort: (val: number) => `$${val.toFixed(2)}`,
    isTokenMode: false,
    isLocalMode: false,
    localCurrencySymbol: '$',
    mode: 'dollar' as const,
    toggleMode: () => {},
    setUserCountry: () => {},
  };
}
