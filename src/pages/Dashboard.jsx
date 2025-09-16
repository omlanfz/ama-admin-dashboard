import Card from "../components/Card";
import { useEffect, useState } from "react";
import { fetchLaundryOrders } from "../api/bookings";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLaundryOrders()
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard data:", err);
        setLoading(false);
      });
  }, []);

  const today = new Date().toLocaleDateString();

  const todaysOrders = orders.filter(
    (order) => new Date(order.order_timestamp).toLocaleDateString() === today
  );
  const pendingOrders = orders.filter(
    (order) => order.order_status !== "completed"
  );
  const completedOrdersToday = todaysOrders.filter(
    (order) => order.order_status === "completed"
  );
  const estimatedRevenueToday = completedOrdersToday.reduce((sum, order) => {
    return sum + parseFloat(order.total_price || 0);
  }, 0);
  const activeCustomersToday = [
    ...new Set(todaysOrders.map((order) => order.customer_name)),
  ].length;

  if (loading) {
    return (
      <Card title="Dashboard Overview">
        <p>Loading...</p>
      </Card>
    );
  }

  return (
    <>
      <Card title="Dashboard Overview">
        <p>Welcome back, Admin! Here's a quick summary of today's activity.</p>
      </Card>

      <div className="dashboard-grid">
        <Card title="Today's Orders">
          <p className="dashboard-metric">{todaysOrders.length}</p>
        </Card>

        <Card title="Pending Orders">
          <p className="dashboard-metric">{pendingOrders.length}</p>
        </Card>

        <Card title="Completed Orders Today">
          <p className="dashboard-metric">{completedOrdersToday.length}</p>
        </Card>

        <Card title="Estimated Revenue (Today)">
          <p className="dashboard-metric">
            ${estimatedRevenueToday.toFixed(2)}
          </p>
        </Card>

        <Card title="Active Customers Today">
          <p className="dashboard-metric">{activeCustomersToday}</p>
        </Card>
      </div>
    </>
  );
}
