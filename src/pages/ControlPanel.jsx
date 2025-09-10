import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Card from "../components/Card";
import {
  getSettings,
  updateSettings,
  createPickupSlot,
  deletePickupSlot,
  createPaymentMethod,
  deletePaymentMethod,
  updateServicePrice,
} from "../api/controlPanel";

export default function ControlPanel() {
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState([]);
  const [pickupSlots, setPickupSlots] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [dailyAvailability, setDailyAvailability] = useState(true);
  const [newSlot, setNewSlot] = useState("");
  const [newPaymentMethod, setNewPaymentMethod] = useState("");
  const [error, setError] = useState("");

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
    if (!newSlot.trim()) return;
    try {
      const addedSlot = await createPickupSlot(newSlot.trim());
      const newSlotForState = { id: addedSlot.id, time: addedSlot.acf.time };
      setPickupSlots([...pickupSlots, newSlotForState]);
      setNewSlot("");
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

  if (loading) {
    return <div className="text-center p-10">Loading settings...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-400">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold">Control Panel</h1>
        <p className="text-slate-300 mt-1">
          Use these settings to configure your service.
        </p>
      </header>

      {error && (
        <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg">
          {error}
        </p>
      )}

      <Card title="Daily Availability">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>
            {dailyAvailability
              ? "Service is available for booking today."
              : "Service is inactive. Users will see a 'Fully booked' message."}
          </p>
          <button
            onClick={handleToggleAvailability}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors w-full sm:w-auto ${
              dailyAvailability
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {dailyAvailability ? "Deactivate for Today" : "Activate for Today"}
          </button>
        </div>
      </Card>

      <Card title="Service Pricing">
        <div className="space-y-3">
          {prices.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row justify-between items-center gap-2 bg-black/20 p-3 rounded-lg"
            >
              <span className="font-medium">{item.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-lg text-slate-400">$</span>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => handlePriceChange(item.id, e.target.value)}
                  onBlur={(e) =>
                    handlePriceUpdateOnBlur(item.id, e.target.value)
                  }
                  className="w-28 bg-slate-800 border border-slate-600 rounded-lg p-2 text-right focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Pickup Schedules">
        <div className="space-y-3 mb-6">
          {pickupSlots.length > 0 ? (
            pickupSlots.map((slot) => (
              <div
                key={slot.id}
                className="flex justify-between items-center bg-black/20 p-3 rounded-lg"
              >
                <span className="font-medium">{slot.time}</span>
                <button
                  onClick={() => handleDeleteSlot(slot.id)}
                  className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                  aria-label="Delete slot"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-400">
              No pickup slots added yet.
            </p>
          )}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddSlot();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={newSlot}
            onChange={(e) => setNewSlot(e.target.value)}
            placeholder="e.g., 20:00 - 21:00"
            className="flex-grow bg-slate-800 border border-slate-600 rounded-lg p-3 m-0 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="p-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            aria-label="Add slot"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </form>
      </Card>

      <Card title="Payment Methods">
        <div className="space-y-3 mb-6">
          {paymentMethods.length > 0 ? (
            paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex justify-between items-center bg-black/20 p-3 rounded-lg"
              >
                <span className="font-medium">{method.name}</span>
                <button
                  onClick={() => handleDeletePaymentMethod(method.id)}
                  className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                  aria-label="Delete payment method"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-400">
              No payment methods added yet.
            </p>
          )}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddPaymentMethod();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={newPaymentMethod}
            onChange={(e) => setNewPaymentMethod(e.target.value)}
            placeholder="Add new payment method"
            className="flex-grow bg-slate-800 border border-slate-600 rounded-lg p-3 m-0 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="p-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            aria-label="Add payment method"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </form>
      </Card>
    </div>
  );
}

// import { useState, useEffect } from "react";
// import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
// import Card from "../components/Card";
// import {
//   getSettings,
//   updateSettings,
//   createPickupSlot,
//   deletePickupSlot,
//   createPaymentMethod,
//   deletePaymentMethod,
//   updateServicePrice,
// } from "../api/controlPanel";

// export default function ControlPanel() {
//   const [loading, setLoading] = useState(true);
//   const [prices, setPrices] = useState([]);
//   const [pickupSlots, setPickupSlots] = useState([]);
//   const [paymentMethods, setPaymentMethods] = useState([]);
//   const [dailyAvailability, setDailyAvailability] = useState(true);
//   const [newSlot, setNewSlot] = useState("");
//   const [newPaymentMethod, setNewPaymentMethod] = useState("");

//   useEffect(() => {
//     const fetchSettings = async () => {
//       setLoading(true);
//       try {
//         const settings = await getSettings();
//         setPrices(settings.prices);
//         setPickupSlots(settings.pickupSlots);
//         setPaymentMethods(settings.paymentMethods);
//         setDailyAvailability(settings.dailyAvailability.isAvailable);
//       } catch (error) {
//         console.error("Failed to fetch settings:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchSettings();
//   }, []);

//   const handlePriceChange = (id, newPrice) => {
//     const updatedPrices = prices.map((item) =>
//       item.id === id ? { ...item, price: parseFloat(newPrice) || 0 } : item
//     );
//     setPrices(updatedPrices);
//     updateServicePrice(id, newPrice);
//   };

//   const handleAddSlot = async () => {
//     if (newSlot.trim()) {
//       const newPickupSlot = await createPickupSlot(newSlot.trim());
//       setPickupSlots([...pickupSlots, newPickupSlot]);
//       setNewSlot("");
//     }
//   };

//   const handleDeleteSlot = async (id) => {
//     await deletePickupSlot(id);
//     setPickupSlots(pickupSlots.filter((slot) => slot.id !== id));
//   };

//   const handleAddPaymentMethod = async () => {
//     if (newPaymentMethod.trim()) {
//       const newMethod = await createPaymentMethod(newPaymentMethod.trim());
//       setPaymentMethods([...paymentMethods, newMethod]);
//       setNewPaymentMethod("");
//     }
//   };

//   const handleDeletePaymentMethod = async (id) => {
//     await deletePaymentMethod(id);
//     setPaymentMethods(paymentMethods.filter((method) => method.id !== id));
//   };

//   const handleToggleAvailability = () => {
//     const newAvailability = !dailyAvailability;
//     setDailyAvailability(newAvailability);
//     updateSettings({
//       dailyAvailability: { isAvailable: newAvailability },
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex-center">
//         <p>Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <>
//       <header className="text-center">
//         <h1>Control Panel</h1>
//         <p className="sub">Use these settings to configure your service.</p>
//       </header>

//       <Card title="Daily Availability">
//         <div className="toggle-container">
//           <p>
//             {dailyAvailability
//               ? "Available today"
//               : "Fully booked today, happy to serve you tomorrow."}
//           </p>
//           <button
//             onClick={handleToggleAvailability}
//             className={`btn ${dailyAvailability ? "btn-danger" : "btn-add"}`}
//           >
//             {dailyAvailability ? "Deactivate Today" : "Activate Today"}
//           </button>
//         </div>
//       </Card>

//       <Card title="Service Pricing">
//         <div className="list-table">
//           {prices.map((item) => (
//             <div key={item.id} className="list-item">
//               <span className="label">{item.name}</span>
//               <div className="flex items-center">
//                 <span className="mr-2">$</span>
//                 <input
//                   type="number"
//                   value={item.price}
//                   onChange={(e) => handlePriceChange(item.id, e.target.value)}
//                   className="w-24 text-right"
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       </Card>

//       <Card title="Pickup Schedules">
//         <div className="list-table">
//           {pickupSlots.map((slot) => (
//             <div key={slot.id} className="list-item">
//               <span className="label">{slot.time}</span>
//               <button
//                 onClick={() => handleDeleteSlot(slot.id)}
//                 className="btn-danger p-2"
//               >
//                 <TrashIcon className="h-5 w-5" />
//               </button>
//             </div>
//           ))}
//         </div>
//         <div className="mt-6 flex items-center space-x-2">
//           <input
//             type="text"
//             value={newSlot}
//             onChange={(e) => setNewSlot(e.target.value)}
//             placeholder="e.g., 20:00 - 21:00"
//             className="flex-grow"
//           />
//           <button onClick={handleAddSlot} className="btn-add p-3">
//             <PlusIcon className="h-5 w-5" />
//           </button>
//         </div>
//       </Card>

//       <Card title="Payment Methods">
//         <div className="list-table">
//           {paymentMethods.map((method) => (
//             <div key={method.id} className="list-item">
//               <span className="label">{method.name}</span>
//               <button
//                 onClick={() => handleDeletePaymentMethod(method.id)}
//                 className="btn-danger p-2"
//               >
//                 <TrashIcon className="h-5 w-5" />
//               </button>
//             </div>
//           ))}
//         </div>
//         <div className="mt-6 flex items-center space-x-2">
//           <input
//             type="text"
//             value={newPaymentMethod}
//             onChange={(e) => setNewPaymentMethod(e.target.value)}
//             placeholder="Add a new payment method"
//             className="flex-grow"
//           />
//           <button onClick={handleAddPaymentMethod} className="btn-add p-3">
//             <PlusIcon className="h-5 w-5" />
//           </button>
//         </div>
//       </Card>
//     </>
//   );
// }
