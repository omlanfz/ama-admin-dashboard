import { useEffect, useState } from "react";
import Card from "../components/Card";
import { fetchCamps, createCamp, updateCamp, deleteCamp } from "../api/camps";

export default function Camps() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCampName, setNewCampName] = useState("");
  const [editingCamp, setEditingCamp] = useState(null); // { id, name }

  const loadCamps = async () => {
    try {
      setLoading(true);
      setError("");
      const campsData = await fetchCamps();
      setCamps(campsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCamps();
  }, []);

  const handleAddCamp = async (e) => {
    e.preventDefault();
    if (!newCampName.trim()) return;
    try {
      await createCamp(newCampName);
      setNewCampName("");
      loadCamps(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateCamp = async (id, name) => {
    if (!name.trim()) return;
    try {
      await updateCamp(id, name);
      setEditingCamp(null); // Exit editing mode
      loadCamps(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCamp = async (id) => {
    if (window.confirm("Are you sure you want to delete this camp?")) {
      try {
        await deleteCamp(id);
        loadCamps(); // Refresh the list
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <>
      <Card title="Add New Camp">
        <form onSubmit={handleAddCamp} className="camps-add-form">
          <input
            type="text"
            value={newCampName}
            onChange={(e) => setNewCampName(e.target.value)}
            placeholder="Enter camp name"
            className="camps-input"
          />
          <button type="submit" className="btn-add">
            Add Camp
          </button>
        </form>
      </Card>

      <Card title="Manage Existing Camps">
        {loading && <p>Loading camps...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <div className="camps-list">
          {camps.map((camp) => (
            <div key={camp.id} className="camps-list-item">
              {editingCamp?.id === camp.id ? (
                <input
                  type="text"
                  value={editingCamp.name}
                  onChange={(e) =>
                    setEditingCamp({ ...editingCamp, name: e.target.value })
                  }
                  className="camps-input"
                />
              ) : (
                <div className="camps-list-item-name">
                  <strong>{camp.name}</strong>
                </div>
              )}
              <div className="camps-list-item-actions">
                {editingCamp?.id === camp.id ? (
                  <button
                    onClick={() =>
                      handleUpdateCamp(editingCamp.id, editingCamp.name)
                    }
                    className="btn-add"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingCamp(camp)}
                    className="btn-edit"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDeleteCamp(camp.id)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
