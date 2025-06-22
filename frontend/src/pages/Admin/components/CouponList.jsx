import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getAllCoupons, toggleCouponStatus } from '../../../services/operations/couponAPI';
import { toast } from 'react-hot-toast';
import CouponDetailsModal from '../../../components/common/CouponDetailsModal';
import { FiTag, FiCalendar, FiUsers, FiDollarSign, FiClock, FiEye } from 'react-icons/fi';

export default function CouponList() {
  const { token } = useSelector((state) => state.auth);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState({});
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await getAllCoupons(token);
      setCoupons(response);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (couponId) => {
    try {
      setToggleLoading(prev => ({ ...prev, [couponId]: true }));
      const updatedCoupon = await toggleCouponStatus(couponId, token);
      
      // Update the coupon in the local state
      setCoupons(prevCoupons => 
        prevCoupons.map(coupon => 
          coupon._id === couponId ? updatedCoupon : coupon
        )
      );
    } catch (error) {
      console.error('Error toggling coupon status:', error);
    } finally {
      setToggleLoading(prev => ({ ...prev, [couponId]: false }));
    }
  };

  const handleCouponClick = (coupon) => {
    setSelectedCoupon(coupon);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusInfo = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const expiryDate = new Date(coupon.expiryDate);

    if (!coupon.isActive) {
      return { 
        status: 'Inactive', 
        color: 'text-red-400', 
        bgColor: 'bg-red-900/20', 
        borderColor: 'border-red-500/30',
        icon: '⏸️'
      };
    }
    
    if (now < startDate) {
      return { 
        status: 'Upcoming', 
        color: 'text-yellow-400', 
        bgColor: 'bg-yellow-900/20', 
        borderColor: 'border-yellow-500/30',
        icon: '⏰'
      };
    }
    
    if (now > expiryDate) {
      return { 
        status: 'Expired', 
        color: 'text-red-400', 
        bgColor: 'bg-red-900/20', 
        borderColor: 'border-red-500/30',
        icon: '❌'
      };
    }
    
    return { 
      status: 'Active', 
      color: 'text-green-400', 
      bgColor: 'bg-green-900/20', 
      borderColor: 'border-green-500/30',
      icon: '✅'
    };
  };

  const getUsagePercentage = (coupon) => {
    if (coupon.usageLimit <= 0) return 0;
    return Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-50"></div>
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-richblack-700 rounded-2xl p-8 border border-richblack-600">
          <FiTag className="mx-auto text-6xl text-richblack-400 mb-4" />
          <p className="text-richblack-300 text-xl font-semibold mb-2">No coupons created yet</p>
          <p className="text-richblack-400 text-sm">Click "Create Coupon" to add your first coupon and start offering discounts</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6">
        {coupons.map((coupon) => {
          const statusInfo = getStatusInfo(coupon);
          const usagePercentage = getUsagePercentage(coupon);
          
          return (
            <div
              key={coupon._id}
              className="bg-gradient-to-r from-richblack-800 to-richblack-700 border border-richblack-600 rounded-2xl p-6 hover:shadow-lg hover:shadow-richblack-900/20 transition-all duration-300 hover:border-richblack-500"
            >
              {/* Header Section */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <FiTag className="text-yellow-50 text-xl" />
                    <h3 
                      className="text-2xl font-bold text-richblack-5 cursor-pointer hover:text-yellow-50 transition-colors flex items-center gap-2 group"
                      onClick={() => handleCouponClick(coupon)}
                    >
                      {coupon.code}
                      <FiEye className="text-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <span className={`px-3 py-1 text-sm rounded-full font-medium border ${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.borderColor} flex items-center gap-1`}>
                      <span>{statusInfo.icon}</span>
                      {statusInfo.status}
                    </span>
                    <span className="text-lg font-bold text-yellow-50 bg-yellow-900/20 px-3 py-1 rounded-full border border-yellow-500/30">
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discountValue}% OFF` 
                        : `₹${coupon.discountValue} OFF`}
                    </span>
                  </div>

                  <p className="text-xs text-richblack-400 cursor-pointer hover:text-richblack-300 transition-colors" onClick={() => handleCouponClick(coupon)}>
                    💡 Click coupon code to view detailed information
                  </p>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-richblack-400 mb-1">Usage</p>
                    <p className="text-lg font-bold text-richblack-200">
                      {coupon.usedCount}
                      {coupon.usageLimit > 0 && ` / ${coupon.usageLimit}`}
                    </p>
                    {coupon.usageLimit > 0 && (
                      <div className="w-20 bg-richblack-600 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${usagePercentage}%` }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Modern Toggle Switch */}
                  <div className="flex flex-col items-center gap-2">
                    <span className={`text-xs font-medium ${coupon.isActive ? 'text-green-400' : 'text-red-400'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(coupon._id)}
                      disabled={toggleLoading[coupon._id]}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-richblack-800 ${
                        coupon.isActive
                          ? 'bg-green-500 focus:ring-green-500'
                          : 'bg-richblack-600 focus:ring-richblack-500'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          coupon.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    {toggleLoading[coupon._id] && (
                      <div className="animate-spin rounded-full h-3 w-3 border border-richblack-400 border-t-transparent"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-richblack-700/50 p-4 rounded-xl border border-richblack-600/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FiCalendar className="text-blue-400" />
                    <p className="text-richblack-400 text-sm font-medium">Valid From</p>
                  </div>
                  <p className="text-richblack-200 font-semibold">{formatDate(coupon.startDate)}</p>
                </div>

                <div className="bg-richblack-700/50 p-4 rounded-xl border border-richblack-600/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FiClock className="text-red-400" />
                    <p className="text-richblack-400 text-sm font-medium">Valid Until</p>
                  </div>
                  <p className="text-richblack-200 font-semibold">{formatDate(coupon.expiryDate)}</p>
                </div>

                <div className="bg-richblack-700/50 p-4 rounded-xl border border-richblack-600/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FiDollarSign className="text-green-400" />
                    <p className="text-richblack-400 text-sm font-medium">Min. Order</p>
                  </div>
                  <p className="text-richblack-200 font-semibold">
                    {coupon.minimumOrderAmount > 0 ? `₹${coupon.minimumOrderAmount}` : 'No minimum'}
                  </p>
                </div>

                <div className="bg-richblack-700/50 p-4 rounded-xl border border-richblack-600/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FiUsers className="text-purple-400" />
                    <p className="text-richblack-400 text-sm font-medium">Per User Limit</p>
                  </div>
                  <p className="text-richblack-200 font-semibold">
                    {coupon.perUserLimit > 0 ? `${coupon.perUserLimit} uses` : 'Unlimited'}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              {(coupon.usageLimit > 0 || coupon.perUserLimit > 0) && (
                <div className="pt-4 border-t border-richblack-600/50">
                  <div className="flex items-center justify-between text-sm">
                    {coupon.usageLimit > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-richblack-400">Total Usage Progress:</span>
                        <span className="text-richblack-300 font-medium">
                          {usagePercentage.toFixed(1)}% ({coupon.usedCount}/{coupon.usageLimit})
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-richblack-400">Created:</span>
                      <span className="text-richblack-300">{formatDate(coupon.createdAt)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <CouponDetailsModal 
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        coupon={selectedCoupon}
      />
    </>
  );
}
