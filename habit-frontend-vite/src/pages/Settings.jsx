import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import { getMe, updateMe } from "../services/api";
import { useNavigate } from "react-router-dom";

// Custom Toggle Switch Component
function ToggleSwitch({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col pr-4">
        <span className="text-[15px] font-bold text-gray-900">{label}</span>
        <span className="text-[13px] text-gray-500 font-medium">{description}</span>
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
        <div className="w-12 h-6.5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-[#8a5126]"></div>
      </label>
    </div>
  );
}

export default function Settings() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);

  // Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("Digital product designer exploring the intersection of mindfulness and productivity. Building better habits, one day at a time.");
  const [dailyTarget, setDailyTarget] = useState(8);
  const [weeklyGoal, setWeeklyGoal] = useState(85);

  // Toggle States
  const [twoFactor, setTwoFactor] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailReports, setEmailReports] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);

  useEffect(() => {
    getMe(token).then((data) => {
      setMe(data);
      if (data) {
        setFullName(data.username || "");
        setEmail(data.email || "");
        setBio(data.bio || "");
      }
    }).catch(console.error);
  }, [token]);

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("username", fullName.trim());
      formData.append("bio", bio.trim());
      if (avatarFile) formData.append("avatar", avatarFile);
      const data = await updateMe(token, formData);
      setMe(data.user);
      setAvatarFile(null);
      setAvatarPreview("");
    } catch (err) {
      alert(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex bg-[#f9f9f8] min-h-screen font-sans text-[#2f3333]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64 relative">
        
        {/* ── TOP APP BAR ── */}
        <header className="w-full sticky top-0 z-40 bg-[#f9f9f8]/90 backdrop-blur-xl flex justify-between items-center px-10 py-6 border-b border-gray-100">
          <div className="hidden md:flex flex-1 max-w-md bg-white border border-gray-200 rounded-full px-5 py-3 items-center gap-3 shadow-sm ml-auto">
            <span className="material-symbols-outlined text-gray-400">search</span>
            <input className="bg-transparent border-none focus:ring-0 text-[15px] font-bold w-full outline-none text-gray-700 placeholder-gray-400" placeholder="Search settings..." type="text"/>
          </div>
          <div className="flex items-center gap-6 ml-6">
            <button className="relative text-gray-400 hover:text-gray-800 transition-colors w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[24px]">notifications</span>
            </button>
            <div className="hidden md:flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="text-right">
                <p className="text-[15px] font-black text-gray-900 leading-tight">{me?.username || "User"}</p>
                <p className="text-[12px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Free Member</p>
              </div>
              <div className="w-12 h-12 rounded-full overflow-hidden border-[3px] border-[#ffb380] shadow-sm cursor-pointer">
                {me?.avatar ? <img src={`http://localhost:3000${me.avatar}`} className="w-full h-full object-cover" alt="User" /> : <div className="w-full h-full bg-[#8a5126] flex items-center justify-center text-white font-black text-[20px]">{me?.username?.[0]?.toUpperCase()}</div>}
              </div>
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT ── */}
        <main className="p-8 lg:p-12 max-w-[1400px] w-full mx-auto overflow-y-auto pb-32">
          
          <header className="mb-12">
            <h1 className="text-[44px] lg:text-[52px] font-black tracking-tight text-[#8a5126] mb-2 leading-none">Settings</h1>
            <p className="text-[#5c605f] text-[18px] font-medium">Personalize your HabitPulse journey and account preferences.</p>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            
            {/* ── LEFT COLUMN (Profile, Goals, Security) ── */}
            <div className="xl:col-span-8 flex flex-col gap-10">
              
              {/* Profile Card */}
              <div className="bg-white p-10 rounded-[40px] shadow-[0_20px_40px_rgba(47,51,51,0.04)] border border-gray-50">
                <div className="flex flex-col md:flex-row items-start gap-10">
                  <div className="relative group shrink-0">
                    <div className="w-36 h-36 rounded-full overflow-hidden border-[6px] border-[#ffb380] bg-gray-200 shadow-sm">
                      {avatarPreview ? (
                        <img src={avatarPreview} className="w-full h-full object-cover" alt="Profile preview" />
                      ) : me?.avatar ? (
                        <img src={`http://localhost:3000${me.avatar}`} className="w-full h-full object-cover" alt="Profile" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-gray-300 to-gray-100"></div>
                      )}
                    </div>
                    <label className="absolute bottom-1 right-1 bg-[#8a5126] text-white w-11 h-11 rounded-full flex items-center justify-center border-[4px] border-white shadow-md hover:scale-105 transition-transform cursor-pointer">
                      <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div className="flex flex-col gap-2.5">
                      <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                      <input 
                        className="w-full bg-[#f3f4f3] border-none rounded-2xl p-4 text-[16px] font-bold text-gray-900 focus:ring-2 focus:ring-[#ffb380] transition-all outline-none" 
                        type="text" 
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2.5">
                      <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                      <input 
                        className="w-full bg-[#f3f4f3] border-none rounded-2xl p-4 text-[16px] font-bold text-gray-900 focus:ring-2 focus:ring-[#ffb380] transition-all outline-none" 
                        type="email" 
                        value={email}
                        disabled
                      />
                    </div>
                    <div className="flex flex-col gap-2.5 md:col-span-2">
                      <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">Short Bio</label>
                      <textarea 
                        className="w-full bg-[#f3f4f3] border-none rounded-2xl p-4 text-[15px] font-medium text-gray-800 focus:ring-2 focus:ring-[#ffb380] transition-all resize-none outline-none leading-relaxed" 
                        rows="3"
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Habit Goals */}
              <div className="bg-[#caf9dc]/40 p-10 rounded-[40px] border border-[#caf9dc]">
                <div className="flex items-center gap-4 mb-8">
                  <span className="material-symbols-outlined text-[#3e6752] text-[32px] filled-icon">track_changes</span>
                  <h2 className="text-[24px] font-black text-[#3e6752] tracking-tight">Habit Goals</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Daily Target */}
                  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-white/50">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[15px] font-bold text-gray-900">Daily Habit Target</span>
                      <span className="text-[#3e6752] font-black text-[18px]">{dailyTarget} habits</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" max="15" 
                      value={dailyTarget}
                      onChange={(e) => setDailyTarget(e.target.value)}
                      className="w-full h-2.5 bg-[#caf9dc] rounded-full appearance-none cursor-pointer accent-[#3e6752]" 
                    />
                    <p className="text-[13px] text-[#5c605f] mt-5 font-medium italic">Most high-performers track 6-10 habits daily.</p>
                  </div>

                  {/* Weekly Goal */}
                  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-white/50">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[15px] font-bold text-gray-900">Weekly Completion Goal</span>
                      <span className="text-[#3e6752] font-black text-[18px]">{weeklyGoal}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="50" max="100" 
                      value={weeklyGoal}
                      onChange={(e) => setWeeklyGoal(e.target.value)}
                      className="w-full h-2.5 bg-[#caf9dc] rounded-full appearance-none cursor-pointer accent-[#3e6752]" 
                    />
                    <p className="text-[13px] text-[#5c605f] mt-5 font-medium italic">Your current average is 78%.</p>
                  </div>
                </div>
              </div>

              {/* Account Security */}
              <div className="bg-[#f3f4f3] p-10 rounded-[40px] flex flex-col gap-6">
                <h2 className="text-[24px] font-black text-gray-900 tracking-tight mb-2">Account Security</h2>
                
                <div className="flex flex-col gap-4">
                  {/* Password Mgmt */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white rounded-[24px] shadow-sm gap-4">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-full bg-[#ffb380]/20 flex items-center justify-center text-[#8a5126]">
                        <span className="material-symbols-outlined text-[24px]">lock</span>
                      </div>
                      <div>
                        <p className="text-[16px] font-black text-gray-900">Password Management</p>
                        <p className="text-[13px] text-gray-500 font-bold mt-0.5">Last updated 3 months ago</p>
                      </div>
                    </div>
                    <button className="px-6 py-3 text-[14px] font-black text-[#8a5126] hover:bg-[#ffb380]/10 rounded-full transition-colors w-full sm:w-auto">
                      Change Password
                    </button>
                  </div>

                  {/* 2FA */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white rounded-[24px] shadow-sm gap-4">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-full bg-[#caf6fd] flex items-center justify-center text-[#3c656c]">
                        <span className="material-symbols-outlined text-[24px]">verified_user</span>
                      </div>
                      <div>
                        <p className="text-[16px] font-black text-gray-900">Two-Factor Authentication</p>
                        <p className="text-[13px] text-gray-500 font-bold mt-0.5">Secure your account via SMS or Auth App</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-2 sm:mt-0">
                      <input type="checkbox" className="sr-only peer" checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
                      <div className="w-12 h-6.5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-[#8a5126]"></div>
                    </label>
                  </div>
                </div>

                <div className="mt-4 pt-6 border-t border-gray-300/50">
                  <button className="flex items-center gap-2 text-[#aa371c] text-[15px] font-black hover:underline px-2">
                    <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                    Delete My Account
                  </button>
                </div>
              </div>

            </div>

            {/* ── RIGHT COLUMN (Pro Card, Preferences) ── */}
            <aside className="xl:col-span-4 flex flex-col gap-10">
              
              {/* Subscription Card */}
              <div className="bg-[#8a5126] p-10 rounded-[40px] text-white flex flex-col gap-6 relative overflow-hidden shadow-xl shadow-[#8a5126]/20">
                <div className="relative z-10">
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm">Current Plan</span>
                  <h3 className="text-[36px] font-black mt-6 tracking-tight leading-none mb-3">HabitPulse Free</h3>
                  <p className="text-white/80 text-[16px] font-medium leading-relaxed max-w-[250px]">Unlock advanced analytics, custom themes, and unlimited habits with Pro.</p>
                  
                  <button className="mt-10 w-full py-5 bg-white text-[#8a5126] font-black text-[16px] rounded-full hover:scale-[1.03] active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg">
                    Upgrade to Pro
                    <span className="material-symbols-outlined text-[20px] filled-icon">bolt</span>
                  </button>
                </div>
                {/* Decorative overlapping circles */}
                <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-black/20 rounded-full blur-3xl"></div>
              </div>

              {/* Preferences Card */}
              <div className="bg-white p-10 rounded-[40px] shadow-[0_20px_40px_rgba(47,51,51,0.04)] border border-gray-50">
                <h2 className="text-[24px] font-black mb-8 text-gray-900 tracking-tight">Preferences</h2>
                
                <div className="space-y-8">
                  <ToggleSwitch 
                    label="Push Notifications" 
                    description="Daily reminders" 
                    checked={pushNotifs} 
                    onChange={() => setPushNotifs(!pushNotifs)} 
                  />
                  <ToggleSwitch 
                    label="Email Reports" 
                    description="Weekly progress summaries" 
                    checked={emailReports} 
                    onChange={() => setEmailReports(!emailReports)} 
                  />
                  <ToggleSwitch 
                    label="Dark Mode" 
                    description="System adaptive" 
                    checked={darkMode} 
                    onChange={() => setDarkMode(!darkMode)} 
                  />
                  
                  <div className="pt-8 border-t border-gray-100">
                    <ToggleSwitch 
                      label="Public Profile" 
                      description="Allow others to see progress" 
                      checked={publicProfile} 
                      onChange={() => setPublicProfile(!publicProfile)} 
                    />
                  </div>
                </div>
              </div>

              {/* Footer Links */}
              <div className="pt-4 flex flex-col items-center gap-3">
                <p className="text-[12px] text-gray-400 uppercase tracking-widest font-black">HabitPulse v2.4.0</p>
                <div className="flex gap-6">
                  <a href="#" className="text-[14px] font-bold text-[#8a5126] hover:underline">Terms</a>
                  <a href="#" className="text-[14px] font-bold text-[#8a5126] hover:underline">Privacy</a>
                  <a href="#" className="text-[14px] font-bold text-[#8a5126] hover:underline">Support</a>
                </div>
              </div>

            </aside>
          </div>
        </main>

        {/* Floating Action Button */}
        <div className="fixed bottom-12 right-12 z-50">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#8a5126] text-white px-10 py-5 rounded-full font-black text-[16px] shadow-2xl shadow-[#8a5126]/30 flex items-center gap-3 hover:scale-105 active:scale-95 transition-transform disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save Changes"}
            <span className="material-symbols-outlined text-[20px]">save</span>
          </button>
        </div>

      </div>
    </div>
  );
}
