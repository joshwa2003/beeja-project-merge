import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { RxCross2 } from "react-icons/rx"
import { useDispatch, useSelector } from "react-redux"

import {
  createSubSection,
  updateSubSection,
} from "../../../../../services/operations/courseDetailsAPI"
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
  const { token } = useSelector((state) => state.auth)
  const { course } = useSelector((state) => state.course)

  useEffect(() => {
    if (view || edit) {
      setValue("lectureTitle", modalData.title)
      setValue("lectureDesc", modalData.description)
      setValue("lectureVideo", modalData.videoUrl)
    }
  }, [])

  // detect whether form is updated or not
  const isFormUpdated = () => {
    const currentValues = getValues()
    if (
      currentValues.lectureTitle !== modalData.title ||
      currentValues.lectureDesc !== modalData.description ||
      currentValues.lectureVideo !== modalData.videoUrl
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
    
    
    try {
      const formData = new FormData()
      formData.append("sectionId", modalData)
      formData.append("title", data.lectureTitle)
      formData.append("description", data.lectureDesc)
      formData.append("video", data.lectureVideo)

      // Create subsection with timeout
      const timeoutDuration = 300000 // 5 minutes
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration)

      try {
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
        }
      } catch (error) {
        console.error("Error creating subsection:", error)
        if (error?.response?.status === 401) {
          toast.error("Session expired. Please login again.")
          // You might want to redirect to login or refresh token here
        } else if (error.message === 'Upload timeout') {
          toast.error("Upload timed out. Please try again with a smaller video file.")
        } else {
          toast.error(error?.response?.data?.message || "Failed to add lecture. Please try again.")
        }
        throw error
      }
    } finally {
      setLoading(false)
      toast.dismiss(toastId)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-4 w-11/12 max-w-[700px] rounded-lg border border-richblack-400 bg-richblack-800">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-lg bg-richblack-700 p-4 md:p-5">
          <p className="text-xl font-semibold text-richblack-5">
            {view && "Viewing"} {add && "Adding"} {edit && "Editing"} Lecture
          </p>
          <button onClick={() => (!loading ? setModalData(null) : {})}>
            <RxCross2 className="text-2xl text-richblack-5" />
          </button>
        </div>
        {/* Modal Form */}
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 p-4 md:p-6 lg:p-8"
          >
            {/* Video Upload Section */}
            <div className="space-y-4">
              <div className="border-b border-richblack-600 pb-4">
                <h3 className="text-lg font-medium text-richblack-5 mb-2">
                  📹 Video Content
                </h3>
                <p className="text-sm text-richblack-300">
                  Upload your lecture video (Max: 100MB, Format: MP4)
                </p>
              </div>
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
            </div>

            {/* Lecture Details Section */}
            <div className="space-y-4">
              <div className="border-b border-richblack-600 pb-4">
                <h3 className="text-lg font-medium text-richblack-5 mb-2">
                  📝 Lecture Details
                </h3>
                <p className="text-sm text-richblack-300">
                  Provide clear and descriptive information about your lecture
                </p>
              </div>
              
              {/* Responsive Grid for Form Fields */}
              <div className="grid grid-cols-1 gap-4 lg:gap-6">
                {/* Lecture Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-richblack-5" htmlFor="lectureTitle">
                    Lecture Title {!view && <sup className="text-pink-200">*</sup>}
                  </label>
                  <input
                    disabled={view || loading}
                    id="lectureTitle"
                    placeholder="Enter a clear and descriptive title"
                    {...register("lectureTitle", { 
                      required: "Lecture title is required",
                      minLength: {
                        value: 3,
                        message: "Title must be at least 3 characters long"
                      },
                      maxLength: {
                        value: 100,
                        message: "Title must be less than 100 characters"
                      }
                    })}
                    className="form-style w-full transition-all duration-200 focus:ring-2 focus:ring-yellow-50 focus:border-yellow-50"
                  />
                  {errors.lectureTitle && (
                    <span className="flex items-center text-xs text-pink-200 mt-1">
                      <span className="mr-1">⚠️</span>
                      {errors.lectureTitle.message}
                    </span>
                  )}
                </div>
                
                {/* Lecture Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-richblack-5" htmlFor="lectureDesc">
                    Lecture Description {!view && <sup className="text-pink-200">*</sup>}
                  </label>
                  <textarea
                    disabled={view || loading}
                    id="lectureDesc"
                    placeholder="Describe what students will learn in this lecture..."
                    {...register("lectureDesc", { 
                      required: "Lecture description is required",
                      minLength: {
                        value: 10,
                        message: "Description must be at least 10 characters long"
                      },
                      maxLength: {
                        value: 1000,
                        message: "Description must be less than 1000 characters"
                      }
                    })}
                    className="form-style resize-none min-h-[120px] w-full transition-all duration-200 focus:ring-2 focus:ring-yellow-50 focus:border-yellow-50"
                    rows="4"
                  />
                  {errors.lectureDesc && (
                    <span className="flex items-center text-xs text-pink-200 mt-1">
                      <span className="mr-1">⚠️</span>
                      {errors.lectureDesc.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!view && (
              <div className="sticky bottom-0 bg-richblack-800 pt-4 border-t border-richblack-600">
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setModalData(null)}
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-3 text-richblack-5 bg-richblack-600 rounded-lg hover:bg-richblack-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <IconBtn
                    disabled={loading}
                    text={loading ? "Processing..." : edit ? "Save Changes" : "Add Lecture"}
                    className="w-full sm:w-auto"
                  />
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
