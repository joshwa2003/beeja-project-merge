import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { getQuizById, submitQuiz } from "../../../services/operations/quizAPI"
import IconBtn from "../../common/IconBtn"
import { IoIosArrowBack } from "react-icons/io"
import { FiClock, FiCheckCircle, FiAlertCircle } from "react-icons/fi"
import { HiOutlineQuestionMarkCircle } from "react-icons/hi"

const QuizView = () => {
  const { courseId, sectionId, subSectionId } = useParams()
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const { courseSectionData, courseEntireData, completedLectures } = useSelector((state) => state.viewCourse)

  const [quizData, setQuizData] = useState(null)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [quizResult, setQuizResult] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [quizStarted, setQuizStarted] = useState(false)

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      if (!courseSectionData.length) return
      
      const filteredData = courseSectionData.filter(course => course._id === sectionId)
      const filteredVideoData = filteredData?.[0]?.subSection.filter(data => data._id === subSectionId)
      
      if (filteredVideoData?.[0]?.quiz) {
        const quizId = typeof filteredVideoData[0].quiz === 'object' 
          ? filteredVideoData[0].quiz._id 
          : filteredVideoData[0].quiz
        
        try {
          setLoading(true)
          const quiz = await getQuizById(quizId, token)
          setQuizData(quiz)
          // Set timer if quiz has time limit (default 30 minutes)
          setTimeRemaining(quiz.timeLimit || 30 * 60)
        } catch (error) {
          console.error("Error loading quiz:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadQuiz()
  }, [courseSectionData, sectionId, subSectionId, token])

  // Timer effect
  useEffect(() => {
    if (quizStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleQuizSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [quizStarted, timeRemaining])

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Handle quiz answer selection
  const handleQuizAnswer = (questionId, selectedOption, questionType = 'single') => {
    if (questionType === 'multipleChoice') {
      setQuizAnswers(prev => {
        const currentAnswers = prev[questionId] || []
        const isSelected = currentAnswers.includes(selectedOption)
        
        if (isSelected) {
          return {
            ...prev,
            [questionId]: currentAnswers.filter(option => option !== selectedOption)
          }
        } else {
          return {
            ...prev,
            [questionId]: [...currentAnswers, selectedOption]
          }
        }
      })
    } else if (questionType === 'singleAnswer') {
      setQuizAnswers(prev => ({
        ...prev,
        [questionId]: Number(selectedOption)
      }))
    } else {
      setQuizAnswers(prev => ({
        ...prev,
        [questionId]: selectedOption
      }))
    }
  }

  // Submit quiz
  const handleQuizSubmit = async () => {
    if (!quizData) return

    // Validate all questions are answered
    const unansweredQuestions = []
    quizData.questions.forEach((question, index) => {
      const answer = quizAnswers[question._id]
      
      if (question.questionType === 'matchTheFollowing') {
        const hasAllMatches = question.options.every((_, optionIndex) => {
          const matchAnswer = quizAnswers[`${question._id}_${optionIndex}`]
          return matchAnswer !== undefined && matchAnswer !== null && matchAnswer !== ''
        })
        if (!hasAllMatches) {
          unansweredQuestions.push(index + 1)
        }
      } else if (question.questionType === 'multipleChoice') {
        const selectedOptions = quizAnswers[question._id] || []
        if (!Array.isArray(selectedOptions) || selectedOptions.length === 0) {
          unansweredQuestions.push(index + 1)
        }
      } else if (question.questionType === 'singleAnswer') {
        const answerNum = Number(answer)
        if (isNaN(answerNum) && answer !== 0) {
          unansweredQuestions.push(index + 1)
        }
      } else {
        if (!answer || (typeof answer === 'string' && answer.trim() === '')) {
          unansweredQuestions.push(index + 1)
        }
      }
    })

    if (unansweredQuestions.length > 0) {
      alert(`Please answer all questions before submitting. Unanswered questions: ${unansweredQuestions.join(', ')}`)
      return
    }

    setLoading(true)
    try {
      const quizSubmissionData = {
        quizId: quizData._id,
        courseId: courseId,
        subsectionId: subSectionId,
        answers: quizAnswers
      }

      const result = await submitQuiz(quizSubmissionData, token)
      if (result) {
        setQuizResult(result)
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
    }
    setLoading(false)
  }

  // Navigate to next lecture
  const goToNextLecture = () => {
    const currentSectionIndx = courseSectionData.findIndex(data => data._id === sectionId)
    const noOfSubsections = courseSectionData[currentSectionIndx].subSection.length
    const currentSubSectionIndx = courseSectionData[currentSectionIndx].subSection.findIndex(data => data._id === subSectionId)

    if (currentSubSectionIndx !== noOfSubsections - 1) {
      const nextSubSectionId = courseSectionData[currentSectionIndx].subSection[currentSubSectionIndx + 1]._id
      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`)
    } else if (currentSectionIndx < courseSectionData.length - 1) {
      const nextSectionId = courseSectionData[currentSectionIndx + 1]._id
      const nextSubSectionId = courseSectionData[currentSectionIndx + 1].subSection[0]._id
      navigate(`/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`)
    } else {
      navigate(`/dashboard/enrolled-courses`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-50 mx-auto mb-4"></div>
          <p className="text-richblack-200">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (quizResult) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gradient-to-r from-green-800 to-green-600 rounded-xl p-8 text-center shadow-xl">
          <FiCheckCircle className="mx-auto text-6xl text-white mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">Quiz Completed!</h1>
          
          <div className="bg-white/10 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
              <div>
                <p className="text-lg font-semibold">Your Score</p>
                <p className="text-3xl font-bold">{quizResult.score}/{quizResult.totalMarks}</p>
              </div>
              <div>
                <p className="text-lg font-semibold">Percentage</p>
                <p className="text-3xl font-bold">{((quizResult.score / quizResult.totalMarks) * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-lg font-semibold">Status</p>
                <p className="text-xl font-bold">
                  {((quizResult.score / quizResult.totalMarks) * 100) >= 60 ? "Passed" : "Failed"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <IconBtn
              onClick={() => navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${subSectionId}`)}
              text="Back to Lecture"
              customClasses="px-6 py-3 bg-white text-green-800 hover:bg-gray-100"
            />
            <IconBtn
              onClick={goToNextLecture}
              text="Next Lecture"
              customClasses="px-6 py-3"
            />
          </div>
        </div>
      </div>
    )
  }

  if (!quizData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FiAlertCircle className="mx-auto text-6xl text-richblack-400 mb-4" />
          <p className="text-richblack-200">Quiz not found</p>
          <IconBtn
            onClick={() => navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${subSectionId}`)}
            text="Back to Lecture"
            customClasses="mt-4"
          />
        </div>
      </div>
    )
  }

  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-richblack-800 rounded-xl p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${subSectionId}`)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-richblack-700 hover:bg-richblack-600 transition-colors"
            >
              <IoIosArrowBack className="text-white text-xl" />
            </button>
            <h1 className="text-3xl font-bold text-white">Quiz Instructions</h1>
          </div>

          <div className="bg-richblack-700 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-white mb-4">{quizData.title}</h2>
            <p className="text-richblack-200 mb-4">{quizData.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-richblack-200">
              <div className="flex items-center gap-2">
                <HiOutlineQuestionMarkCircle className="text-yellow-50" />
                <span>Questions: {quizData.questions.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="text-yellow-50" />
                <span>Time Limit: {formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-800/20 border border-yellow-600 rounded-lg p-4 mb-6">
            <h3 className="text-yellow-200 font-semibold mb-2">Important Instructions:</h3>
            <ul className="text-yellow-100 space-y-1 text-sm">
              <li>• Answer all questions before submitting</li>
              <li>• You cannot go back once you start the quiz</li>
              <li>• The quiz will auto-submit when time runs out</li>
              <li>• Make sure you have a stable internet connection</li>
            </ul>
          </div>

          <div className="text-center">
            <IconBtn
              onClick={() => setQuizStarted(true)}
              text="Start Quiz"
              customClasses="px-8 py-3 text-lg"
            />
          </div>
        </div>
      </div>
    )
  }

  const currentQuestionData = quizData.questions[currentQuestion]

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-richblack-800 rounded-xl p-6 mb-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">{quizData.title}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-yellow-50">
              <FiClock />
              <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-richblack-200">
          <span>Question {currentQuestion + 1} of {quizData.questions.length}</span>
          <div className="w-64 bg-richblack-700 rounded-full h-2">
            <div 
              className="bg-yellow-50 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-richblack-800 rounded-xl p-6 mb-6 shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-4">
          {currentQuestionData.questionText}
          <span className="text-sm text-richblack-300 ml-2">
            ({currentQuestionData.marks} {currentQuestionData.marks === 1 ? 'mark' : 'marks'})
          </span>
        </h2>

        {/* Multiple Choice Questions */}
        {currentQuestionData.questionType === 'multipleChoice' && (
          <div className="space-y-3">
            <p className="text-sm text-richblack-300 mb-4">Select all that apply:</p>
            {currentQuestionData.options.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center space-x-3 p-3 bg-richblack-700 rounded-lg cursor-pointer hover:bg-richblack-600 transition-colors">
                <input
                  type="checkbox"
                  checked={(quizAnswers[currentQuestionData._id] || []).includes(optionIndex)}
                  onChange={() => handleQuizAnswer(currentQuestionData._id, optionIndex, 'multipleChoice')}
                  className="w-4 h-4 text-yellow-50 bg-richblack-600 border-richblack-500 rounded focus:ring-yellow-50"
                />
                <span className="text-richblack-25">{option}</span>
              </label>
            ))}
          </div>
        )}

        {/* Single Answer Questions */}
        {currentQuestionData.questionType === 'singleAnswer' && (
          <div className="space-y-3">
            {currentQuestionData.options.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center space-x-3 p-3 bg-richblack-700 rounded-lg cursor-pointer hover:bg-richblack-600 transition-colors">
                <input
                  type="radio"
                  name={`question-${currentQuestionData._id}`}
                  value={optionIndex}
                  checked={quizAnswers[currentQuestionData._id] === optionIndex}
                  onChange={() => handleQuizAnswer(currentQuestionData._id, optionIndex, 'singleAnswer')}
                  className="w-4 h-4 text-yellow-50 bg-richblack-600 border-richblack-500 focus:ring-yellow-50"
                />
                <span className="text-richblack-25">{option}</span>
              </label>
            ))}
          </div>
        )}

        {/* Short Answer Questions */}
        {currentQuestionData.questionType === 'shortAnswer' && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter your answer..."
              value={quizAnswers[currentQuestionData._id] || ''}
              onChange={(e) => handleQuizAnswer(currentQuestionData._id, e.target.value)}
              className="w-full p-4 bg-richblack-700 text-richblack-25 rounded-lg border border-richblack-600 focus:border-yellow-50 focus:outline-none transition-colors"
              maxLength={200}
            />
            <p className="text-xs text-richblack-400">Maximum 200 characters</p>
          </div>
        )}

        {/* Long Answer Questions */}
        {currentQuestionData.questionType === 'longAnswer' && (
          <div className="space-y-2">
            <textarea
              placeholder="Enter your detailed answer..."
              value={quizAnswers[currentQuestionData._id] || ''}
              onChange={(e) => handleQuizAnswer(currentQuestionData._id, e.target.value)}
              className="w-full p-4 bg-richblack-700 text-richblack-25 rounded-lg border border-richblack-600 focus:border-yellow-50 focus:outline-none resize-vertical transition-colors"
              rows={6}
              maxLength={1000}
            />
            <p className="text-xs text-richblack-400">Maximum 1000 characters</p>
          </div>
        )}

        {/* Match the Following Questions */}
        {currentQuestionData.questionType === 'matchTheFollowing' && (
          <div className="space-y-3">
            <p className="text-sm text-richblack-300 mb-4">Match the items by selecting corresponding pairs:</p>
            {currentQuestionData.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center space-x-4 p-3 bg-richblack-700 rounded-lg">
                <span className="text-richblack-25 flex-1">{option}</span>
                <select
                  value={quizAnswers[`${currentQuestionData._id}_${optionIndex}`] || ''}
                  onChange={(e) => handleQuizAnswer(`${currentQuestionData._id}_${optionIndex}`, e.target.value)}
                  className="p-2 bg-richblack-600 text-richblack-25 rounded border border-richblack-500 focus:border-yellow-50 focus:outline-none"
                >
                  <option value="">Select match...</option>
                  {currentQuestionData.options.map((matchOption, matchIndex) => (
                    <option key={matchIndex} value={matchIndex}>
                      {String.fromCharCode(65 + matchIndex)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="px-6 py-3 bg-richblack-700 text-white rounded-lg hover:bg-richblack-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        <div className="flex gap-2">
          {quizData.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                index === currentQuestion
                  ? 'bg-yellow-50 text-richblack-900'
                  : quizAnswers[quizData.questions[index]._id] !== undefined
                  ? 'bg-green-600 text-white'
                  : 'bg-richblack-700 text-richblack-300 hover:bg-richblack-600'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion === quizData.questions.length - 1 ? (
          <IconBtn
            onClick={handleQuizSubmit}
            text={loading ? "Submitting..." : "Submit Quiz"}
            disabled={loading}
            customClasses="px-6 py-3"
          />
        ) : (
          <button
            onClick={() => setCurrentQuestion(prev => Math.min(quizData.questions.length - 1, prev + 1))}
            className="px-6 py-3 bg-yellow-50 text-richblack-900 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}

export default QuizView
