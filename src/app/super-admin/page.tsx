"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, UserPlus, LogOut } from "lucide-react";

export default function SuperAdminPage() {
  const [adminSecret, setAdminSecret] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [limit, setLimit] = useState(20);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState("create");

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminSecret, email, password, limit }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage("✅ " + data.message);
        setEmail("");
        setPassword("");
      } else {
        setMessage("❌ " + (data.error || "Failed to create account"));
      }
    } catch (err) {
      setMessage("❌ An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👑</span>
              <span className="font-bold text-lg tracking-wide">ReviewMitra Super Admin</span>
            </div>
            
            <div className="flex gap-6">
              <button 
                onClick={() => setActiveTab("create")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'create' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
              >
                <UserPlus size={18} />
                Create Customer
              </button>
              <button 
                onClick={() => setActiveTab("view")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'view' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
              >
                <Users size={18} />
                View Customers
              </button>
              <Link href="/login" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors ml-4 border border-slate-700">
                <LogOut size={18} />
                Exit Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto mt-10 p-4">
        
        {activeTab === "create" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Create Customer Account</h2>
            <p className="text-slate-500 mb-8">Generate a new account and password to hand over to your paying customer.</p>

            <form onSubmit={handleCreateUser} className="space-y-5">
              
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-1">Admin Secret Password</label>
                <p className="text-xs text-slate-500 mb-3">Required to prove you are the owner.</p>
                <input
                  type="password"
                  required
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter super admin secret"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Customer Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="customer@restaurant.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assign Password</label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="securepass123"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Free Trial Limit (Generations)</label>
                <input
                  type="number"
                  required
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm font-medium ${message.includes("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 mt-4 shadow-md"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "view" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <Users size={48} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Customer List Coming Soon</h2>
            <p className="text-slate-500">In the future, you will see a list of all your customers and their usage here.</p>
          </div>
        )}

      </div>
    </div>
  );
}
