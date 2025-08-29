// src/api/auth.js

const API_URL = "https://amalaundry.com.au/wp-json/jwt-auth/v1/token";
const BASE_API_URL = "https://amalaundry.com.au/wp-json/wp/v2";

/**
 * Logs in the admin and stores the JWT token in localStorage.
 * This function will fail in the browser if CORS headers are not configured
 * on the WordPress server.
 * @param {string} username - The admin's username.
 * @param {string} password - The admin's password.
 * @returns {Promise<object>} - User data including the token.
 * @throws {Error} - Throws an error if login fails or the request is blocked.
 */
export async function loginAdmin(username, password) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem("jwt", data.token);
      return data;
    } else {
      // The API returned an error, or the token was missing.
      throw new Error(data.message || "Login failed. Check your credentials.");
    }
  } catch (err) {
    // This catch block will trigger if a network error or CORS issue occurs.
    console.error("Login error:", err);
    throw new Error(
      "Could not connect to the authentication server. Please check your network and server configuration (CORS)."
    );
  }
}

/**
 * Retrieves the stored JWT token from localStorage.
 * @returns {string|null} - The JWT token or null if not found.
 */
export function getToken() {
  const token = localStorage.getItem("jwt");
  if (!token) {
    console.warn(
      "JWT token not found in localStorage. User may not be logged in."
    );
  }
  return token;
}

/**
 * Logs out the admin by clearing the token from localStorage.
 */
export function logoutAdmin() {
  localStorage.removeItem("jwt");
  console.log("Logged out successfully.");
}

/**
 * A general function to make authenticated GET requests to the WordPress REST API.
 * This is an example of how to use the JWT token.
 * @param {string} endpoint - The API endpoint to fetch (e.g., "laundry_order").
 * @returns {Promise<object>} - The JSON data from the API.
 * @throws {Error} - Throws an error if the request fails.
 */
export async function getAuthenticatedData(endpoint) {
  const token = getToken();

  if (!token) {
    throw new Error("No token found. Please log in first.");
  }

  try {
    const res = await fetch(`${BASE_API_URL}/${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `API error: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error(`Error fetching data from ${endpoint}:`, err);
    throw err;
  }
}

// Correct usage:
(async () => {
  try {
    // 1. Await the login to ensure the token is retrieved and stored.
    // await loginAdmin("your_username", "your_password");
    await loginAdmin("Dev 1", "Omlan@2025#");

    // 2. Only then, call the function to fetch authenticated data.
    const orders = await getAuthenticatedData("laundry_order");
    console.log("Orders:", orders);
  } catch (err) {
    console.error("Failed to fetch orders:", err);
  }
})();

// // src/api/auth.js

// const API_URL = "https://amalaundry.com.au/wp-json/jwt-auth/v1/token"

// /**
//  * Logs in the admin and stores JWT token in localStorage
//  * @param {string} username
//  * @param {string} password
//  * @returns {Promise<object>} user data including token
//  */
// export async function loginAdmin(username, password) {
//   try {
//     const res = await fetch(API_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({ username, password })
//     })

//     const data = await res.json()

//     if (res.ok && data.token) {
//       localStorage.setItem("jwt", data.token)
//       return data
//     } else {
//       throw new Error(data.message || "Login failed")
//     }
//   } catch (err) {
//     console.error("Login error:", err)
//     throw err
//   }
// }

// /**
//  * Retrieves the stored JWT token from localStorage
//  * @returns {string|null}
//  */
// export function getToken() {
//   const token = localStorage.getItem("jwt")
//   if (!token) {
//     console.warn("JWT token not found in localStorage")
//   }
//   return token
// }

// /**
//  * Logs out the admin by clearing the token
//  */
// export function logoutAdmin() {
//   localStorage.removeItem("jwt")
// }
