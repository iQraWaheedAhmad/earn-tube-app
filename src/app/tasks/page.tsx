"use client";

import { useEffect, useMemo, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useDepositStatus } from "@/hooks/useDepositStatus";
import { useTaskStatus } from "@/hooks/useTaskStatus";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

function getRandomInt(min: number, max: number) {
  const range = max - min + 1;
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return min + (buf[0] % range);
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = getRandomInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getFallbackPicsumUrl(seed: string) {
  const safeSeed = encodeURIComponent(seed);
  return `https://picsum.photos/seed/${safeSeed}/900/520`;
}

function formatCountdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function TasksPage() {
  const { depositStatus, loading: depositLoading } = useDepositStatus();
  const { user } = useUser();
  const {
    taskStatus,
    loading: taskLoading,
    refetch,
    nextAvailableAtMs,
  } = useTaskStatus();
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [actionLoading, setActionLoading] = useState(false);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [roundImages, setRoundImages] = useState<string[]>([]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const totalSteps = taskStatus?.round?.totalSteps ?? 5;
  const currentStep = taskStatus?.round?.currentStep ?? 0;
  const completedToday = !!taskStatus?.completedToday;
  const rewardAmount = taskStatus?.rewardAmount ?? 0;

  // Fetch 5 DIFFERENT random images for each round/day (no DB storage).
  // They stay consistent during this session; refresh will generate a new set.
  useEffect(() => {
    if (!taskStatus?.dateKey) return;
    if (!user?.id) return;

    const controller = new AbortController();
    const stepCount = totalSteps || 5;

    const run = async () => {
      setImagesLoading(true);
      try {
        const page = getRandomInt(1, 50);
        const res = await fetch(
          `https://picsum.photos/v2/list?page=${page}&limit=100`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("list_fetch_failed");
        const list = (await res.json()) as Array<{ id: string }>;
        const uniqueIds = Array.from(new Set(list.map((x) => x.id)));
        const chosen = shuffle(uniqueIds).slice(0, stepCount);
        if (chosen.length < stepCount) throw new Error("not_enough_images");

        // Random nonce prevents Next/Image caching across rounds/refreshes
        const nonce = `${Date.now()}-${getRandomInt(1000, 9999)}`;
        setRoundImages(
          chosen.map(
            (id) => `https://picsum.photos/id/${id}/900/520?rnd=${nonce}`
          )
        );
      } catch {
        const seedBase = `${user.id}-${taskStatus.dateKey}`;
        setRoundImages(
          Array.from({ length: stepCount }).map((_, i) =>
            getFallbackPicsumUrl(`${seedBase}-step-${i + 1}`)
          )
        );
      } finally {
        setImagesLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [taskStatus?.dateKey, user?.id, totalSteps]);

  const currentImage = useMemo(() => {
    const stepIndex = Math.min(
      Math.max(currentStep, 0),
      Math.max(totalSteps - 1, 0)
    );

    const fromRound = roundImages[stepIndex];
    if (fromRound) return fromRound;

    const dateKey = taskStatus?.dateKey || "unknown-date";
    const userSeed = user?.id || "anon";
    return getFallbackPicsumUrl(`${userSeed}-${dateKey}-step-${stepIndex + 1}`);
  }, [currentStep, totalSteps, roundImages, taskStatus?.dateKey, user?.id]);

  const remainingMs = useMemo(() => {
    if (!nextAvailableAtMs) return null;
    return Math.max(0, nextAvailableAtMs - nowMs);
  }, [nextAvailableAtMs, nowMs]);

  const handleNext = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ type: "error", text: "Please login again." });
        return;
      }
      const tzOffsetMinutes = new Date().getTimezoneOffset();
      const res = await fetch("/api/tasks/step", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-tz-offset-minutes": String(tzOffsetMinutes),
        },
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        setMessage({
          type: "error",
          text: json?.error || "Failed to progress task.",
        });
        return;
      }
      await refetch();
      if (json.paid) {
        setMessage({
          type: "success",
          text: `Round completed! +$${rewardAmount.toFixed(
            2
          )} added to your balance.`,
        });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setActionLoading(false);
    }
  };

  if (depositLoading || taskLoading) {
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

  if (depositStatus.status !== "COMPLETED") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-card to-background px-5">
          <div className="max-w-lg mx-auto bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
            <h1 className="text-2xl font-bold mb-4 text-foreground">
              Complete Your Deposit to Unlock Tasks
            </h1>
            <p className="mb-6 text-muted-foreground">
              Daily Tasks are available only after your deposit is approved
              (status: <span className="font-semibold">COMPLETED</span>). Once
              approved, you’ll unlock 1 round per day and earn profit.
            </p>
            <Link
              href="/deposit"
              className="hero-gradient text-white font-bold py-3 px-8 rounded-lg shadow-lg inline-block transition-all duration-300 transform hover:scale-105"
            >
              Go to Deposit
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-gradient-to-b from-card to-background py-12 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-5xl font-bold font-display text-foreground mb-3">
              Daily Tasks
            </h1>
            <p className="text-muted-foreground text-lg">
              Complete today’s 5-step round to earn your daily profit.
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg text-center ${
                message.type === "success"
                  ? "bg-green-500/20 text-green-500 border border-green-500/30"
                  : "bg-red-500/20 text-red-500 border border-red-500/30"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/2">
                <div className="relative rounded-2xl overflow-hidden border border-border bg-muted">
                  <Image
                    src={currentImage}
                    alt="Task"
                    width={900}
                    height={520}
                    className="w-full h-[260px] sm:h-[340px] object-cover"
                    priority
                    // Picsum sometimes redirects and Next's optimizer can 500 in dev.
                    // Rendering unoptimized avoids /_next/image and fixes the error.
                    unoptimized
                  />
                  {imagesLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full md:w-1/2">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-foreground">
                    Step {Math.min(currentStep + 1, totalSteps)} of {totalSteps}
                  </div>
                  <div className="text-sm font-semibold text-green-600">
                    Round reward: ${rewardAmount.toFixed(2)}
                  </div>
                </div>

                <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-6">
                  <div
                    className="h-3 hero-gradient"
                    style={{
                      width: `${Math.min(
                        100,
                        (currentStep / totalSteps) * 100
                      )}%`,
                    }}
                  />
                </div>

                {completedToday ? (
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Round Completed
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      You’ve finished today’s round. Next round unlocks at
                      midnight.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-muted">
                      <span className="text-sm text-muted-foreground">
                        Next task in
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {remainingMs != null
                          ? formatCountdown(remainingMs)
                          : "--:--:--"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Watch & Continue
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      View each picture and click Next. After 5 pictures, your
                      round will be completed.
                    </p>
                    <Button
                      onClick={handleNext}
                      disabled={actionLoading}
                      className="hero-gradient text-white w-full sm:w-auto"
                    >
                      {actionLoading
                        ? "Processing..."
                        : currentStep + 1 >= totalSteps
                        ? "Finish Round"
                        : "Next"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            New round becomes available automatically when the date changes
            (midnight).
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function TasksPageWrapper() {
  return (
    <ProtectedRoute>
      <TasksPage />
    </ProtectedRoute>
  );
}
