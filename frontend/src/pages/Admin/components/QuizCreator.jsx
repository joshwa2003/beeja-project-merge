import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { RiAddLine, RiDeleteBin6Line } from "react-icons/ri"
import { createQuiz, updateQuiz } from "../../../services/operations/quizAPI"

export default function QuizCreator({ subSectionId, existingQuiz, onClose, onSuccess }) {
  const { token } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      questionType: "multipleChoice",
      options: ["", "", "", ""],
      correctAnswers: [], // For multiple choice (array of indices)
      correctAnswer: null, // For single answer (single index)
      marks: 5,
      required: true
    }
  ])

  // Initialize with existing quiz data if editing
  useEffect(() => {
    if (existingQuiz && existingQuiz.questions) {
      setQuestions(existingQuiz.questions.map(q => ({
        questionText: q.questionText || "",
        questionType: q.questionType || "multipleChoice",
        options: q.options || ["", "", "", ""],
        correctAnswers: q.correctAnswers || [],
        correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : null,
        marks: q.marks || 5,
        required: q.required !== undefined ? q.required : true
      })))
    }
  }, [existingQuiz])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  // Add more questions (up to 25)
  const addQuestion = () => {
    if (questions.length < 25) {
      setQuestions([...questions, {
        questionText: "",
        questionType: "multipleChoice",
        options: ["", "", "", ""],
        correctAnswers: [],
        correctAnswer: null,
        marks: 5,
        required: true
      }])
    }
  }

  // Remove question (minimum 15)
  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = [...questions]
      newQuestions.splice(index, 1)
      setQuestions(newQuestions)
    }
  }

  // Handle question changes
  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions]
    newQuestions[index][field] = value
    setQuestions(newQuestions)
  }

  // Handle option changes
  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex] = value
    setQuestions(newQuestions)
  }

  // Submit quiz
  const onSubmit = async () => {
    // Validate questions
    const invalidQuestions = questions.filter(q => 
      !q.questionText.trim() || 
      (q.questionType !== "shortAnswer" && q.options.some(opt => !opt.trim()))
    )

    if (invalidQuestions.length > 0) {
      toast.error("Please fill all question texts and options")
      return
    }

    // Validate correct answers are selected
    const questionsWithoutAnswers = questions.filter((q, index) => {
      if (q.questionType === "multipleChoice") {
        return !q.correctAnswers || q.correctAnswers.length === 0
      } else if (q.questionType === "singleAnswer") {
        return q.correctAnswer === null || q.correctAnswer === undefined
      }
      return false // Short answer questions don't need predefined correct answers
    })

    if (questionsWithoutAnswers.length > 0) {
      toast.error("Please select correct answers for all multiple choice and single answer questions")
      return
    }

    setLoading(true)
    try {
      // Clean up questions data
      const cleanedQuestions = questions.map(q => ({
        questionText: q.questionText.trim(),
        questionType: q.questionType,
        options: q.questionType === "shortAnswer" ? [] : q.options.map(opt => opt.trim()),
        correctAnswers: q.questionType === "multipleChoice" ? (q.correctAnswers || []) : [],
        correctAnswer: q.questionType === "singleAnswer" ? q.correctAnswer : null,
        marks: q.marks,
        required: q.required
      }))

      const quizData = {
        subSectionId,
        questions: cleanedQuestions
      }
      
      console.log("Submitting quiz data:", quizData)
      
      let result;
      if (existingQuiz) {
        const updateData = {
          ...quizData,
          quizId: existingQuiz._id
        }
        result = await updateQuiz(updateData, token)
      } else {
        result = await createQuiz(quizData, token)
      }

      if (result) {
        console.log("Quiz operation successful:", result)
        onSuccess && onSuccess(result)
        onClose()
      } else {
        throw new Error("No result returned from quiz operation")
      }
    } catch (error) {
      console.error(`Error ${existingQuiz ? 'updating' : 'creating'} quiz:`, error)
      toast.error(error.message || `Failed to ${existingQuiz ? 'update' : 'create'} quiz`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-richblack-5">
          Quiz Questions ({questions.length}/25)
        </p>
        <button
          onClick={addQuestion}
          disabled={questions.length >= 25}
          className="flex items-center gap-2 bg-yellow-50 text-richblack-900 px-3 py-2 rounded-lg hover:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RiAddLine />
          Add Question
        </button>
      </div>


      <div className="space-y-6 max-h-[60vh] overflow-y-auto">
        {questions.map((question, qIndex) => (
          <div key={qIndex} className="space-y-4 border border-richblack-700 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <p className="text-sm text-richblack-5 font-medium">Question {qIndex + 1}</p>
              {questions.length > 1 && (
                <button
                  onClick={() => removeQuestion(qIndex)}
                  className="text-pink-300 hover:text-pink-200 p-1"
                >
                  <RiDeleteBin6Line />
                </button>
              )}
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <label className="text-sm text-richblack-5">Question Text *</label>
              <textarea
                value={question.questionText}
                onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)}
                placeholder="Enter your question here..."
                className="w-full bg-richblack-700 text-richblack-5 rounded-lg p-3 min-h-[80px] resize-none"
                required
              />
            </div>

            {/* Question Type */}
            <div className="space-y-2">
              <label className="text-sm text-richblack-5">Question Type</label>
              <select
                value={question.questionType}
                onChange={(e) => handleQuestionChange(qIndex, "questionType", e.target.value)}
                className="w-full bg-richblack-700 text-richblack-5 rounded-lg p-3"
              >
                <option value="multipleChoice">Multiple Choice</option>
                <option value="singleAnswer">Single Answer</option>
                <option value="shortAnswer">Short Answer</option>
              </select>
            </div>

            {/* Options (for multiple choice and single answer) */}
            {(question.questionType === "multipleChoice" || question.questionType === "singleAnswer") && (
              <div className="space-y-4">
                <label className="text-sm text-richblack-5">Options *</label>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        className="flex-1 bg-richblack-700 text-richblack-5 rounded-lg p-3"
                        required
                      />
                      <label className="flex items-center gap-2 text-sm text-richblack-300">
                        <input
                          type={question.questionType === "multipleChoice" ? "checkbox" : "radio"}
                          name={`correct-${qIndex}`}
                          checked={question.questionType === "multipleChoice" 
                            ? question.correctAnswers?.includes(oIndex)
                            : question.correctAnswer === oIndex}
                          onChange={() => {
                            const newQuestions = [...questions];
                            if (question.questionType === "multipleChoice") {
                              // Toggle the option in correctAnswers array
                              const currentAnswers = newQuestions[qIndex].correctAnswers || [];
                              if (currentAnswers.includes(oIndex)) {
                                newQuestions[qIndex].correctAnswers = currentAnswers.filter(i => i !== oIndex);
                              } else {
                                newQuestions[qIndex].correctAnswers = [...currentAnswers, oIndex];
                              }
                            } else {
                              // Set single correct answer
                              newQuestions[qIndex].correctAnswer = oIndex;
                            }
                            setQuestions(newQuestions);
                          }}
                          className="text-yellow-50"
                        />
                        Correct Answer
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Marks and Required */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-richblack-5">Marks:</label>
                <input
                  type="number"
                  value={question.marks}
                  onChange={(e) => handleQuestionChange(qIndex, "marks", parseInt(e.target.value) || 1)}
                  min="1"
                  max="10"
                  className="w-20 bg-richblack-700 text-richblack-5 rounded-lg p-2"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-richblack-5">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) => handleQuestionChange(qIndex, "required", e.target.checked)}
                  className="rounded"
                />
                Required
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4 border-t border-richblack-700">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-6 py-2 bg-richblack-700 text-richblack-50 rounded-lg hover:bg-richblack-600 transition-all duration-200"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="px-6 py-2 bg-yellow-50 text-richblack-900 rounded-lg hover:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading 
            ? (existingQuiz ? "Updating..." : "Creating...") 
            : (existingQuiz ? "Update Quiz" : "Create Quiz")
          }
        </button>
      </div>
    </div>
  )
}
