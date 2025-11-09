"use client";
import { SignInButton } from "@clerk/nextjs";
import { Sparkles, Zap, TrendingUp, CheckCircle2, Target, Award, Brain, Rocket, Star, Trophy, BarChart3, Clock, Play } from "lucide-react";
import { IconFlask } from "@tabler/icons-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200/60 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <span className="text-2xl">🧪</span>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900">MetaLLab</span>
              <p className="text-xs text-slate-600">Science Experiments</p>
            </div>
          </div>
          <SignInButton mode="redirect">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
              Get Started
              <Rocket className="w-4 h-4" />
            </button>
          </SignInButton>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full mb-8 shadow-lg">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-bold">Virtual Lab Simulations</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
              Perform Real Experiments
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                Without a Lab
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto mb-10 leading-relaxed">
              Interactive simulations for high school and college students. 
              Real-time experiments with GPU acceleration. From quantum mechanics to thermodynamics—experience science at your fingertips.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <SignInButton mode="redirect">
                <button className="group px-10 py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg transition-all shadow-2xl hover:shadow-3xl hover:-translate-y-1 flex items-center justify-center gap-3">
                  Start Learning Free
                  <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignInButton>
              <button className="group px-10 py-5 bg-white hover:bg-gray-50 text-slate-900 border-2 border-gray-200 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { 
                icon: <Brain className="w-8 h-8" />, 
                title: "GPU-Powered Simulations", 
                desc: "Real-time calculations with frame-by-frame analysis",
                color: "from-blue-500 to-cyan-500"
              },
              { 
                icon: <Target className="w-8 h-8" />, 
                title: "Difficult Experiments", 
                desc: "Perform experiments too dangerous or expensive for real labs",
                color: "from-purple-500 to-pink-500"
              },
              { 
                icon: <Trophy className="w-8 h-8" />, 
                title: "Gamified Learning", 
                desc: "Track progress, earn achievements, and level up",
                color: "from-amber-500 to-orange-500"
              }
            ].map((feature, i) => (
              <div key={i} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-200/60 hover:border-blue-300 transition-all hover:-translate-y-2">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white border-y border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <Award className="w-8 h-8 text-blue-600" />, value: "10K+", label: "Active Students", bg: "bg-blue-50" },
              { icon: <Brain className="w-8 h-8 text-purple-600" />, value: "50+", label: "Experiments", bg: "bg-purple-50" },
              { icon: <Trophy className="w-8 h-8 text-amber-600" />, value: "98%", label: "Success Rate", bg: "bg-amber-50" },
              { icon: <Star className="w-8 h-8 text-emerald-600" />, value: "4.9★", label: "User Rating", bg: "bg-emerald-50" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className={`w-16 h-16 ${stat.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  {stat.icon}
                </div>
                <div className="text-4xl font-black text-slate-900 mb-2">{stat.value}</div>
                <div className="text-sm font-semibold text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-slate-900 mb-4">Why Choose MetaLLab?</h2>
            <p className="text-xl text-slate-600">Everything you need for virtual science experiments</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Zap className="w-6 h-6" />, title: "Real-time Physics Engine", desc: "GPU-accelerated calculations for smooth simulations", color: "bg-blue-500" },
              { icon: <Clock className="w-6 h-6" />, title: "Frame-by-Frame Analysis", desc: "Slow motion replay and detailed observations", color: "bg-purple-500" },
              { icon: <Target className="w-6 h-6" />, title: "Interactive 3D Environments", desc: "Manipulate variables and see instant results", color: "bg-pink-500" },
              { icon: <BarChart3 className="w-6 h-6" />, title: "Progress Tracking", desc: "Monitor your learning journey with detailed analytics", color: "bg-emerald-500" },
              { icon: <Trophy className="w-6 h-6" />, title: "Achievement System", desc: "Unlock badges and rewards as you learn", color: "bg-amber-500" },
              { icon: <Brain className="w-6 h-6" />, title: "Personalized Learning", desc: "Adaptive difficulty based on your progress", color: "bg-cyan-500" }
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl border border-gray-200/60 hover:border-blue-300 transition-all hover:-translate-y-1 group">
                <div className={`w-12 h-12 ${feature.color} rounded-xl text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experiments Showcase */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-slate-900 mb-4">Featured Experiments</h2>
            <p className="text-xl text-slate-600">From quantum mechanics to classical physics</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Rutherford's Gold Foil", difficulty: "Advanced", time: "15-20 min", color: "from-red-500 to-pink-500", icon: "🔬", bg: "bg-red-50" },
              { title: "Young's Double Slit", difficulty: "Intermediate", time: "10-15 min", color: "from-blue-500 to-cyan-500", icon: "🌊", bg: "bg-blue-50" },
              { title: "Photoelectric Effect", difficulty: "Beginner", time: "8-12 min", color: "from-green-500 to-teal-500", icon: "💡", bg: "bg-green-50" }
            ].map((exp, i) => (
              <div key={i} className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-gray-200/60 hover:border-blue-300 transition-all cursor-pointer hover:-translate-y-2">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${exp.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-4xl shadow-lg`}>
                  {exp.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{exp.title}</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${exp.bg} text-slate-900`}>
                    {exp.difficulty}
                  </span>
                  <span className="text-sm text-slate-600 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {exp.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-12 md:p-16 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
            <div className="relative">
              <h2 className="text-5xl md:text-6xl font-black mb-6">Ready to Start Learning?</h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Join thousands of students mastering science through interactive simulations
              </p>
              <SignInButton mode="redirect">
                <button className="px-12 py-5 bg-white text-slate-900 hover:bg-gray-100 rounded-2xl font-bold text-xl transition-all shadow-2xl hover:shadow-3xl hover:-translate-y-1 inline-flex items-center gap-3">
                  Start Your Free Trial
                  <Rocket className="w-6 h-6" />
                </button>
              </SignInButton>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center text-slate-600">
          <p className="font-semibold">© 2025 MetaLLab. Making science education accessible to everyone.</p>
        </div>
      </footer>
    </div>
  );
}