"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Settings, CreditCard } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile State
  const [profileData, setProfileData] = useState({
    name: "", city: "", type: "", phone: "", tone: "Professional", language: "English", rules: ""
  });
  const [businessId, setBusinessId] = useState("");
  const [subscription, setSubscription] = useState<any>(null);
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      // Fetch profile data
      fetch("/api/business")
        .then(res => res.json())
        .then(data => {
          if (data.business) {
            setProfileData({
              name: data.business.name || "",
              city: data.business.city || "",
              type: data.business.type || "",
              phone: data.business.phone || "",
              tone: data.business.tone || "Professional",
              language: data.business.language || "English",
              rules: data.business.rules || ""
            });
            setBusinessId(data.business.id);
          }
          if (data.subscription) {
            setSubscription(data.subscription);
          }
        });

      // Fetch payment QR Code
      fetch("/api/admin/settings")
        .then(res => res.json())
        .then(data => {
          if (data.url) setQrUrl(data.url);
        });
    }
  }, [status, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Profile saved successfully!");
        setBusinessId(data.business.id);
      } else {
        setMessage(data.error || "Failed to save profile");
      }
    } catch (err) {
      setMessage("An error occurred");
    } finally {
      setLoading(false);
    }
  };


  // No duplicate useEffect here

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col md:min-h-screen">
        <div className="p-6 border-b border-slate-200 flex items-center gap-2">
          <span className="text-xl">✨</span>
          <span className="font-bold text-slate-800">ReviewMitra</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 flex flex-col sm:flex-row md:flex-col sm:gap-2 md:gap-0">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "profile" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <Settings className="w-5 h-5" />
            Business Profile
          </button>
          
          <button
            onClick={() => setActiveTab("billing")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "billing" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <CreditCard className="w-5 h-5" />
            Billing & Usage
          </button>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">
            {activeTab === "profile" ? "Business Profile Settings" : "Billing & Usage"}
          </h1>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            {activeTab === "profile" && (
              <div className="space-y-4">
                <p className="text-slate-500 mb-6">Set up your business details here to customize how the AI replies to your reviews.</p>
                
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {message && <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">{message}</div>}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
                      <input required type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500" placeholder="e.g. Writer's Cafe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Business Type</label>
                      <input required type="text" value={profileData.type} onChange={(e) => setProfileData({...profileData, type: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500" placeholder="e.g. Cafe, Salon" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                      <input required type="text" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500" placeholder="e.g. +91 9876543210" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                      <input required type="text" value={profileData.city} onChange={(e) => setProfileData({...profileData, city: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500" placeholder="e.g. Mumbai" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Reply Tone</label>
                      <select value={profileData.tone} onChange={(e) => setProfileData({...profileData, tone: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500">
                        <option value="Professional">Professional</option>
                        <option value="Warm & Friendly">Warm & Friendly</option>
                        <option value="Playful">Playful</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
                      <select value={profileData.language} onChange={(e) => setProfileData({...profileData, language: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500">
                        <option value="English">English only</option>
                        <option value="Hinglish">Hinglish</option>
                        <option value="Match Reviewer">Match reviewer's language</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Custom Rules (Optional)</label>
                    <textarea 
                      value={profileData.rules} 
                      onChange={(e) => setProfileData({...profileData, rules: e.target.value})} 
                      className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 h-24" 
                      placeholder="e.g. Always thank them for visiting, never promise free items."
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6 pt-4 border-t border-slate-100 gap-4">
                    <div className="w-full sm:w-auto overflow-hidden">
                      <label className="block text-sm font-bold text-slate-800">Your Business ID</label>
                      <p className="text-xs text-slate-500">Copy this into your Chrome Extension</p>
                      <code className="mt-1 block bg-slate-100 px-3 py-1 rounded text-sm text-blue-600 font-mono truncate max-w-[200px] sm:max-w-[300px]">
                        {businessId || "Save profile to get ID"}
                      </code>
                    </div>
                    
                    <button type="submit" disabled={loading} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      {loading ? "Saving..." : "Save Settings"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "billing" && (
              <div>
                <p className="text-slate-500 mb-6">Manage your subscription and view your remaining credits.</p>
                
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-lg mb-6 gap-4">
                  <div>
                    <h3 className="font-semibold text-blue-900 capitalize">{subscription?.status || 'Trial'} Plan</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      {subscription ? Math.max(0, (subscription.maxLimit || 20) - subscription.repliesGeneratedThisMonth) : 20} replies remaining
                    </p>
                  </div>
                  {qrUrl && (
                    <div className="text-center bg-white p-3 rounded-lg border border-blue-200 shadow-sm">
                      <p className="text-xs font-bold text-slate-700 mb-2">Scan to Upgrade/Renew Limit</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrUrl} alt="Payment QR" className="w-32 h-32 object-cover mx-auto rounded-md border border-slate-100" />
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-800 mb-4">Usage Details</h4>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600 text-sm">Allocated Limit</span>
                    <span className="font-medium">{subscription?.maxLimit || 20}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600 text-sm">Used</span>
                    <span className="font-medium text-blue-600">{subscription?.repliesGeneratedThisMonth || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600 text-sm">Remaining</span>
                    <span className="font-medium text-green-600">{subscription ? Math.max(0, (subscription.maxLimit || 20) - subscription.repliesGeneratedThisMonth) : 20}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
