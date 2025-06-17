import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { getAllUsers, createUser, updateUser, deleteUser, toggleUserStatus } from "../../../services/operations/adminAPI";
import { FaEdit, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { toast } from "react-hot-toast";

const UserManagement = () => {
  const { token } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
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
      setLoading(true);
      const users = await getAllUsers(token);
      if (mounted) {
        setUsers(users);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      if (mounted) {
        setError(err.message || 'Failed to fetch users');
        toast.error('Failed to fetch users');
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    let mounted = true;
    loadUsers(mounted);
    return () => {
      mounted = false;
    };
  }, [loadUsers]);

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
      toast.success("User created successfully");
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
        toast.success("User deleted successfully");
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
      toast.error(errorMessage);
      
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
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-lg font-semibold">User Management</h4>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-yellow-50 text-richblack-900 px-4 py-2 rounded-lg"
        >
          Add New User
        </button>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-richblack-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-richblack-800 p-6 rounded-lg w-96">
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
        <div className="fixed inset-0 bg-richblack-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-richblack-800 p-6 rounded-lg w-96">
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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-richblack-700">
                <th className="p-4 border border-richblack-600">Name</th>
                <th className="p-4 border border-richblack-600">Email</th>
                <th className="p-4 border border-richblack-600">Account Type</th>
                <th className="p-4 border border-richblack-600">Contact</th>
                <th className="p-4 border border-richblack-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-b border-richblack-600">
                    <td className="p-4">{user.firstName} {user.lastName}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.accountType}</td>
                    <td className="p-4">{user.additionalDetails?.contactNumber || 'N/A'}</td>
                    <td className="p-4 flex items-center">
                      <button
                        onClick={() => handleToggleUserStatus(user._id)}
                        className={`mr-4 ${user.active ? 'text-green-500' : 'text-gray-500'} hover:text-green-600`}
                        disabled={togglingUserId === user._id}
                        title={user.active ? 'Deactivate User' : 'Activate User'}
                      >
                        {togglingUserId === user._id ? (
                          <div className="w-5 h-5 animate-spin rounded-full border-b-2 border-green-500"/>
                        ) : (
                          user.active ? <FaEye size={20} /> : <FaEyeSlash size={20} />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-yellow-50 hover:text-yellow-100 mr-4"
                        title="Edit User"
                      >
                        <FaEdit size={20} />
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
                          <div className="w-5 h-5 animate-spin rounded-full border-b-2 border-red-500"/>
                        ) : (
                          <FaTrash size={20} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
