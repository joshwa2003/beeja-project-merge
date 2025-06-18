import { useEffect } from "react"
import { useSelector } from "react-redux"
import { formatDate } from "../../../utils/dateFormatter"
import Img from './../../common/Img';

export default function MyProfile() {
  const { user } = useSelector((state) => state.profile)

  // Scroll to the top of the page when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  return (
    <div className="fade-in-up">
      <div className="glass-effect p-6 rounded-xl mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200 text-center sm:text-left">
          My Profile
        </h1>
        <p className="text-richblack-200 mt-2 opacity-75">
          Manage your personal information
        </p>
      </div>

      <div className="card-gradient rounded-xl p-6 glass-effect mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <Img
              src={user?.image}
              alt={`profile-${user?.firstName}`}
              className="w-24 h-24 rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200 capitalize">
              {user?.firstName + " " + user?.lastName}
            </h2>
            <p className="text-richblack-300 mt-2">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="card-gradient rounded-xl p-6 glass-effect mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200">
            About
          </h3>
        </div>
        <p className={`${user?.additionalDetails?.about ? "text-richblack-5" : "text-richblack-400"} text-sm leading-relaxed`}>
          {user?.additionalDetails?.about ?? "Write Something About Yourself"}
        </p>
      </div>

      <div className="card-gradient rounded-xl p-6 glass-effect">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-50 to-yellow-200">
            Personal Details
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="metric-card p-4 rounded-lg">
              <p className="text-sm text-richblack-300 mb-1">First Name</p>
              <p className="text-base font-semibold text-richblack-5 capitalize">
                {user?.firstName}
              </p>
            </div>
            <div className="metric-card p-4 rounded-lg">
              <p className="text-sm text-richblack-300 mb-1">Account Type</p>
              <p className="text-base font-semibold text-richblack-5 capitalize">
                {user?.accountType}
              </p>
            </div>
            <div className="metric-card p-4 rounded-lg">
              <p className="text-sm text-richblack-300 mb-1">Email</p>
              <p className="text-base font-semibold text-richblack-5">
                {user?.email}
              </p>
            </div>
            <div className="metric-card p-4 rounded-lg">
              <p className="text-sm text-richblack-300 mb-1">Gender</p>
              <p className="text-base font-semibold text-richblack-5">
                {user?.additionalDetails?.gender ?? "Add Gender"}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="metric-card p-4 rounded-lg">
              <p className="text-sm text-richblack-300 mb-1">Last Name</p>
              <p className="text-base font-semibold text-richblack-5 capitalize">
                {user?.lastName}
              </p>
            </div>
            <div className="metric-card p-4 rounded-lg">
              <p className="text-sm text-richblack-300 mb-1">Phone Number</p>
              <p className="text-base font-semibold text-richblack-5">
                {user?.additionalDetails?.contactNumber ?? "Add Contact Number"}
              </p>
            </div>
            <div className="metric-card p-4 rounded-lg">
              <p className="text-sm text-richblack-300 mb-1">Date Of Birth</p>
              <p className="text-base font-semibold text-richblack-5">
                {formatDate(user?.additionalDetails?.dateOfBirth) ?? "Add Date Of Birth"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
