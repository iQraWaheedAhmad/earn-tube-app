"use client";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";

const plans = [
  { priceUSD: 15, profitUSD: 1 },
  { priceUSD: 25, profitUSD: 1.50 },
  { priceUSD: 35, profitUSD: 1.75 },
  { priceUSD: 50, profitUSD: 2},
  { priceUSD: 75, profitUSD: 2.50 },
  { priceUSD: 150, profitUSD: 3},
  { priceUSD: 250, profitUSD: 5 },
];
//this is plan pages
export default function PlansPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-card to-background py-12 px-5 flex justify-center items-center">
        <div className="w-full max-w-7xl">
          <h1 className="text-center text-3xl sm:text-6xl font-bold font-display text-foreground mb-4">
            Daily Profit Plans
          </h1>
          <p className="text-center text-muted-foreground mb-8 text-lg">
            Choose your investment plan and watch your profits grow daily
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-accent/5 rounded-3xl p-6 border border-border shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105"
              >
                <div className="w-32 h-32 flex items-center justify-center bg-card rounded-full shadow-md border-4 border-primary/20">
                  <p className="text-lg text-foreground font-bold text-center">
                    ${plan.priceUSD.toLocaleString()}
                  </p>
                </div>

                <p className="text-lg text-primary font-semibold mt-4">
                  Daily Profit: ${plan.profitUSD}
                </p>

                <Link
                  href="/staking"
                  className="mt-4 w-full bg-primary text-primary-foreground font-semibold py-2.5 px-4 rounded-lg hover:bg-primary/90 transition-colors text-center"
                >
                  Start Earning
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
