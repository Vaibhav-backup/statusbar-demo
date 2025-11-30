import React from 'react';
import { Button } from './Button';
import { Zap, Brain, Sparkles, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-8 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <Zap className="text-black w-3 h-3 fill-current" />
          </div>
          <span className="text-lg font-bold tracking-tight">Statusbar.</span>
        </div>
        <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-sm font-medium" onClick={onGetStarted}>Sign In</Button>
            <Button variant="primary" onClick={onGetStarted} className="px-6">Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-24 pb-32 relative overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10"></div>
        
        <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm text-xs font-medium text-zinc-400 mb-8 animate-fade-in">
                <Sparkles className="w-3 h-3" />
                <span>Powered by Gemini 2.5</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-medium tracking-tighter mb-8 leading-[1.1] bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
              Master your time.<br />
              Own the narrative.
            </h1>
            
            <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              The minimalist AI planner designed to align your schedule with your energy. Stop grinding, start flowing.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={onGetStarted} className="h-14 px-10 text-lg rounded-full">
                 Initialize
                 <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
        </div>
      </section>

      {/* Feature Grid - Minimal */}
      <section className="border-t border-zinc-900 bg-zinc-950 py-32">
        <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12">
                <div className="group">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-white transition-colors duration-500">
                        <Brain className="w-5 h-5 text-white group-hover:text-black transition-colors" />
                    </div>
                    <h3 className="text-xl font-medium mb-3 text-zinc-100">Intelligent Batching</h3>
                    <p className="text-zinc-500 leading-relaxed font-light">
                        Our algorithm understands context. It groups similar cognitive tasks to minimize context switching overhead.
                    </p>
                </div>
                <div className="group">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-white transition-colors duration-500">
                        <Zap className="w-5 h-5 text-white group-hover:text-black transition-colors" />
                    </div>
                    <h3 className="text-xl font-medium mb-3 text-zinc-100">Energy Alignment</h3>
                    <p className="text-zinc-500 leading-relaxed font-light">
                        We map high-focus tasks to your peak performance hours, ensuring you're not swimming upstream.
                    </p>
                </div>
                <div className="group">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-white transition-colors duration-500">
                        <Sparkles className="w-5 h-5 text-white group-hover:text-black transition-colors" />
                    </div>
                    <h3 className="text-xl font-medium mb-3 text-zinc-100">Visual Insights</h3>
                    <p className="text-zinc-500 leading-relaxed font-light">
                        Turn your daily agenda into aesthetic, high-contrast infographics with a single click.
                    </p>
                </div>
            </div>
        </div>
      </section>

      <footer className="bg-black py-12 border-t border-zinc-900 text-center text-zinc-600 text-sm font-medium tracking-wide">
        <p>STATUSBAR &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};