import { useState } from "react";
import Card from "../components/Card";

export default function Account() {
  const [displayName, setDisplayName] = useState("Admin");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Password state
  const [storedPassword, setStoredPassword] = useState("admin");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (currentPassword === storedPassword && newPassword.length >= 4) {
      setStoredPassword(newPassword);
      setMessage("✅ Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      setMessage("❌ Invalid current password or new password too short.");
    }
  };

  return (
    <>
      <Card title="Profile Settings">
        <div className="grid gap-4">
          <label className="block">
            <span className="font-medium">Display Name</span>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2 mt-1"
            />
          </label>

          <div className="toggle-container">
            <span className="font-medium">Notifications</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={() => setNotificationsEnabled(!notificationsEnabled)}
              />
              <span className="slider" />
            </label>
          </div>
        </div>
      </Card>

      <Card title="Change Password">
        <form onSubmit={handlePasswordUpdate} className="grid gap-4">
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="bg-slate-800 text-white border border-slate-600 rounded-lg px-4 py-2"
          />
          <button type="submit" className="btn-add">
            Update Password
          </button>
          {message && <p className="text-sm text-slate-300">{message}</p>}
        </form>
      </Card>

      <Card title="Session">
        <div className="grid gap-4">
          <p>
            You are logged in as <strong>{displayName}</strong>
          </p>
          <button
            className="btn-danger"
            onClick={() => window.location.reload()}
          >
            Logout
          </button>
        </div>
      </Card>
    </>
  );
}
