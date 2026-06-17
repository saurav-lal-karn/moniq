import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Dashboard | Moniq",
  description: "Dashboard page",
};

export default function Dashboard() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        Hello from Admin
      </h1>
    </div>
  );
}
