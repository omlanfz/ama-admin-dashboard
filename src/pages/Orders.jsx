import { useEffect, useState } from "react";
import Card from "../components/Card";
import { fetchLaundryOrders } from "../api/bookings";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchLaundryOrders()
      .then((data) => {
        if (!Array.isArray(data)) {
          setError(true);
        } else {
          setOrders(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch orders:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <Card title="Today's Orders">
      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p className="text-red-500">Error loading orders. Please try again.</p>
      ) : orders.length === 0 ? (
        <p>No orders found. Waiting for first booking.</p>
      ) : (
        <div className="orders-table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Order ID</th>
                <th>Camp Name</th>
                <th>Room</th>
                <th>Service</th>
                <th>Pickup</th>
                <th>Pickup Slot</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order.id}>
                  <td data-label="#">{index + 1}</td>
                  <td data-label="Order ID">{order.id}</td>
                  <td data-label="Camp Name">{order.camp_name || "—"}</td>
                  <td data-label="Room">{order.room_number}</td>
                  <td data-label="Service">
                    {order.services && order.services.length > 0
                      ? order.services.map((service) => service.name).join(", ")
                      : "—"}
                  </td>
                  <td data-label="Pickup">{order.pickup_method}</td>
                  <td data-label="Pickup Slot">
                    {order.pickup_slot?.acf?.time || "—"}
                  </td>
                  <td data-label="Payment Status">
                    <span
                      className={`status ${
                        order.payment_confirmed
                          ? "status-confirmed"
                          : "status-unconfirmed"
                      }`}
                    >
                      {order.payment_confirmed ? "Confirmed" : "Unconfirmed"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

// import { useEffect, useState } from "react";
// import Card from "../components/Card";
// import { fetchLaundryOrders } from "../api/bookings";

// export default function Orders() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   useEffect(() => {
//     fetchLaundryOrders()
//       .then((data) => {
//         if (!Array.isArray(data)) {
//           setError(true);
//         } else {
//           setOrders(data);
//         }
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Failed to fetch orders:", err);
//         setError(true);
//         setLoading(false);
//       });
//   }, []);

//   return (
//     <Card title="Today's Orders">
//       {loading ? (
//         <p>Loading orders...</p>
//       ) : error ? (
//         <p className="text-red-500">Error loading orders. Please try again.</p>
//       ) : orders.length === 0 ? (
//         <p className="text-gray-500">
//           No orders found. Waiting for first booking.
//         </p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-700">
//             <thead className="bg-gray-800">
//               <tr>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xl font-medium text-gray-400 uppercase tracking-wider"
//                 >
//                   #
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
//                 >
//                   Order ID
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
//                 >
//                   Camp Name
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
//                 >
//                   Room
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
//                 >
//                   Service
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
//                 >
//                   Pickup
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
//                 >
//                   Pickup Slot
//                 </th>
//                 <th
//                   scope="col"
//                   className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
//                 >
//                   Payment Status
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-gray-900 divide-y divide-gray-700">
//               {orders.map((order, index) => (
//                 <tr key={order.id}>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
//                     {index + 1}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                     {order.id}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                     {order.camp_name || "—"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
//                     {order.room_number}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                     {order.services && order.services.length > 0
//                       ? order.services.map((service) => service.name).join(", ")
//                       : "—"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                     {order.pickup_method}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                     {/* Correctly accessing the pickup slot time */}
//                     {order.pickup_slot?.acf?.time || "—"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <span
//                       className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
//                         order.payment_confirmed
//                           ? "bg-green-100 text-green-800"
//                           : "bg-yellow-100 text-yellow-800"
//                       }`}
//                     >
//                       {order.payment_confirmed ? "Confirmed" : "Unconfirmed"}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </Card>
//   );
// }
