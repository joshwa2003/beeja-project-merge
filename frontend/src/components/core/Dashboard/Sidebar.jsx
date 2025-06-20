import { useEffect, useState } from "react"
import { VscSignOut } from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { sidebarLinks } from './../../../../data/dashboard-links';
import { logout } from "../../../services/operations/authAPI"
import ConfirmationModal from "../../common/ConfirmationModal"
import SidebarLink from "./SidebarLink"
import Loading from './../../common/Loading';

import { HiMenuAlt1 } from 'react-icons/hi'
import { IoMdClose } from 'react-icons/io'
import { FiSettings } from 'react-icons/fi'
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md'

import { setOpenSideMenu, setScreenSize, toggleSidebarCollapse } from "../../../slices/sidebarSlice";

export default function Sidebar() {
  const { user, loading: profileLoading } = useSelector((state) => state.profile)
  const { loading: authLoading } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // to keep track of confirmation modal
  const [confirmationModal, setConfirmationModal] = useState(null)

  const { openSideMenu, screenSize, isCollapsed } = useSelector((state) => state.sidebar)

  useEffect(() => {
    const handleResize = () => dispatch(setScreenSize(window.innerWidth))

    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // If screen size is small then close the side bar
  useEffect(() => {
    if (screenSize <= 640) {
      dispatch(setOpenSideMenu(false))
    }
    else dispatch(setOpenSideMenu(true))
  }, [screenSize])

  if (profileLoading || authLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] min-w-[200px] items-center justify-center bg-slate-900/50 backdrop-blur-xl border-r border-slate-700/50">
        <div className="relative">
          <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="sm:hidden fixed top-20 left-4 z-[60]">
        <button 
          onClick={() => dispatch(setOpenSideMenu(!openSideMenu))}
          className="p-3 rounded-xl bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 text-white hover:bg-slate-700/80 transition-all duration-300 shadow-lg"
        >
          {openSideMenu ? <IoMdClose size={20} /> : <HiMenuAlt1 size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      {openSideMenu && (
        <>
          {/* Mobile Overlay */}
          {screenSize <= 640 && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[45] sm:hidden"
              onClick={() => dispatch(setOpenSideMenu(false))}
            />
          )}
          
          <div className={`fixed sm:relative min-h-screen ${
            isCollapsed ? 'w-[56px]' : 'w-[240px] sm:w-[200px]'
          } flex flex-col bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 transition-all duration-300 z-50`}>
            {/* Collapse/Expand Button - Desktop Only */}
            {screenSize > 640 && (
              <div className="absolute -right-2 top-20 z-[1001]">
                <button
                  onClick={() => dispatch(toggleSidebarCollapse())}
                  className="w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300 shadow-lg hover:scale-110"
                >
                  {isCollapsed ? <MdKeyboardArrowRight size={14} /> : <MdKeyboardArrowLeft size={14} />}
                </button>
              </div>
            )}

            {/* Top Spacer to push content below navbar */}
            <div className="h-20 sm:h-0"></div>

            {/* User Profile Section */}
            <div className={`${isCollapsed ? 'p-2' : 'p-3'} border-b border-slate-700/50 transition-all duration-300`}>
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                <div className="relative">
                  <img
                    src={user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${user?.firstName} ${user?.lastName}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-purple-500/30"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-xs truncate">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-slate-400 text-xs truncate capitalize">
                      {user?.accountType}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Links */}
            <div className={`flex-1 py-3 ${isCollapsed ? 'px-1' : 'px-2'} overflow-y-auto custom-scrollbar transition-all duration-300`}>
              <nav className="space-y-1">
                {sidebarLinks.map((link) => {
                  if (link.type && user?.accountType !== link.type) return null
                  return (
                    <SidebarLink key={link.id} link={link} iconName={link.icon} isCollapsed={isCollapsed} />
                  )
                })}
              </nav>

              {/* Divider */}
              <div className="my-3 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

              {/* Settings & Logout */}
              <div className="space-y-1">
                <SidebarLink
                  link={{ name: "Settings", path: "/dashboard/settings" }}
                  iconName={"VscSettingsGear"}
                  isCollapsed={isCollapsed}
                />

                <button
                  onClick={() =>
                    setConfirmationModal({
                      text1: "Are you sure?",
                      text2: "You will be logged out of your account.",
                      btn1Text: "Logout",
                      btn2Text: "Cancel",
                      btn1Handler: () => dispatch(logout(navigate)),
                      btn2Handler: () => setConfirmationModal(null),
                    })
                  }
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-1' : 'gap-2 px-3'} py-2 text-slate-300 hover:text-white hover:bg-red-500/10 rounded-lg transition-all duration-300 group`}
                  title={isCollapsed ? "Logout" : ""}
                >
                  <VscSignOut className="text-sm group-hover:text-red-400 transition-colors duration-300" />
                  {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
                </button>
              </div>
            </div>

            {/* Footer */}
            {!isCollapsed && (
              <div className="p-2 border-t border-slate-700/50">
                <div className="text-center">
                  <p className="text-xs text-slate-500">
                    © 2024 Beeja
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} closeModal={() => setConfirmationModal(null)} />}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
      `}</style>
    </>
  )
}
