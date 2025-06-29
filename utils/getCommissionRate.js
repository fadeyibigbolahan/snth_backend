function getCommissionRate(rank) {
  switch (rank) {
    case "Champion":
      return 0.25;
    case "Leader":
      return 0.2;
    case "Advocate":
    default:
      return 0.15;
  }
}
module.exports = getCommissionRate;
