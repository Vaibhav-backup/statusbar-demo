import React from 'react';
import { Button } from './Button';
import { Zap, Brain, Sparkles, Rocket } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30 font-sans">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="text-white w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight">Statusbar</span>
        </div>
        <Button variant="ghost" onClick={onGetStarted}>Log In</Button>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-32 text-center relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] -z-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px] -z-10 ml-32"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-emerald-400 mb-8 animate-fade-in-up">
            <Sparkles className="w-3 h-3" />
            <span>Powered by Gemini 2.5 Flash</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
          Stop Doomscrolling.<br />
          <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Start Main Character Energy.</span>
        </h1>
        
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          The AI planner that helps you lock in, touch grass, and secure the bag. 
          Optimizes your day based on your actual energy levels. No cap.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={onGetStarted} className="h-12 px-8 text-lg w-full sm:w-auto">
             Enter The Mainframe
             <Rocket className="w-5 h-5" />
          </Button>
          <Button variant="secondary" className="h-12 px-8 text-lg w-full sm:w-auto">
             View Demo
          </Button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-slate-900 border-t border-slate-800 py-24">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Why we're distinct</h2>
                <p className="text-slate-400">Not your average boomer calendar app.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6">
                        <Brain className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Vibe-Based Scheduling</h3>
                    <p className="text-slate-400 leading-relaxed">
                        We know when you're cooked. Statusbar batches tasks around your peak energy so you don't burnout.
                    </p>
                </div>
                <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
                        <Zap className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Academic Weapon Mode</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Got a deadline? We'll restructure your entire day to ensure you secure that W.
                    </p>
                </div>
                <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Hype Notifications</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Motivational nudges that actually sound like a human, not a robot. We keep it 100.
                    </p>
                </div>
            </div>
        </div>
      </section>

      <footer className="bg-slate-950 py-12 border-t border-slate-900 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Statusbar. Built for the plot.</p>
      </footer>
    </div>
  );
};