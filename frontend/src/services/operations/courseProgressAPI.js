import { toast } from "react-hot-toast"
import { apiConnector } from "../apiConnector"
import { courseEndpoints } from "../apis"

const {
  UPDATE_QUIZ_PROGRESS_API,
  CHECK_SECTION_ACCESS_API,
} = courseEndpoints

export async function updateQuizProgress(data, token) {
  try {
    const response = await apiConnector("POST", UPDATE_QUIZ_PROGRESS_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("UPDATE QUIZ PROGRESS API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Update Quiz Progress")
    }
    return response?.data?.data
  } catch (error) {
    console.log("UPDATE QUIZ PROGRESS API ERROR............", error)
    // Don't show toast error for quiz progress as it's not critical
    return null
  }
}

export async function checkSectionAccess(data, token) {
  try {
    const response = await apiConnector("POST", CHECK_SECTION_ACCESS_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("CHECK SECTION ACCESS API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Check Section Access")
    }
    return response?.data?.hasAccess
  } catch (error) {
    console.log("CHECK SECTION ACCESS API ERROR............", error)
    // Return false to indicate no access in case of error
    return false
  }
}
