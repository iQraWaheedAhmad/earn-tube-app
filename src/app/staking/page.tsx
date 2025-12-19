"use client";

import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Copy } from "lucide-react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";

const walletAddresses = [
  {
    label: "Primary (TRC20)",
    value: "TJuZCvYANND2emRa4ssrWqpZswPFUaJVWQ",
  },
  {
    label: "Alternate (Binance)",
    value: "0x3721e7e7666fa8c519190fef940052007f422935",
  },
];

type StepProps = {
  title: string;
  color: string;
  children: React.ReactNode;
};

const Step = ({ title, children, color }: StepProps) => (
  <div
    className={`bg-card shadow rounded-lg p-4 border-l-4 mt-6 ${color} border border-border`}
  >
    <h2 className="text-xl font-semibold mb-2 text-foreground">{title}</h2>
    <div className="text-muted-foreground text-sm space-y-2">{children}</div>
  </div>
);

const WalletRow = ({ label, value }: { label: string; value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">

      <div className="px-2 py-1 rounded bg-muted text-sm font-semibold text-foreground">
        {label}
      </div>
      <code className="bg-muted px-2 py-1 rounded text-primary font-mono break-all">
        {value}
      </code>
      <button
        onClick={handleCopy}
        className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm inline-flex items-center gap-1 transition-smooth hover:bg-primary/90"
      >
        <Copy className="w-4 h-4" />
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
};

function BinanceStaking() {
  const router = useRouter();

  return (
    <>
    <Navigation />
      <Head>
        <title>Staking - EarnTube</title>
        <meta
          name="description"
          content="Step-by-step guide to stake USDT and start earning daily."
        />
      </Head>

      <main className="max-w-3xl mx-auto px-4 py-10 text-foreground">
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
            🚀 Staking Guide
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-3">
          Join USDT (TRC20) Staking
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Simple steps to start earning daily rewards with EarnTube.
        </p>

        <Step title="📥 Step 1: Copy Wallet Address" color="border-primary">
          <p>Send your USDT (TRC20) to one of the addresses below:</p>
          {walletAddresses.map((item) => (
            <WalletRow key={item.value} label={item.label} value={item.value} />
          ))}
        </Step>

        <Step title="📱 Step 2: Open Wallet" color="border-green-500">
          <ul className="list-disc ml-5">
            <li>Use Binance, Trust Wallet, or TronLink.</li>
            <li>
              Ensure USDT is on <strong>TRC-20</strong> network.
            </li>
          </ul>
        </Step>

        <Step title="💸 Step 3: Send USDT" color="border-purple-500">
          <ul className="list-decimal ml-5 space-y-1">
            <li>Tap “Withdraw” or “Send”.</li>
            <li>Paste the address above.</li>
            <li>Enter amount (e.g., 100 USDT).</li>
            <li>
              Choose <strong>TRC20</strong> network.
            </li>
            <li>Confirm transaction.</li>
          </ul>
        </Step>

        <Step title="🔁 Step 4: Send TXID" color="border-yellow-500">
          <ul className="list-decimal ml-5 space-y-1">
            <li>Copy the transaction hash (TXID).</li>
            <li>Send TXID via form or email.</li>
          </ul>
          <p className="text-xs text-muted-foreground">
            Every deposit is manually verified.
          </p>
        </Step>

        <Step title="🎉 Step 5: Start Earning" color="border-red-500">
          <p>
            Daily reward example: $2 per 100 USDT. Withdraw after 12h. Deposit
            locked for 30 days.
          </p>
        </Step>

        <Step title="⚠️ Important Notes" color="border-yellow-400">
          <ul className="list-disc ml-5 text-sm space-y-1">
            <li>Only send USDT via TRC20.</li>
            <li>Never share your wallet&apos;s seed phrase.</li>
            <li>Withdraw only after 30 days.</li>
            <li>Keep TXID safe for records.</li>
          </ul>
        </Step>

        <div className="mt-8 text-sm text-muted-foreground space-y-1">
          <h3 className="text-lg font-medium text-foreground">
            📧 Manual Submission
          </h3>
          <p>
            Send TXID and screenshot to:
            <a
              href="mailto:imran@gmail.com"
              className="text-primary underline ml-1"
            >
              imran@gmail.com
            </a>
          </p>
          <p className="text-xs">
            Include wallet address and TXID for faster verification.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => router.push("/deposit")}
            className="hero-gradient text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center transition-all duration-300 transform hover:scale-105"
          >
            Make a Deposit Now
            <ArrowRight className="ml-2" />
          </button>
        </div>
      </main>
        <Footer />
    </>
  );
}

export default function StakingPageWrapper() {
  return (
    <ProtectedRoute>
      <BinanceStaking />
    </ProtectedRoute>
  );
}
