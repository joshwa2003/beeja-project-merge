import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { HiOutlineCurrencyRupee } from "react-icons/hi"

import { createCourseAsAdmin, getAllInstructors } from "../../../../services/operations/adminAPI"
import { fetchCourseCategories } from "../../../../services/operations/courseDetailsAPI"
import Upload from "../../../../components/core/Dashboard/AddCourse/Upload"
import IconBtn from "../../../../components/common/IconBtn"
import { COURSE_STATUS } from "../../../../utils/constants"
import ChipInput from "../../../../components/core/Dashboard/AddCourse/CourseInformation/ChipInput"
import RequirementsField from "../../../../components/core/Dashboard/AddCourse/CourseInformation/RequirementField"

export default function CreateCourse({ onCancel }) {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [instructors, setInstructors] = useState([])
  const [categories, setCategories] = useState([])

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [instructorsResponse, categoriesResponse] = await Promise.all([
          getAllInstructors(token),
          fetchCourseCategories()
        ])
        
        if (instructorsResponse) {
          setInstructors(instructorsResponse)
        }
        if (categoriesResponse) {
          setCategories(categoriesResponse)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to fetch required data")
      }
      setLoading(false)
    }
    fetchData()
  }, [token])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("courseName", data.courseTitle)
      formData.append("courseDescription", data.courseShortDesc)
      formData.append("price", data.coursePrice)
      formData.append("category", data.courseCategory)
      formData.append("whatYouWillLearn", data.courseBenefits)
      formData.append("instructorId", data.instructorId)
      formData.append("status", data.status || COURSE_STATUS.DRAFT)
      formData.append("tag", JSON.stringify(data.courseTags || []))
      formData.append("instructions", JSON.stringify(data.courseRequirements || []))

      // Handle thumbnail image
      if (data.courseImage instanceof File) {
        formData.append("thumbnailImage", data.courseImage)
      }

      console.log("Form Data:", {
        courseTitle: data.courseTitle,
        courseShortDesc: data.courseShortDesc,
        coursePrice: data.coursePrice,
        category: data.courseCategory,
        courseBenefits: data.courseBenefits,
        instructorId: data.instructorId,
        status: data.status,
        courseTags: data.courseTags,
        courseRequirements: data.courseRequirements,
        courseImage: data.courseImage instanceof File ? data.courseImage.name : 'No file'
      })

      const result = await createCourseAsAdmin(formData, token)
      if (result) {
        toast.success("Course created successfully")
        if (onCancel) {
          onCancel() // Go back to course management
        } else {
          navigate("/admin")
        }
      } else {
        toast.error("Failed to create course")
      }
    } catch (error) {
      console.error("Error creating course:", error)
      toast.error("Error creating course: " + (error.message || "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6">
      <h1 className="mb-14 text-3xl font-medium text-richblack-5">
        Create New Course
      </h1>

      {/* Course Title */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseTitle">
          Course Title <sup className="text-pink-200">*</sup>
        </label>
        <input
          id="courseTitle"
          placeholder="Enter Course Title"
          {...register("courseTitle", { required: true })}
          className="form-style w-full"
        />
        {errors.courseTitle && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            Course title is required
          </span>
        )}
      </div>

      {/* Course Description */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseShortDesc">
          Course Description <sup className="text-pink-200">*</sup>
        </label>
        <textarea
          id="courseShortDesc"
          placeholder="Enter Course Description"
          {...register("courseShortDesc", { required: true })}
          className="form-style min-h-[130px] w-full"
        />
        {errors.courseShortDesc && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            Course description is required
          </span>
        )}
      </div>

      {/* Course Price */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="coursePrice">
          Course Price <sup className="text-pink-200">*</sup>
        </label>
        <div className="relative">
          <input
            id="coursePrice"
            placeholder="Enter Course Price"
            {...register("coursePrice", {
              required: true,
              valueAsNumber: true,
              pattern: {
                value: /^(0|[1-9]\d*)(\.\d+)?$/,
              },
            })}
            type="number"
            className="form-style w-full !pl-12"
          />
          <HiOutlineCurrencyRupee className="absolute left-3 top-1/2 inline-block -translate-y-1/2 text-2xl text-richblack-400" />
        </div>
        {errors.coursePrice && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            Course price is required and must be non-negative
          </span>
        )}
      </div>

      {/* Course Category */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseCategory">
          Course Category <sup className="text-pink-200">*</sup>
        </label>
        <select
          id="courseCategory"
          defaultValue=""
          {...register("courseCategory", { required: true })}
          className="form-style w-full"
        >
          <option value="" disabled>
            Choose a Category
          </option>
          {categories?.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.courseCategory && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            Course category is required
          </span>
        )}
      </div>

      {/* Course Tags */}
      <ChipInput
        label="Tags"
        name="courseTags"
        placeholder="Enter Tags and press Enter or Comma"
        register={register}
        errors={errors}
        setValue={setValue}
      />

      {/* Course Thumbnail */}
      <Upload
        name="courseImage"
        label="Course Thumbnail"
        register={register}
        setValue={setValue}
        errors={errors}
        editData={null}
        viewData={null}
      />

      {/* Benefits of the course */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseBenefits">
          Benefits of the course <sup className="text-pink-200">*</sup>
        </label>
        <textarea
          id="courseBenefits"
          placeholder="Enter benefits of the course"
          {...register("courseBenefits", { required: true })}
          className="form-style min-h-[130px] w-full"
        />
        {errors.courseBenefits && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            Benefits of the course is required
          </span>
        )}
      </div>

      {/* Requirements/Instructions */}
      <RequirementsField
        name="courseRequirements"
        label="Requirements/Instructions"
        register={register}
        setValue={setValue}
        errors={errors}
      />

      {/* Instructor Selection */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="instructorId">
          Select Instructor <sup className="text-pink-200">*</sup>
        </label>
        <select
          id="instructorId"
          defaultValue=""
          {...register("instructorId", { required: true })}
          className="form-style w-full"
        >
          <option value="" disabled>
            Choose an Instructor
          </option>
          {instructors?.map((instructor) => (
            <option key={instructor._id} value={instructor._id}>
              {instructor.firstName} {instructor.lastName}
            </option>
          ))}
        </select>
        {errors.instructorId && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            Instructor selection is required
          </span>
        )}
      </div>

      {/* Course Status */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="status">
          Course Status <sup className="text-pink-200">*</sup>
        </label>
        <select
          id="status"
          defaultValue={COURSE_STATUS.DRAFT}
          {...register("status", { required: true })}
          className="form-style w-full"
        >
          <option value={COURSE_STATUS.DRAFT}>Draft</option>
          <option value={COURSE_STATUS.PUBLISHED}>Published</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex gap-x-2">
        <button
          disabled={loading}
          type="button"
          onClick={() => {
            if (onCancel) {
              onCancel()
            } else {
              navigate("/admin")
            }
          }}
          className="flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900"
        >
          Cancel
        </button>
        <IconBtn
          disabled={loading}
          text={loading ? "Creating..." : "Create Course"}
        />
      </div>
    </form>
  )
}
