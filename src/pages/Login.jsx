import { useState } from "react";
import amaLogo from "../assets/ama_logo.png";
import { loginAdmin } from "../api/auth";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await loginAdmin(username, password);
      onLogin(user); // Pass user data to parent
    } catch (err) {
      setError(err.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-16 gap-6">
      <div className="w-40 h-40 mx-auto rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
        <img
          src={amaLogo}
          alt="AMA Logo"
          className="w-full h-full object-cover"
        />
      </div>

      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="sub">Manage laundry booking services.</p>

      <form onSubmit={handleSubmit} className="card max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-semibold">Admin Login</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2"
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2"
          disabled={loading}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" className="btn-add w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

// import { useState } from "react";
// import amaLogo from "../assets/ama_logo.png";

// export default function Login({ onLogin }) {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (username === "admin" && password === "admin") {
//       onLogin();
//     } else {
//       setError("Invalid credentials. Try again.");
//     }
//   };

//   return (
//     <div className="text-center space-y-6">
//       <div className="w-40 h-40 mx-auto rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
//         <img
//           src={amaLogo}
//           alt="AMA Logo"
//           className="w-full h-full object-cover"
//         />
//       </div>
//       {/* <div className="logo">
//         <span>AMA</span>
//       </div> */}
//       <h1 className="text-2xl font-bold">Admin Dashboard</h1>
//       <p className="sub">Manage laundry booking services.</p>

//       <form onSubmit={handleSubmit} className="card max-w-md mx-auto space-y-4">
//         <h2 className="text-xl font-semibold">Admin Login</h2>

//         <input
//           type="text"
//           placeholder="Username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2"
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2"
//         />

//         {error && <p className="text-red-500 text-sm">{error}</p>}

//         <button type="submit" className="btn-add w-full">
//           Login
//         </button>
//       </form>
//     </div>
//   );
// }
