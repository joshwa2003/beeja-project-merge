import { toast } from "react-hot-toast"
import { apiConnector } from "../apiConnector"
import { quizEndpoints } from "../apis"
import { updateQuizProgress } from "./courseProgressAPI"

const {
  CREATE_QUIZ_API,
  UPDATE_QUIZ_API,
  GET_QUIZ_API,
  GET_ALL_QUIZZES_API,
  SUBMIT_QUIZ_API,
  GET_QUIZ_RESULTS_API,
  VALIDATE_SECTION_ACCESS_API,
} = quizEndpoints

export async function createQuiz(data, token) {
  const toastId = toast.loading("Creating Quiz...")
  try {
    console.log("Creating quiz with data:", data)
    const response = await apiConnector("POST", CREATE_QUIZ_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("CREATE QUIZ API RESPONSE............", response)
    
    if (!response?.data?.success) {
      const errorMessage = response?.data?.message || "Could Not Create Quiz"
      throw new Error(errorMessage)
    }
    
    toast.success("Quiz Created Successfully")
    return response?.data?.data
  } catch (error) {
    console.error("CREATE QUIZ API ERROR............", error)
    const errorMessage = error.response?.data?.message || error.message || "Failed to create quiz"
    toast.error(errorMessage)
    throw error // Re-throw to handle in component
  } finally {
    toast.dismiss(toastId)
  }
}

export async function updateQuiz(data, token) {
  const toastId = toast.loading("Updating Quiz...")
  try {
    const { quizId, ...updateData } = data
    const response = await apiConnector("PUT", UPDATE_QUIZ_API.replace(":quizId", quizId), updateData, {
      Authorization: `Bearer ${token}`,
    })
    console.log("UPDATE QUIZ API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Update Quiz")
    }
    toast.success("Quiz Updated Successfully")
    return response?.data?.data
  } catch (error) {
    console.log("UPDATE QUIZ API ERROR............", error)
    const errorMessage = error.response?.data?.message || error.message || "Failed to update quiz"
    toast.error(errorMessage)
    throw error // Re-throw to handle in component
  } finally {
    toast.dismiss(toastId)
  }
}

export async function getQuizById(quizId, token) {
  try {
    const response = await apiConnector("GET", GET_QUIZ_API.replace(":quizId", quizId), null, {
      Authorization: `Bearer ${token}`,
    })
    console.log("GET QUIZ API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Get Quiz")
    }
    return response?.data?.data
  } catch (error) {
    console.log("GET QUIZ API ERROR............", error)
    // Silently handle error without showing toast notification
    throw error
  }
}

export async function submitQuiz(data, token) {
  const toastId = toast.loading("Submitting Quiz...")
  try {
    const response = await apiConnector("POST", SUBMIT_QUIZ_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("SUBMIT QUIZ API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Submit Quiz")
    }

    // Update course progress with quiz completion
    if (data.courseId && data.subsectionId) {
      const progressData = {
        courseId: data.courseId,
        subsectionId: data.subsectionId,
        quizId: data.quizId,
        score: response.data.data.score,
        totalMarks: response.data.data.totalMarks
      }
      await updateQuizProgress(progressData, token)
    }

    toast.success("Quiz Submitted Successfully")
    return response?.data?.data
  } catch (error) {
    console.log("SUBMIT QUIZ API ERROR............", error)
    toast.error(error.message)
    return null
  } finally {
    toast.dismiss(toastId)
  }
}

export async function getQuizResults(quizId, token) {
  const toastId = toast.loading("Loading Quiz Results...")
  try {
    const response = await apiConnector("GET", GET_QUIZ_RESULTS_API.replace(":quizId", quizId), null, {
      Authorization: `Bearer ${token}`,
    })
    console.log("GET QUIZ RESULTS API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Get Quiz Results")
    }
    return response?.data?.data
  } catch (error) {
    console.log("GET QUIZ RESULTS API ERROR............", error)
    toast.error(error.message)
  }
  toast.dismiss(toastId)
}

export async function validateSectionAccess(sectionId, token) {
  try {
    const response = await apiConnector("GET", VALIDATE_SECTION_ACCESS_API.replace(":sectionId", sectionId), null, {
      Authorization: `Bearer ${token}`,
    })
    console.log("VALIDATE SECTION ACCESS API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Validate Section Access")
    }
    return response?.data
  } catch (error) {
    console.log("VALIDATE SECTION ACCESS API ERROR............", error)
    toast.error(error.message)
  }
}

export async function getAllQuizzes(token) {
  try {
    const response = await apiConnector("GET", GET_ALL_QUIZZES_API, null, {
      Authorization: `Bearer ${token}`,
    })
    console.log("GET ALL QUIZZES API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Get Quizzes")
    }
    return response?.data?.data
  } catch (error) {
    console.log("GET ALL QUIZZES API ERROR............", error)
    toast.error(error.message)
    return []
  }
}
