"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, UserPlus, LogOut, Eye, EyeOff } from "lucide-react";

export default function SuperAdminPage() {
  const [adminSecret, setAdminSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [limit, setLimit] = useState(20);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [users, setUsers] = useState<any[]>([]);
  const [qrUrl, setQrUrl] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  
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

  const fetchUsers = async () => {
    if (!adminSecret) {
      alert("Please enter the Admin Secret in the Create tab first!");
      return;
    }
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users", {
        headers: { "x-admin-secret": adminSecret }
      });
      const data = await res.json();
      if (data.users) setUsers(data.users);
      else alert(data.error || "Failed to fetch users");
    } catch(err) {
      alert("Error fetching users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.url) setQrUrl(data.url);
    } catch(err) {
      console.log(err);
    }
  };

  const handleUpdateLimit = async (userId: string, newLimit: number) => {
    if (!adminSecret) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-secret": adminSecret },
        body: JSON.stringify({ userId, maxLimit: newLimit })
      });
      if (res.ok) {
        alert("Limit updated successfully!");
        fetchUsers(); // Refresh
      } else {
        alert("Failed to update limit");
      }
    } catch(err) {
      alert("Error updating limit");
    }
  };

  const handleSaveQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminSecret) {
      alert("Please enter the Admin Secret in the Create tab first!");
      return;
    }
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": adminSecret },
        body: JSON.stringify({ url: qrUrl })
      });
      if (res.ok) {
        alert("QR Code URL saved successfully!");
      } else {
        alert("Failed to save QR URL");
      }
    } catch(err) {
      alert("Error saving QR URL");
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "view") fetchUsers();
    if (tab === "payment") fetchSettings();
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
                onClick={() => handleTabChange("create")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'create' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
              >
                <UserPlus size={18} />
                Create Customer
              </button>
              <button 
                onClick={() => handleTabChange("view")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'view' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
              >
                <Users size={18} />
                View Customers
              </button>
              <button 
                onClick={() => handleTabChange("payment")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'payment' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
              >
                <span>💳</span>
                Payment QR
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
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    required
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                    placeholder="Enter super admin secret"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
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
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Customer List</h2>
            
            {loadingUsers ? (
              <p className="text-center text-slate-500">Loading customers...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-3 px-4 font-semibold text-sm text-slate-600">Email</th>
                      <th className="py-3 px-4 font-semibold text-sm text-slate-600">Usage</th>
                      <th className="py-3 px-4 font-semibold text-sm text-slate-600">Limit</th>
                      <th className="py-3 px-4 font-semibold text-sm text-slate-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm font-medium text-slate-800">{user.email}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {user.subscription?.repliesGeneratedThisMonth || 0} used
                        </td>
                        <td className="py-3 px-4">
                          <input 
                            type="number" 
                            defaultValue={user.subscription?.maxLimit || 20}
                            className="w-20 px-2 py-1 border border-slate-300 rounded text-sm outline-none focus:border-blue-500"
                            id={`limit-${user.id}`}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => {
                              const el = document.getElementById(`limit-${user.id}`) as HTMLInputElement;
                              handleUpdateLimit(user.id, parseInt(el.value));
                            }}
                            className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200 transition-colors"
                          >
                            Save
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-slate-500">No customers found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "payment" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Global Payment QR Code</h2>
            <p className="text-slate-500 mb-8">Paste the image URL of your UPI QR Code. All customers will see this in their billing dashboard.</p>
            
            <form onSubmit={handleSaveQR} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">QR Code Image URL</label>
                <input
                  type="url"
                  required
                  value={qrUrl}
                  onChange={(e) => setQrUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://i.imgur.com/your-qr-code.png"
                />
              </div>

              {qrUrl && (
                <div className="mt-4 border border-slate-200 p-2 rounded-lg inline-block bg-slate-50">
                  <p className="text-xs text-slate-500 mb-2 text-center">Preview:</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt="QR Preview" className="max-w-[200px] rounded" />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors mt-4 shadow-md"
              >
                Save QR Code
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
