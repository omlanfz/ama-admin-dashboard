import { getToken } from "./auth";

const API_BASE = "https://amalaundry.com.au/wp-json/wp/v2";

const apiRequest = async (endpoint, method = "GET", body = null) => {
  const token = getToken();
  if (!token) throw new Error("Authentication token not found.");

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}/${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to ${method} ${endpoint}`);
  }

  return response.json();
};

export const getSettings = async () => {
  const services = await apiRequest("service?per_page=100");
  const pickupSlots = await apiRequest("pickup_slot?per_page=100");

  const prices = services.map((service) => ({
    id: service.id,
    name: service.title.rendered,
    price: service.acf.price || 0,
  }));

  const slots = pickupSlots.map((slot) => ({
    id: slot.id,
    time: slot.acf.time,
  }));

  // Mocking payment methods and daily availability for now
  return {
    prices,
    pickupSlots: slots,
    paymentMethods: [
      { id: 1, name: "Stripe" },
      { id: 2, name: "Square" },
    ],
    dailyAvailability: {
      isAvailable: true,
    },
  };
};

export const updateServicePrice = (id, price) => {
  return apiRequest(`service/${id}`, "POST", {
    acf: {
      price: price,
    },
  });
};

export const createPickupSlot = (time) => {
  return apiRequest("pickup_slot", "POST", {
    title: time,
    status: "publish",
    acf: {
      time: time,
      is_active: true,
    },
  });
};

export const deletePickupSlot = (id) => {
  return apiRequest(`pickup_slot/${id}`, "DELETE", { force: true });
};

export const createPaymentMethod = (name) => {
  // This is a placeholder as there's no payment_method CPT
  console.log("Creating payment method:", name);
  return Promise.resolve({ id: Date.now(), name });
};

export const deletePaymentMethod = (id) => {
  // This is a placeholder
  console.log("Deleting payment method:", id);
  return Promise.resolve({ success: true });
};

export const updateSettings = (settings) => {
  // Placeholder for general settings updates
  console.log("Updating general settings:", settings);
  return Promise.resolve({ success: true });
};
