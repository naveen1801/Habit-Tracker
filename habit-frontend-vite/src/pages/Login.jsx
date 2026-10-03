import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

export default function Login() {
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [loading,      setLoading]      = useState(false);
  const [googleLoading,setGoogleLoading]= useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState("");
  const [rememberMe,   setRememberMe]   = useState(false);
  const navigate = useNavigate();

  const parseJsonSafe = async (res) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const fetchWithTimeout = async (url, options, timeoutMs = 10000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) { setError("Please enter email and password"); return; }
    if (!trimmedEmail.includes("@")) { setError("Please enter a valid email address"); return; }

    setError("");

    try {
      setLoading(true);
      const res  = await fetchWithTimeout("http://localhost:3000/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: trimmedEmail, password: trimmedPassword })
      });
      const data = await parseJsonSafe(res);

      if (res.ok && data?.token) {
        // App-wide auth currently reads from localStorage.
        localStorage.setItem("token", data.token);
        navigate("/");
      } else {
        setError(data?.message || `Login failed (${res.status})`);
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google Login handler
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleLoading(true);
        setError("");

        // Send real Google access token to backend for verification.
      const res  = await fetchWithTimeout("http://localhost:3000/auth/google", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            access_token: tokenResponse.access_token
          })
        });
        const data = await parseJsonSafe(res);

        if (res.ok && data?.token) {
          // App-wide auth currently reads from localStorage.
          localStorage.setItem("token", data.token);
          navigate("/");
        } else {
          setError(data?.message || `Google login failed (${res.status})`);
        }
      } catch (err) {
        console.error(err);
        setError("Google login failed. Please try again.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setError("Google login was cancelled or failed.");
    }
  });

  return (
    <div className="bg-[#f9f9f8] font-sans text-[#2f3333] antialiased min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col md:flex-row min-h-screen">

        {/* ── Left Side ── */}
        <section className="relative w-full md:w-1/2 min-h-[460px] md:min-h-screen overflow-hidden flex items-center justify-center px-8 py-12">
          <div className="absolute inset-0 z-0 bg-gray-900">
            <img
              className="w-full h-full object-cover opacity-90"
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=65"
              alt="Dreamy sunrise over a calm lake"
              loading="lazy"
              fetchPriority="low"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#8a5126]/60 via-[#3e6752]/30 to-transparent"></div>
          </div>

          <div className="relative z-10 w-full max-w-lg text-center md:text-left mt-auto md:mt-0">
            <div className="mb-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <span className="material-symbols-outlined text-[#ffb380] text-[20px] filled-icon">auto_awesome</span>
              <span className="text-[13px] font-black tracking-widest uppercase text-white">The Living Canvas</span>
            </div>
            <h1 className="text-white text-[48px] lg:text-[68px] font-extrabold tracking-tight mb-5 leading-[1.05]">
              Build better habits, together.
            </h1>
            <p className="text-white/95 text-[18px] lg:text-[21px] font-medium leading-relaxed max-w-lg">
              Track your daily progress, share proof with your community, and turn small steps into lasting change.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="bg-white/90 backdrop-blur-xl p-4 rounded-[20px] flex items-center gap-4 shadow-xl border border-white/40">
                <div className="w-12 h-12 rounded-full bg-[#caf9dc] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#3e6752] text-[28px] filled-icon">groups</span>
                </div>
                <div className="text-left pr-4">
                  <p className="text-[12px] uppercase tracking-widest font-black text-[#5c605f]">Active Users</p>
                  <p className="text-[18px] font-black text-[#2f3333]">12.4k Members</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Right Side: Login Form ── */}
        <section className="w-full md:w-1/2 flex items-center justify-center bg-[#f9f9f8] px-8 py-12">
          <div className="w-full max-w-md space-y-10">

            <div className="text-center md:text-left">
              <h2 className="text-[22px] font-black text-[#8a5126] mb-3 tracking-tight">HabitCanvas</h2>
              <h3 className="text-[42px] lg:text-[48px] font-black text-gray-900 tracking-tight mb-2 leading-none">Welcome back</h3>
              <p className="text-[#5c605f] font-medium text-[16px]">Please enter your details to continue your journey.</p>
            </div>

            {/* ✅ Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 font-bold px-5 py-4 rounded-2xl text-[14px]">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleLogin} noValidate>
              {/* Email */}
              <div className="space-y-3">
                <label className="block text-[15px] font-extrabold text-gray-900 ml-1">Email address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 text-[24px] group-focus-within:text-[#8a5126] transition-colors">mail</span>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="block w-full pl-16 pr-6 py-4 bg-[#f3f4f3] border-none rounded-full text-gray-900 text-[16px] font-bold placeholder-gray-400 focus:ring-2 focus:ring-[#ffb380] transition-all outline-none"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-2">
                  <label className="block text-[15px] font-extrabold text-gray-900">Password</label>
                  <a
                    href="#"
                    className="text-[14px] font-extrabold text-[#8a5126] hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      setError("Password reset flow is not connected yet.");
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 text-[24px] group-focus-within:text-[#8a5126] transition-colors">lock</span>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="block w-full pl-16 pr-14 py-4 bg-[#f3f4f3] border-none rounded-full text-gray-900 text-[16px] font-bold placeholder-gray-400 focus:ring-2 focus:ring-[#ffb380] transition-all outline-none tracking-wider"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-6 flex items-center"
                  >
                    <span className="material-symbols-outlined text-gray-400 hover:text-gray-900 transition-colors text-[24px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center px-3">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-[#8a5126] focus:ring-[#ffb380] cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-3 block text-[15px] font-bold text-[#5c605f] cursor-pointer">
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8a5126] text-white font-black py-4 rounded-full shadow-lg shadow-[#8a5126]/20 hover:bg-[#7c451c] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 text-[16px]"
              >
                {loading ? "Signing In..." : "Sign In"}
                {!loading && <span className="material-symbols-outlined text-[24px]">arrow_forward</span>}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200"></span>
              </div>
              <div className="relative flex justify-center text-[12px] uppercase tracking-widest font-black">
                <span className="bg-[#f9f9f8] px-4 text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* ✅ Social Buttons — Google is now functional */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={googleLoading}
                className="flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-60"
              >
                {googleLoading ? (
                  <span className="material-symbols-outlined text-gray-400 animate-spin text-[24px]">progress_activity</span>
                ) : (
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                )}
                <span className="text-[16px] font-black text-gray-900">
                  {googleLoading ? "Loading..." : "Google"}
                </span>
              </button>

              {/* Apple — UI only, no functionality yet */}
              <button
                type="button"
                className="flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
                onClick={() => alert("Apple login coming soon!")}
              >
                <span className="material-symbols-outlined text-gray-900 filled-icon text-[24px]">ios</span>
                <span className="text-[16px] font-black text-gray-900">Apple</span>
              </button>
            </div>

            <p className="text-center text-[16px] font-bold text-[#5c605f] mt-4">
              Don't have an account?
              <button onClick={() => navigate("/register")} className="text-[#8a5126] font-black hover:underline ml-2">
                Create one now
              </button>
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