import Link from "next/link";
import { ArrowRight, Star, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ReviewMitra</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm">
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8 border border-blue-100">
            <Star className="w-4 h-4" />
            <span>Built for Indian Businesses</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Reply to Google Reviews <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              in Seconds with AI
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Boost your local ranking and keep customers happy. ReviewMitra drafts personalized, human-sounding replies directly inside your Google Business page.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-blue-200">
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-sm">
              Install Chrome Extension
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-5xl mx-auto mt-32 grid md:grid-cols-3 gap-8">
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Works in your browser</h3>
            <p className="text-slate-600 leading-relaxed">A magic button appears directly on your Google Business page. No need to switch tabs or copy-paste between apps.</p>
          </div>

          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Speaks your language</h3>
            <p className="text-slate-600 leading-relaxed">Perfect English, natural Hinglish, or a mix of both. The AI adapts to match the tone of the customer's original review.</p>
          </div>

          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">You are in control</h3>
            <p className="text-slate-600 leading-relaxed">Never worry about bots posting wrong things. You review and approve every single reply before it goes live.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
