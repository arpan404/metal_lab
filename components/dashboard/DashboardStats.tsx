import React from "react";
import { FlaskConical, Trophy, Clock, TrendingUp } from "lucide-react";

const stats = [
  { label: "Experiments Completed", value: "12", icon: FlaskConical, gradient: "from-blue-500 to-cyan-500" },
  { label: "Lab Hours", value: "8.5", icon: Clock, gradient: "from-emerald-500 to-teal-500" },
  { label: "Achievement Points", value: "245", icon: Trophy, gradient: "from-amber-500 to-orange-500" },
  { label: "Progress", value: "68%", icon: TrendingUp, gradient: "from-purple-500 to-pink-500" },
];

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden group hover:-translate-y-1"
        >
          {/* Gradient background on hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
          
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            </div>
            <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}