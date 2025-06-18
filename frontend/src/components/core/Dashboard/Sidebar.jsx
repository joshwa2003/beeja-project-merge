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

import { setOpenSideMenu, setScreenSize } from "../../../slices/sidebarSlice";

export default function Sidebar() {
  const { user, loading: profileLoading } = useSelector((state) => state.profile)
  const { loading: authLoading } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // to keep track of confirmation modal
  const [confirmationModal, setConfirmationModal] = useState(null)

  const { openSideMenu, screenSize } = useSelector((state) => state.sidebar)

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
      <div className="flex h-[calc(100vh-3.5rem)] min-w-[280px] items-center justify-center bg-slate-900/50 backdrop-blur-xl border-r border-slate-700/50">
        <div className="relative">
          <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="sm:hidden fixed top-4 left-4 z-50">
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 sm:hidden"
              onClick={() => dispatch(setOpenSideMenu(false))}
            />
          )}
          
          <div className="fixed sm:relative h-[calc(100vh-3.5rem)] w-[280px] flex flex-col bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 z-50 sm:z-auto">
            {/* User Profile Section */}
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${user?.firstName} ${user?.lastName}`}
                    alt="Profile"
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-purple-500/30"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-slate-400 text-xs truncate capitalize">
                    {user?.accountType}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 py-6 px-4 overflow-y-auto custom-scrollbar">
              <nav className="space-y-2">
                {sidebarLinks.map((link) => {
                  if (link.type && user?.accountType !== link.type) return null
                  return (
                    <SidebarLink key={link.id} link={link} iconName={link.icon} />
                  )
                })}
              </nav>

              {/* Divider */}
              <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

              {/* Settings & Logout */}
              <div className="space-y-2">
                <SidebarLink
                  link={{ name: "Settings", path: "/dashboard/settings" }}
                  iconName={"VscSettingsGear"}
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
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-red-500/10 rounded-xl transition-all duration-300 group"
                >
                  <VscSignOut className="text-lg group-hover:text-red-400 transition-colors duration-300" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700/50">
              <div className="text-center">
                <p className="text-xs text-slate-500">
                  © 2024 Beeja Inovative ventures
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} closeModal={() => setConfirmationModal(null)} />}

      <style jsx>{`
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
