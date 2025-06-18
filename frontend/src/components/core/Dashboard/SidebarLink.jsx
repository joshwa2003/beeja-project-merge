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
      className={({ isActive }) => `
        group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
        ${isActive 
          ? 'bg-purple-500/10 text-purple-400' 
          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
        }
      `}
    >
      {/* Icon with glow effect */}
      <div className={`
        relative flex items-center justify-center w-8 h-8 rounded-lg
        ${matchRoute(link.path)
          ? 'bg-purple-500/10 text-purple-400'
          : 'text-slate-400 group-hover:text-white'
        }
        transition-all duration-300
      `}>
        <Icon className="text-lg" />
        {matchRoute(link.path) && (
          <div className="absolute inset-0 rounded-lg bg-purple-500/20 animate-pulse" />
        )}
      </div>

      {/* Link Text */}
      <span className="font-medium text-sm">{link.name}</span>

      {/* Active Indicator */}
      {matchRoute(link.path) && (
        <div className="absolute left-0 w-1 h-8 bg-gradient-to-b from-purple-400 to-blue-500 rounded-r-full" />
      )}
    </NavLink>
  )
}
