"use client";
import React from "react";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ExperimentGrid from "@/components/dashboard/ExperimentGrid";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🧪 Physics Virtual Lab
          </h1>
          <p className="text-gray-600 text-lg">
            Explore quantum mechanics and classical physics through interactive simulations
          </p>
        </div>

        {/* Stats */}
        <DashboardStats />

        {/* Experiments Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Experiments</h2>
        </div>
        
        <ExperimentGrid />
      </div>
    </div>
  );
}