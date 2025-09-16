import Card from "../components/Card";
import { useEffect, useState } from "react";
import { fetchLaundryOrders } from "../api/bookings";

export default function Statistics() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLaundryOrders()
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch statistics data:", err);
        setLoading(false);
      });
  }, []);

  const totalOrders = orders.length;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const ordersThisMonth = orders.filter((order) => {
    const orderDate = new Date(order.order_timestamp);
    return (
      orderDate.getMonth() === currentMonth &&
      orderDate.getFullYear() === currentYear
    );
  });

  const revenueThisMonth = ordersThisMonth.reduce((sum, order) => {
    return sum + parseFloat(order.total_price || 0);
  }, 0);

  const averageOrderValue =
    totalOrders > 0
      ? orders.reduce(
          (sum, order) => sum + parseFloat(order.total_price || 0),
          0
        ) / totalOrders
      : 0;

  const serviceCounts = orders
    .flatMap((order) => order.services)
    .reduce((acc, service) => {
      if (service) {
        acc[service.name] = (acc[service.name] || 0) + 1;
      }
      return acc;
    }, {});

  const mostPopularService = Object.keys(serviceCounts).reduce(
    (a, b) => (serviceCounts[a] > serviceCounts[b] ? a : b),
    ""
  );
  const mostPopularServiceCount = serviceCounts[mostPopularService] || 0;

  // No cancelled status is available, so this will be 0
  const cancelledOrdersThisMonth = 0;

  if (loading) {
    return (
      <div className="statistics-grid">
        <Card title="Total Orders (All Time)">
          <p className="statistics-metric">Loading...</p>
        </Card>
      </div>
    );
  }

  const stats = [
    { label: "Total Orders (All Time)", value: totalOrders },
    { label: "Revenue This Month", value: `$${revenueThisMonth.toFixed(2)}` },
    { label: "Orders This Month", value: ordersThisMonth.length },
    {
      label: "Average Order Value (AOV)",
      value: `$${averageOrderValue.toFixed(2)}`,
    },
    {
      label: "Most Popular Service",
      value: `${mostPopularService} (${mostPopularServiceCount} orders)`,
    },
    { label: "Cancelled Orders (This Month)", value: cancelledOrdersThisMonth },
  ];

  return (
    <div className="statistics-grid">
      {stats.map((stat, index) => (
        <Card key={index} title={stat.label}>
          <p className="statistics-metric">{stat.value}</p>
        </Card>
      ))}
    </div>
  );
}
