import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import { getCommunityFeed, createPost, likePost, getMe } from "../services/api";

// Mapped exact colors from the Living Canvas design for the badges
const TYPE_OPTIONS = [
  { value: "general",     label: "General",     badge: "bg-[#caf6fd] text-[#355f65]" },      // Tertiary (Teal)
  { value: "achievement", label: "Achievement", badge: "bg-[#caf9dc] text-[#37614b]" },      // Secondary (Green)
  { value: "checkin",     label: "Check-in",    badge: "bg-[#f3f4f3] text-[#5c605f]" },      // Surface Low (Gray)
  { value: "tip",         label: "Tip",         badge: "bg-[#ffb380]/20 text-[#633108]" },   // Primary Container (Peach)
];

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  if (h < 48) return "Yesterday";
  return `${Math.floor(h / 24)} days ago`;
}

function PostCard({ post, me, onLike }) {
  const liked = post.likes?.includes(me?._id);
  const typeOpt = TYPE_OPTIONS.find(t => t.value === post.type) || TYPE_OPTIONS[0];

  return (
    <article className="bg-[#ffffff] rounded-2xl p-6 shadow-[0_10px_30px_rgba(47,51,51,0.04)] hover:shadow-[0_15px_35px_rgba(47,51,51,0.07)] transition-shadow border border-gray-50/50">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#8a5126] flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0 border border-gray-100">
            {post.userId?.avatar
              ? <img src={`http://localhost:3000${post.userId.avatar}`} className="w-full h-full object-cover" alt="" />
              : post.userId?.username?.[0]?.toUpperCase() || "?"
            }
          </div>
          <div>
            <h3 className="font-bold text-[#2f3333] leading-tight text-[15px]">
              {post.userId?.username || "User"}
            </h3>
            <p className="text-[10px] uppercase tracking-widest text-[#5c605f] font-bold mt-0.5">
              {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${typeOpt.badge}`}>
          {typeOpt.label}
        </span>
      </div>

      {/* Content */}
      <p className="text-[#2f3333] text-lg leading-relaxed mb-6 whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-6 pt-4 border-t border-[#edeeed]">
        <button 
          onClick={() => onLike(post._id)}
          className="flex items-center gap-2 group transition-colors"
        >
          <span className={`material-symbols-outlined transition-colors ${liked ? "text-[#aa371c] filled-icon" : "text-[#5c605f] group-hover:text-[#aa371c]"}`}>
            favorite
          </span>
          <span className={`text-sm font-bold ${liked ? "text-[#aa371c]" : "text-[#5c605f]"}`}>
            {post.likes?.length || 0}
          </span>
        </button>
        <button className="flex items-center gap-2 group transition-colors cursor-not-allowed opacity-70">
          <span className="material-symbols-outlined text-[#5c605f] group-hover:text-[#8a5126] transition-colors">
            chat_bubble
          </span>
          <span className="text-sm font-bold text-[#5c605f]">
            {post.comments?.length || 0}
          </span>
        </button>
      </div>
    </article>
  );
}

export default function Community() {
  const token = localStorage.getItem("token");

  const [posts, setPosts] = useState([]);
  const [me, setMe] = useState(null);
  const [content, setContent] = useState("");
  const [type, setType] = useState("general");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  async function load() {
    try {
      const [feed, user] = await Promise.all([
        getCommunityFeed(token),
        getMe(token)
      ]);
      setPosts(Array.isArray(feed) ? feed : []);
      setMe(user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    try {
      const newPost = await createPost(token, { content, type });
      setPosts(prev => [newPost, ...prev]);
      setContent("");
      setType("general"); // reset type
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await likePost(token, postId);
      setPosts(prev => prev.map(p => {
        if (p._id !== postId) return p;
        const liked = p.likes?.includes(me?._id);
        return {
          ...p,
          likes: liked
            ? p.likes.filter(id => id !== me?._id)
            : [...(p.likes || []), me?._id]
        };
      }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-[#f9f9f8] min-h-screen font-sans text-[#2f3333]">
        <Sidebar />
        <main className="ml-0 md:ml-64 flex-1 flex items-center justify-center font-bold text-[#5c605f] text-[20px]">
          Loading Community...
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-[#f9f9f8] min-h-screen font-sans text-[#2f3333]">
      <Sidebar />
      
      {/* ── Mobile Top NavBar (Matches Design) ── */}
      <header className="md:hidden fixed top-0 w-full bg-[#f9f9f8] z-40 px-6 py-4 flex justify-between items-center shadow-sm">
        <span className="text-2xl font-bold text-[#8a5126]">HabitCanvas</span>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-[#8a5126]">search</span>
          <span className="material-symbols-outlined text-[#8a5126]">notifications</span>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 md:ml-64 min-h-screen pt-20 md:pt-0">
        <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
          
          {/* Header */}
          <section className="mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#8a5126] tracking-tight mb-2 leading-tight">
              Community
            </h1>
            <p className="text-[#5c605f] text-lg font-medium">
              Share achievements, tips and check-ins with everyone.
            </p>
          </section>

          {/* Post Composer */}
          <section className="bg-[#ffffff] rounded-2xl shadow-[0_20px_40px_rgba(47,51,51,0.06)] p-6 mb-10 transition-all hover:shadow-[0_25px_50px_rgba(47,51,51,0.08)] border border-gray-50/50">
            <div className="flex gap-4 mb-4">
              {/* Me Avatar */}
              <div className="w-12 h-12 rounded-full bg-[#8a5126] flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0 border border-gray-100">
                {me?.avatar 
                  ? <img src={`http://localhost:3000${me.avatar}`} className="w-full h-full object-cover" alt="" />
                  : me?.username?.[0]?.toUpperCase() || "U"}
              </div>
              {/* Textarea */}
              <textarea
                rows="3"
                placeholder="Share an achievement, tip, or daily check-in..."
                className="w-full bg-[#f3f4f3] border-none rounded-xl p-4 focus:ring-2 focus:ring-[#ffb380] text-[#2f3333] placeholder-[#5c605f]/60 resize-none font-medium text-base outline-none transition-all"
                value={content}
                onChange={e => setContent(e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Type selector (Pills) */}
              <div className="flex gap-2 overflow-x-auto w-full sm:w-auto [&::-webkit-scrollbar]:hidden">
                {TYPE_OPTIONS.map(opt => {
                  const isActive = type === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setType(opt.value)}
                      className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border ${
                        isActive
                          ? "bg-[#ffb380]/20 text-[#633108] border-[#ffb380]/30"
                          : "bg-[#f3f4f3] text-[#5c605f] border-transparent hover:bg-[#e6e9e8]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {/* Post Button */}
              <button
                onClick={handlePost}
                disabled={posting || !content.trim()}
                className="w-full sm:w-auto px-10 py-3 bg-[#ffb380] text-[#633108] rounded-full font-bold shadow-lg shadow-[#ffb380]/40 hover:scale-[0.98] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-[15px]"
              >
                {posting ? "Posting..." : "Post"}
              </button>
            </div>
          </section>

          {/* Feed */}
          <div className="space-y-6 pb-20">
            {posts.length === 0 ? (
              <div className="text-center py-20 text-[#5c605f]">
                <span className="material-symbols-outlined text-[64px] mb-4 block opacity-50">forum</span>
                <p className="font-bold text-xl text-[#2f3333]">No posts yet.</p>
                <p className="mt-2 text-lg">Be the first to share your progress!</p>
              </div>
            ) : (
              posts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  me={me}
                  onLike={handleLike}
                />
              ))
            )}
          </div>

        </div>
      </main>

      {/* ── Mobile Bottom Navigation (Matches Design) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 rounded-t-[2rem] bg-white/90 backdrop-blur-xl border-t border-gray-200 h-20 flex justify-around items-center px-6 pb-safe shadow-[0_-10px_40px_rgba(47,51,51,0.06)]">
        <div className="flex flex-col items-center justify-center text-[#9c9d9c] py-3 cursor-pointer" onClick={() => navigate("/")}>
          <span className="material-symbols-outlined text-2xl">home</span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Home</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#9c9d9c] py-3 cursor-pointer" onClick={() => navigate("/habits")}>
          <span className="material-symbols-outlined text-2xl">check_circle</span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Habits</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-[#ffb380] text-[#633108] rounded-full p-4 -mt-8 shadow-lg shadow-[#ffb380]/40 scale-110 transition-transform">
          <span className="material-symbols-outlined text-2xl filled-icon">forum</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#9c9d9c] py-3 cursor-pointer" onClick={() => navigate("/wellness")}>
          <span className="material-symbols-outlined text-2xl">spa</span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Wellness</span>
        </div>
        <div className="flex flex-col items-center justify-center text-[#9c9d9c] py-3 cursor-pointer" onClick={() => navigate("/settings")}>
          <span className="material-symbols-outlined text-2xl">person</span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Me</span>
        </div>
      </nav>

    </div>
  );
}