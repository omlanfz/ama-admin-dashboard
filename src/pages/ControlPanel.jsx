import { useState, useEffect } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import Card from "../components/Card";
import TimePicker from "../components/TimePicker"; // Import the component
import {
  getSettings,
  updateSettings,
  createPickupSlot,
  deletePickupSlot,
  createPaymentMethod,
  deletePaymentMethod,
  updateServicePrice,
} from "../api/controlPanel";

// Helper function (remains the same)
const convertTo24Hour = (time12h) => {
  if (!time12h) return "";
  const [time, period] = time12h.split(" ");
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours, 10);
  if (period === "PM" && hours !== 12) {
    hours += 12;
  }
  if (period === "AM" && hours === 12) {
    hours = 0;
  }
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
};

export default function ControlPanel() {
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState([]);
  const [pickupSlots, setPickupSlots] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [dailyAvailability, setDailyAvailability] = useState(true);
  const [newSlotStart, setNewSlotStart] = useState("");
  const [newSlotEnd, setNewSlotEnd] = useState("");
  const [newPaymentMethod, setNewPaymentMethod] = useState("");
  const [error, setError] = useState("");

  // State for managing the TimePicker modal
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerConfig, setPickerConfig] = useState({
    target: null,
    initialValue: "",
  });

  // (useEffect and other handlers remain the same)
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError("");
      try {
        const settings = await getSettings();
        setPrices(settings.prices);
        setPickupSlots(settings.pickupSlots);
        setPaymentMethods(settings.paymentMethods);
        setDailyAvailability(settings.dailyAvailability.isAvailable);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        setError("Failed to load settings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handlePriceChange = (id, newPrice) => {
    const updatedPrices = prices.map((item) =>
      item.id === id ? { ...item, price: parseFloat(newPrice) || 0 } : item
    );
    setPrices(updatedPrices);
  };

  const handlePriceUpdateOnBlur = (id, price) => {
    updateServicePrice(id, price).catch((err) => {
      console.error("Failed to update price:", err);
      setError("Failed to update price. Check connection and try again.");
    });
  };

  const handleAddSlot = async () => {
    if (!newSlotStart || !newSlotEnd) {
      setError("Please select both a start and end time.");
      return;
    }
    setError("");
    try {
      const startTime24 = convertTo24Hour(newSlotStart);
      const endTime24 = convertTo24Hour(newSlotEnd);
      const newSlotValue = `${startTime24} - ${endTime24}`;

      const addedSlot = await createPickupSlot(newSlotValue);
      const newSlotForState = { id: addedSlot.id, time: addedSlot.acf.time };
      setPickupSlots([...pickupSlots, newSlotForState]);
      setNewSlotStart("");
      setNewSlotEnd("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSlot = async (id) => {
    try {
      await deletePickupSlot(id);
      setPickupSlots(pickupSlots.filter((slot) => slot.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!newPaymentMethod.trim()) return;
    try {
      const addedMethod = await createPaymentMethod(newPaymentMethod.trim());
      const newMethodForState = {
        id: addedMethod.id,
        name: addedMethod.title.rendered,
      };
      setPaymentMethods([...paymentMethods, newMethodForState]);
      setNewPaymentMethod("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePaymentMethod = async (id) => {
    try {
      await deletePaymentMethod(id);
      setPaymentMethods(paymentMethods.filter((method) => method.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleAvailability = () => {
    const newAvailability = !dailyAvailability;
    setDailyAvailability(newAvailability);
    updateSettings({
      dailyAvailability: { isAvailable: newAvailability },
    });
  };

  // MODIFIED: Functions to control the TimePicker modal
  const openPicker = (target, initialValue) => {
    setPickerConfig({ target, initialValue });
    setIsPickerOpen(true);
  };

  const handlePickerConfirm = (time) => {
    if (pickerConfig.target === "start") {
      setNewSlotStart(time);
    } else if (pickerConfig.target === "end") {
      setNewSlotEnd(time);
    }
    setIsPickerOpen(false);
  };

  if (loading) {
    return <div className="text-center p-10">Loading settings...</div>;
  }

  return (
    <div className="space-y-8">
      {/* ... (Header, Error, other Cards remain unchanged) ... */}
      <header className="text-center m-4">
        <h1 className="text-3xl font-bold">Control Panel</h1>
        <p className="sub mt-1 mb-1 pb-8">
          Manage service availability, pricing, and payment options.
        </p>
      </header>

      {error && (
        <div className="bg-red-900/50 text-red-300 p-4 rounded-lg text-center">
          <p>
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      <div className="control-panel-grid">
        <Card title="Daily Availability">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="flex-1 text-center sm:text-left">
              {dailyAvailability
                ? "Service is available for booking today."
                : "Service is inactive. Users will see a 'Fully booked' message."}
            </p>
            <button
              onClick={handleToggleAvailability}
              className={`w-full sm:w-auto ${
                dailyAvailability ? "btn-danger" : "btn-add"
              }`}
            >
              {dailyAvailability
                ? "Deactivate for Today"
                : "Activate for Today"}
            </button>
          </div>
        </Card>

        <Card title="Service Pricing">
          <div className="cp-list">
            {prices.map((item) => (
              <div key={item.id} className="cp-list-item">
                <span className="item-name">{item.name}</span>
                <div className="item-actions">
                  <span className="text-lg text-slate-300">$</span>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => handlePriceChange(item.id, e.target.value)}
                    onBlur={(e) =>
                      handlePriceUpdateOnBlur(item.id, e.target.value)
                    }
                    className="cp-input add-item-input"
                    aria-label={`Price for ${item.name}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-8">
          <Card title="Pickup Schedules">
            <div className="cp-list">
              {pickupSlots.map((slot) => (
                <div key={slot.id} className="cp-list-item">
                  <span className="item-name">{slot.time}</span>
                  <div className="item-actions">
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="btn-icon delete"
                      aria-label={`Delete slot ${slot.time}`}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddSlot();
              }}
              className="add-item-form"
            >
              <div className="time-input-container">
                {/* MODIFIED: onClick now passes the current value */}
                <button
                  type="button"
                  onClick={() => openPicker("start", newSlotStart)}
                  className="time-picker-button"
                >
                  {newSlotStart || "Start Time"}
                </button>
                <span className="time-separator">-</span>
                <button
                  type="button"
                  onClick={() => openPicker("end", newSlotEnd)}
                  className="time-picker-button"
                >
                  {newSlotEnd || "End Time"}
                </button>
              </div>
              <button
                type="submit"
                className="add-item-btn"
                aria-label="Add new pickup slot"
              >
                Add Pickup Slot
              </button>
            </form>
          </Card>

          <Card title="Payment Methods">
            {/* ... (This card's content remains unchanged) ... */}
            <div className="cp-list">
              {paymentMethods.map((method) => (
                <div key={method.id} className="cp-list-item">
                  <span className="item-name">{method.name}</span>
                  <div className="item-actions">
                    <button
                      onClick={() => handleDeletePaymentMethod(method.id)}
                      className="btn-icon delete"
                      aria-label={`Delete payment method ${method.name}`}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddPaymentMethod();
              }}
              className="add-item-form"
            >
              <input
                type="text"
                value={newPaymentMethod}
                onChange={(e) => setNewPaymentMethod(e.target.value)}
                placeholder="Add new payment method"
                className="add-item-input"
              />
              <button
                type="submit"
                className="add-item-btn"
                aria-label="Add new payment method"
              >
                Add Payment Method
              </button>
            </form>
          </Card>
        </div>
      </div>
      {/* MODIFIED: Render the TimePicker with the initialTime prop */}
      <TimePicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onConfirm={handlePickerConfirm}
        initialTime={pickerConfig.initialValue}
      />
    </div>
  );
}
