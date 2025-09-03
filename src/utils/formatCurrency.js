export const formatCurrency = (value, shorten = false) => {
  if (shorten) {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`;
    } else if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
    }
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};