import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Dashboard | Moniq",
  description: "Dashboard page",
};

function StatCard({
  title,
  value,
  change,
  changeType,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}) {
  const changeColor =
    changeType === "positive"
      ? "text-success"
      : changeType === "negative"
        ? "text-danger"
        : "text-foreground-muted";

  return (
    <div className="rounded-xl border border-border bg-surface p-6 transition-shadow hover:shadow-theme-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-foreground-muted">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
          <p className={`mt-2 text-sm ${changeColor}`}>{change}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-soft text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}

function RecentActivityCard() {
  const activities = [
    {
      id: 1,
      action: "New user registered",
      time: "2 minutes ago",
      type: "success",
    },
    {
      id: 2,
      action: "Payment received",
      time: "15 minutes ago",
      type: "success",
    },
    {
      id: 3,
      action: "Server alert triggered",
      time: "1 hour ago",
      type: "warning",
    },
    {
      id: 4,
      action: "Report generated",
      time: "3 hours ago",
      type: "info",
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
      <div className="mt-4 space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
          >
            <div className="flex items-center gap-3">
              <div
                className={`h-2 w-2 rounded-full ${
                  activity.type === "success"
                    ? "bg-success"
                    : activity.type === "warning"
                      ? "bg-warning"
                      : "bg-info"
                }`}
              />
              <span className="text-sm text-foreground">{activity.action}</span>
            </div>
            <span className="text-xs text-foreground-muted">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActionsCard() {
  const actions = [
    { label: "Add User", icon: "+" },
    { label: "Create Report", icon: "+" },
    { label: "View Analytics", icon: "+" },
    { label: "Settings", icon: "+" },
  ];

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            className="flex items-center justify-center gap-2 rounded-lg bg-surface-secondary px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-primary-soft hover:text-primary"
          >
            <span className="text-lg">{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-foreground-muted">
          Welcome back! Here&apos;s an overview of your account.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="$45,231"
          change="+20.1% from last month"
          changeType="positive"
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatCard
          title="Active Users"
          value="2,350"
          change="+180 new users"
          changeType="positive"
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />
        <StatCard
          title="Pending Tasks"
          value="12"
          change="3 due today"
          changeType="neutral"
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          }
        />
        <StatCard
          title="System Health"
          value="98.5%"
          change="All systems operational"
          changeType="positive"
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Secondary Cards Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivityCard />
        <QuickActionsCard />
      </div>

      {/* Full Width Card */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Performance Overview
          </h3>
          <div className="flex gap-2">
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover">
              View Report
            </button>
            <button className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-secondary">
              Export
            </button>
          </div>
        </div>
        <div className="mt-6 flex h-64 items-center justify-center rounded-lg bg-surface-secondary">
          <p className="text-foreground-muted">Chart placeholder</p>
        </div>
      </div>
    </div>
  );
}
