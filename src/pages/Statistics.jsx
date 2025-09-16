import Card from "../components/Card";
import { useEffect, useState } from "react";
import { fetchLaundryOrders } from "../api/bookings";

export default function Statistics() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refreshData = () => {
    setLoading(true);
    fetchLaundryOrders()
      .then((data) => {
        setOrders(data);
        setLoading(false);
        setLastUpdated(new Date());
      })
      .catch((err) => {
        console.error("Failed to fetch statistics data:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Improved date parsing that handles various formats
  const parseOrderDate = (dateString) => {
    if (!dateString || dateString === "—") return null;

    try {
      // Handle Australian format: "17/09/2025, 3:23:27 am"
      if (dateString.includes("/") && dateString.includes(",")) {
        const [datePart, timePart] = dateString.split(", ");
        const [day, month, year] = datePart.split("/");

        // Convert to ISO format: "2025-09-17T03:23:27"
        const timeParts = timePart.split(":");
        let hours = parseInt(timeParts[0]);
        const minutes = timeParts[1];
        const seconds = timeParts[2].split(" ")[0];
        const ampm = timePart.toLowerCase().includes("am") ? "am" : "pm";

        // Convert 12h to 24h format
        if (ampm === "pm" && hours < 12) hours += 12;
        if (ampm === "am" && hours === 12) hours = 0;

        const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
          2,
          "0"
        )}T${hours.toString().padStart(2, "0")}:${minutes}:${seconds}`;
        return new Date(isoDate);
      }

      // Handle ISO format: "2025-09-16T21:31:36"
      if (dateString.includes("T") && dateString.includes("-")) {
        return new Date(dateString);
      }

      // Handle other formats or return null
      console.warn("Unknown date format:", dateString);
      return null;
    } catch (error) {
      console.warn("Failed to parse date:", dateString, error);
      return null;
    }
  };

  const totalOrders = orders.length;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Simple string-based approach as fallback for month filtering
  const currentMonthFormatted = (currentMonth + 1).toString().padStart(2, "0");
  const currentYearFormatted = currentYear.toString();

  const ordersThisMonth = orders.filter((order) => {
    if (!order.order_timestamp || order.order_timestamp === "—") return false;

    // Method 1: Try parsing the date
    const orderDate = parseOrderDate(order.order_timestamp);
    if (orderDate) {
      return (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    }

    // Method 2: Fallback to string matching for month/year
    // Look for patterns like "/09/2025" (month/year)
    const monthYearPattern = `/${currentMonthFormatted}/${currentYearFormatted}`;
    return order.order_timestamp.includes(monthYearPattern);
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
    .flatMap((order) => order.services || [])
    .reduce((acc, service) => {
      if (service && service.name) {
        acc[service.name] = (acc[service.name] || 0) + 1;
      }
      return acc;
    }, {});

  const mostPopularService =
    Object.keys(serviceCounts).length > 0
      ? Object.keys(serviceCounts).reduce(
          (a, b) => (serviceCounts[a] > serviceCounts[b] ? a : b),
          Object.keys(serviceCounts)[0]
        )
      : "No data";

  const mostPopularServiceCount = serviceCounts[mostPopularService] || 0;

  // Debug: Log what's being filtered
  useEffect(() => {
    if (orders.length > 0) {
      console.log("=== STATISTICS DATE DEBUGGING ===");
      console.log(
        "Current month/year:",
        `${currentMonthFormatted}/${currentYearFormatted}`
      );
      console.log("Total orders:", orders.length);

      orders.forEach((order, index) => {
        const orderDate = parseOrderDate(order.order_timestamp);
        const isThisMonth = orderDate
          ? orderDate.getMonth() === currentMonth &&
            orderDate.getFullYear() === currentYear
          : order.order_timestamp &&
            order.order_timestamp.includes(
              `/${currentMonthFormatted}/${currentYearFormatted}`
            );

        console.log(
          `Order ${index}:`,
          order.order_timestamp,
          "-> This month?",
          isThisMonth
        );
      });

      console.log("Orders this month:", ordersThisMonth.length);
      console.log("Revenue this month:", revenueThisMonth);
    }
  }, [orders, currentMonthFormatted, currentYearFormatted]);

  if (loading) {
    return (
      <div className="statistics-grid">
        <Card title="Loading Statistics">
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
    { label: "Cancelled Orders (This Month)", value: 0 },
  ];

  return (
    <div>
      <Card title="Statistics Overview">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p>Comprehensive order statistics and analytics</p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={refreshData}
              style={{
                padding: "5px 10px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Refresh
            </button>
            <small style={{ color: "#666" }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </small>
          </div>
        </div>
      </Card>

      <div className="dashboard-grid">
        {stats.map((stat, index) => (
          <Card key={index} title={stat.label}>
            <p className="statistics-metric">{stat.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
