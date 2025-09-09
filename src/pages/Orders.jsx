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
        <p className="text-gray-500">
          No orders found. Waiting for first booking.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                {/* New: Index Serial */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xl font-medium text-gray-400 uppercase tracking-wider"
                >
                  #
                </th>
                {/* New: Unique Order ID */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Order ID
                </th>
                {/* New: Camp Name */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Camp Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Room
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Service
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Pickup
                </th>
                {/* New: Pickup Slot */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Pickup Slot
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Payment Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-700">
              {orders.map((order, index) => (
                <tr key={order.id}>
                  {/* New: Index Serial */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {index + 1}
                  </td>
                  {/* New: Unique Order ID */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {order.id}
                  </td>
                  {/* New: Camp Name */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {order.camp_name || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {order.room_number}
                  </td>
                  {/* Updated: Multiple Services */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {order.services && order.services.length > 0
                      ? order.services.map((service) => service.name).join(", ")
                      : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {order.pickup_method}
                  </td>
                  {/* New: Pickup Slot */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {order.pickup_slot?.name || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span
                      className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                        order.payment_confirmed
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
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
//                   Payment Status
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-gray-900 divide-y divide-gray-700">
//               {orders.map((order) => (
//                 <tr key={order.id}>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
//                     {order.room_number}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                     {order.service?.name || "—"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                     {order.pickup_method}
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
