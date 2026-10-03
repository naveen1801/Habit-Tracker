import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar(){

  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setToken(localStorage.getItem("token"));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if(!token) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  return(

    <div className="bg-slate-900 text-white p-4 flex justify-between items-center">

      <div className="flex gap-6">
        <Link to="/">Dashboard</Link>
        <Link to="/habits">My Habits</Link>
        <Link to="/guardian">Guardian</Link>
      </div>

      <button 
        onClick={handleLogout}
        className="bg-red-500 px-3 py-1 rounded"
      >
        Logout
      </button>

    </div>

  )
}