"use client";

import { useState } from "react";
import React from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import ProtectedRoute from "@/app/components/ProtectedRoute";

const amounts = [15, 25, 35, 50, 75, 150, 250];

interface Deposit {
  id: string;
  coin: string;
  amount: number;
  transactionHash: string;
  status: "PENDING" | "COMPLETED" | "REJECTED";
  createdAt: string;
  paymentProof?: string;
}

interface DepositHistory {
  statistics: {
    totalDeposits: number;
    completedDeposits: number;
    pendingDeposits: number;
    rejectedDeposits: number;
    totalAmount: number;
  };
  deposits: Deposit[];
  pending: Deposit[];
  completed: Deposit[];
  rejected: Deposit[];
}

function DepositPage() {
  const [selectedCoin, setSelectedCoin] = useState("");
  const [selectedAmount, setSelectedAmount] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("deposit");
  const [historyTab, setHistoryTab] = useState("total");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [depositHistory, setDepositHistory] = useState<DepositHistory | null>(
    null
  );
  const [historyLoading, setHistoryLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCoin || !selectedAmount || !transactionHash || !paymentProof) {
      setMessage({ type: "error", text: "Please fill all required fields" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ type: "error", text: "Please login to make a deposit" });
        return;
      }

      const formData = new FormData();
      formData.append("coin", selectedCoin);
      formData.append("amount", selectedAmount);
      formData.append("transactionHash", transactionHash);
      if (paymentProof) {
        formData.append("paymentProof", paymentProof);
      }

      const response = await fetch("/api/deposit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: "Deposit submitted successfully! It will be reviewed shortly.",
        });
        // Reset form
        setSelectedCoin("");
        setSelectedAmount("");
        setTransactionHash("");
        setPaymentProof(null);
        // Refresh history if user is on history tab
        if (activeTab === "history") {
          fetchDepositHistory();
        }
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to submit deposit",
        });
      }
    } catch (error) {
      console.error("Deposit submission error:", error);
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepositHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({
          type: "error",
          text: "Please login to view deposit history",
        });
        return;
      }

      const response = await fetch("/api/deposit/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setDepositHistory(result.data);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to fetch deposit history",
        });
      }
    } catch (error) {
      console.error("Deposit history fetch error:", error);
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch deposit history when component mounts or when tab changes to history
  React.useEffect(() => {
    if (!depositHistory) {
      fetchDepositHistory();
    }
  }, [depositHistory]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setPaymentProof(file);
    } else {
      setMessage({ type: "error", text: "Please upload an image file" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 bg-gradient-to-b from-card to-background py-12 px-5">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-center text-3xl sm:text-5xl font-bold font-display text-foreground mb-8">
            Make a Deposit
          </h1>

          {/* Message Display */}
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

          {/* Main Tabs */}
          <div className="flex flex-wrap justify-center mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab("deposit")}
              className={`px-8 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === "deposit"
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              Make Deposit
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-8 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === "history"
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              History
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === "deposit" && (
              <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
                {depositHistory && depositHistory.deposits.length > 0 ? (
                  <div className="text-center py-12">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-yellow-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Deposit Already Submitted
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        You can only make one deposit at a time. Your current
                        deposit is being processed.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Please check the History tab to see the status of your
                        deposit.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Column 1: Select Coin */}
                      <div className="space-y-2">
                        <label
                          htmlFor="coin"
                          className="block text-sm font-medium text-foreground"
                        >
                          Select Coin
                        </label>
                        <select
                          id="coin"
                          value={selectedCoin}
                          onChange={(e) => setSelectedCoin(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        >
                          <option value="">Choose coin</option>
                          <option value="USDT">Tether USD (USDT)</option>
                        </select>
                      </div>

                      {/* Column 2: Select Amount */}
                      <div className="space-y-2">
                        <label
                          htmlFor="amount"
                          className="block text-sm font-medium text-foreground"
                        >
                          Select Amount
                        </label>
                        <select
                          id="amount"
                          value={selectedAmount}
                          onChange={(e) => setSelectedAmount(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        >
                          <option value="">Choose amount</option>
                          {amounts.map((amount) => (
                            <option key={amount} value={amount}>
                              ${amount} USD
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Column 3: Transaction Hash */}
                      <div className="space-y-2">
                        <label
                          htmlFor="transaction"
                          className="block text-sm font-medium text-foreground"
                        >
                          Transaction Hash
                        </label>
                        <input
                          id="transaction"
                          type="text"
                          value={transactionHash}
                          onChange={(e) => setTransactionHash(e.target.value)}
                          placeholder="Enter TXID"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>

                      {/* Column 4: Payment Proof */}
                      <div className="space-y-2">
                        <label
                          htmlFor="proof"
                          className="block text-sm font-medium text-foreground"
                        >
                          Payment Proof
                        </label>
                        <input
                          id="proof"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                          required
                        />
                        {paymentProof && (
                          <p
                            className="text-xs text-muted-foreground mt-1 truncate"
                            title={paymentProof.name}
                          >
                            Selected: {paymentProof.name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8 flex justify-center">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="hero-gradient text-white font-bold py-3 px-8 rounded-lg shadow-lg flex items-center transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          "Submit Deposit"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
                {/* History Sub-Tabs */}
                <div className="flex flex-wrap justify-center mb-8 border-b border-border">
                  <button
                    onClick={() => setHistoryTab("total")}
                    className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                      historyTab === "total"
                        ? "text-primary border-primary"
                        : "text-muted-foreground border-transparent hover:text-foreground"
                    }`}
                  >
                    Total Deposit
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

                {/* History Tab Content */}
                <div className="min-h-[200px]">
                  {historyLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : depositHistory ? (
                    <>
                      {historyTab === "total" && (
                        <div className="text-center py-8">
                          <div className="mb-6">
                            <p className="text-4xl font-bold text-primary mb-2">
                              $
                              {depositHistory.statistics.totalAmount.toFixed(2)}
                            </p>
                            <p className="text-muted-foreground">
                              Total Deposited Amount
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                            <div className="bg-muted rounded-lg p-4">
                              <p className="text-2xl font-semibold text-foreground">
                                {depositHistory.statistics.totalDeposits}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Total Deposits
                              </p>
                            </div>
                            <div className="bg-muted rounded-lg p-4">
                              <p className="text-2xl font-semibold text-green-500">
                                {depositHistory.statistics.completedDeposits}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Completed
                              </p>
                            </div>
                            <div className="bg-muted rounded-lg p-4">
                              <p className="text-2xl font-semibold text-yellow-500">
                                {depositHistory.statistics.pendingDeposits}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Pending
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {historyTab === "pending" && (
                        <div className="space-y-4">
                          {depositHistory.pending.length > 0 ? (
                            depositHistory.pending.map((deposit) => (
                              <div
                                key={deposit.id}
                                className="bg-muted/50 rounded-lg p-4 border-l-4 border-yellow-500"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-semibold text-foreground">
                                      ${deposit.amount} - {deposit.coin}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      TXID:{" "}
                                      {deposit.transactionHash.slice(0, 10)}...
                                      {deposit.transactionHash.slice(-8)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(
                                        deposit.createdAt
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                    {deposit.paymentProof && (
                                      <div className="mt-3">
                                        <p className="text-xs text-muted-foreground mb-2">
                                          Payment Proof:
                                        </p>
                                        <img
                                          src={deposit.paymentProof}
                                          alt="Payment Proof"
                                          className="w-32 h-32 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => window.open(deposit.paymentProof, "_blank")}
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-medium ml-4">
                                    Pending
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              No pending deposits found.
                            </div>
                          )}
                        </div>
                      )}

                      {historyTab === "rejected" && (
                        <div className="space-y-4">
                          {depositHistory.rejected.length > 0 ? (
                            depositHistory.rejected.map((deposit) => (
                              <div
                                key={deposit.id}
                                className="bg-muted/50 rounded-lg p-4 border-l-4 border-red-500"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-semibold text-foreground">
                                      ${deposit.amount} - {deposit.coin}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      TXID:{" "}
                                      {deposit.transactionHash.slice(0, 10)}...
                                      {deposit.transactionHash.slice(-8)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(
                                        deposit.createdAt
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                    {deposit.paymentProof && (
                                      <div className="mt-3">
                                        <p className="text-xs text-muted-foreground mb-2">
                                          Payment Proof:
                                        </p>
                                        <img
                                          src={deposit.paymentProof}
                                          alt="Payment Proof"
                                          className="w-32 h-32 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => window.open(deposit.paymentProof, "_blank")}
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-sm font-medium ml-4">
                                    Rejected
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              No rejected deposits found.
                            </div>
                          )}

                          {/* Contact message for rejected deposits */}
                          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-500 text-center font-medium">
                              If your deposit was rejected, please contact our
                              support team at:
                            </p>
                            <p className="text-red-500 text-center font-semibold mt-2">
                              support@earntube.com
                            </p>
                            <p className="text-red-500 text-center text-sm mt-2">
                              We'll help you resolve any issues with your
                              deposit.
                            </p>
                          </div>
                        </div>
                      )}

                      {historyTab === "completed" && (
                        <div className="space-y-4">
                          {depositHistory.completed.length > 0 ? (
                            depositHistory.completed.map((deposit) => (
                              <div
                                key={deposit.id}
                                className="bg-muted/50 rounded-lg p-4 border-l-4 border-green-500"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-semibold text-foreground">
                                      ${deposit.amount} - {deposit.coin}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      TXID:{" "}
                                      {deposit.transactionHash.slice(0, 10)}...
                                      {deposit.transactionHash.slice(-8)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(
                                        deposit.createdAt
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                    {deposit.paymentProof && (
                                      <div className="mt-3">
                                        <p className="text-xs text-muted-foreground mb-2">
                                          Payment Proof:
                                        </p>
                                        <img
                                          src={deposit.paymentProof}
                                          alt="Payment Proof"
                                          className="w-32 h-32 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => window.open(deposit.paymentProof, "_blank")}
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm font-medium ml-4">
                                    Completed
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              No completed deposits found.
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No deposit history available.
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

export default function DepositPageWrapper() {
  return (
    <ProtectedRoute>
      <DepositPage />
    </ProtectedRoute>
  );
}
