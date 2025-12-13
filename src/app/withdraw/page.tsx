"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { useDepositStatus } from "@/hooks/useDepositStatus";
import { useUser } from "@/hooks/useUser";
import { Footer } from "@/components/Footer";
import ProtectedRoute from "@/app/components/ProtectedRoute";

const assets = [{ label: "Tether USD (USDT)", value: "USDT" }];

function WithdrawPage() {
  const MIN_WITHDRAW_AMOUNT = 10;
  const { depositStatus, loading: depositStatusLoading } = useDepositStatus();
  const { user, loading: userLoading, refetchUser } = useUser();
  const [activeTab, setActiveTab] = useState("withdraw");
  const [asset, setAsset] = useState("USDT");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [withdrawalHistory, setWithdrawalHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTab, setHistoryTab] = useState("total");

  // Refresh user data periodically to get updated balance from referral rewards
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      refetchUser();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [refetchUser]);

  // Fetch withdrawals for history tab
  useEffect(() => {
    const fetchWithdrawals = async () => {
      setHistoryLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setWithdrawalHistory(null);
          setHistoryLoading(false);
          return;
        }
        const res = await fetch("/api/withdraw/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (result.success) {
          setWithdrawalHistory(result.data);
        } else {
          setWithdrawalHistory(null);
        }
      } catch {
        setWithdrawalHistory(null);
      }
      setHistoryLoading(false);
    };
    fetchWithdrawals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate amount is a number > 0
    const amountNum = Number(amount);
    if (!asset || !address || !amount || isNaN(amountNum) || amountNum <= 0) {
      setMessage({
        type: "error",
        text: "Enter a valid amount greater than zero.",
      });
      return;
    }
    if ((user?.balance || 0) < MIN_WITHDRAW_AMOUNT) {
      setMessage({
        type: "error",
        text: `Minimum balance required to withdraw is $${MIN_WITHDRAW_AMOUNT}.`,
      });
      return;
    }
    if (amountNum < MIN_WITHDRAW_AMOUNT) {
      setMessage({
        type: "error",
        text: `Minimum withdrawal amount is $${MIN_WITHDRAW_AMOUNT}.`,
      });
      return;
    }
    if (amountNum > (user?.balance || 0)) {
      setMessage({ type: "error", text: "Amount exceeds available balance" });
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ type: "error", text: "Please login to withdraw." });
        return;
      }
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ asset, address, amount }),
      });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: "success", text: "Withdrawal request submitted!" });
        setAddress("");
        setAmount("");
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to submit withdrawal.",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: Fetch withdrawals for history tab

  if (depositStatusLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
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
              Deposit Required
            </h1>
            <p className="mb-6 text-muted-foreground">
              You must complete a deposit before you can withdraw funds.
            </p>
            <a
              href="/deposit"
              className="hero-gradient text-white font-bold py-3 px-8 rounded-lg shadow-lg inline-block transition-all duration-300 transform hover:scale-105"
            >
              Go to Deposit
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 bg-gradient-to-b from-card to-background py-12 px-5">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-center text-3xl sm:text-5xl font-bold font-display text-foreground mb-8">
            Withdraw Funds
          </h1>
          <div className="flex flex-wrap justify-center mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab("withdraw")}
              className={`px-8 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === "withdraw"
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              Make Withdrawal
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-8 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === "history"
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              Withdrawals History
            </button>
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
          <div className="min-h-[400px]">
            {activeTab === "withdraw" && (
              <form
                onSubmit={handleSubmit}
                className="bg-card rounded-2xl shadow-xl border border-border p-8 max-w-xl mx-auto"
              >
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="asset"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Select Asset
                    </label>
                    <select
                      id="asset"
                      value={asset}
                      onChange={(e) => setAsset(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {assets.map((a) => (
                        <option value={a.value} key={a.value}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Recipient Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter wallet address"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label
                        htmlFor="amount"
                        className="block text-sm font-medium text-foreground"
                      >
                        Amount to Withdraw
                      </label>
                      <div className="text-sm font-medium text-green-600">
                        Balance: ${user?.balance?.toFixed(2) || "0.00"}
                      </div>
                    </div>
                    <input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        let v = e.target.value.replace(/[^0-9]/g, "");
                        // Remove leading zeros
                        v = v.replace(/^0+/, "");
                        setAmount(v);
                      }}
                      onKeyDown={(e) => {
                        if (
                          ["-", "+", ".", "e", "0"].includes(e.key) &&
                          amount.length === 0
                        )
                          e.preventDefault();
                      }}
                      min={MIN_WITHDRAW_AMOUNT}
                      max={user?.balance || 0}
                      placeholder={`Min $${MIN_WITHDRAW_AMOUNT} (max: $${
                        user?.balance?.toFixed(2) || "0.00"
                      })`}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                    {(user?.balance || 0) < MIN_WITHDRAW_AMOUNT && (
                      <p className="text-yellow-600 text-sm mt-2">
                        Minimum balance required to withdraw is $
                        {MIN_WITHDRAW_AMOUNT}. Please earn more before
                        requesting a withdrawal.
                      </p>
                    )}
                    {amount &&
                      parseFloat(amount) > 0 &&
                      parseFloat(amount) < MIN_WITHDRAW_AMOUNT && (
                        <p className="text-red-500 text-sm mt-1">
                          Minimum withdrawal amount is ${MIN_WITHDRAW_AMOUNT}
                        </p>
                      )}
                    {amount && parseFloat(amount) > (user?.balance || 0) && (
                      <p className="text-red-500 text-sm mt-1">
                        Amount exceeds available balance
                      </p>
                    )}
                  </div>
                  <div className="flex justify-center mt-8">
                    <button
                      type="submit"
                      disabled={
                        isLoading ||
                        (user?.balance || 0) < MIN_WITHDRAW_AMOUNT ||
                        !amount ||
                        Number(amount) < MIN_WITHDRAW_AMOUNT ||
                        Number(amount) > (user?.balance || 0)
                      }
                      className="hero-gradient text-white font-bold py-3 px-8 rounded-lg shadow-lg flex items-center transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        "Submit Withdrawal"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
            {activeTab === "history" && (
              <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
                <div className="flex flex-wrap justify-center mb-8 border-b border-border">
                  <button
                    onClick={() => setHistoryTab("total")}
                    className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                      historyTab === "total"
                        ? "text-primary border-primary"
                        : "text-muted-foreground border-transparent hover:text-foreground"
                    }`}
                  >
                    Total Withdraw
                  </button>
                  <button
                    onClick={() => setHistoryTab("pending")}
                    className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                      historyTab === "pending"
                        ? "text-primary border-primary"
                        : "text-muted-foreground border-transparent hover:text-foreground"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setHistoryTab("completed")}
                    className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                      historyTab === "completed"
                        ? "text-primary border-primary"
                        : "text-muted-foreground border-transparent hover:text-foreground"
                    }`}
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => setHistoryTab("rejected")}
                    className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                      historyTab === "rejected"
                        ? "text-primary border-primary"
                        : "text-muted-foreground border-transparent hover:text-foreground"
                    }`}
                  >
                    Rejected
                  </button>
                </div>
                <div className="min-h-[200px]">
                  {/* TODO: Render withdrawals by status */}
                  {historyLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : withdrawalHistory ? (
                    historyTab === "total" ? (
                      <div className="text-center py-8">
                        <div className="mb-6">
                          <p className="text-4xl font-bold text-primary mb-2">
                            $
                            {withdrawalHistory.statistics.totalAmount?.toFixed(
                              2
                            ) || 0}
                          </p>
                          <p className="text-muted-foreground">
                            Total Withdrawn Amount
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                          <div className="bg-muted rounded-lg p-4">
                            <p className="text-2xl font-semibold text-foreground">
                              {withdrawalHistory.statistics.totalWithdrawals}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Total Withdrawals
                            </p>
                          </div>
                          <div className="bg-muted rounded-lg p-4">
                            <p className="text-2xl font-semibold text-green-500">
                              {
                                withdrawalHistory.statistics
                                  .completedWithdrawals
                              }
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Completed
                            </p>
                          </div>
                          <div className="bg-muted rounded-lg p-4">
                            <p className="text-2xl font-semibold text-yellow-500">
                              {withdrawalHistory.statistics.pendingWithdrawals}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Pending
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : historyTab === "pending" ? (
                      withdrawalHistory.pending.length > 0 ? (
                        <div className="space-y-4">
                          {withdrawalHistory.pending.map((w) => (
                            <div
                              key={w.id}
                              className="bg-muted/50 rounded-lg p-4 border-l-4 border-yellow-500"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-semibold text-foreground">
                                    ${w.amount} - {w.asset}
                                  </p>
                                  <p className="text-sm text-muted-foreground break-all">
                                    {w.address}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(w.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-medium ml-4">
                                  Pending
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No pending withdrawals found.
                        </div>
                      )
                    ) : historyTab === "completed" ? (
                      withdrawalHistory.completed.length > 0 ? (
                        <div className="space-y-4">
                          {withdrawalHistory.completed.map((w) => (
                            <div
                              key={w.id}
                              className="bg-muted/50 rounded-lg p-4 border-l-4 border-green-500"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-semibold text-foreground">
                                    ${w.amount} - {w.asset}
                                  </p>
                                  <p className="text-sm text-muted-foreground break-all">
                                    {w.address}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(w.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm font-medium ml-4">
                                  Completed
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No completed withdrawals found.
                        </div>
                      )
                    ) : historyTab === "rejected" ? (
                      withdrawalHistory.rejected.length > 0 ? (
                        <div className="space-y-4">
                          {withdrawalHistory.rejected.map((w) => (
                            <div
                              key={w.id}
                              className="bg-muted/50 rounded-lg p-4 border-l-4 border-red-500"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-semibold text-foreground">
                                    ${w.amount} - {w.asset}
                                  </p>
                                  <p className="text-sm text-muted-foreground break-all">
                                    {w.address}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(w.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-sm font-medium ml-4">
                                  Rejected
                                </span>
                              </div>
                            </div>
                          ))}
                          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-500 text-center font-medium">
                              If your withdrawal was rejected, please contact
                              our support team at:
                            </p>
                            <p className="text-red-500 text-center font-semibold mt-2">
                              support@earntube.com
                            </p>
                            <p className="text-red-500 text-center text-sm mt-2">
                              We'll help you resolve any issues with your
                              withdrawal.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-center py-8 text-muted-foreground">
                            No rejected withdrawals found.
                          </div>
                          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-500 text-center font-medium">
                              If your withdrawal was rejected, please contact
                              our support team at:
                            </p>
                            <p className="text-red-500 text-center font-semibold mt-2">
                              support@earntube.com
                            </p>
                            <p className="text-red-500 text-center text-sm mt-2">
                              We'll help you resolve any issues with your
                              withdrawal.
                            </p>
                          </div>
                        </>
                      )
                    ) : null
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No withdrawal history available.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function WithdrawPageWrapper() {
  return (
    <ProtectedRoute>
      <WithdrawPage />
    </ProtectedRoute>
  );
}
