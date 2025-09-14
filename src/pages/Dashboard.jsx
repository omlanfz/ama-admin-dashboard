import Card from "../components/Card";
import ToggleSwitch from "../components/ToggleSwitch";
import { useEffect, useState } from "react";
import { fetchLaundryOrders } from "../api/bookings";

export default function Dashboard() {
  const [available, setAvailable] = useState(true);
  const [orders, setOrders] = useState([]);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    fetchLaundryOrders()
      .then((data) => {
        setOrders(data);

        // Calculate total revenue
        const total = data.reduce((sum, order) => {
          const price = parseFloat(order.service?.price || 0);
          return sum + price;
        }, 0);

        setRevenue(total);
      })
      .catch((err) => console.error("Failed to fetch dashboard data:", err));
  }, []);

  return (
    <>
      <Card title="Dashboard Overview">
        <p>Welcome back, Admin! Here's a quick summary of today's activity.</p>
      </Card>

      <Card title="Daily Availability">
        <div className="toggle-container">
          <div>
            <strong>Service Availability Today</strong>
            <p className="sub">
              {available
                ? "Active and recurring bookings."
                : "Inactive. 'Fully booked today...' message will display."}
            </p>
          </div>
          <ToggleSwitch
            checked={available}
            onChange={() => setAvailable(!available)}
          />
        </div>
      </Card>

      <div className="dashboard-grid">
        <Card title="Today's Orders">
          <p className="dashboard-metric">{orders.length}</p>
        </Card>
        <Card title="Estimated Revenue">
          <p className="dashboard-metric">${revenue.toFixed(2)}</p>
        </Card>
      </div>
    </>
  );
}