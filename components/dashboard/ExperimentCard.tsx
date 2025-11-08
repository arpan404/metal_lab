import React from "react";
import { FlaskConical, Zap, Atom, Waves } from "lucide-react";

interface ExperimentCardProps {
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  icon: "flask" | "zap" | "atom" | "waves";
  isNew?: boolean;
}

const iconMap = {
  flask: FlaskConical,
  zap: Zap,
  atom: Atom,
  waves: Waves,
};

export default function ExperimentCard({
  title,
  description,
  difficulty,
  duration,
  icon,
  isNew = false,
}: ExperimentCardProps) {
  const Icon = iconMap[icon];
  
  const difficultyColors = {
    Beginner: "bg-green-100 text-green-700 border-green-200",
    Intermediate: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Advanced: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 cursor-pointer border-2 border-gray-100 hover:border-blue-400 hover:-translate-y-1 relative overflow-hidden group">
      {isNew && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-blue-500 text-white text-xs font-bold px-4 py-2 rounded-bl-xl shadow-md">
          ✨ NEW
        </div>
      )}
      
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl group-hover:from-blue-100 group-hover:to-blue-200 transition-all shadow-sm">
          <Icon className="w-7 h-7 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${difficultyColors[difficulty]}`}>
          {difficulty}
        </span>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <span className="text-base">⏱️</span> {duration}
        </span>
      </div>
      
      <div className="pt-4 border-t-2 border-gray-100">
        <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2 group-hover:gap-3 transition-all">
          Start Experiment 
          <span className="text-lg">→</span>
        </button>
      </div>
    </div>
  );
}