const API_BASE = "https://amalaundry.com.au/wp-json/wp/v2";

function getToken() {
  const token = localStorage.getItem("jwt");
  if (!token) {
    console.warn("JWT token missing");
  }
  return token;
}

export async function fetchService(id) {
  try {
    const res = await fetch(`${API_BASE}/service/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch service with ID ${id}:`, err);
    return null;
  }
}

export async function fetchPickupSlot(id) {
  try {
    const res = await fetch(`${API_BASE}/pickup_slot/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return await res.json();
  } catch (err) {
    console.error(`Failed to fetch pickup slot with ID ${id}:`, err);
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

    const raw = await res.text();
    let orders;
    try {
      orders = JSON.parse(raw);
    } catch (err) {
      console.error("Invalid JSON response:", raw);
      return [];
    }

    if (!Array.isArray(orders)) return [];

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const acf = order.acf || {};

        // Handle multiple services. Assumes service_id is an array of IDs.
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

        return {
          id: order.id,
          title: order.title?.rendered || "",
          room_number: acf.room_number || "",
          camp_name: acf.camp_name || "", // New field
          pickup_method: acf.pickup_method || "",
          payment_confirmed: acf.payment_confirmed || false,

          services: services, // Return an array of service objects

          slot: slot
            ? {
                id: slot.id,
                time: slot.acf?.time || "",
                is_active: slot.acf?.is_active || false,
              }
            : null,
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
//   try {
//     const res = await fetch(`${API_BASE}/service/${id}`, {
//       headers: { Authorization: `Bearer ${getToken()}` },
//     });
//     return await res.json();
//   } catch (err) {
//     console.error("Failed to fetch service:", err);
//     return null;
//   }
// }

// export async function fetchPickupSlot(id) {
//   try {
//     const res = await fetch(`${API_BASE}/pickup_slot/${id}`, {
//       headers: { Authorization: `Bearer ${getToken()}` },
//     });
//     return await res.json();
//   } catch (err) {
//     console.error("Failed to fetch pickup slot:", err);
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

//     const raw = await res.text();
//     let orders;
//     try {
//       orders = JSON.parse(raw);
//     } catch (err) {
//       console.error("Invalid JSON response:", raw);
//       return [];
//     }

//     if (!Array.isArray(orders)) return [];

//     const enrichedOrders = await Promise.all(
//       orders.map(async (order) => {
//         const acf = order.acf || {};

//         const service = acf.service_id
//           ? await fetchService(acf.service_id)
//           : null;
//         const slot = acf.slot_id ? await fetchPickupSlot(acf.slot_id) : null;

//         return {
//           id: order.id,
//           title: order.title?.rendered || "",
//           room_number: acf.room_number || "",
//           pickup_method: acf.pickup_method || "",
//           payment_confirmed: acf.payment_confirmed || false,

//           service: service
//             ? {
//                 id: service.id,
//                 name: service.title?.rendered || "",
//                 slug: service.acf?.slug || "",
//                 price: service.acf?.price || "",
//               }
//             : null,

//           slot: slot
//             ? {
//                 id: slot.id,
//                 time: slot.acf?.time || "",
//                 is_active: slot.acf?.is_active || false,
//               }
//             : null,
//         };
//       })
//     );

//     return enrichedOrders;
//   } catch (err) {
//     console.error("Error fetching laundry orders:", err);
//     return [];
//   }
// }

// const API_BASE = "https://amalaundry.com.au/wp-json/wp/v2";

// function getToken() {
//   return localStorage.getItem('jwt') || ''
// }

// // 🔹 Fetch a single Service by ID
// export async function fetchService(id) {
//   const res = await fetch(`${API_BASE}/service/${id}`, {
//     headers: { Authorization: `Bearer ${getToken()}` },
//   });
//   return await res.json();
// }

// // 🔹 Fetch a single Pickup Slot by ID
// export async function fetchPickupSlot(id) {
//   const res = await fetch(`${API_BASE}/pickup_slot/${id}`, {
//     headers: { Authorization: `Bearer ${getToken()}` },
//   });
//   return await res.json();
// }

// // 🔹 Fetch a single Payment Method by ID
// export async function fetchPaymentMethod(id) {
//   const res = await fetch(`${API_BASE}/payment_method/${id}`, {
//     headers: { Authorization: `Bearer ${getToken()}` },
//   });
//   return await res.json();
// }

// // 🔹 Fetch all Laundry Orders and resolve related fields
// export async function fetchLaundryOrders() {
//   const res = await fetch(`${API_BASE}/laundry_order?per_page=100`, {
//     headers: {
//       Authorization: `Bearer ${getToken()}`,
//       "Content-Type": "application/json",
//     },
//   });

//   const orders = await res.json();

//   if (!Array.isArray(orders) || orders.length === 0) {
//     return []; // Fallback: no orders yet
//   }

//   const enrichedOrders = await Promise.all(
//     orders.map(async (order) => {
//       const acf = order.acf || {};

//       const service = acf.service_id
//         ? await fetchService(acf.service_id)
//         : null;
//       const slot = acf.slot_id ? await fetchPickupSlot(acf.slot_id) : null;
//       const payment = acf.payment_method_id
//         ? await fetchPaymentMethod(acf.payment_method_id)
//         : null;

//       return {
//         id: order.id,
//         title: order.title?.rendered || "",
//         room_number: acf.room_number || "",
//         pickup_method: acf.pickup_method || "",
//         payment_confirmed: acf.payment_confirmed || false,

//         service: service
//           ? {
//               id: service.id,
//               name: service.title?.rendered || "",
//               slug: service.acf?.slug || "",
//               price: service.acf?.price || "",
//               image: service.acf?.image || "",
//             }
//           : null,

//         slot: slot
//           ? {
//               id: slot.id,
//               time: slot.acf?.time || "",
//               is_active: slot.acf?.is_active || false,
//             }
//           : null,

//         payment_method: payment
//           ? {
//               id: payment.id,
//               provider_code: payment.acf?.provider_code || "",
//               icon: payment.acf?.icon || "",
//               is_active: payment.acf?.is_active || false,
//             }
//           : null,
//       };
//     })
//   );

//   return enrichedOrders;
// }
