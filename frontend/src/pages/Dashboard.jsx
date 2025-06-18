import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Outlet } from "react-router-dom"
import Sidebar from '../components/core/Dashboard/Sidebar'
import Loading from '../components/common/Loading'

const Dashboard = () => {

    const { loading: authLoading } = useSelector((state) => state.auth);
    const { loading: profileLoading } = useSelector((state) => state.profile);


    if (profileLoading || authLoading) {
        return (
            <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-400 rounded-full animate-spin animation-delay-150"></div>
                </div>
            </div>
        )
    }
    // Scroll to the top of the page when the component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])

    return (
        <div className='relative flex min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <Sidebar />

            <div className='h-[calc(100vh-3.5rem)] overflow-auto w-full custom-scrollbar relative z-10'>
                <div className='mx-auto w-11/12 max-w-[1400px] py-8 px-6'>
                    <div className="animate-fade-in-up">
                        <Outlet />
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .animation-delay-150 {
                    animation-delay: 150ms;
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.6s ease-out;
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(15, 23, 42, 0.3);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #8b5cf6, #3b82f6);
                    border-radius: 10px;
                    border: 2px solid rgba(15, 23, 42, 0.3);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, #7c3aed, #2563eb);
                }
            `}</style>
        </div>
    )
}

export default Dashboard
