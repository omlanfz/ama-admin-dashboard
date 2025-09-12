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


// const API_BASE = "https://amalaundry.com.au/wp-json/wp/v2";

// function getToken() {
//   const token = localStorage.getItem("jwt");
//   if (!token) {
//     console.warn("JWT token missing");
//   }
//   return token;
// }

// export async function fetchService(id) {
//   if (!id) {
//     console.error("fetchService called with invalid ID:", id);
//     return null;
//   }
//   try {
//     const res = await fetch(`${API_BASE}/service/${id}`, {
//       headers: { Authorization: `Bearer ${getToken()}` },
//     });
//     if (!res.ok) {
//       console.error(`Failed to fetch service with ID ${id}: ${res.statusText}`);
//       return null;
//     }
//     return await res.json();
//   } catch (err) {
//     console.error(`Failed to fetch service with ID ${id}:`, err);
//     return null;
//   }
// }

// export async function fetchPickupSlot(id) {
//   if (!id) {
//     console.error("fetchPickupSlot called with invalid ID:", id);
//     return null;
//   }
//   try {
//     const res = await fetch(`${API_BASE}/pickup_slot/${id}`, {
//       headers: { Authorization: `Bearer ${getToken()}` },
//     });
//     if (!res.ok) {
//       console.error(
//         `Failed to fetch pickup slot with ID ${id}: ${res.statusText}`
//       );
//       return null;
//     }
//     return await res.json();
//   } catch (err) {
//     console.error(`Failed to fetch pickup slot with ID ${id}:`, err);
//     return null;
//   }
// }

// async function fetchCamp(id) {
//   if (!id) {
//     console.error("fetchCamp called with invalid ID:", id);
//     return null;
//   }
//   try {
//     const res = await fetch(`${API_BASE}/camp/${id}`, {
//       headers: { Authorization: `Bearer ${getToken()}` },
//     });
//     if (!res.ok) {
//       console.error(`Failed to fetch camp with ID ${id}: ${res.statusText}`);
//       return null;
//     }
//     const campData = await res.json();
//     return campData.title?.rendered || "Unknown Camp";
//   } catch (err) {
//     console.error(`Failed to fetch camp with ID ${id}:`, err);
//     return null;
//   }
// }

// export async function fetchLaundryOrders() {
//   const token = getToken();
//   if (!token) return [];

//   try {
//     const res = await fetch(`${API_BASE}/laundry_order?per_page=100`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });

//     if (!res.ok) {
//       console.error("Laundry order fetch failed:", res.statusText);
//       return [];
//     }

//     const orders = await res.json();

//     if (!Array.isArray(orders)) {
//       console.error("Fetched data is not an array:", orders);
//       return [];
//     }

//     const enrichedOrders = await Promise.all(
//       orders.map(async (order) => {
//         const acf = order.acf || {};

//         const serviceIds = Array.isArray(acf.service_id)
//           ? acf.service_id
//           : [acf.service_id].filter(Boolean);

//         const fetchedServices = await Promise.all(
//           serviceIds.map((id) => fetchService(id))
//         );
//         const services = fetchedServices.filter(Boolean).map((service) => ({
//           id: service.id,
//           name: service.title?.rendered || "",
//           slug: service.acf?.slug || "",
//           price: service.acf?.price || "",
//         }));

//         const slot = acf.slot_id ? await fetchPickupSlot(acf.slot_id) : null;
        
//         // Fetch the camp name using the new helper function
//         const campName = acf.camp_name ? await fetchCamp(acf.camp_name) : "—";

//         // Explicitly build the final order object to ensure all fields are included
//         return {
//           id: order.id,
//           title: order.title?.rendered || "",
          
//           // Fields from ACF
//           customer_name: acf.customer_name || "—",
//           room_number: acf.room_number || "—",
//           pickup_method: acf.pickup_method || "—",
//           payment_confirmed: acf.payment_confirmed || false,
//           total_price: acf.total_price || "0.00",
//           special_instructions: acf.special_instructions || "—",

//           // Enriched/Resolved fields
//           camp_name: campName, // Use the fetched name instead of the ID
//           services: services,
//           pickup_slot: slot,
//         };
//       })
//     );

//     return enrichedOrders;
//   } catch (err) {
//     console.error("Error fetching laundry orders:", err);
//     return [];
//   }
// }

