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
        <div className="list-table">
          {orders.map((order) => (
            <div key={order.id}>
              <div className="label">
                <strong>Room:</strong> {order.room_number}
              </div>
              <div className="label">
                <strong>Service:</strong> {order.service?.name || "—"}
              </div>
              <div className="label">
                <strong>Pickup:</strong> {order.pickup_method}
              </div>
              <div className="value">
                {order.payment_confirmed ? "Confirmed" : "Unconfirmed"}
              </div>
              <select
                value={order.payment_confirmed ? "Confirmed" : "Unconfirmed"}
                onChange={(e) =>
                  setOrders((prev) =>
                    prev.map((o) =>
                      o.id === order.id
                        ? {
                            ...o,
                            payment_confirmed: e.target.value === "Confirmed",
                          }
                        : o
                    )
                  )
                }
              >
                <option>Unconfirmed</option>
                <option>Confirmed</option>
              </select>
            </div>
          ))}
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

//   useEffect(() => {
//     fetchLaundryOrders()
//       .then((data) => {
//         setOrders(data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Failed to fetch orders:", err);
//         setLoading(false);
//       });
//   }, []);

//   return (
//     <Card title="Today's Orders">
//       {loading ? (
//         <p>Loading orders...</p>
//       ) : orders.length === 0 ? (
//         <p className="text-gray-500">
//           No orders found. Waiting for first booking.
//         </p>
//       ) : (
//         <div className="list-table">
//           {orders.map((order) => (
//             <div key={order.id}>
//               <div className="label">
//                 <strong>Room:</strong> {order.room_number}
//               </div>
//               <div className="label">
//                 <strong>Service:</strong> {order.service?.name || "—"}
//               </div>
//               <div className="label">
//                 <strong>Pickup:</strong> {order.pickup_method}
//               </div>
//               <div className="value">
//                 {order.payment_confirmed ? "Confirmed" : "Unconfirmed"}
//               </div>
//               <select
//                 value={order.payment_confirmed ? "Confirmed" : "Unconfirmed"}
//                 onChange={(e) =>
//                   setOrders((prev) =>
//                     prev.map((o) =>
//                       o.id === order.id
//                         ? {
//                             ...o,
//                             payment_confirmed: e.target.value === "Confirmed",
//                           }
//                         : o
//                     )
//                   )
//                 }
//               >
//                 <option>Unconfirmed</option>
//                 <option>Confirmed</option>
//               </select>
//             </div>
//           ))}
//         </div>
//       )}
//     </Card>
//   );
// }

// import { useState } from "react";
// import Card from "../components/Card";

// export default function Orders() {
//   const [orders, setOrders] = useState([
//     { id: 1, customer: "Ayesha", service: "Wash & Fold", status: "Pending" },
//     { id: 2, customer: "Rahim", service: "Dry Cleaning", status: "Completed" },
//     { id: 3, customer: "Karim", service: "Ironing", status: "In Progress" },
//   ]);

//   const updateStatus = (id, newStatus) => {
//     setOrders((prev) =>
//       prev.map((order) =>
//         order.id === id ? { ...order, status: newStatus } : order
//       )
//     );
//   };

//   return (
//     <Card title="Today's Orders">
//       <div className="list-table">
//         {orders.map((order) => (
//           <div key={order.id}>
//             <div className="label">{order.customer}</div>
//             <div className="label">{order.service}</div>
//             <div className="value">{order.status}</div>
//             <select
//               value={order.status}
//               onChange={(e) => updateStatus(order.id, e.target.value)}
//             >
//               <option>Pending</option>
//               <option>In Progress</option>
//               <option>Completed</option>
//             </select>
//           </div>
//         ))}
//       </div>
//     </Card>
//   );
// }
