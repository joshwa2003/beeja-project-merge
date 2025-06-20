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
    if (!token) {
      throw new Error("No authentication token found");
    }

    if (!data) {
      throw new Error("Quiz data is required");
    }

    console.log("Creating quiz with data:", data)
    const response = await apiConnector("POST", CREATE_QUIZ_API, data, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("CREATE QUIZ API RESPONSE............", response)
    
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Create Quiz")
    }
    
    if (!response?.data?.data) {
      throw new Error("No quiz data received in response")
    }
    
    toast.success("Quiz Created Successfully")
    return response.data.data
  } catch (error) {
    console.error("CREATE QUIZ API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
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
    if (!token) {
      throw new Error("No authentication token found")
    }

    if (!data || !data.quizId) {
      throw new Error("Quiz ID and update data are required")
    }

    const { quizId, ...updateData } = data
    const response = await apiConnector("PUT", UPDATE_QUIZ_API.replace(":quizId", quizId), updateData, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("UPDATE QUIZ API RESPONSE............", response)
    
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Update Quiz")
    }
    
    if (!response?.data?.data) {
      throw new Error("No quiz data received in response")
    }
    
    toast.success("Quiz Updated Successfully")
    return response.data.data
  } catch (error) {
    console.error("UPDATE QUIZ API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.message || error.message || "Failed to update quiz"
    toast.error(errorMessage)
    throw error // Re-throw to handle in component
  } finally {
    toast.dismiss(toastId)
  }
}

export async function getQuizById(quizId, token) {
  try {
    if (!token) {
      throw new Error("No authentication token found");
    }

    if (!quizId) {
      throw new Error("Quiz ID is required");
    }

    const response = await apiConnector("GET", GET_QUIZ_API.replace(":quizId", quizId), null, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("GET QUIZ API RESPONSE............", response)
    
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Get Quiz")
    }
    
    if (!response?.data?.data) {
      throw new Error("No quiz data received")
    }
    
    return response.data.data
  } catch (error) {
    console.error("GET QUIZ API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    throw error
  }
}

export async function submitQuiz(data, token) {
  const toastId = toast.loading("Submitting Quiz...")
  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    if (!data || !data.quizId) {
      throw new Error("Quiz submission data is required")
    }

    const response = await apiConnector("POST", SUBMIT_QUIZ_API, data, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("SUBMIT QUIZ API RESPONSE............", response)
    
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Submit Quiz")
    }

    if (!response?.data?.data) {
      throw new Error("No submission data received in response")
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
    return response.data.data
  } catch (error) {
    console.error("SUBMIT QUIZ API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.message || error.message || "Failed to submit quiz"
    toast.error(errorMessage)
    return null
  } finally {
    toast.dismiss(toastId)
  }
}

export async function getQuizResults(quizId, token) {
  const toastId = toast.loading("Loading Quiz Results...")
  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    if (!quizId) {
      throw new Error("Quiz ID is required")
    }

    const response = await apiConnector("GET", GET_QUIZ_RESULTS_API.replace(":quizId", quizId), null, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("GET QUIZ RESULTS API RESPONSE............", response)
    
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Get Quiz Results")
    }
    
    if (!response?.data?.data) {
      throw new Error("No quiz results data received")
    }
    
    return response.data.data
  } catch (error) {
    console.error("GET QUIZ RESULTS API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.message || error.message || "Failed to get quiz results"
    toast.error(errorMessage)
    return null
  } finally {
    toast.dismiss(toastId)
  }
}

export async function validateSectionAccess(sectionId, token) {
  try {
    if (!token) {
      throw new Error("No authentication token found")
    }

    if (!sectionId) {
      throw new Error("Section ID is required")
    }

    const response = await apiConnector("GET", VALIDATE_SECTION_ACCESS_API.replace(":sectionId", sectionId), null, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("VALIDATE SECTION ACCESS API RESPONSE............", response)
    
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Validate Section Access")
    }
    
    return response.data
  } catch (error) {
    console.error("VALIDATE SECTION ACCESS API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    const errorMessage = error.response?.data?.message || error.message || "Failed to validate section access"
    toast.error(errorMessage)
    return null
  }
}

export async function getAllQuizzes(token) {
  try {
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await apiConnector("GET", GET_ALL_QUIZZES_API, null, {
      Authorization: `Bearer ${token}`,
    })
    
    console.log("GET ALL QUIZZES API RESPONSE............", response)
    
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Get Quizzes")
    }
    
    if (!response?.data?.data) {
      throw new Error("No quiz data received")
    }
    
    return response.data.data
  } catch (error) {
    console.error("GET ALL QUIZZES API ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    toast.error(error.response?.data?.message || error.message)
    return []
  }
}
