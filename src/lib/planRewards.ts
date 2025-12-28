<<<<<<< HEAD
export const PLAN_REWARDS: Array<{ priceUSD: number; profitUSD: number }> = [
  { priceUSD: 15, profitUSD: 1 },
  { priceUSD: 25, profitUSD: 1.50 },
  { priceUSD: 35, profitUSD: 1.75 },
  { priceUSD: 50, profitUSD: 2 },
  { priceUSD: 75, profitUSD: 2.50 },
  { priceUSD: 150, profitUSD: 3 },
  { priceUSD: 250, profitUSD: 5 },
=======
export const PLAN_REWARDS: Array<{ priceUSD: number; profitUSD: number; referralProfitUSD: number }> = [
  { priceUSD: 15, profitUSD: 1, referralProfitUSD: 3 },
  { priceUSD: 25, profitUSD: 1.50, referralProfitUSD: 4 },
  { priceUSD: 35, profitUSD: 1.75, referralProfitUSD: 5 },
  { priceUSD: 50, profitUSD: 2, referralProfitUSD: 6 },
  { priceUSD: 75, profitUSD: 3.75, referralProfitUSD: 7 },
  { priceUSD: 150, profitUSD: 5, referralProfitUSD: 10 },
  { priceUSD: 250, profitUSD: 8, referralProfitUSD: 20 },
>>>>>>> ccb9353 (Update the plan page and fix reward issue)
];

export function getProfitForDepositAmount(amount: number): number | null {
  const plan = PLAN_REWARDS.find((p) => p.priceUSD === amount);
  return plan ? plan.profitUSD : null;
}

export function getReferralProfitForDepositAmount(amount: number): number | null {
  const plan = PLAN_REWARDS.find((p) => p.priceUSD === amount);
  return plan ? plan.referralProfitUSD : null;
}
