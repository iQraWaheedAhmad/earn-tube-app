export const PLAN_REWARDS: Array<{ priceUSD: number; profitUSD: number }> = [
  { priceUSD: 15, profitUSD: 1 },
  { priceUSD: 25, profitUSD: 1.50 },
  { priceUSD: 35, profitUSD: 1.75 },
  { priceUSD: 50, profitUSD: 2 },
  { priceUSD: 75, profitUSD: 2.50 },
  { priceUSD: 150, profitUSD: 3 },
  { priceUSD: 250, profitUSD: 5 },
];

export function getProfitForDepositAmount(amount: number): number | null {
  const plan = PLAN_REWARDS.find((p) => p.priceUSD === amount);
  return plan ? plan.profitUSD : null;
}
