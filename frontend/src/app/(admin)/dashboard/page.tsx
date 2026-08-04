import { Metadata } from "next";
import React from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ScanText,
  Users,
  CreditCard,
  ShoppingBag,
  Zap,
  PiggyBank,
  CheckCircle2
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | Moniq - Financial Intelligence",
  description: "Unified ledger and financial analytics for personal, family, and teams.",
};

function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendType,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  trend: string;
  trendType: "up" | "down" | "neutral";
  icon: React.ReactNode;
}) {
  return (
    <div className="group rounded-2xl border border-border bg-surface p-6 transition-all hover:border-primary/30 hover:shadow-theme-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
          {title}
        </span>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary transition-transform group-hover:scale-105">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
          {value}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-foreground-muted">{subtitle}</span>
          <span
            className={`inline-flex items-center gap-1 font-semibold ${
              trendType === "up"
                ? "text-emerald-600 dark:text-emerald-400"
                : trendType === "down"
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-foreground-muted"
            }`}
          >
            {trendType === "up" && <ArrowUpRight className="h-3.5 w-3.5" />}
            {trendType === "down" && <ArrowDownRight className="h-3.5 w-3.5" />}
            {trend}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const wallets = [
    {
      name: "Primary Checking",
      bank: "Chase Bank",
      balance: "$42,850.00",
      type: "Bank",
      color: "from-emerald-600 to-teal-800",
      number: "•••• 4892",
    },
    {
      name: "Family Vault",
      bank: "High-Yield Savings",
      balance: "$68,400.00",
      type: "Savings",
      color: "from-slate-700 to-slate-900",
      number: "•••• 9104",
    },
    {
      name: "Team Reserve",
      bank: "Silicon Valley Bank",
      balance: "$24,200.00",
      type: "Business",
      color: "from-teal-600 to-cyan-900",
      number: "•••• 3310",
    },
    {
      name: "Executive Rewards",
      bank: "American Express",
      balance: "-$7,000.00",
      type: "Credit",
      color: "from-amber-600 to-yellow-800",
      number: "•••• 1005",
    },
  ];

  const recentTransactions = [
    {
      id: "tx-1",
      merchant: "Whole Foods Market",
      category: "Groceries & Dining",
      date: "Today, 2:15 PM",
      amount: "-$142.80",
      type: "expense",
      wallet: "Primary Checking",
      icon: <ShoppingBag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    },
    {
      id: "tx-2",
      merchant: "Acme Corp Salary",
      category: "Income",
      date: "Yesterday",
      amount: "+$6,250.00",
      type: "income",
      wallet: "Primary Checking",
      icon: <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    },
    {
      id: "tx-3",
      merchant: "City Electric & Power",
      category: "Utilities",
      date: "Jul 22, 2026",
      amount: "-$185.20",
      type: "expense",
      wallet: "Family Vault",
      icon: <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
    },
    {
      id: "tx-4",
      merchant: "Quarterly Investment Yield",
      category: "Dividends",
      date: "Jul 20, 2026",
      amount: "+$1,840.00",
      type: "income",
      wallet: "Family Vault",
      icon: <PiggyBank className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
    },
  ];

  const categoryBreakdown = [
    { name: "Housing & Rent", percentage: 35, amount: "$1,850.00", color: "bg-emerald-600" },
    { name: "Groceries & Food", percentage: 22, amount: "$1,164.00", color: "bg-teal-500" },
    { name: "Utilities & Bills", percentage: 15, amount: "$793.00", color: "bg-amber-500" },
    { name: "Entertainment & Travel", percentage: 14, amount: "$740.00", color: "bg-indigo-500" },
    { name: "Subscriptions & Tools", percentage: 14, amount: "$740.00", color: "bg-slate-400" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-secondary px-3 py-1 text-xs font-semibold text-primary mb-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Family & Team Shared Vault
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Financial Dashboard
          </h1>
          <p className="mt-1 text-sm font-medium text-foreground-muted">
            Overview of overall balances, net worth, and recent activity across linked accounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/wallet"
            className="inline-flex items-center gap-2 rounded-xl bg-surface-secondary border border-border px-4 py-2.5 text-sm font-bold text-foreground transition-all hover:bg-border active:scale-98"
          >
            <Wallet className="h-4 w-4 text-primary" />
            Manage Wallets
          </Link>
          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-theme-sm transition-all hover:bg-primary-hover active:scale-98"
          >
            <Plus className="h-4 w-4" />
            Log Transaction
          </Link>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Net Worth"
          value="$128,450.00"
          subtitle="Across 4 active accounts"
          trend="+4.2%"
          trendType="up"
          icon={<Wallet className="h-5 w-5" />}
        />
        <MetricCard
          title="Monthly Income"
          value="$8,090.00"
          subtitle="Salary & Investment Yield"
          trend="+12.5%"
          trendType="up"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricCard
          title="Monthly Expenses"
          value="$5,287.00"
          subtitle="Budgeted cap: $6,500"
          trend="-3.1%"
          trendType="down"
          icon={<TrendingDown className="h-5 w-5" />}
        />
        <MetricCard
          title="Savings Rate"
          value="34.6%"
          subtitle="Goal target: 30.0%"
          trend="+4.6%"
          trendType="up"
          icon={<PiggyBank className="h-5 w-5" />}
        />
      </div>

      {/* Wallets Card Carousel / Grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Linked Wallets & Accounts
          </h2>
          <Link
            href="/wallet"
            className="text-xs font-bold text-primary hover:underline"
          >
            View All Wallets →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {wallets.map((w) => (
            <div
              key={w.name}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${w.color} p-5 text-white shadow-theme-md transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider opacity-80">
                  {w.type}
                </span>
                <span className="text-xs font-mono opacity-80">{w.number}</span>
              </div>
              <div className="mt-6">
                <div className="text-xs font-medium opacity-90">{w.name}</div>
                <div className="mt-1 text-2xl font-black tracking-tight tabular-nums">
                  {w.balance}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] opacity-75">
                <span>{w.bank}</span>
                <span className="font-semibold uppercase">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cash Flow Analytics & Category Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Spending Category Breakdown */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-theme-xs lg:col-span-1">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Spending Breakdown</h3>
              <p className="text-xs text-foreground-muted">Monthly expense allocation</p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary-soft px-2.5 py-1 rounded-full">
              July 2026
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {categoryBreakdown.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-foreground">{cat.name}</span>
                  <span className="text-foreground font-mono">{cat.amount} ({cat.percentage}%)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-secondary">
                  <div
                    className={`h-full ${cat.color} rounded-full transition-all`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-border bg-surface-secondary p-4 text-xs text-foreground-muted">
            <div className="flex items-center gap-2 font-semibold text-foreground mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              On Track with Family Budget
            </div>
            Expense allocation is 14% below your set monthly ceiling.
          </div>
        </div>

        {/* Recent Financial Transactions Feed */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-theme-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Recent Transactions</h3>
              <p className="text-xs text-foreground-muted">Real-time ledger updates across workspace</p>
            </div>
            <Link
              href="/wallet"
              className="text-xs font-bold text-primary hover:underline"
            >
              Full Ledger →
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-surface p-3.5 transition-colors hover:bg-surface-secondary/60"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-secondary">
                    {tx.icon}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">
                      {tx.merchant}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-foreground-muted">
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span className="rounded bg-surface-secondary px-1.5 py-0.5 text-[10px] font-semibold text-foreground-muted">
                        {tx.wallet}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-extrabold tabular-nums ${
                      tx.type === "income"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-foreground"
                    }`}
                  >
                    {tx.amount}
                  </div>
                  <div className="text-[11px] text-foreground-muted">
                    {tx.date}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Action Bar */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border">
            <button className="flex items-center justify-center gap-2 rounded-xl bg-surface-secondary px-3 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-primary-soft hover:text-primary">
              <Plus className="h-3.5 w-3.5" />
              Add Income
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl bg-surface-secondary px-3 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-primary-soft hover:text-primary">
              <ScanText className="h-3.5 w-3.5" />
              Scan Receipt
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl bg-surface-secondary px-3 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-primary-soft hover:text-primary">
              <CreditCard className="h-3.5 w-3.5" />
              Add Wallet
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl bg-surface-secondary px-3 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-primary-soft hover:text-primary">
              <Users className="h-3.5 w-3.5" />
              Invite Member
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
