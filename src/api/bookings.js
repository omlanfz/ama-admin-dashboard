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
          // ✅ FIX: Changed from acf.special_instructions to acf.Special_Instructions
          special_instructions: acf.Special_Instructions || "—",
          order_status: acf.order_status || "pending", // Added order_status field
          order_timestamp: acf.order_timestamp || "—",

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
    // Standard WordPress REST API approach - use POST method
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

    if (!response.ok) {
      // If POST fails, try PUT method
      const putResponse = await fetch(`${API_BASE}/laundry_order/${orderId}`, {
        method: "PUT",
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

      if (!putResponse.ok) {
        const errorData = await putResponse.json().catch(() => ({}));
        console.error("Update failed:", putResponse.status, errorData);
        throw new Error(`HTTP error! status: ${putResponse.status}`);
      }

      const updatedOrder = await putResponse.json();
      return updatedOrder;
    }

    const updatedOrder = await response.json();
    return updatedOrder;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}
// Alternative implementation using WordPress REST API custom endpoint
// Uncomment if you have a custom endpoint for updating order status

/*
export async function updateOrderStatus(orderId, status) {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token missing");
  }

  try {
    // Using a custom endpoint for updating order status
    const response = await fetch(`${API_BASE}/update_order_status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        order_id: orderId,
        order_status: status
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}
*/
