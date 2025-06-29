function getPVCommissionRate(pv) {
  if (pv >= 300) return 0.25;
  if (pv >= 100) return 0.2;
  if (pv > 0) return 0.15;
  return 0;
}

module.exports = getPVCommissionRate;
