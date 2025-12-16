"use client";

import { useEffect, useState, useMemo } from "react";
import { useUser } from "@/hooks/useUser";
import { useTaskStatus } from "@/hooks/useTaskStatus";
import {
  Crown,
  CheckCircle2,
  Clock,
  Video,
  TrendingUp,
  Timer,
  DollarSign,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DepositData {
  success: boolean;
  data?: {
    deposits: Array<{
      amount: number;
      status: string;
    }>;
  };
}

export const UserOverview = () => {
  const { user, loading: userLoading } = useUser();
  const {
    taskStatus,
    loading: taskLoading,
    nextAvailableAtMs,
  } = useTaskStatus();
  const [depositData, setDepositData] = useState<DepositData | null>(null);
  const [depositLoading, setDepositLoading] = useState(true);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const fetchDepositHistory = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setDepositLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/deposit/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDepositData(data);
        }
      } catch (error) {
        console.error("Failed to fetch deposit history:", error);
      } finally {
        setDepositLoading(false);
      }
    };

    if (user?.id) {
      fetchDepositHistory();
    }
  }, [user?.id]);

  // Update time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format countdown timer
  const formatCountdown = (ms: number) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const hh = String(Math.floor(s / 3600)).padStart(2, "0");
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  // Calculate remaining time (show countdown to next available task time)
  const remainingTime = useMemo(() => {
    if (!nextAvailableAtMs) return null;
    const remaining = nextAvailableAtMs - nowMs;
    return remaining > 0 ? remaining : 0;
  }, [nextAvailableAtMs, nowMs]);

  // Don't show if user is not logged in
  if (userLoading || !user) {
    return null;
  }

  // Get active plan from latest completed deposit
  // Deposits are already ordered by createdAt desc from the API
  const completedDeposits =
    depositData?.data?.deposits?.filter(
      (deposit) => deposit.status === "COMPLETED"
    ) || [];
  const latestCompletedDeposit = completedDeposits[0]; // First one is the latest

  const activePlanAmount = latestCompletedDeposit?.amount || 0;
  const hasActivePlan = activePlanAmount > 0;

  // Get plan name based on amount
  const getPlanName = (amount: number) => {
    if (amount >= 250) return "Elite";
    if (amount >= 150) return "Premium";
    if (amount >= 75) return "Pro";
    if (amount >= 50) return "Advanced";
    if (amount >= 35) return "Standard";
    if (amount >= 25) return "Basic";
    if (amount >= 15) return "Starter";
    return "No Plan";
  };

  // Task information
  const tasksWatched = taskStatus?.round?.currentStep || 0;
  const totalTasks = taskStatus?.round?.totalSteps || 5;
  const isCompleted = taskStatus?.completedToday || false;
  const taskProgress = totalTasks > 0 ? (tasksWatched / totalTasks) * 100 : 0;

  // If no active plan, show a message to get started
  if (!hasActivePlan && !depositLoading) {
    return (
      <section className="py-12 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-card rounded-2xl p-6 md:p-8 card-shadow border border-primary/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl hero-gradient flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    Get Started with a Plan
                  </h3>
                  <p className="text-muted-foreground">
                    Choose a plan to start earning from daily tasks
                  </p>
                </div>
              </div>
              <Link href="/plans">
                <Button className="hero-gradient text-white">View Plans</Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  // Show loading state
  if (depositLoading || taskLoading) {
    return (
      <section className="py-12 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-card rounded-2xl p-6 md:p-8 card-shadow">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-b from-primary/5 to-transparent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-card rounded-2xl p-6 md:p-8 card-shadow border border-primary/20">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
                  Your Overview
                </h2>
                <p className="text-muted-foreground">
                  Track your active plan and daily task progress
                </p>
              </div>
            </div>

            {/* Mobile: Balance Display */}
            <div className="md:hidden bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">
                    Your Balance
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${user?.balance?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile: Task Countdown Timer */}
            {remainingTime !== null && remainingTime > 0 && taskStatus && (
              <div className="md:hidden bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg hero-gradient flex items-center justify-center">
                    <Timer className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">
                      {taskStatus.completedToday
                        ? "Next Task Available In"
                        : "Tasks Reset In"}
                    </p>
                    <p className="text-2xl font-bold text-foreground font-mono">
                      {formatCountdown(remainingTime)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Active Plan */}
              <div className="bg-muted/50 rounded-xl p-5 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg hero-gradient flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Plan</p>
                    <p className="text-lg font-bold text-foreground">
                      {getPlanName(activePlanAmount)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  ${activePlanAmount.toFixed(2)} USD
                </p>
              </div>

              {/* Tasks Watched */}
              <div className="bg-muted/50 rounded-xl p-5 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg hero-gradient flex items-center justify-center">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tasks Today</p>
                    <p className="text-lg font-bold text-foreground">
                      {tasksWatched} / {totalTasks}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="hero-gradient h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(taskProgress, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Completion Status */}
              <div className="bg-muted/50 rounded-xl p-5 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-500/20 border border-green-500/30"
                        : "bg-orange-500/20 border border-orange-500/30"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p
                      className={`text-lg font-bold ${
                        isCompleted
                          ? "text-green-600 dark:text-green-400"
                          : "text-orange-600 dark:text-orange-400"
                      }`}
                    >
                      {isCompleted ? "Completed" : "In Progress"}
                    </p>
                  </div>
                </div>
                {!isCompleted && (
                  <Link href="/tasks">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 text-xs"
                    >
                      Continue Tasks
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Action Button */}
            {!isCompleted && (
              <div className="pt-4 border-t border-border">
                <Link href="/tasks">
                  <Button className="hero-gradient text-white w-full md:w-auto">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Complete Your Tasks
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
};
