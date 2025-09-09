import amaLogo from "../assets/ama_logo.png";

export default function Header() {
  return (
    <header className="flex flex-col items-center">
      <div className="w-28 h-28 mx-auto rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
        <img
          src={amaLogo}
          alt="AMA Logo"
          className="w-full h-full object-cover"
        />
      </div>
      <h1 className="text-2xl font-bold mt-3">Admin Dashboard</h1>
      <p className="sub">Manage laundry booking services.</p>
      <div className="brand-stripe" />
    </header>
  );
}

// export default function Header() {
//   return (
//     <header>
//       <div className="logo">
//         <span>AMA</span>
//       </div>
//       <h1>Admin Dashboard</h1>
//       <p className="sub">Manage laundry booking services.</p>
//       <div className="brand-stripe" />
//     </header>
//   )
// }
