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
        <p className="orders-loading">Loading orders...</p>
      ) : error ? (
        <p className="orders-error">Error loading orders. Please try again.</p>
      ) : orders.length === 0 ? (
        <p className="orders-none">
          No orders found. Waiting for first booking.
        </p>
      ) : (
        <div className="orders-table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Camp Name</th>
                <th>Room</th>
                <th>Service</th>
                <th>Total Price</th>
                <th>Pickup</th>
                <th>Pickup Slot</th>
                <th>Instructions</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order.id}>
                  <td data-label="#">{index + 1}</td>
                  <td data-label="Order ID">{order.id}</td>
                  <td data-label="Customer Name">
                    {order.customer_name || "—"}
                  </td>
                  <td data-label="Camp Name">{order.camp_name || "—"}</td>
                  <td data-label="Room">{order.room_number}</td>
                  <td data-label="Service">
                    {order.services && order.services.length > 0 ? (
                      <ol className="orders-list">
                        {order.services.map((service) => (
                          <li key={service.id}>{service.name}</li>
                        ))}
                      </ol>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td data-label="Total Price" className="font-semibold">
                    ${parseFloat(order.total_price || 0).toFixed(2)} AUD
                  </td>
                  <td data-label="Pickup">{order.pickup_method}</td>
                  <td data-label="Pickup Slot">
                    {order.pickup_slot?.acf?.time || "—"}
                  </td>
                  <td
                    data-label="Instructions"
                    style={{ whiteSpace: "normal" }}
                  >
                    {order.special_instructions || "—"}
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
