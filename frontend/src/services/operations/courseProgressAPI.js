import { toast } from "react-hot-toast"
import { apiConnector } from "../apiConnector"
import { courseEndpoints } from "../apis"

const {
  LECTURE_COMPLETION_API,
  UPDATE_QUIZ_PROGRESS_API,
  CHECK_SECTION_ACCESS_API,
  GET_PROGRESS_PERCENTAGE_API,
} = courseEndpoints

// Update Course Progress
export const updateCourseProgress = async (data, token) => {
  const toastId = toast.loading("Loading...")
  try {
    const response = await apiConnector("POST", LECTURE_COMPLETION_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("UPDATE COURSE PROGRESS API RESPONSE............", response)
    if (!response?.data?.message) {
      throw new Error(response?.data?.error || "Could Not Update Course Progress")
    }
    toast.success("Lecture Completed")
    return response.data
  } catch (error) {
    console.log("UPDATE COURSE PROGRESS API ERROR............", error)
    toast.error(error.message)
    return null
  } finally {
    toast.dismiss(toastId)
  }
}

// Update Quiz Progress
export const updateQuizProgress = async (data, token) => {
  const toastId = toast.loading("Submitting quiz...")
  try {
    const response = await apiConnector("POST", UPDATE_QUIZ_PROGRESS_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("UPDATE QUIZ PROGRESS API RESPONSE............", response)
    if (!response?.data?.message) {
      throw new Error(response?.data?.error || "Could Not Update Quiz Progress")
    }
    toast.success("Quiz Completed")
    return response.data
  } catch (error) {
    console.log("UPDATE QUIZ PROGRESS API ERROR............", error)
    toast.error(error.message)
    return null
  } finally {
    toast.dismiss(toastId)
  }
}

// Check Section Access
export const checkSectionAccess = async (data, token) => {
  try {
    const response = await apiConnector("POST", CHECK_SECTION_ACCESS_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("CHECK SECTION ACCESS API RESPONSE............", response)
    if (!response?.data?.hasAccess) {
      toast.error(response?.data?.message || "Complete previous section first")
      return false
    }
    return true
  } catch (error) {
    console.log("CHECK SECTION ACCESS API ERROR............", error)
    toast.error(error.message)
    return false
  }
}

// Get Progress Percentage
export const getProgressPercentage = async (data, token) => {
  const toastId = toast.loading("Loading progress...")
  try {
    const response = await apiConnector("POST", GET_PROGRESS_PERCENTAGE_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("GET PROGRESS PERCENTAGE API RESPONSE............", response)
    if (!response?.data?.data) {
      throw new Error(response?.data?.error || "Could Not Get Progress")
    }
    return response.data.data
  } catch (error) {
    console.log("GET PROGRESS PERCENTAGE API ERROR............", error)
    toast.error(error.message)
    return 0
  } finally {
    toast.dismiss(toastId)
  }
}
