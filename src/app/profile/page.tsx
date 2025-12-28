"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Share2,
  Users,
  TrendingUp,
  Gift,
  Crown,
  Star,
  ExternalLink,
} from "lucide-react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

const plans = [
  { priceUSD: 15, profitUSD: 1, referralProfitUSD: 3 },
  { priceUSD: 25, profitUSD: 1.5, referralProfitUSD: 4 },
  { priceUSD: 35, profitUSD: 1.75, referralProfitUSD: 5 },
  { priceUSD: 50, profitUSD: 2, referralProfitUSD: 6 },
  { priceUSD: 75, profitUSD: 3.75, referralProfitUSD: 7 },
  { priceUSD: 150, profitUSD: 5, referralProfitUSD: 10 },
  { priceUSD: 250, profitUSD: 8, referralProfitUSD: 20 },
];

const ProfilePage = () => {
  const { user, loading } = useUser();
  const [referralLink, setReferralLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
    activeReferrals: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      // Prefer stored referralCode; fallback to classic 8-char alphanumeric code from userId
      const code = user.referralCode || user.id.slice(-8).toUpperCase();
      const link = `${window.location.origin}/register?ref=${code}`;
      setReferralLink(link);

      // Fetch referral stats
      fetchReferralStats();
    }
  }, [user]);

  const fetchReferralStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/referrals/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReferralStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch referral stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-gradient-to-b from-card to-background py-12 px-5">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-6xl font-bold font-display text-foreground mb-4">
              Refer Friends
            </h1>
            <p className="text-xl text-muted-foreground">
              Earn rewards by inviting friends to join EarnTube
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-semibold text-foreground">
                  Total Referrals
                </h3>
              </div>
              <p className="text-3xl font-bold text-blue-500">
                {statsLoading ? "..." : referralStats.totalReferrals}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                People you've referred
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold text-foreground">
                  Total Earnings
                </h3>
              </div>
              <p className="text-3xl font-bold text-green-500">
                $
                {statsLoading ? "0.00" : referralStats.totalEarnings.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                From referral rewards
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Gift className="w-6 h-6 text-purple-500" />
                <h3 className="text-lg font-semibold text-foreground">
                  Active Referrals
                </h3>
              </div>
              <p className="text-3xl font-bold text-purple-500">
                {statsLoading ? "..." : referralStats.activeReferrals}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Currently active
              </p>
            </div>
          </div>

          {/* Referral Link Section */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Share2 className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                Your Referral Link
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-4 py-3 bg-muted border border-border rounded-lg font-mono text-sm"
                placeholder="Generating your unique link..."
              />
              <Button
                onClick={() => copyToClipboard(referralLink)}
                className="hero-gradient text-white flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Referral Rewards Table */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-foreground">
                Referral Rewards
              </h2>
            </div>

            <div className="mb-4">
              <p className="text-muted-foreground">
                Earn rewards based on the investment plan your referred friends
                choose:
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Plan Amount
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Your Reward
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Daily Profit
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Reward %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan, index) => (
                    <tr
                      key={index}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            ${plan.priceUSD}
                          </span>
                          <Star className="w-4 h-4 text-yellow-500" />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-green-500">
                          ${plan.referralProfitUSD}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        ${plan.profitUSD}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-medium">
                          {((plan.profitUSD / plan.priceUSD) * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <ExternalLink className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                How It Works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Share Your Link
                </h3>
                <p className="text-sm text-muted-foreground">
                  Copy your referral link and share it with friends
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  They Invest
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your friends register and choose an investment plan
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">You Earn</h3>
                <p className="text-sm text-muted-foreground">
                  Get rewarded based on their chosen plan amount
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default function ProfilePageWrapper() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}
