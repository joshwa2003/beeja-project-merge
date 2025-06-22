import { useState } from 'react';
import CouponForm from './components/CouponForm';
import CouponList from './components/CouponList';

export default function Coupons() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateCoupon = () => {
    setShowCreateForm(true);
  };

  const handleBackToList = () => {
    setShowCreateForm(false);
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-medium text-richblack-5">
          Coupon Management
        </h1>
        {!showCreateForm && (
          <button
            onClick={handleCreateCoupon}
            className="bg-yellow-50 text-richblack-900 px-6 py-3 rounded-md font-medium hover:scale-95 transition-all duration-200"
          >
            Create Coupon
          </button>
        )}
      </div>

      {showCreateForm ? (
        <div className="flex flex-col gap-6 bg-richblack-800 p-6 rounded-lg border-[1px] border-richblack-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-richblack-5">
              Create New Coupon
            </h2>
            <button
              onClick={handleBackToList}
              className="text-richblack-300 hover:text-richblack-100 transition-colors"
            >
              ← Back to List
            </button>
          </div>
          <CouponForm onSuccess={handleBackToList} />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <CouponList />
        </div>
      )}
    </div>
  );
}
