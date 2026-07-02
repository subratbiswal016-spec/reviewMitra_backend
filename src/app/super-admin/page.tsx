"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, UserPlus, LogOut, Eye, EyeOff } from "lucide-react";

export default function SuperAdminPage() {
  const [adminSecret, setAdminSecret] = useState("supersecret123");
  const [showSecret, setShowSecret] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [limit, setLimit] = useState(20);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editLimit, setEditLimit] = useState(20);

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
      const res = await fetch(`/api/admin/users?t=${Date.now()}`, {
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
      const res = await fetch(`/api/admin/settings?t=${Date.now()}`);
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

  const handleUpdateUser = async (userId: string) => {
    if (!adminSecret) return;
    try {
      const body: any = { userId, maxLimit: editLimit, email: editEmail };
      if (editPassword) body.password = editPassword;

      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-secret": adminSecret },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("Customer updated successfully!");
        setEditingUserId(null);
        fetchUsers(); // Refresh
      } else {
        alert("Failed to update customer: " + (data.error || ""));
      }
    } catch(err) {
      alert("Error updating customer");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!adminSecret) return;
    if (!confirm("Are you sure you want to delete this customer? This cannot be undone.")) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-secret": adminSecret },
        body: JSON.stringify({ userId })
      });
      
      if (res.ok) {
        alert("Customer deleted successfully!");
        fetchUsers(); // Refresh
      } else {
        alert("Failed to delete customer");
      }
    } catch(err) {
      alert("Error deleting customer");
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

  const handleDeleteQR = async () => {
    if (!adminSecret) return;
    if (!confirm("Are you sure you want to delete the QR code?")) return;
    try {
      const res = await fetch("/api/admin/settings", {
        method: "DELETE",
        headers: { "x-admin-secret": adminSecret }
      });
      if (res.ok) {
        alert("QR Code deleted successfully!");
        setQrUrl("");
      } else {
        alert("Failed to delete QR");
      }
    } catch (err) {
      alert("Error deleting QR");
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
      <nav className="bg-slate-900 text-white shadow-md py-4 px-6">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">ReviewMitra</span>
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md tracking-wider">SUPER ADMIN</span>
          </div>
          <nav>
            <div className="flex flex-wrap gap-2 md:gap-6 justify-center">
              <button 
                onClick={() => handleTabChange("create")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'create' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
              >
                <UserPlus size={18} />
                <span className="hidden sm:inline">Create Customer</span>
                <span className="sm:hidden">Create</span>
              </button>
              <button 
                onClick={() => handleTabChange("view")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'view' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
              >
                <Users size={18} />
                <span className="hidden sm:inline">View Customers</span>
                <span className="sm:hidden">View</span>
              </button>
              <button 
                onClick={() => handleTabChange("payment")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'payment' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
              >
                <span>💳</span>
                <span className="hidden sm:inline">Payment QR</span>
                <span className="sm:hidden">QR</span>
              </button>
              <Link href="/login" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors ml-0 md:ml-4 border border-slate-700">
                <LogOut size={18} />
                <span className="hidden sm:inline">Exit Admin</span>
                <span className="sm:hidden">Exit</span>
              </Link>
            </div>
          </nav>
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
                    autoComplete="new-password"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Customer Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. client@restaurant.com"
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
                    placeholder="e.g. securepass123"
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-slate-800">Customer List</h2>
              <div className="relative w-full sm:w-64">
                <input 
                  type="text" 
                  placeholder="Search by email..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>
            
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
                    {users.filter(user => user.email.toLowerCase().includes(searchQuery.toLowerCase())).map(user => (
                      <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        {editingUserId === user.id ? (
                          <td colSpan={4} className="py-4 px-4">
                            <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-100 p-4 rounded-lg">
                              <div className="flex-1 w-full">
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none text-sm focus:border-blue-500" />
                              </div>
                              <div className="flex-1 w-full">
                                <label className="block text-xs font-semibold text-slate-500 mb-1">New Password (leave blank to keep)</label>
                                <input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none text-sm focus:border-blue-500" placeholder="••••••••" />
                              </div>
                              <div className="w-24">
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Limit</label>
                                <input type="number" value={editLimit} onChange={e => setEditLimit(parseInt(e.target.value))} className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none text-sm focus:border-blue-500" />
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => handleUpdateUser(user.id)} className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-semibold hover:bg-blue-700">Save</button>
                                <button onClick={() => setEditingUserId(null)} className="bg-slate-300 text-slate-700 px-4 py-1.5 rounded text-sm font-semibold hover:bg-slate-400">Cancel</button>
                              </div>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td className="py-3 px-4 text-sm font-medium text-slate-800">{user.email}</td>
                            <td className="py-3 px-4 text-sm text-slate-600">
                              <div className="flex flex-col gap-1 w-32">
                                <div className="flex justify-between text-xs">
                                  <span>{user.subscription?.repliesGeneratedThisMonth || 0} used</span>
                                  <span className="font-semibold text-blue-600">
                                    {Math.min(100, Math.round(((user.subscription?.repliesGeneratedThisMonth || 0) / (user.subscription?.maxLimit || 20)) * 100)) || 0}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className={`h-1.5 rounded-full ${((user.subscription?.repliesGeneratedThisMonth || 0) / (user.subscription?.maxLimit || 20)) >= 1 ? 'bg-red-500' : 'bg-blue-500'}`}
                                    style={{ width: `${Math.min(100, Math.round(((user.subscription?.repliesGeneratedThisMonth || 0) / (user.subscription?.maxLimit || 20)) * 100)) || 0}%` }}
                                  ></div>
                                </div>
                              </div>
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
                              <div className="flex flex-col gap-2">
                                <button 
                                  onClick={() => {
                                    const el = document.getElementById(`limit-${user.id}`) as HTMLInputElement;
                                    handleUpdateLimit(user.id, parseInt(el.value));
                                  }}
                                  className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200 transition-colors"
                                >
                                  Save Limit
                                </button>
                                <button 
                                  onClick={() => {
                                    setEditingUserId(user.id);
                                    setEditEmail(user.email);
                                    setEditPassword("");
                                    setEditLimit(user.subscription?.maxLimit || 20);
                                  }}
                                  className="text-xs font-semibold bg-slate-200 text-slate-700 px-3 py-1.5 rounded hover:bg-slate-300 transition-colors"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-xs font-semibold bg-red-100 text-red-700 px-3 py-1.5 rounded hover:bg-red-200 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                    {users.filter(user => user.email.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-slate-500">No customers found matching your search.</td>
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
            <p className="text-slate-500 mb-8">Upload a photo of your UPI QR Code. All customers will see this in their billing dashboard. (It is saved securely in the database).</p>
            
            <form onSubmit={handleSaveQR} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Upload QR Code Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setQrUrl(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {qrUrl && (
                <div className="mt-4 border border-slate-200 p-2 rounded-lg inline-block bg-slate-50">
                  <p className="text-xs text-slate-500 mb-2 text-center">Preview:</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt="QR Preview" className="max-w-[200px] rounded" />
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors mt-4 shadow-md"
                >
                  Save QR Code
                </button>
                {qrUrl && (
                  <button
                    type="button"
                    onClick={handleDeleteQR}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 rounded-xl transition-colors mt-4 shadow-md"
                  >
                    Delete QR Code
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
