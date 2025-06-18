import { useState } from "react"
import { Chart, registerables } from "chart.js"
import { Pie } from "react-chartjs-2"

Chart.register(...registerables)

export default function InstructorChart({ courses }) {
  // State to keep track of the currently selected chart
  const [currChart, setCurrChart] = useState("students")

  // Function to generate random colors for the chart
  const generateRandomColors = (numColors) => {
    const colors = []
    for (let i = 0; i < numColors; i++) {
      const color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
        Math.random() * 256
      )}, ${Math.floor(Math.random() * 256)})`
      colors.push(color)
    }
    return colors
  }

  // Data for the chart displaying student information
  const chartDataStudents = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        data: courses.map((course) => course.totalStudentsEnrolled),
        backgroundColor: generateRandomColors(courses.length),
      },
    ],
  }

  // Data for the chart displaying income information
  const chartIncomeData = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        data: courses.map((course) => course.totalAmountGenerated),
        backgroundColor: generateRandomColors(courses.length),
      },
    ],
  }

  // Options for the chart
  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-y-4 rounded-xl card-gradient p-6 glass-effect">
      <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200">Visualize</p>

      <div className="flex gap-2 font-semibold">
        {/* Button to switch to the "students" chart */}
        <button
          onClick={() => setCurrChart("students")}
          className={`rounded-lg px-4 py-2 transition-all duration-300 ${currChart === "students"
            ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-richblack-900 shadow-lg"
            : "text-yellow-400 hover:bg-richblack-700/50"
            }`}
        >
          Students
        </button>

        {/* Button to switch to the "income" chart */}
        <button
          onClick={() => setCurrChart("income")}
          className={`rounded-lg px-4 py-2 transition-all duration-300 ${currChart === "income"
            ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-richblack-900 shadow-lg"
            : "text-yellow-400 hover:bg-richblack-700/50"
            }`}
        >
          Income
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="w-full max-w-[300px] h-[300px] relative">
          {/* Render the Pie chart based on the selected chart */}
          <Pie
            data={currChart === "students" ? chartDataStudents : chartIncomeData}
            options={options}
          />
        </div>
      </div>
    </div>
  )
}
