import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { RxCross2 } from "react-icons/rx"
import { useDispatch, useSelector } from "react-redux"

import {
  createSubSection,
  updateSubSection,
} from "../../../../../services/operations/courseDetailsAPI"
import { getAllQuizzes } from "../../../../../services/operations/quizAPI"
import { setCourse } from "../../../../../slices/courseSlice"
import IconBtn from "../../../../common/IconBtn"
import Upload from "../Upload"

export default function SubSectionModal({ modalData, setModalData, add = false, view = false, edit = false, }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
  } = useForm()

  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [quizzes, setQuizzes] = useState([])
  const { token } = useSelector((state) => state.auth)
  const { course } = useSelector((state) => state.course)

  useEffect(() => {
    if (view || edit) {
      setValue("lectureTitle", modalData.title)
      setValue("lectureDesc", modalData.description)
      setValue("lectureVideo", modalData.videoUrl)
      setValue("quiz", modalData.quiz?._id || "")
    }
    
    // Load available quizzes
    loadQuizzes()
  }, [])

  const loadQuizzes = async () => {
    try {
      const response = await getAllQuizzes(token)
      if (response) {
        setQuizzes(response)
      }
    } catch (error) {
      console.error("Error loading quizzes:", error)
      // Set empty array if quiz loading fails
      setQuizzes([])
    }
  }

  // detect whether form is updated or not
  const isFormUpdated = () => {
    const currentValues = getValues()
    if (
      currentValues.lectureTitle !== modalData.title ||
      currentValues.lectureDesc !== modalData.description ||
      currentValues.lectureVideo !== modalData.videoUrl ||
      currentValues.quiz !== (modalData.quiz?._id || "")
    ) {
      return true
    }
    return false
  }

  // handle the editing of subsection
  const handleEditSubsection = async () => {
    setLoading(true)
    
    try {
      const currentValues = getValues()
      const formData = new FormData()
      formData.append("sectionId", modalData.sectionId)
      formData.append("subSectionId", modalData._id)
      if (currentValues.lectureTitle !== modalData.title) {
        formData.append("title", currentValues.lectureTitle)
      }
      if (currentValues.lectureDesc !== modalData.description) {
        formData.append("description", currentValues.lectureDesc)
      }
      if (currentValues.lectureVideo !== modalData.videoUrl) {
        formData.append("video", currentValues.lectureVideo)
      }
      if (currentValues.quiz !== (modalData.quiz?._id || "")) {
        formData.append("quiz", currentValues.quiz)
      }
      
      const result = await updateSubSection(formData, token)
      if (result) {
        // update the structure of course
        const updatedCourseContent = course.courseContent.map((section) =>
          section._id === modalData.sectionId ? result : section
        )
        const updatedCourse = { ...course, courseContent: updatedCourseContent }
        dispatch(setCourse(updatedCourse))
        setModalData(null)
      } else {
        toast.error("Failed to update lecture. Please try again.")
      }
    } catch (error) {
      console.error("Error updating subsection:", error)
      toast.error("Failed to update lecture. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    if (view) return

    if (edit) {
      if (!isFormUpdated()) {
        toast.error("No changes made to the form")
      } else {
        handleEditSubsection()
      }
      return
    }

    // Validate video file
    if (!data.lectureVideo || !(data.lectureVideo instanceof File)) {
      toast.error("Please upload a video file")
      return
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024 // 100MB in bytes
    if (data.lectureVideo.size > maxSize) {
      toast.error("Video file size must be less than 100MB")
      return
    }

    setLoading(true)
    const toastId = toast.loading("Uploading lecture... This may take a few minutes.")
    
    try {
      const formData = new FormData()
      formData.append("sectionId", modalData)
      formData.append("title", data.lectureTitle)
      formData.append("description", data.lectureDesc)
      formData.append("video", data.lectureVideo)
      if (data.quiz) {
        formData.append("quiz", data.quiz)
      }

      // Create subsection with timeout
      const timeoutDuration = 300000 // 5 minutes
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration)

      const subsectionResult = await Promise.race([
        createSubSection(formData, token),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout')), timeoutDuration)
        )
      ])

      clearTimeout(timeoutId)
      
      if (subsectionResult) {
        // Update course structure
        const updatedCourseContent = course.courseContent.map((section) =>
          section._id === modalData ? subsectionResult : section
        )
        const updatedCourse = { ...course, courseContent: updatedCourseContent }
        dispatch(setCourse(updatedCourse))
        toast.success("Lecture added successfully")
        setModalData(null)
      } else {
        throw new Error("Failed to create lecture")
      }
    } catch (error) {
      console.error("Error creating subsection:", error)
      if (error.message === 'Upload timeout') {
        toast.error("Upload timed out. Please try again with a smaller video file.")
      } else {
        toast.error("Failed to add lecture. Please try again.")
      }
    } finally {
      setLoading(false)
      toast.dismiss(toastId)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 flex h-screen w-screen items-center justify-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm p-4">
      <div className="max-h-[90vh] w-full max-w-[700px] overflow-y-auto rounded-lg border border-richblack-400 bg-richblack-800 p-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <p className="text-xl font-semibold text-richblack-5">
            {view && "Viewing"} {add && "Adding"} {edit && "Editing"} Lecture
          </p>
          <button onClick={() => (!loading ? setModalData(null) : {})}>
            <RxCross2 className="text-2xl text-richblack-5" />
          </button>
        </div>
        {/* Modal Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8 px-8 py-10 max-h-[70vh] overflow-y-auto"
        >
          {/* Lecture Video Upload */}
          <Upload
            name="lectureVideo"
            label="Lecture Video"
            register={register}
            setValue={setValue}
            errors={errors}
            video={true}
            viewData={view ? modalData.videoUrl : null}
            editData={edit ? modalData.videoUrl : null}
          />
          {/* Lecture Title */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="lectureTitle">
              Lecture Title {!view && <sup className="text-pink-200">*</sup>}
            </label>
            <input
              disabled={view || loading}
              id="lectureTitle"
              placeholder="Enter Lecture Title"
              {...register("lectureTitle", { required: true })}
              className="form-style w-full"
            />
            {errors.lectureTitle && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Lecture title is required
              </span>
            )}
          </div>
          
          {/* Lecture Description */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="lectureDesc">
              Lecture Description{" "}
              {!view && <sup className="text-pink-200">*</sup>}
            </label>
            <textarea
              disabled={view || loading}
              id="lectureDesc"
              placeholder="Enter Lecture Description"
              {...register("lectureDesc", { required: true })}
              className="form-style resize-x-none min-h-[130px] w-full"
            />
            {errors.lectureDesc && (
              <span className="ml-2 text-xs tracking-wide text-pink-200">
                Lecture Description is required
              </span>
            )}
          </div>

          {/* Quiz Selection
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="quiz">
              Attach Quiz (Optional)
            </label>
            <select
              disabled={view || loading}
              id="quiz"
              {...register("quiz")}
              className="form-style w-full"
            >
              <option value="">No Quiz</option>
              {quizzes.map((quiz) => (
                <option key={quiz._id} value={quiz._id}>
                  {quiz.title}
                </option>
              ))}
            </select>
          </div> */}

          {!view && (
            <div className="flex justify-end">
              <IconBtn
                disabled={loading}
                text={loading ? "Loading.." : edit ? "Save Changes" : "Save"}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
