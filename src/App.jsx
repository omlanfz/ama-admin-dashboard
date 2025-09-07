import { useState } from "react";
import Header from "./components/Header";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Camps from "./pages/Camps"; // 1. Import the new page
import Statistics from "./pages/Statistics";
import ControlPanel from "./pages/ControlPanel";
import Account from "./pages/Account";
import Login from "./pages/Login";

const tabs = {
  dashboard: <Dashboard />,
  orders: <Orders />,
  camps: <Camps />, // 2. Add the new page to the tabs object
  statistics: <Statistics />,
  control: <ControlPanel />,
  account: <Account />,
};

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className="wrap">
      {!loggedIn ? (
        <Login onLogin={() => setLoggedIn(true)} />
      ) : (
        <>
          <Header />
          <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="grid gap-6">{tabs[activeTab]}</main>
        </>
      )}
    </div>
  );
}
