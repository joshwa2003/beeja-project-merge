import * as Icons from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { NavLink, matchPath, useLocation } from "react-router-dom"

import { resetCourseState } from "../../../slices/courseSlice"
import { setOpenSideMenu } from "../../../slices/sidebarSlice"



export default function SidebarLink({ link, iconName }) {
  const Icon = Icons[iconName]
  const location = useLocation()
  const dispatch = useDispatch()

  const { openSideMenu, screenSize } = useSelector(state => state.sidebar)

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  const handleClick = () => {
    dispatch(resetCourseState())
    if (openSideMenu && screenSize <= 640) dispatch(setOpenSideMenu(false))
  }

  return (
    <NavLink
      to={link.path}
      onClick={handleClick}
      className={`sidebar-item relative px-8 py-3 text-sm font-medium rounded-lg mx-2 my-1 ${matchRoute(link.path)
        ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-richblack-900 shadow-lg"
        : "text-richblack-300"
        } transition-all duration-300`}
    >
      <span
        className={`absolute left-0 top-0 h-full w-[0.25rem] bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-r-full ${matchRoute(link.path) ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
      >
      </span>

      <div className="flex items-center gap-x-3 relative z-10">
        <Icon className={`text-lg ${matchRoute(link.path) ? "text-richblack-900" : "text-richblack-300"} transition-colors duration-300`} />
        <span className="font-medium">{link.name}</span>
      </div>

    </NavLink>
  )
}