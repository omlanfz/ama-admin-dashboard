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

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const settings = await getSettings();
        setPrices(settings.prices);
        setPickupSlots(settings.pickupSlots);
        setPaymentMethods(settings.paymentMethods);
        setDailyAvailability(settings.dailyAvailability.isAvailable);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
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
    updateServicePrice(id, newPrice);
  };

  const handleAddSlot = async () => {
    if (newSlot.trim()) {
      const newPickupSlot = await createPickupSlot(newSlot.trim());
      setPickupSlots([...pickupSlots, newPickupSlot]);
      setNewSlot("");
    }
  };

  const handleDeleteSlot = async (id) => {
    await deletePickupSlot(id);
    setPickupSlots(pickupSlots.filter((slot) => slot.id !== id));
  };

  const handleAddPaymentMethod = async () => {
    if (newPaymentMethod.trim()) {
      const newMethod = await createPaymentMethod(newPaymentMethod.trim());
      setPaymentMethods([...paymentMethods, newMethod]);
      setNewPaymentMethod("");
    }
  };

  const handleDeletePaymentMethod = async (id) => {
    await deletePaymentMethod(id);
    setPaymentMethods(paymentMethods.filter((method) => method.id !== id));
  };

  const handleToggleAvailability = () => {
    const newAvailability = !dailyAvailability;
    setDailyAvailability(newAvailability);
    updateSettings({
      dailyAvailability: { isAvailable: newAvailability },
    });
  };

  if (loading) {
    return (
      <div className="flex-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <header className="text-center">
        <h1>Control Panel</h1>
        <p className="sub">Use these settings to configure your service.</p>
      </header>

      <Card title="Daily Availability">
        <div className="toggle-container">
          <p>
            {dailyAvailability
              ? "Available today"
              : "Fully booked today, happy to serve you tomorrow."}
          </p>
          <button
            onClick={handleToggleAvailability}
            className={`btn ${dailyAvailability ? "btn-danger" : "btn-add"}`}
          >
            {dailyAvailability ? "Deactivate Today" : "Activate Today"}
          </button>
        </div>
      </Card>

      <Card title="Service Pricing">
        <div className="list-table">
          {prices.map((item) => (
            <div key={item.id} className="list-item">
              <span className="label">{item.name}</span>
              <div className="flex items-center">
                <span className="mr-2">$</span>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) => handlePriceChange(item.id, e.target.value)}
                  className="w-24 text-right"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Pickup Schedules">
        <div className="list-table">
          {pickupSlots.map((slot) => (
            <div key={slot.id} className="list-item">
              <span className="label">{slot.time}</span>
              <button
                onClick={() => handleDeleteSlot(slot.id)}
                className="btn-danger p-2"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center space-x-2">
          <input
            type="text"
            value={newSlot}
            onChange={(e) => setNewSlot(e.target.value)}
            placeholder="e.g., 20:00 - 21:00"
            className="flex-grow"
          />
          <button onClick={handleAddSlot} className="btn-add p-3">
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
      </Card>

      <Card title="Payment Methods">
        <div className="list-table">
          {paymentMethods.map((method) => (
            <div key={method.id} className="list-item">
              <span className="label">{method.name}</span>
              <button
                onClick={() => handleDeletePaymentMethod(method.id)}
                className="btn-danger p-2"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center space-x-2">
          <input
            type="text"
            value={newPaymentMethod}
            onChange={(e) => setNewPaymentMethod(e.target.value)}
            placeholder="Add a new payment method"
            className="flex-grow"
          />
          <button onClick={handleAddPaymentMethod} className="btn-add p-3">
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
      </Card>
    </>
  );
}

// import { useState, useEffect } from "react";
// import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
// // import Card from "../components/Card";

// // Mock API functions to simulate communication with the WordPress backend
// // In a real application, replace these with actual API calls (e.g., using fetch or axios)
// // Mock API to simulate fetching and updating settings
// const mockApi = {
//   getSettings: () => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve({
//           prices: [
//             { id: 1, name: "Uniforms - Yellow", price: 12.5 },
//             { id: 2, name: "Uniforms - Orange", price: 12.5 },
//             { id: 3, name: "Uniforms - Pink", price: 12.5 },
//             { id: 4, name: "Other - Underwear", price: 8.0 },
//             { id: 5, name: "Other - Socks", price: 8.0 },
//             { id: 6, name: "Other - Sportswear", price: 8.0 },
//           ],
//           pickupSlots: [
//             { id: 1, time: "06:00 - 07:00" },
//             { id: 2, time: "07:00 - 08:00" },
//             { id: 3, time: "18:00 - 19:00" },
//             { id: 4, time: "19:00 - 20:00" },
//           ],
//           paymentMethods: [
//             { id: 1, name: "Stripe" },
//             { id: 2, name: "Square" },
//             { id: 3, name: "PayPal" },
//           ],
//           dailyAvailability: {
//             isAvailable: true,
//           },
//         });
//       }, 500);
//     });
//   },
//   updateSettings: (settings) => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         console.log("Updated settings:", settings);
//         resolve({ success: true });
//       }, 500);
//     });
//   },
// };

// // Reusable Card component
// const Card = ({ title, children }) => (
//   <div className="card">
//     <h2>{title}</h2>
//     <div>{children}</div>
//   </div>
// );

// // Main component
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
//         const settings = await mockApi.getSettings();
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
//     mockApi.updateSettings({ prices: updatedPrices });
//   };

//   const handleAddSlot = () => {
//     if (newSlot.trim()) {
//       const updatedSlots = [
//         ...pickupSlots,
//         { id: Date.now(), time: newSlot.trim() },
//       ];
//       setPickupSlots(updatedSlots);
//       setNewSlot("");
//       mockApi.updateSettings({ pickupSlots: updatedSlots });
//     }
//   };

//   const handleDeleteSlot = (id) => {
//     const updatedSlots = pickupSlots.filter((slot) => slot.id !== id);
//     setPickupSlots(updatedSlots);
//     mockApi.updateSettings({ pickupSlots: updatedSlots });
//   };

//   const handleAddPaymentMethod = () => {
//     if (newPaymentMethod.trim()) {
//       const updatedMethods = [
//         ...paymentMethods,
//         { id: Date.now(), name: newPaymentMethod.trim() },
//       ];
//       setPaymentMethods(updatedMethods);
//       setNewPaymentMethod("");
//       mockApi.updateSettings({ paymentMethods: updatedMethods });
//     }
//   };

//   const handleDeletePaymentMethod = (id) => {
//     const updatedMethods = paymentMethods.filter((method) => method.id !== id);
//     setPaymentMethods(updatedMethods);
//     mockApi.updateSettings({ paymentMethods: updatedMethods });
//   };

//   const handleToggleAvailability = () => {
//     setDailyAvailability(!dailyAvailability);
//     mockApi.updateSettings({
//       dailyAvailability: { isAvailable: !dailyAvailability },
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex-center min-h-screen bg-gray-900 text-gray-200">
//         <svg
//           className="animate-spin h-8 w-8 text-white"
//           xmlns="http://www.w3.org/2000/svg"
//           fill="none"
//           viewBox="0 0 24 24"
//         >
//           <circle
//             className="opacity-25"
//             cx="12"
//             cy="12"
//             r="10"
//             stroke="currentColor"
//             strokeWidth="4"
//           ></circle>
//           <path
//             className="opacity-75"
//             fill="currentColor"
//             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//           ></path>
//         </svg>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-900 text-gray-200 min-h-screen p-8 font-sans antialiased">
//       <div className="max-w-4xl mx-auto space-y-8">
//         {/* Header */}
//         <header className="text-center">
//           <h1 className="text-4xl font-bold text-white mb-2">Control Panel</h1>
//           <p className="text-gray-400">
//             Use these settings to configure your service.
//           </p>
//         </header>

//         {/* Daily Availability */}
//         <Card title="Daily Availability">
//           <div className="flex justify-between items-center">
//             <p className="text-lg">
//               {dailyAvailability
//                 ? "Available today"
//                 : "Fully booked today, happy to serve you tomorrow."}
//             </p>
//             <button
//               onClick={handleToggleAvailability}
//               className={`px-4 py-2 rounded-lg font-medium transition-colors ${
//                 dailyAvailability
//                   ? "bg-red-600 hover:bg-red-700"
//                   : "bg-green-600 hover:bg-green-700"
//               }`}
//             >
//               {dailyAvailability ? "Deactivate Today" : "Activate Today"}
//             </button>
//           </div>
//         </Card>

//         {/* Service Pricing */}
//         <Card title="Service Pricing">
//           <div className="space-y-4">
//             {prices.map((item) => (
//               <div
//                 key={item.id}
//                 className="flex justify-between items-center bg-gray-800 p-4 rounded-lg"
//               >
//                 <span className="text-lg font-medium">{item.name}</span>
//                 <div className="flex items-center">
//                   <span className="text-xl mr-2">$</span>
//                   <input
//                     type="number"
//                     value={item.price}
//                     onChange={(e) => handlePriceChange(item.id, e.target.value)}
//                     className="w-24 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg p-2 text-right focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </Card>

//         {/* Pickup Schedules */}
//         <Card title="Pickup Schedules">
//           <div className="space-y-4">
//             {pickupSlots.map((slot) => (
//               <div
//                 key={slot.id}
//                 className="flex justify-between items-center bg-gray-800 p-4 rounded-lg"
//               >
//                 <span className="text-lg font-medium">{slot.time}</span>
//                 <button
//                   onClick={() => handleDeleteSlot(slot.id)}
//                   className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
//                 >
//                   <TrashIcon className="h-5 w-5" />
//                 </button>
//               </div>
//             ))}
//           </div>
//           <div className="mt-6 flex items-center space-x-2">
//             <input
//               type="text"
//               value={newSlot}
//               onChange={(e) => setNewSlot(e.target.value)}
//               placeholder="e.g., 20:00 - 21:00"
//               className="flex-grow bg-gray-700 text-gray-200 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
//             />
//             <button
//               onClick={handleAddSlot}
//               className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
//             >
//               <PlusIcon className="h-5 w-5" />
//             </button>
//           </div>
//         </Card>

//         {/* Payment Methods */}
//         <Card title="Payment Methods">
//           <div className="space-y-4">
//             {paymentMethods.map((method) => (
//               <div
//                 key={method.id}
//                 className="flex justify-between items-center bg-gray-800 p-4 rounded-lg"
//               >
//                 <span className="text-lg font-medium">{method.name}</span>
//                 <button
//                   onClick={() => handleDeletePaymentMethod(method.id)}
//                   className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
//                 >
//                   <TrashIcon className="h-5 w-5" />
//                 </button>
//               </div>
//             ))}
//           </div>
//           <div className="mt-6 flex items-center space-x-2">
//             <input
//               type="text"
//               value={newPaymentMethod}
//               onChange={(e) => setNewPaymentMethod(e.target.value)}
//               placeholder="Add a new payment method"
//               className="flex-grow bg-gray-700 text-gray-200 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
//             />
//             <button
//               onClick={handleAddPaymentMethod}
//               className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
//             >
//               <PlusIcon className="h-5 w-5" />
//             </button>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }

// const mockApi = {
//   getSettings: () => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve({
//           prices: [
//             { id: 1, name: "Uniforms - Yellow", price: 12.5 },
//             { id: 2, name: "Uniforms - Orange", price: 12.5 },
//             { id: 3, name: "Uniforms - Pink", price: 12.5 },
//             { id: 4, name: "Other - Underwear", price: 8.0 },
//             { id: 5, name: "Other - Socks", price: 8.0 },
//             { id: 6, name: "Other - Sportswear", price: 8.0 },
//           ],
//           pickupSlots: [
//             { id: 1, time: "06:00 - 07:00" },
//             { id: 2, time: "07:00 - 08:00" },
//             { id: 3, time: "18:00 - 19:00" },
//             { id: 4, time: "19:00 - 20:00" },
//           ],
//           paymentMethods: [
//             { id: 1, name: "Stripe" },
//             { id: 2, name: "Square" },
//             { id: 3, name: "PayPal" },
//           ],
//           dailyAvailability: {
//             isAvailable: true,
//           },
//         });
//       }, 500);
//     });
//   },
//   updateSettings: (settings) => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         console.log("Updated settings:", settings);
//         resolve({ success: true });
//       }, 500);
//     });
//   },
// };

// // export default function ControlPanel() {
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
//         const settings = await mockApi.getSettings();
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
//     mockApi.updateSettings({ prices: updatedPrices });
//   };

//   const handleAddSlot = () => {
//     if (newSlot.trim()) {
//       const updatedSlots = [
//         ...pickupSlots,
//         { id: Date.now(), time: newSlot.trim() },
//       ];
//       setPickupSlots(updatedSlots);
//       setNewSlot("");
//       mockApi.updateSettings({ pickupSlots: updatedSlots });
//     }
//   };

//   const handleDeleteSlot = (id) => {
//     const updatedSlots = pickupSlots.filter((slot) => slot.id !== id);
//     setPickupSlots(updatedSlots);
//     mockApi.updateSettings({ pickupSlots: updatedSlots });
//   };

//   const handleAddPaymentMethod = () => {
//     if (newPaymentMethod.trim()) {
//       const updatedMethods = [
//         ...paymentMethods,
//         { id: Date.now(), name: newPaymentMethod.trim() },
//       ];
//       setPaymentMethods(updatedMethods);
//       setNewPaymentMethod("");
//       mockApi.updateSettings({ paymentMethods: updatedMethods });
//     }
//   };

//   const handleDeletePaymentMethod = (id) => {
//     const updatedMethods = paymentMethods.filter((method) => method.id !== id);
//     setPaymentMethods(updatedMethods);
//     mockApi.updateSettings({ paymentMethods: updatedMethods });
//   };

//   const handleToggleAvailability = () => {
//     setDailyAvailability(!dailyAvailability);
//     mockApi.updateSettings({
//       dailyAvailability: { isAvailable: !dailyAvailability },
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-200">
//         <svg
//           className="animate-spin h-8 w-8 text-white"
//           xmlns="http://www.w3.org/2000/svg"
//           fill="none"
//           viewBox="0 0 24 24"
//         >
//           <circle
//             className="opacity-25"
//             cx="12"
//             cy="12"
//             r="10"
//             stroke="currentColor"
//             strokeWidth="4"
//           ></circle>
//           <path
//             className="opacity-75"
//             fill="currentColor"
//             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//           ></path>
//         </svg>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-900 text-gray-200 min-h-screen p-8 font-sans antialiased">
//       <div className="max-w-4xl mx-auto space-y-8">
//         {/* Header */}
//         <div className="text-center">
//           <h1 className="text-4xl font-bold text-white mb-2">Control Panel</h1>
//           <p className="text-gray-400">
//             Use these settings to configure your service.
//           </p>
//         </div>

//         {/* Daily Availability */}
//         <Card title="Daily Availability">
//           <div className="flex justify-between items-center">
//             <p className="text-lg">
//               {dailyAvailability
//                 ? "Available today"
//                 : "Fully booked today, happy to serve you tomorrow."}
//             </p>
//             <button
//               onClick={handleToggleAvailability}
//               className={`px-4 py-2 rounded-lg font-medium transition-colors ${
//                 dailyAvailability
//                   ? "bg-red-600 hover:bg-red-700"
//                   : "bg-green-600 hover:bg-green-700"
//               }`}
//             >
//               {dailyAvailability ? "Deactivate Today" : "Activate Today"}
//             </button>
//           </div>
//         </Card>

//         {/* Service Pricing */}
//         <Card title="Service Pricing">
//           <div className="space-y-4">
//             {prices.map((item) => (
//               <div
//                 key={item.id}
//                 className="flex justify-between items-center bg-gray-800 p-4 rounded-lg"
//               >
//                 <span className="text-lg font-medium">{item.name}</span>
//                 <div className="flex items-center">
//                   <span className="text-xl mr-2">$</span>
//                   <input
//                     type="number"
//                     value={item.price}
//                     onChange={(e) => handlePriceChange(item.id, e.target.value)}
//                     className="w-24 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg p-2 text-right focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </Card>

//         {/* Pickup Schedules */}
//         <Card title="Pickup Schedules">
//           <div className="space-y-4">
//             {pickupSlots.map((slot) => (
//               <div
//                 key={slot.id}
//                 className="flex justify-between items-center bg-gray-800 p-4 rounded-lg"
//               >
//                 <span className="text-lg font-medium">{slot.time}</span>
//                 <button
//                   onClick={() => handleDeleteSlot(slot.id)}
//                   className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
//                 >
//                   <TrashIcon className="h-5 w-5" />
//                 </button>
//               </div>
//             ))}
//           </div>
//           <div className="mt-6 flex items-center space-x-2">
//             <input
//               type="text"
//               value={newSlot}
//               onChange={(e) => setNewSlot(e.target.value)}
//               placeholder="e.g., 20:00 - 21:00"
//               className="flex-grow bg-gray-700 text-gray-200 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
//             />
//             <button
//               onClick={handleAddSlot}
//               className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
//             >
//               <PlusIcon className="h-5 w-5" />
//             </button>
//           </div>
//         </Card>

//         {/* Payment Methods */}
//         <Card title="Payment Methods">
//           <div className="space-y-4">
//             {paymentMethods.map((method) => (
//               <div
//                 key={method.id}
//                 className="flex justify-between items-center bg-gray-800 p-4 rounded-lg"
//               >
//                 <span className="text-lg font-medium">{method.name}</span>
//                 <button
//                   onClick={() => handleDeletePaymentMethod(method.id)}
//                   className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
//                 >
//                   <TrashIcon className="h-5 w-5" />
//                 </button>
//               </div>
//             ))}
//           </div>
//           <div className="mt-6 flex items-center space-x-2">
//             <input
//               type="text"
//               value={newPaymentMethod}
//               onChange={(e) => setNewPaymentMethod(e.target.value)}
//               placeholder="Add a new payment method"
//               className="flex-grow bg-gray-700 text-gray-200 border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
//             />
//             <button
//               onClick={handleAddPaymentMethod}
//               className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
//             >
//               <PlusIcon className="h-5 w-5" />
//             </button>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }
