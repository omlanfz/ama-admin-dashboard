const API_BASE = "https://amalaundry.com.au/wp-json/wp/v2";

function getToken() {
  return localStorage.getItem('jwt') || ''
}

// 🔹 Fetch a single Service by ID
export async function fetchService(id) {
  const res = await fetch(`${API_BASE}/service/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return await res.json();
}

// 🔹 Fetch a single Pickup Slot by ID
export async function fetchPickupSlot(id) {
  const res = await fetch(`${API_BASE}/pickup_slot/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return await res.json();
}

// 🔹 Fetch a single Payment Method by ID
export async function fetchPaymentMethod(id) {
  const res = await fetch(`${API_BASE}/payment_method/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return await res.json();
}

// 🔹 Fetch all Laundry Orders and resolve related fields
export async function fetchLaundryOrders() {
  const res = await fetch(`${API_BASE}/laundry_order?per_page=100`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });


  const orders = await res.json();

  if (!Array.isArray(orders) || orders.length === 0) {
    return []; // Fallback: no orders yet
  }

  const enrichedOrders = await Promise.all(
    orders.map(async (order) => {
      const acf = order.acf || {};

      const service = acf.service_id
        ? await fetchService(acf.service_id)
        : null;
      const slot = acf.slot_id ? await fetchPickupSlot(acf.slot_id) : null;
      const payment = acf.payment_method_id
        ? await fetchPaymentMethod(acf.payment_method_id)
        : null;

      return {
        id: order.id,
        title: order.title?.rendered || "",
        room_number: acf.room_number || "",
        pickup_method: acf.pickup_method || "",
        payment_confirmed: acf.payment_confirmed || false,

        service: service
          ? {
              id: service.id,
              name: service.title?.rendered || "",
              slug: service.acf?.slug || "",
              price: service.acf?.price || "",
              image: service.acf?.image || "",
            }
          : null,

        slot: slot
          ? {
              id: slot.id,
              time: slot.acf?.time || "",
              is_active: slot.acf?.is_active || false,
            }
          : null,

        payment_method: payment
          ? {
              id: payment.id,
              provider_code: payment.acf?.provider_code || "",
              icon: payment.acf?.icon || "",
              is_active: payment.acf?.is_active || false,
            }
          : null,
      };
    })
  );

  return enrichedOrders;
}
