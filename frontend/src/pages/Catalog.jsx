import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion"

// import CourseCard from "../components/Catalog/CourseCard"
// import CourseSlider from "../components/Catalog/CourseSlider"
import ImprovedFooter from "../components/common/ImprovedFooter"
import Course_Card from '../components/core/Catalog/Course_Card'
import Course_Slider from "../components/core/Catalog/Course_Slider"
import Loading from './../components/common/Loading';
import BackgroundEffect from './BackgroundEffect'

import { getCatalogPageData } from '../services/operations/pageAndComponentData'
import { fetchCourseCategories } from './../services/operations/courseDetailsAPI';




function Catalog() {

    const { catalogName } = useParams()
    const [active, setActive] = useState(1)
    const [catalogPageData, setCatalogPageData] = useState(null)
    const [categoryId, setCategoryId] = useState("")
    const [loading, setLoading] = useState(false);

    // Fetch All Categories
    useEffect(() => {
        ; (async () => {
            try {
                const res = await fetchCourseCategories();
                const category_id = res.filter(
                    (ct) => ct.name.split(" ").join("-").toLowerCase() === catalogName
                )[0]._id
                setCategoryId(category_id)
            } catch (error) {
                console.log("Could not fetch Categories.", error)
            }
        })()
    }, [catalogName])


    useEffect(() => {
        if (categoryId) {
            ; (async () => {
                setLoading(true)
                try {
                    const res = await getCatalogPageData(categoryId)
                    setCatalogPageData(res)
                } catch (error) {
                    console.log(error)
                }
                setLoading(false)
            })()
        }
    }, [categoryId])

    // console.log('======================================= ', catalogPageData)
    // console.log('categoryId ==================================== ', categoryId)

    if (loading) {
        return (
            <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
                <Loading />
            </div>
        )
    }
    if (!loading && !catalogPageData) {
        return (
            <div className="text-white text-4xl flex justify-center items-center mt-[20%]">
                No Courses found for selected Category
            </div>)
    }



    return (
        <>
            {/* Background with Gradient and Particles */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="relative z-0"
            >
                <BackgroundEffect />
            </motion.div>

            {/* Hero Section */}
            <div className="relative box-content bg-richblack-800 px-4 sm:px-6 lg:px-8 z-10">
                <div className="mx-auto flex min-h-[200px] sm:min-h-[240px] lg:min-h-[260px] max-w-maxContentTab flex-col justify-center gap-3 sm:gap-4 lg:max-w-maxContent">
                    <p className="text-xs sm:text-sm text-richblack-300">
                        {`Home / Catalog / `}
                        <span className="text-yellow-25">
                            {catalogPageData?.selectedCategory?.name}
                        </span>
                    </p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-richblack-5 leading-tight">
                        {catalogPageData?.selectedCategory?.name}
                    </p>
                    <p className="max-w-[870px] text-sm sm:text-base text-richblack-200 leading-relaxed">
                        {catalogPageData?.selectedCategory?.description}
                    </p>
                </div>
            </div>

            {/* Section 1 */}
            <div className="mx-auto box-content w-full max-w-maxContentTab px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 lg:max-w-maxContent">
                <div className="section_heading text-2xl sm:text-3xl font-bold text-richblack-5 mb-6">
                    Courses to get you started
                </div>
                <div className="my-4 flex border-b border-b-richblack-600 text-sm overflow-x-auto">
                    <p
                        className={`px-3 sm:px-4 py-2 whitespace-nowrap ${active === 1
                            ? "border-b border-b-yellow-25 text-yellow-25"
                            : "text-richblack-50"
                            } cursor-pointer hover:text-yellow-50 transition-colors`}
                        onClick={() => setActive(1)}
                    >
                        Most Popular
                    </p>
                    <p
                        className={`px-3 sm:px-4 py-2 whitespace-nowrap ${active === 2
                            ? "border-b border-b-yellow-25 text-yellow-25"
                            : "text-richblack-50"
                            } cursor-pointer hover:text-yellow-50 transition-colors`}
                        onClick={() => setActive(2)}
                    >
                        New
                    </p>
                </div>
                <div>
                    <Course_Slider
                        Courses={catalogPageData?.selectedCategory?.courses}
                    />
                </div>
            </div>

            {/* Section 2 */}
            <div className="mx-auto box-content w-full max-w-maxContentTab px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 lg:max-w-maxContent">
                <div className="section_heading text-2xl sm:text-3xl font-bold text-richblack-5 mb-6">
                    Top courses in {catalogPageData?.differentCategory?.name}
                </div>
                <div>
                    <Course_Slider
                        Courses={catalogPageData?.differentCategory?.courses}
                    />
                </div>
            </div>

            {/* Section 3 */}
            <div className="mx-auto box-content w-full max-w-maxContentTab px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 lg:max-w-maxContent">
                <div className="section_heading text-2xl sm:text-3xl font-bold text-richblack-5 mb-6">
                    Frequently Bought
                </div>
                <div className="py-6 sm:py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                        {catalogPageData?.mostSellingCourses
                            ?.slice(0, 4)   
                            .map((course, i) => (
                                <Course_Card 
                                    course={course} 
                                    key={i} 
                                    Height={"h-[250px] sm:h-[280px] lg:h-[300px]"} 
                                />
                            ))}
                    </div>
                </div>
            </div>

            <ImprovedFooter />
        </>
    )
}

export default Catalog
