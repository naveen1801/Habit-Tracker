import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const sendOtp = async (e) => {
    if(e) e.preventDefault();
    if (!email) { alert("Enter email first"); return; }
    if (!email.includes("@")) { alert("Enter valid email"); return; }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (res.ok) {
        setOtpSent(true);
        setTimer(60);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    if(e) e.preventDefault();
    if (!username || !password || !otp) { alert("Fill all fields"); return; }
    if (password.length < 6) { alert("Password must be at least 6 characters"); return; }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, otp })
      });
      const data = await res.json();
      
      if (res.ok) {
        alert(data.message);
        navigate("/login");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f9f9f8] font-sans text-[#2f3333] antialiased min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col md:flex-row min-h-screen">
        
        {/* ── Left Side: Inspiring Brand Section ── */}
        <section className="relative w-full md:w-1/2 min-h-[500px] md:min-h-screen overflow-hidden flex items-center justify-center px-10 py-16">
          <div className="absolute inset-0 z-0 bg-gray-900">
            {/* Fixed public high-res image link */}
            <img 
              className="w-full h-full object-cover opacity-90" 
              src="https://images.unsplash.com/photo-1494548162494-384bba4ab999?auto=format&fit=crop&w=2000&q=80" 
              alt="Mountain forest landscape sunrise" 
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#3e6752]/70 via-[#8a5126]/30 to-transparent"></div>
          </div>
          
          <div className="relative z-10 w-full max-w-xl text-center md:text-left mt-auto md:mt-0">
            <div className="mb-8 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20">
              <span className="material-symbols-outlined text-[#caf9dc] text-[20px] filled-icon">landscape</span>
              <span className="text-[13px] font-black tracking-widest uppercase text-white">Start Today</span>
            </div>
            <h1 className="text-white text-[56px] lg:text-[80px] font-extrabold tracking-tight mb-6 leading-[1.05]">
              Start your journey today.
            </h1>
            <p className="text-white/95 text-[20px] lg:text-[24px] font-medium leading-relaxed max-w-lg">
              Join thousands of others who are transforming their lives one small habit at a time.
            </p>
          </div>
        </section>

        {/* ── Right Side: Register Form ── */}
        <section className="w-full md:w-1/2 flex items-center justify-center bg-[#f9f9f8] px-10 py-16">
          <div className="w-full max-w-lg space-y-10">
            
            <div className="text-center md:text-left">
              <h2 className="text-[22px] font-black text-[#3e6752] mb-3 tracking-tight">HabitCanvas</h2>
              <h3 className="text-[48px] lg:text-[56px] font-black text-gray-900 tracking-tight mb-3 leading-none">Create an account</h3>
              <p className="text-[#5c605f] font-medium text-[18px]">Let's get you set up so you can start tracking.</p>
            </div>

            <form className="space-y-6">
              
              {/* Username */}
              <div className="space-y-3">
                <label className="block text-[15px] font-extrabold text-gray-900 ml-1">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 text-[24px] group-focus-within:text-[#3e6752] transition-colors">person</span>
                  </div>
                  <input 
                    type="text"
                    value={username}
                    onChange={(e)=>setUsername(e.target.value)}
                    disabled={otpSent}
                    className="block w-full pl-16 pr-6 py-5 bg-[#f3f4f3] border-none rounded-full text-gray-900 text-[18px] font-bold placeholder-gray-400 focus:ring-2 focus:ring-[#caf9dc] transition-all outline-none disabled:opacity-50" 
                    placeholder="How should we call you?" 
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-3">
                <label className="block text-[15px] font-extrabold text-gray-900 ml-1">Email address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 text-[24px] group-focus-within:text-[#3e6752] transition-colors">mail</span>
                  </div>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    disabled={otpSent}
                    className="block w-full pl-16 pr-6 py-5 bg-[#f3f4f3] border-none rounded-full text-gray-900 text-[18px] font-bold placeholder-gray-400 focus:ring-2 focus:ring-[#caf9dc] transition-all outline-none disabled:opacity-50" 
                    placeholder="name@example.com" 
                  />
                </div>
              </div>

              {/* SEND OTP BUTTON */}
              {!otpSent && (
                <button 
                  type="button"
                  onClick={sendOtp}
                  disabled={loading}
                  className="w-full bg-[#3e6752] text-white font-black py-5 rounded-full shadow-lg shadow-[#3e6752]/20 hover:bg-[#254e3a] hover:scale-[1.02] active:scale-[0.98] transition-all mt-10 disabled:opacity-70 text-[18px]"
                >
                  {loading ? "Sending Code..." : "Send Verification Code"}
                </button>
              )}

              {/* ── OTP SECTION (Revealed after code sent) ── */}
              {otpSent && (
                <div className="pt-6 space-y-6 animate-fadeIn">
                  <div className="bg-[#caf9dc]/50 text-[#254e3a] px-6 py-4 rounded-[20px] text-[15px] font-bold border border-[#caf9dc]">
                    We've sent a 6-digit code to your email.
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[15px] font-extrabold text-gray-900 ml-1">Verification Code</label>
                    <input 
                      type="text"
                      value={otp}
                      onChange={(e)=>setOtp(e.target.value)}
                      className="block w-full py-5 bg-[#f3f4f3] border-none rounded-full text-gray-900 font-black placeholder-gray-400 focus:ring-2 focus:ring-[#caf9dc] transition-all outline-none text-center tracking-[0.5em] text-[20px]" 
                      placeholder="000000" 
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[15px] font-extrabold text-gray-900 ml-1">Create Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-gray-400 text-[24px] group-focus-within:text-[#3e6752] transition-colors">lock</span>
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        className="block w-full pl-16 pr-14 py-5 bg-[#f3f4f3] border-none rounded-full text-gray-900 text-[18px] font-bold placeholder-gray-400 focus:ring-2 focus:ring-[#caf9dc] transition-all outline-none tracking-wider" 
                        placeholder="Minimum 6 characters" 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-6 flex items-center"
                      >
                        <span className="material-symbols-outlined text-gray-400 hover:text-gray-900 transition-colors text-[24px]">{showPassword ? "visibility_off" : "visibility"}</span>
                      </button>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={verifyOtp}
                    disabled={loading}
                    className="w-full bg-[#3e6752] text-white font-black py-5 rounded-full shadow-lg shadow-[#3e6752]/20 hover:bg-[#254e3a] hover:scale-[1.02] active:scale-[0.98] transition-all text-[18px] disabled:opacity-70 mt-6"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>

                  <div className="text-center pt-3">
                    {timer > 0 ? (
                      <span className="text-[15px] text-gray-500 font-bold">Resend code in {timer}s</span>
                    ) : (
                      <button type="button" onClick={sendOtp} className="text-[#3e6752] text-[15px] font-black hover:underline">
                        Didn't receive it? Resend Code
                      </button>
                    )}
                  </div>
                </div>
              )}

            </form>

            <div className="relative pt-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
              <div className="relative flex justify-center text-[12px] uppercase tracking-widest font-black">
                <span className="bg-[#f9f9f8] px-4 text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-5">
              <button type="button" className="flex items-center justify-center gap-3 py-4 px-4 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                <span className="text-[16px] font-black text-gray-900">Google</span>
              </button>
              <button type="button" className="flex items-center justify-center gap-3 py-4 px-4 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
                <span className="material-symbols-outlined text-gray-900 filled-icon text-[24px]">ios</span>
                <span className="text-[16px] font-black text-gray-900">Apple</span>
              </button>
            </div>

            <p className="text-center text-[16px] font-bold text-[#5c605f] mt-4">
              Already have an account? 
              <button onClick={() => navigate("/login")} className="text-[#3e6752] font-black hover:underline ml-2">Sign In</button>
            </p>
          </div>
        </section>
      </main>
      
      {/* ── Footer ── */}
      <footer className="flex flex-col md:flex-row justify-between items-center px-12 py-8 w-full mt-auto bg-[#f3f4f3] border-t border-gray-200">
        <p className="text-[14px] font-bold text-[#5c605f]">© 2026 HabitCanvas. The Living Canvas.</p>
        <div className="flex gap-8 mt-4 md:mt-0">
          <a href="#" className="text-[14px] font-bold text-[#5c605f] hover:text-[#8a5126] transition-colors">Privacy Policy</a>
          <a href="#" className="text-[14px] font-bold text-[#5c605f] hover:text-[#8a5126] transition-colors">Terms of Service</a>
          <a href="#" className="text-[14px] font-bold text-[#5c605f] hover:text-[#8a5126] transition-colors">Help Center</a>
        </div>
      </footer>
    </div>
  );
} 


