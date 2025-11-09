"use client";

import React, { useState } from "react";
import { LabCard } from "@/components/labs/lab-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/app-store";
import {
  Filter,
  Search,
  Sparkles,
  TrendingUp,
  Target,
  Lock,
  CheckCircle,
  Play,
  Layers,
  Award,
  ArrowRight,
} from "lucide-react";
import {
  IconFlask,
  IconAtom,
  IconChartBar,
  IconTrophy,
  IconLock,
  IconPlayerPlay,
} from "@tabler/icons-react";

export default function LabsPage() {
  const { labs, stats: userStats } = useAppStore();
  const [filter, setFilter] = useState<
    "all" | "completed" | "in-progress" | "locked"
  >("all");

  const filteredLabs = labs.filter((lab) => {
    if (filter === "all") return true;
    return lab.status === filter;
  });

  const completedCount = labs.filter((l) => l.status === "completed").length;
  const inProgressCount = labs.filter((l) => l.status === "in-progress").length;
  const lockedCount = labs.filter((l) => l.status === "locked").length;

  const statsDisplay = [
    {
      icon: <CheckCircle className="h-6 w-6" />,
      label: "Completed Labs",
      value: completedCount,
      iconBg: "bg-emerald-500",
      trend: { value: "+3 this month", positive: true },
    },
    {
      icon: <Play className="h-6 w-6" />,
      label: "In Progress",
      value: inProgressCount,
      iconBg: "bg-amber-500",
      description: "Keep going!",
    },
    {
      icon: <Layers className="h-6 w-6" />,
      label: "Total Labs",
      value: labs.length,
      iconBg: "bg-blue-500",
      description: `${lockedCount} locked`,
    },
  ];

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-lg">
                <IconFlask className="w-5 h-5" />
              </div>
              <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                <Sparkles className="w-3 h-3 mr-1" />
                {labs.length} Labs Available
              </Badge>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
              Interactive Labs
            </h1>
            <p className="text-lg text-slate-600">
              Dive into hands-on virtual labs that bring any concept to life
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsDisplay.map((stat, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-gray-200/60 overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.iconBg} text-white flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg`}
                  >
                    {stat.icon}
                  </div>
                  {stat.trend && (
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-50">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stat.trend.value}
                    </Badge>
                  )}
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-slate-600 mb-1">
                  {stat.label}
                </div>
                {stat.description && (
                  <div className="text-xs text-slate-500 mt-2">
                    {stat.description}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Tabs */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900">
                Explore Labs
              </h2>
              <Badge variant="outline" className="text-xs">
                {filteredLabs.length}{" "}
                {filter === "all" ? "total" : filter.replace("-", " ")}
              </Badge>
            </div>
            <Tabs
              value={filter}
              onValueChange={(value) => setFilter(value as any)}
            >
              <TabsList className="grid grid-cols-4 w-fit">
                <TabsTrigger value="all" className="gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  All ({labs.length})
                </TabsTrigger>
                <TabsTrigger value="in-progress" className="gap-1.5">
                  <IconPlayerPlay className="w-3.5 h-3.5" />
                  Active ({inProgressCount})
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Done ({completedCount})
                </TabsTrigger>
                <TabsTrigger value="locked" className="gap-1.5">
                  <IconLock className="w-3.5 h-3.5" />
                  Locked ({lockedCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {filteredLabs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLabs.map((lab) => (
                <LabCard key={lab.id} lab={lab} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed border-2">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No labs found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters to see more results
              </p>
              <Button variant="outline" onClick={() => setFilter("all")}>
                View All Labs
              </Button>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
