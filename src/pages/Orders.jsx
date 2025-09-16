import { useEffect, useState } from "react";
import Card from "../components/Card";
import { fetchLaundryOrders } from "../api/bookings";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    customerName: "all",
    campName: "all",
    roomNumber: "all",
    service: "all",
    paymentStatus: "all",
    pickupMethod: "all",
    minPrice: "",
    maxPrice: "",
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const uniqueCustomerNames = [
    ...new Set(orders.map((order) => order.customer_name).filter(Boolean)),
  ];
  const uniqueCampNames = [
    ...new Set(orders.map((order) => order.camp_name).filter(Boolean)),
  ];
  const uniqueRoomNumbers = [
    ...new Set(orders.map((order) => order.room_number).filter(Boolean)),
  ];
  const uniqueServices = [
    ...new Set(
      orders
        .flatMap((order) =>
          order.services ? order.services.map((service) => service.name) : []
        )
        .filter(Boolean)
    ),
  ];
  const uniquePickupMethods = [
    ...new Set(orders.map((order) => order.pickup_method).filter(Boolean)),
  ];

  useEffect(() => {
    fetchLaundryOrders()
      .then((data) => {
        if (!Array.isArray(data)) {
          setError(true);
        } else {
          setOrders(data);
          setFilteredOrders(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch orders:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  const applyFilters = () => {
    let result = orders;

    if (tempFilters.customerName !== "all") {
      result = result.filter(
        (order) => order.customer_name === tempFilters.customerName
      );
    }

    if (tempFilters.campName !== "all") {
      result = result.filter(
        (order) => order.camp_name === tempFilters.campName
      );
    }

    if (tempFilters.roomNumber !== "all") {
      result = result.filter(
        (order) => order.room_number.toString() === tempFilters.roomNumber
      );
    }

    if (tempFilters.service !== "all") {
      result = result.filter((order) =>
        order.services?.some((service) => service.name === tempFilters.service)
      );
    }

    if (tempFilters.paymentStatus !== "all") {
      const status = tempFilters.paymentStatus === "confirmed";
      result = result.filter((order) => order.payment_confirmed === status);
    }

    if (tempFilters.pickupMethod !== "all") {
      result = result.filter(
        (order) => order.pickup_method === tempFilters.pickupMethod
      );
    }

    if (tempFilters.minPrice) {
      result = result.filter(
        (order) =>
          parseFloat(order.total_price || 0) >= parseFloat(tempFilters.minPrice)
      );
    }

    if (tempFilters.maxPrice) {
      result = result.filter(
        (order) =>
          parseFloat(order.total_price || 0) <= parseFloat(tempFilters.maxPrice)
      );
    }

    setFilteredOrders(result);
    setFilters({ ...tempFilters });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    const resetValues = {
      customerName: "all",
      campName: "all",
      roomNumber: "all",
      service: "all",
      paymentStatus: "all",
      pickupMethod: "all",
      minPrice: "",
      maxPrice: "",
    };
    setTempFilters(resetValues);
    setFilters(resetValues);
    setFilteredOrders(orders);
  };

  return (
    <Card title="Today's Orders">
      {loading ? (
        <p style={{ color: "black" }}>Loading orders...</p>
      ) : error ? (
        <p style={{ color: "black" }}>
          Error loading orders. Please try again.
        </p>
      ) : (
        <>
          {/* Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "White",
              color: "black",
              border: "none",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              cursor: "pointer",
              marginBottom: "1rem",
            }}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          {/* Filter Section */}
          {showFilters && (
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                borderRadius: "0.5rem",
                padding: "1.5rem",
                marginBottom: "1.5rem",
                border: "1px solid #e5e7eb",
                color: "black",
              }}
            >
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  color: "black",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                Filter Orders
                <button
                  onClick={() => setShowFilters(false)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    fontSize: "1rem",
                    cursor: "pointer",
                    color: "black",
                  }}
                >
                  ✖ Cancel
                </button>
              </h3>

              {/* === Full Filter Inputs === */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                  color: "black",
                }}
              >
                {/* Customer Name */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label htmlFor="customerName" style={{ color: "black" }}>
                    Customer Name
                  </label>
                  <select
                    id="customerName"
                    name="customerName"
                    value={tempFilters.customerName}
                    onChange={handleFilterChange}
                    style={{ color: "black" }}
                  >
                    <option value="all">All Customers</option>
                    {uniqueCustomerNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Camp Name */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label htmlFor="campName" style={{ color: "black" }}>
                    Camp Name
                  </label>
                  <select
                    id="campName"
                    name="campName"
                    value={tempFilters.campName}
                    onChange={handleFilterChange}
                    style={{ color: "black" }}
                  >
                    <option value="all">All Camps</option>
                    {uniqueCampNames.map((camp) => (
                      <option key={camp} value={camp}>
                        {camp}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Room Number */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label htmlFor="roomNumber" style={{ color: "black" }}>
                    Room Number
                  </label>
                  <select
                    id="roomNumber"
                    name="roomNumber"
                    value={tempFilters.roomNumber}
                    onChange={handleFilterChange}
                    style={{ color: "black" }}
                  >
                    <option value="all">All Rooms</option>
                    {uniqueRoomNumbers.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label htmlFor="service" style={{ color: "black" }}>
                    Service
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={tempFilters.service}
                    onChange={handleFilterChange}
                    style={{ color: "black" }}
                  >
                    <option value="all">All Services</option>
                    {uniqueServices.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Status */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label htmlFor="paymentStatus" style={{ color: "black" }}>
                    Payment Status
                  </label>
                  <select
                    id="paymentStatus"
                    name="paymentStatus"
                    value={tempFilters.paymentStatus}
                    onChange={handleFilterChange}
                    style={{ color: "black" }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="unconfirmed">Unconfirmed</option>
                  </select>
                </div>

                {/* Pickup Method */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label htmlFor="pickupMethod" style={{ color: "black" }}>
                    Pickup Method
                  </label>
                  <select
                    id="pickupMethod"
                    name="pickupMethod"
                    value={tempFilters.pickupMethod}
                    onChange={handleFilterChange}
                    style={{ color: "black" }}
                  >
                    <option value="all">All Methods</option>
                    {uniquePickupMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min Price */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label htmlFor="minPrice" style={{ color: "black" }}>
                    Min Price ($)
                  </label>
                  <input
                    type="number"
                    id="minPrice"
                    name="minPrice"
                    value={tempFilters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min price"
                    style={{ color: "black" }}
                  />
                </div>

                {/* Max Price */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label htmlFor="maxPrice" style={{ color: "black" }}>
                    Max Price ($)
                  </label>
                  <input
                    type="number"
                    id="maxPrice"
                    name="maxPrice"
                    value={tempFilters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max price"
                    style={{ color: "black" }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "black",
                }}
              >
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={applyFilters}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#3b82f6",
                      color: "black",
                      border: "none",
                      borderRadius: "0.375rem",
                    }}
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={resetFilters}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#6b7280",
                      color: "black",
                      border: "none",
                      borderRadius: "0.375rem",
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
                <span>
                  Showing {filteredOrders.length} of {orders.length} orders
                </span>
              </div>
            </div>
          )}

          {/* Orders Table */}
          {filteredOrders.length === 0 ? (
            <p style={{ color: "black" }}>No orders match your filters.</p>
          ) : (
            <div className="orders-table-container" style={{ color: "black" }}>
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
                {/* / ***** START OF CHANGES ***** /
                 */}
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr key={order.id}>
                      <td data-label="#">{index + 1}</td>
                      <td data-label="Order ID">{order.id}</td>
                      <td data-label="Customer Name">
                        {order.customer_name || "—"}
                      </td>
                      <td data-label="Camp Name">{order.camp_name || "—"}</td>
                      <td data-label="Room">{order.room_number}</td>
                      <td data-label="Service">
                        {order.services?.length > 0 ? (
                          <ol>
                            {order.services.map((service) => (
                              <li key={service.id}>{service.name}</li>
                            ))}
                          </ol>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td data-label="Total Price">
                        ${parseFloat(order.total_price || 0).toFixed(2)} AUD
                      </td>
                      <td data-label="Pickup">{order.pickup_method}</td>
                      <td data-label="Pickup Slot">
                        {order.pickup_slot?.acf?.time || "—"}
                      </td>
                      <td data-label="Instructions">
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
                          {order.payment_confirmed
                            ? "Confirmed"
                            : "Unconfirmed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* / ***** END OF CHANGES ***** /
                 */}
              </table>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
