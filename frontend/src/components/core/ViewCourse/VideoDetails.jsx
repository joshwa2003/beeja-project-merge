import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation } from "react-router-dom"
import { useNavigate, useParams } from "react-router-dom"

import "video-react/dist/video-react.css"
import { BigPlayButton, Player } from "video-react"

import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI"
import { updateCompletedLectures } from "../../../slices/viewCourseSlice"
import { setCourseViewSidebar } from "../../../slices/sidebarSlice"
import { getQuizById, submitQuiz } from "../../../services/operations/quizAPI"

import IconBtn from "../../common/IconBtn"

import { HiMenuAlt1 } from 'react-icons/hi'


const VideoDetails = () => {
  const { courseId, sectionId, subSectionId } = useParams()

  const navigate = useNavigate()
  const location = useLocation()
  const playerRef = useRef(null)
  const dispatch = useDispatch()

  const { token } = useSelector((state) => state.auth)
  const { courseSectionData, courseEntireData, completedLectures } = useSelector((state) => state.viewCourse)

  const [videoData, setVideoData] = useState([])
  const [previewSource, setPreviewSource] = useState("")
  const [videoEnded, setVideoEnded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizData, setQuizData] = useState(null)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizResult, setQuizResult] = useState(null)

  useEffect(() => {
    ; (async () => {
      if (!courseSectionData.length) return
      if (!courseId && !sectionId && !subSectionId) {
        navigate(`/dashboard/enrolled-courses`)
      } else {
        // console.log("courseSectionData", courseSectionData)
        const filteredData = courseSectionData.filter(
          (course) => course._id === sectionId
        )
        // console.log("filteredData", filteredData)
        const filteredVideoData = filteredData?.[0]?.subSection.filter(
          (data) => data._id === subSectionId
        )
        // console.log("filteredVideoData = ", filteredVideoData)
        if (filteredVideoData) {
          setVideoData(filteredVideoData[0])
          // Check if this subsection has a quiz
          if (filteredVideoData[0]?.quiz) {
            const quizId = typeof filteredVideoData[0].quiz === 'object' 
              ? filteredVideoData[0].quiz._id 
              : filteredVideoData[0].quiz
            loadQuiz(quizId)
          }
        }
        setPreviewSource(courseEntireData.thumbnail)
        setVideoEnded(false)
        setShowQuiz(false)
        setQuizCompleted(false)
        setQuizResult(null)
      }
    })()
  }, [courseSectionData, courseEntireData, location.pathname])

  // check if the lecture is the first video of the course
  const isFirstVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId)

    const currentSubSectionIndx = courseSectionData[currentSectionIndx].subSection.findIndex((data) => data._id === subSectionId)

    if (currentSectionIndx === 0 && currentSubSectionIndx === 0) {
      return true
    } else {
      return false
    }
  }

  // go to the next video
  const goToNextVideo = () => {
    // console.log(courseSectionData)

    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId)

    const noOfSubsections = courseSectionData[currentSectionIndx].subSection.length

    const currentSubSectionIndx = courseSectionData[currentSectionIndx].subSection.findIndex((data) => data._id === subSectionId)

    // console.log("no of subsections", noOfSubsections)

    if (currentSubSectionIndx !== noOfSubsections - 1) {
      const nextSubSectionId = courseSectionData[currentSectionIndx].subSection[currentSubSectionIndx + 1]._id

      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`)
    } else {
      const nextSectionId = courseSectionData[currentSectionIndx + 1]._id
      const nextSubSectionId = courseSectionData[currentSectionIndx + 1].subSection[0]._id
      navigate(`/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`)
    }
  }

  // check if the lecture is the last video of the course
  const isLastVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId)

    const noOfSubsections = courseSectionData[currentSectionIndx].subSection.length

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId)

    if (
      currentSectionIndx === courseSectionData.length - 1 &&
      currentSubSectionIndx === noOfSubsections - 1
    ) {
      return true
    } else {
      return false
    }
  }

  // go to the previous video
  const goToPrevVideo = () => {
    // console.log(courseSectionData)

    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId)

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ].subSection.findIndex((data) => data._id === subSectionId)

    if (currentSubSectionIndx !== 0) {
      const prevSubSectionId = courseSectionData[currentSectionIndx].subSection[currentSubSectionIndx - 1]._id
      navigate(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`
      )
    } else {
      const prevSectionId = courseSectionData[currentSectionIndx - 1]._id
      const prevSubSectionLength = courseSectionData[currentSectionIndx - 1].subSection.length
      const prevSubSectionId = courseSectionData[currentSectionIndx - 1].subSection[prevSubSectionLength - 1]._id
      navigate(
        `/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`
      )
    }
  }

  // Load quiz data silently
  const loadQuiz = async (quizId) => {
    try {
      const quiz = await getQuizById(quizId, token)
      setQuizData(quiz)
    } catch (error) {
      console.error("Error loading quiz:", error)
      // Silently handle error without showing notification
    }
  }

  // handle Lecture Completion
  const handleLectureCompletion = async () => {
    setLoading(true)
    const res = await markLectureAsComplete(
      { courseId: courseId, subsectionId: subSectionId },
      token
    )
    if (res) {
      dispatch(updateCompletedLectures(subSectionId))
      // Show quiz if available after marking lecture complete
      if (videoData?.quiz && quizData) {
        setShowQuiz(true)
      }
    }
    setLoading(false)
  }

  // Handle quiz answer selection
  const handleQuizAnswer = (questionId, selectedOption, questionType = 'single') => {
    console.log('Handling answer:', { questionId, selectedOption, questionType });
    
    if (questionType === 'multipleChoice') {
      // For multiple choice, handle array of selected options
      setQuizAnswers(prev => {
        const currentAnswers = prev[questionId] || []
        const isSelected = currentAnswers.includes(selectedOption)
        
        if (isSelected) {
          // Remove option if already selected
          return {
            ...prev,
            [questionId]: currentAnswers.filter(option => option !== selectedOption)
          }
        } else {
          // Add option if not selected
          return {
            ...prev,
            [questionId]: [...currentAnswers, selectedOption]
          }
        }
      })
    } else if (questionType === 'singleAnswer') {
      // For single choice questions - ensure the value is a number
      setQuizAnswers(prev => ({
        ...prev,
        [questionId]: Number(selectedOption)
      }))
    } else {
      // For other question types
      setQuizAnswers(prev => ({
        ...prev,
        [questionId]: selectedOption
      }))
    }
    
    // Debug: Log current answers after update
    setTimeout(() => {
      console.log('Current quiz answers:', quizAnswers);
    }, 0);
  }

  // Submit quiz
  const handleQuizSubmit = async () => {
    if (!quizData) {
      alert("Quiz data not available.")
      return
    }

    // Validate all questions are answered
    const unansweredQuestions = []
    quizData.questions.forEach((question, index) => {
      const answer = quizAnswers[question._id]
      
      if (question.questionType === 'matchTheFollowing') {
        // Check if all match pairs are answered
        const hasAllMatches = question.options.every((_, optionIndex) => {
          const matchAnswer = quizAnswers[`${question._id}_${optionIndex}`]
          return matchAnswer !== undefined && matchAnswer !== null && matchAnswer !== ''
        })
        if (!hasAllMatches) {
          unansweredQuestions.push(index + 1)
        }
      } else if (question.questionType === 'multipleChoice') {
        // Check if at least one option is selected for multiple choice
        const selectedOptions = quizAnswers[question._id] || []
        if (!Array.isArray(selectedOptions) || selectedOptions.length === 0) {
          unansweredQuestions.push(index + 1)
        }
      } else if (question.questionType === 'singleAnswer') {
        // For single answer questions - check if answer exists (including 0)
        const answerNum = Number(answer);
        if (isNaN(answerNum) && answer !== 0) {
          unansweredQuestions.push(index + 1)
        }
      } else {
        // For text-based questions
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
        setQuizCompleted(true)
        setShowQuiz(false)
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
    }
    setLoading(false)
  }

  const { courseViewSidebar } = useSelector(state => state.sidebar)

  // this will hide course video , title , desc, if sidebar is open in small device
  // for good looking i have try this 
  if (courseViewSidebar && window.innerWidth <= 640) return;

  return (
    <div className="flex flex-col gap-5 text-white">

      {/* open - close side bar icons */}
      <div className="sm:hidden text-white absolute left-7 top-3 cursor-pointer " onClick={() => dispatch(setCourseViewSidebar(!courseViewSidebar))}>
        {
          !courseViewSidebar && <HiMenuAlt1 size={33} />
        }
      </div>


      {!videoData ? (
        <img
          src={previewSource}
          alt="Preview"
          className="h-full w-full rounded-md object-cover"
        />
      ) : (
        <Player
          ref={playerRef}
          aspectRatio="16:9"
          playsInline
          autoPlay
          onEnded={() => setVideoEnded(true)}
          src={videoData?.videoUrl}
        >
          <BigPlayButton position="center" />
          {/* Render When Video Ends */}
          {videoEnded && (
            <div
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
              }}
              className="full absolute inset-0 z-[100] grid h-full place-content-center font-inter"
            >
              {!completedLectures.includes(subSectionId) && (
                <IconBtn
                  disabled={loading}
                  onClick={() => handleLectureCompletion()}
                  text={!loading ? "Mark As Completed" : "Loading..."}
                  customClasses="text-xl max-w-max px-4 mx-auto"
                />
              )}
              {completedLectures.includes(subSectionId) && videoData?.quiz && !quizCompleted && (
                <IconBtn
                  disabled={loading}
                  onClick={() => setShowQuiz(true)}
                  text="Take Quiz"
                  customClasses="text-xl max-w-max px-4 mx-auto"
                />
              )}
              <IconBtn
                disabled={loading}
                onClick={() => {
                  if (playerRef?.current) {
                    // set the current time of the video to 0
                    playerRef?.current?.seek(0)
                    setVideoEnded(false)
                  }
                }}
                text="Rewatch"
                customClasses="text-xl max-w-max px-4 mx-auto mt-2"
              />

              <div className="mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl">
                {!isFirstVideo() && (
                  <button
                    disabled={loading}
                    onClick={goToPrevVideo}
                    className="blackButton"
                  >
                    Prev
                  </button>
                )}
                {!isLastVideo() && (
                  <button
                    disabled={loading}
                    onClick={goToNextVideo}
                    className="blackButton"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </Player>
      )}

      <h1 className="mt-4 text-3xl font-semibold">{videoData?.title}</h1>
      <p className="pt-2 pb-6">{videoData?.description}</p>

      {/* Quiz Access Section - Always available if quiz exists */}
      {videoData?.quiz && quizData && !showQuiz && !quizCompleted && (
        <div className="mt-6 p-4 bg-richblack-800 rounded-lg border border-richblack-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-richblack-25">Quiz Available</h3>
              <p className="text-sm text-richblack-300">
                Test your knowledge with the quiz for this section
              </p>
            </div>
            <IconBtn
              onClick={() => setShowQuiz(true)}
              text="Take Quiz"
              customClasses="px-4 py-2"
            />
          </div>
        </div>
      )}

      {/* Quiz Section */}
      {showQuiz && quizData && (
        <div className="mt-6 p-6 bg-richblack-800 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Quiz: {quizData.title}</h2>
          <p className="text-richblack-200 mb-6">{quizData.description}</p>
          
          {quizData.questions.map((question, index) => (
            <div key={question._id} className="mb-6 p-4 bg-richblack-700 rounded-lg">
              <h3 className="text-lg font-medium mb-3">
                {index + 1}. {question.questionText}
                <span className="text-sm text-richblack-300 ml-2">
                  ({question.marks} {question.marks === 1 ? 'mark' : 'marks'})
                </span>
              </h3>
              
              {/* Multiple Choice Questions */}
              {question.questionType === 'multipleChoice' && (
                <div className="space-y-2">
                  <p className="text-sm text-richblack-300 mb-2">Select all that apply:</p>
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(quizAnswers[question._id] || []).includes(optionIndex)}
                        onChange={() => handleQuizAnswer(question._id, optionIndex, 'multipleChoice')}
                        className="text-yellow-50"
                      />
                      <span className="text-richblack-25">{option}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {/* Single Answer Questions */}
              {question.questionType === 'singleAnswer' && (
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${question._id}`}
                        value={optionIndex}
                        checked={quizAnswers[question._id] === optionIndex}
                        onChange={() => handleQuizAnswer(question._id, optionIndex, 'singleAnswer')}
                        className="text-yellow-50"
                      />
                      <span className="text-richblack-25">{option}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {/* Short Answer Questions */}
              {question.questionType === 'shortAnswer' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Enter your answer..."
                    value={quizAnswers[question._id] || ''}
                    onChange={(e) => handleQuizAnswer(question._id, e.target.value)}
                    className="w-full p-3 bg-richblack-600 text-richblack-25 rounded-lg border border-richblack-500 focus:border-yellow-50 focus:outline-none"
                    maxLength={200}
                  />
                  <p className="text-xs text-richblack-400">Maximum 200 characters</p>
                </div>
              )}
              
              {/* Long Answer Questions */}
              {question.questionType === 'longAnswer' && (
                <div className="space-y-2">
                  <textarea
                    placeholder="Enter your detailed answer..."
                    value={quizAnswers[question._id] || ''}
                    onChange={(e) => handleQuizAnswer(question._id, e.target.value)}
                    className="w-full p-3 bg-richblack-600 text-richblack-25 rounded-lg border border-richblack-500 focus:border-yellow-50 focus:outline-none resize-vertical"
                    rows={5}
                    maxLength={1000}
                  />
                  <p className="text-xs text-richblack-400">Maximum 1000 characters</p>
                </div>
              )}
              
              {/* Match the Following Questions */}
              {question.questionType === 'matchTheFollowing' && (
                <div className="space-y-2">
                  <p className="text-sm text-richblack-300 mb-3">Match the items by selecting corresponding pairs:</p>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-3">
                      <span className="text-richblack-25 flex-1">{option}</span>
                      <select
                        value={quizAnswers[`${question._id}_${optionIndex}`] || ''}
                        onChange={(e) => handleQuizAnswer(`${question._id}_${optionIndex}`, e.target.value)}
                        className="p-2 bg-richblack-600 text-richblack-25 rounded border border-richblack-500 focus:border-yellow-50 focus:outline-none"
                      >
                        <option value="">Select match...</option>
                        {question.options.map((matchOption, matchIndex) => (
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
          ))}
          
          <div className="flex gap-4">
            <IconBtn
              onClick={handleQuizSubmit}
              text={loading ? "Submitting..." : "Submit Quiz"}
              disabled={loading}
              customClasses="px-6 py-2"
            />
            <button
              onClick={() => setShowQuiz(false)}
              className="px-6 py-2 bg-richblack-600 text-white rounded-lg hover:bg-richblack-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Quiz Result */}
      {quizResult && (
        <div className="mt-6 p-6 bg-green-800 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Quiz Completed!</h2>
          <p className="text-lg">
            Your Score: {quizResult.score} / {quizResult.totalMarks}
          </p>
          <p className="text-sm mt-2">
            Percentage: {((quizResult.score / quizResult.totalMarks) * 100).toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  )
}

export default VideoDetails
