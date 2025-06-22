import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { adminEndpoints } from "../apis";

const { GET_ALL_COUPONS_API, GET_FRONTEND_COUPONS_API, CREATE_COUPON_API, VALIDATE_COUPON_API, APPLY_COUPON_API, TOGGLE_COUPON_STATUS_API } = adminEndpoints;

export function createCoupon(data, token) {
  return async (dispatch) => {
    const toastId = toast.loading("Creating Coupon...");
    try {
      const response = await apiConnector("POST", CREATE_COUPON_API, data, {
        Authorization: `Bearer ${token}`,
      });

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Could Not Create Coupon");
      }

      toast.success("Coupon Created Successfully");
      toast.dismiss(toastId);
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Could Not Create Coupon");
      toast.dismiss(toastId);
      return null;
    }
  };
}

export async function validateCoupon(data, token) {
  try {
    const response = await apiConnector("POST", VALIDATE_COUPON_API, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Validate Coupon");
    }

    return response.data;
  } catch (error) {
    // Suppress console error for invalid coupons
    if (error.response?.status === 404) {
      throw new Error("This coupon cannot be used for this type of purchase.");
    }
    
    // For other errors, throw without logging
    throw new Error(error.response?.data?.message || "Could not validate coupon");
  }
}

export async function applyCoupon(data, token) {
  try {
    const response = await apiConnector("POST", APPLY_COUPON_API, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Apply Coupon");
    }

    return response.data;
  } catch (error) {
    // For 404 errors, show the same message as validateCoupon
    if (error.response?.status === 404) {
      throw new Error("This coupon cannot be used for this type of purchase.");
    }
    
    // For other errors, throw without logging
    throw new Error(error.response?.data?.message || "Could not apply coupon");
  }
}

export async function getAllCoupons(token, linkedTo = null) {
  try {
    // If token is provided, use admin endpoint, otherwise use frontend endpoint
    const endpoint = token ? GET_ALL_COUPONS_API : GET_FRONTEND_COUPONS_API;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Add linkedTo query parameter for frontend endpoint
    let url = endpoint;
    if (!token && linkedTo) {
      url = `${endpoint}?linkedTo=${linkedTo}`;
    }

    const response = await apiConnector("GET", url, null, headers);

    if (!response?.data?.success) {
      return []; // Return empty array instead of throwing error for frontend endpoint
    }

    return response.data.data;
  } catch (error) {
    return []; // Return empty array on error for frontend endpoint
  }
}

export async function toggleCouponStatus(couponId, token) {
  try {
    const url = TOGGLE_COUPON_STATUS_API.replace(':couponId', couponId);
    const response = await apiConnector("PATCH", url, null, {
      Authorization: `Bearer ${token}`,
    });

    console.log("TOGGLE COUPON STATUS API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Toggle Coupon Status");
    }

    toast.success(response.data.message);
    return response.data.data;
  } catch (error) {
    console.log("TOGGLE COUPON STATUS API ERROR............", error);
    toast.error(error.response?.data?.message || "Could Not Toggle Coupon Status");
    throw error;
  }
}
