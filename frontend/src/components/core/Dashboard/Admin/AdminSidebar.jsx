import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { FaUsers, FaBookOpen, FaChartBar, FaGraduationCap, FaQuestionCircle } from 'react-icons/fa';
import { MdSettings, MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import { VscSignOut } from "react-icons/vsc";
import { HiMenuAlt1 } from 'react-icons/hi';
import { IoMdClose } from 'react-icons/io';
import { useNavigate } from "react-router-dom";
import { toggleSidebarCollapse, setOpenSideMenu, setScreenSize } from '../../../../slices/sidebarSlice';
import { logout } from "../../../../services/operations/authAPI";
import ConfirmationModal from "../../../common/ConfirmationModal";

const AdminSidebar = ({ activeTab, onTabChange }) => {
  const { isCollapsed, openSideMenu, screenSize } = useSelector((state) => state.sidebar);
  const { user, loading: profileLoading } = useSelector((state) => state.profile);
  const { loading: authLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [confirmationModal, setConfirmationModal] = useState(null);

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'users', label: 'Users', icon: <FaUsers size={20} /> },
    { id: 'courses', label: 'Courses', icon: <FaBookOpen size={20} /> },
    { id: 'courseTypes', label: 'Course Types', icon: <FaGraduationCap size={20} /> },
    { id: 'quizzes', label: 'Quiz Management', icon: <FaQuestionCircle size={20} /> },
    { id: 'accessRequests', label: 'Access Requests', icon: <FaUsers size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <FaChartBar size={20} /> },
    { id: 'settings', label: 'Settings', icon: <MdSettings size={20} /> },
  ];

  useEffect(() => {
    const handleResize = () => dispatch(setScreenSize(window.innerWidth));
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  // If screen size is small then close the side bar
  useEffect(() => {
    if (screenSize <= 640) {
      dispatch(setOpenSideMenu(false));
    } else {
      dispatch(setOpenSideMenu(true));
    }
  }, [screenSize, dispatch]);

  if (profileLoading || authLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] min-w-[280px] items-center justify-center bg-slate-900/50 backdrop-blur-xl border-r border-slate-700/50">
        <div className="relative">
          <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="sm:hidden fixed top-24 left-4 z-50">
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
          
          <div className={`fixed sm:relative h-[calc(100vh-3.5rem)] ${
            isCollapsed ? 'w-[80px]' : 'w-[280px]'
          } flex flex-col bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 z-50 sm:z-10 transition-all duration-300`}>
            {/* Collapse/Expand Button - Desktop Only */}
            {screenSize > 640 && (
              <div className="absolute -right-3 top-32 z-[1001]">
                <button
                  onClick={() => dispatch(toggleSidebarCollapse())}
                  className="w-8 h-8 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-300 shadow-lg hover:scale-110"
                >
                  {isCollapsed ? <MdKeyboardArrowRight size={18} /> : <MdKeyboardArrowLeft size={18} />}
                </button>
              </div>
            )}

            {/* Top Spacer to push content below navbar */}
            <div className="h-32 sm:h-0"></div>

            {/* User Profile Section */}
            <div className={`${isCollapsed ? 'p-4' : 'p-6'} border-b border-slate-700/50 transition-all duration-300`}>
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'}`}>
                <div className="relative">
                  <img
                    src={user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${user?.firstName} ${user?.lastName}`}
                    alt="Profile"
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-purple-500/30"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-slate-400 text-xs truncate capitalize">
                      Admin
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Links */}
            <div className={`flex-1 py-6 ${isCollapsed ? 'px-2' : 'px-4'} overflow-y-auto custom-scrollbar transition-all duration-300`}>
              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'
                    } py-3 rounded-xl transition-all duration-300 group relative ${
                      activeTab === item.id
                        ? 'bg-purple-500/20 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                    title={isCollapsed ? item.label : ""}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </button>
                ))}
              </nav>

              {/* Divider */}
              <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

              {/* Logout */}
              <div className="space-y-2">
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
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 text-slate-300 hover:text-white hover:bg-red-500/10 rounded-xl transition-all duration-300 group`}
                  title={isCollapsed ? "Logout" : ""}
                >
                  <VscSignOut className="text-lg group-hover:text-red-400 transition-colors duration-300" />
                  {!isCollapsed && <span className="font-medium">Logout</span>}
                </button>
              </div>
            </div>

            {/* Footer */}
            {!isCollapsed && (
              <div className="p-4 border-t border-slate-700/50">
                <div className="text-center">
                  <p className="text-xs text-slate-500">
                    © 2024 Beeja Inovative ventures
                  </p>
                </div>
              </div>
            )}
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
  );
};

export default AdminSidebar;
