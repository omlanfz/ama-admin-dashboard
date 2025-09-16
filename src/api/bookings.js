const API_BASE = "https://amalaundry.com.au/wp-json/wp/v2";

function getToken() {
  const token = localStorage.getItem("jwt");
  if (!token) {
    console.warn("JWT token missing");
  }
  return token;
}

export async function fetchService(id) {
  if (!id) {
    console.error("fetchService called with invalid ID:", id);
    return null;
  }
  try {
    const res = await fetch(`${API_BASE}/service/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) {
      console.error(`Failed to fetch service with ID ${id}: ${res.statusText}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch service with ID ${id}:`, err);
    return null;
  }
}

export async function fetchPickupSlot(id) {
  if (!id) {
    console.error("fetchPickupSlot called with invalid ID:", id);
    return null;
  }
  try {
    const res = await fetch(`${API_BASE}/pickup_slot/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) {
      console.error(
        `Failed to fetch pickup slot with ID ${id}: ${res.statusText}`
      );
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch pickup slot with ID ${id}:`, err);
    return null;
  }
}

async function fetchCamp(id) {
  if (!id) {
    console.error("fetchCamp called with invalid ID:", id);
    return null;
  }
  try {
    const res = await fetch(`${API_BASE}/camp/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) {
      console.error(`Failed to fetch camp with ID ${id}: ${res.statusText}`);
      return null;
    }
    const campData = await res.json();
    return campData.title?.rendered || "Unknown Camp";
  } catch (err) {
    console.error(`Failed to fetch camp with ID ${id}:`, err);
    return null;
  }
}

export async function fetchLaundryOrders() {
  const token = getToken();
  if (!token) return [];

  try {
    const res = await fetch(`${API_BASE}/laundry_order?per_page=100`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error("Laundry order fetch failed:", res.statusText);
      return [];
    }

    const orders = await res.json();

    if (!Array.isArray(orders)) {
      console.error("Fetched data is not an array:", orders);
      return [];
    }

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const acf = order.acf || {};

        const serviceIds = Array.isArray(acf.service_id)
          ? acf.service_id
          : [acf.service_id].filter(Boolean);

        const fetchedServices = await Promise.all(
          serviceIds.map((id) => fetchService(id))
        );
        const services = fetchedServices.filter(Boolean).map((service) => ({
          id: service.id,
          name: service.title?.rendered || "",
          slug: service.acf?.slug || "",
          price: service.acf?.price || "",
        }));

        const slot = acf.slot_id ? await fetchPickupSlot(acf.slot_id) : null;

        // Fetch the camp name using the new helper function
        const campName = acf.camp_name ? await fetchCamp(acf.camp_name) : "—";

        // Explicitly build the final order object to ensure all fields are included
        return {
          id: order.id,
          title: order.title?.rendered || "",

          // Fields from ACF
          customer_name: acf.customer_name || "—",
          room_number: acf.room_number || "—",
          pickup_method: acf.pickup_method || "—",
          payment_confirmed: acf.payment_confirmed || false,
          total_price: acf.total_price || "0.00",
          special_instructions: acf.Special_Instructions || "—",
          order_status: acf.order_status || "pending", // This is the new field

          // Enriched/Resolved fields
          camp_name: campName, // Use the fetched name instead of the ID
          services: services,
          pickup_slot: slot,
        };
      })
    );

    return enrichedOrders;
  } catch (err) {
    console.error("Error fetching laundry orders:", err);
    return [];
  }
}

/**
 * Update the status of an order
 * @param {number} orderId - The ID of the order to update
 * @param {string} status - The new status ('completed' or 'pending')
 * @returns {Promise<Object>} - The updated order data
 */
export async function updateOrderStatus(orderId, status) {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token missing");
  }

  try {
    console.log(`Updating order ${orderId} to status: ${status}`);

    // Try the most common WordPress REST API approach first
    const response = await fetch(`${API_BASE}/laundry_order/${orderId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        acf: {
          order_status: status,
        },
      }),
    });

    const responseText = await response.text();
    console.log("Raw response:", responseText);

    if (!response.ok) {
      console.error("Server responded with error status:", response.status);

      // Try alternative approach if the first one fails
      return await updateOrderStatusAlternative(orderId, status, token);
    }

    try {
      const updatedOrder = JSON.parse(responseText);
      console.log("Order status updated successfully:", updatedOrder);
      return updatedOrder;
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      // Even if we can't parse the response, if status is OK, consider it a success
      return { id: orderId, order_status: status, success: true };
    }
  } catch (error) {
    console.error("Error in primary update method:", error);

    // Try the alternative method as fallback
    try {
      return await updateOrderStatusAlternative(orderId, status, token);
    } catch (fallbackError) {
      console.error("All update methods failed:", fallbackError);
      throw new Error(
        `Failed to update order status: ${fallbackError.message}`
      );
    }
  }
}

/**
 * Alternative method for updating order status
 */
async function updateOrderStatusAlternative(orderId, status, token) {
  try {
    console.log("Trying alternative update method...");

    // Method 2: Try using the standard REST API approach
    const response = await fetch(`${API_BASE}/laundry_order/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        order_status: status,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Alternative method failed:", errorText);
      throw new Error(`Alternative method failed: ${response.status}`);
    }

    const result = await response.json();
    console.log(
      "Order status updated successfully via alternative method:",
      result
    );
    return result;
  } catch (error) {
    console.error("Error in alternative update method:", error);
    throw error;
  }
}

/**
 * Debug function to check order data and ACF fields
 */
export async function debugOrder(orderId) {
  const token = getToken();
  if (!token) {
    console.error("No token available for debug");
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}/laundry_order/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(`Debug failed: ${response.status}`);
      return null;
    }

    const orderData = await response.json();
    console.log("Full order data:", orderData);
    console.log("ACF fields:", orderData.acf);
    console.log(
      "Order status field exists:",
      orderData.acf?.order_status !== undefined
    );

    return orderData;
  } catch (error) {
    console.error("Debug error:", error);
    return null;
  }
}

/**
 * Test function to check if we can update orders
 */
export async function testOrderUpdate() {
  try {
    // First, get some orders to test with
    const orders = await fetchLaundryOrders();
    if (orders.length === 0) {
      console.error("No orders found to test with");
      return false;
    }

    const testOrder = orders[0];
    console.log("Testing update with order:", testOrder.id);

    // Try to update the order
    const result = await updateOrderStatus(
      testOrder.id,
      testOrder.order_status === "completed" ? "pending" : "completed"
    );

    console.log("Update test result:", result);
    return true;
  } catch (error) {
    console.error("Update test failed:", error);
    return false;
  }
}
