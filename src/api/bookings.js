const API_BASE = "https://amalaundry.com.au/wp-json/wp/v2";

function getToken() {
  const token = localStorage.getItem("jwt");
  if (!token) {
    console.warn("JWT token missing");
  }
  return token;
}

export async function fetchService(id) {
  // Added a check to prevent fetching if the ID is invalid
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
  // Added a check to prevent fetching if the ID is invalid
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

        // ✅ FIX: Handle multiple service IDs. Assumes service_id is an array of IDs.
        // The original code was treating each item in the array as an object (service.ID),
        // but the API returns an array of numbers.
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

        // ✅ FIX: Handle single pickup slot ID. Assumes slot_id is a single ID.
        // The original code was trying to access acf.slot_id.ID, which caused the error.
        // Now it correctly uses the ID directly from acf.slot_id.
        const slot = acf.slot_id ? await fetchPickupSlot(acf.slot_id) : null;

        return {
          id: order.id,
          title: order.title?.rendered || "",
          room_number: acf.room_number || "",
          camp_name: acf.camp_name || "",
          pickup_method: acf.pickup_method || "",
          payment_confirmed: acf.payment_confirmed || false,
          services: services, // Return an array of service objects
          pickup_slot: slot, // Return the full slot object
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

//         // Handle multiple services. Assumes service_id is an array of Post Objects.
//         const serviceObjects = Array.isArray(acf.service_id)
//           ? acf.service_id
//           : [acf.service_id].filter(Boolean);

//         const fetchedServices = await Promise.all(
//           serviceObjects.map((serviceObj) => fetchService(serviceObj.ID))
//         );
//         const services = fetchedServices.filter(Boolean).map((service) => ({
//           id: service.id,
//           name: service.title?.rendered || "",
//           slug: service.acf?.slug || "",
//           price: service.acf?.price || "",
//         }));

//         // Handle single pickup slot. Assumes slot_id is a single Post Object.
//         const slot = acf.slot_id ? await fetchPickupSlot(acf.slot_id.ID) : null;

//         return {
//           id: order.id,
//           title: order.title?.rendered || "",
//           room_number: acf.room_number || "",
//           camp_name: acf.camp_name || "",
//           pickup_method: acf.pickup_method || "",
//           payment_confirmed: acf.payment_confirmed || false,

//           services: services, // Return an array of service objects
//           pickup_slot: slot, // Return the full slot object
//         };
//       })
//     );

//     return enrichedOrders;
//   } catch (err) {
//     console.error("Error fetching laundry orders:", err);
//     return [];
//   }
// }

