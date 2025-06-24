import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { getAllUsers, createUser, updateUser, deleteUser, toggleUserStatus } from "../../../services/operations/adminAPI";
import { FaEdit, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { toast } from "react-hot-toast";

const UserManagement = () => {
  const { token } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [togglingUserId, setTogglingUserId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    accountType: "Student",
    contactNumber: ""
  });

  const loadUsers = useCallback(async (mounted = true) => {
    try {
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      setLoading(true);
      console.log("Loading users with token:", token);
      
      const response = await getAllUsers(token);
      console.log("Users response:", response);
      
      if (mounted) {
        setUsers(response || []);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching users:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (mounted) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch users';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    let mounted = true;
    
    // Import and use debug utilities
    import('../../../utils/apiDebugger').then(({ debugAPIIssues, testAdminAPI }) => {
      debugAPIIssues();
      if (token) {
        testAdminAPI(token).catch(console.error);
      }
    });

    if (!token) {
      console.error("No token available in Redux state");
      setError("Authentication required");
      return;
    }

    // Log token details
    console.log('Token details:', {
      exists: !!token,
      length: token?.length,
      preview: token ? `${token.substring(0, 20)}...` : 'none',
      fromLocalStorage: !!localStorage.getItem('token')
    });

    loadUsers(mounted);
    return () => {
      mounted = false;
    };
  }, [loadUsers, token]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const result = await createUser(formData, token);
      setShowCreateModal(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        accountType: "Student",
        contactNumber: ""
      });
      await loadUsers(true); // Refresh user list
      
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const result = await updateUser(selectedUser._id, formData, token);
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        accountType: "Student",
        contactNumber: ""
      });
      await loadUsers(true); // Refresh user list
      toast.success("User updated successfully");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!token) {
      toast.error("Authentication token is missing");
      return;
    }

    try {
      setDeletingUserId(userId);
      setError(null);

      // Log deletion attempt
      console.log('Attempting to delete user:', {
        userId,
        tokenExists: !!token
      });
      
      const result = await deleteUser(userId, token);
      
      if (result) {
        setConfirmationModal(null);
        await loadUsers(true);
      }
      
    } catch (error) {
      console.error('Delete operation failed:', {
        error: error.message,
        userId,
        response: error.response?.data
      });
      
      // Show specific error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user';
      setError(errorMessage);
      setConfirmationModal(null);
      
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    if (!token) {
      toast.error("Authentication token is missing");
      return;
    }
    try {
      setTogglingUserId(userId);
      await toggleUserStatus(userId, token);
      await loadUsers(true);
    } catch (error) {
      console.error('Toggle user status failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      accountType: user.accountType,
      contactNumber: user.additionalDetails?.contactNumber || ""
    });
    setShowEditModal(true);
  };

  return (
    <div className="text-richblack-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h4 className="text-lg font-semibold">User Management</h4>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-yellow-50 text-richblack-900 px-3 py-2 rounded-lg text-sm w-full sm:w-auto"
        >
          Add New User
        </button>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-richblack-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-richblack-800 p-4 sm:p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Create New User</h3>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                  required
                />
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                  required
                >
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor</option>
                  <option value="Admin">Admin</option>
                </select>
                <input
                  type="tel"
                  placeholder="Contact Number"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-richblack-700 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-yellow-50 text-richblack-900 px-4 py-2 rounded-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-richblack-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-richblack-800 p-4 sm:p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Edit User</h3>
            <form onSubmit={handleUpdateUser}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                  required
                />
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                  required
                >
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor</option>
                  <option value="Admin">Admin</option>
                </select>
                <input
                  type="tel"
                  placeholder="Contact Number"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-richblack-700 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-yellow-50 text-richblack-900 px-4 py-2 rounded-lg"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && <p>Loading users...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-richblack-700">
                  <th className="p-3 border border-richblack-600">Name</th>
                  <th className="p-3 border border-richblack-600">Email</th>
                  <th className="p-3 border border-richblack-600">Type</th>
                  <th className="p-3 border border-richblack-600">Contact</th>
                  <th className="p-3 border border-richblack-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-3 text-center">No users found.</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="border-b border-richblack-600 hover:bg-richblack-700/50">
                      <td className="p-3">{user.firstName} {user.lastName}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.accountType === 'Admin' ? 'bg-red-500/20 text-red-400' :
                          user.accountType === 'Instructor' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {user.accountType}
                        </span>
                      </td>
                      <td className="p-3">{user.additionalDetails?.contactNumber || 'N/A'}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleUserStatus(user._id)}
                            className={`${user.active ? 'text-green-500' : 'text-gray-500'} hover:text-green-600`}
                            disabled={togglingUserId === user._id}
                            title={user.active ? 'Deactivate User' : 'Activate User'}
                          >
                            {togglingUserId === user._id ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-green-500"/>
                            ) : (
                              user.active ? <FaEye size={16} /> : <FaEyeSlash size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditClick(user)}
                            className="text-yellow-50 hover:text-yellow-100"
                            title="Edit User"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmationModal({
                                text1: "Delete User?",
                                text2: "This action cannot be undone. The user will be permanently deleted.",
                                btn1Text: "Delete",
                                btn2Text: "Cancel",
                                btn1Handler: () => handleDeleteUser(user._id),
                                btn2Handler: () => setConfirmationModal(null),
                              })
                            }}
                            disabled={deletingUserId === user._id}
                            className={`text-red-500 hover:text-red-600 ${
                              deletingUserId === user._id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title="Delete User"
                          >
                            {deletingUserId === user._id ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-red-500"/>
                            ) : (
                              <FaTrash size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {users.length === 0 ? (
              <div className="text-center p-6 bg-richblack-700 rounded-lg">
                <p>No users found.</p>
              </div>
            ) : (
              users.map((user) => (
                <div key={user._id} className="bg-richblack-700 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-semibold text-white">{user.firstName} {user.lastName}</h5>
                      <p className="text-sm text-richblack-300">{user.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.accountType === 'Admin' ? 'bg-red-500/20 text-red-400' :
                      user.accountType === 'Instructor' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {user.accountType}
                    </span>
                  </div>
                  
                  <div className="text-sm text-richblack-300">
                    <p><span className="font-medium">Contact:</span> {user.additionalDetails?.contactNumber || 'N/A'}</p>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-2 border-t border-richblack-600">
                    <button
                      onClick={() => handleToggleUserStatus(user._id)}
                      className={`p-2 rounded ${user.active ? 'text-green-500' : 'text-gray-500'} hover:bg-richblack-600`}
                      disabled={togglingUserId === user._id}
                      title={user.active ? 'Deactivate User' : 'Activate User'}
                    >
                      {togglingUserId === user._id ? (
                        <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-green-500"/>
                      ) : (
                        user.active ? <FaEye size={16} /> : <FaEyeSlash size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => handleEditClick(user)}
                      className="p-2 rounded text-yellow-50 hover:bg-richblack-600"
                      title="Edit User"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setConfirmationModal({
                          text1: "Delete User?",
                          text2: "This action cannot be undone. The user will be permanently deleted.",
                          btn1Text: "Delete",
                          btn2Text: "Cancel",
                          btn1Handler: () => handleDeleteUser(user._id),
                          btn2Handler: () => setConfirmationModal(null),
                        })
                      }}
                      disabled={deletingUserId === user._id}
                      className={`p-2 rounded text-red-500 hover:bg-richblack-600 ${
                        deletingUserId === user._id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Delete User"
                    >
                      {deletingUserId === user._id ? (
                        <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-red-500"/>
                      ) : (
                        <FaTrash size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {confirmationModal && (
        <ConfirmationModal
          modalData={confirmationModal}
          closeModal={() => setConfirmationModal(null)}
        />
      )}
    </div>
  );
};

export default UserManagement;
