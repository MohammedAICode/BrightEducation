import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiFilter, FiEye, FiCalendar, FiMail } from 'react-icons/fi';
import axiosInstance from '../../lib/axios';
import UserDetailModal from '../common/UserDetailModal';
import CreateUserModal from '../common/CreateUserModal';
import UserAvatar from '../common/UserAvatar';

interface User {
  id: string;
  firstname: string;
  lastname: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  profileImg?: string;
  isActive?: string;
}

interface RoleData {
  id: string;
  userId: string;
  [key: string]: any;
}

const Management: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRoleData, setSelectedRoleData] = useState<RoleData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, searchQuery, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const statusParam = statusFilter ? `&isActive=${encodeURIComponent(statusFilter)}` : '';
      const response = await axiosInstance.get(`/user/all?page=${page}&limit=${limit}&role=MANAGEMENT${searchParam}${statusParam}`);
      const usersData = response.data.body?.users || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
      setTotalPages(response.data.body?.pagination?.totalPages || 1);
    } catch (err: any) {
      setError('Failed to fetch management');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await axiosInstance.get(`/user/${userId}`);
      setSelectedUser(response.data.body.user);
      setSelectedRoleData(response.data.body.roleData || null);
      setIsModalOpen(true);
    } catch (err: any) {
    }
  };

  const handleRowClick = (user: User) => {
    fetchUserDetails(user.id);
  };

  const handleDelete = () => {
    fetchUsers();
  };

  const handleUpdate = () => {
    fetchUsers();
  };

  const handleUserUpdated = (updatedUser: any) => {
    setSelectedUser(updatedUser);
    // Fetch role-specific data for the updated user
    if (updatedUser.id) {
      fetchUserDetails(updatedUser.id);
    }
  };

  const handleCreateSuccess = () => {
    fetchUsers();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Management</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Create Management
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:flex-1 relative">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-xs text-sm transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 hover:shadow-md transition-all text-sm flex items-center gap-2"
          >
            <FiSearch className="w-4 h-4" />
            Search
          </button>
        </form>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <FiFilter className="text-gray-400 w-4 h-4 hidden md:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48 px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-xs text-sm transition-all"
          >
            <option value="">All Status</option>
            <option value="CREATED">Created</option>
            <option value="ACTIVE">Active</option>
            <option value="RESET">Reset</option>
            <option value="DELETED">Deleted</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}
        {error && (
          <div className="text-red-600 p-6 text-center font-medium">{error}</div>
        )}
        {!loading && !error && (
          <div className="overflow-x-auto">
            {users.length === 0 ? (
              <div className="text-center py-12 text-gray-500 font-medium">No management found</div>
            ) : (
              <>
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/75">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Date of Birth
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        onClick={() => handleRowClick(user)}
                        className="hover:bg-blue-50/30 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              profileImg={user.profileImg}
                              alt={`${user.firstname} ${user.lastname}`}
                              size="md"
                            />
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {user.firstname} {user.lastname}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <FiMail className="w-3.5 h-3.5" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                          {user.gender?.toLowerCase() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <FiCalendar className="w-4 h-4 text-gray-400" />
                            {formatDate(user.dateOfBirth)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            switch (user.isActive) {
                              case 'CREATED':
                                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase">Created</span>;
                              case 'ACTIVE':
                                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700 border border-green-100 uppercase">Active</span>;
                              case 'RESET':
                                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-100 uppercase">Reset</span>;
                              case 'DELETED':
                                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-100 uppercase">Deleted</span>;
                              default:
                                return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-50 text-gray-700 border border-gray-100 uppercase">{user.isActive || 'N/A'}</span>;
                            }
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(user);
                            }}
                            className="p-1.5 text-blue-600 hover:text-blue-950 hover:bg-blue-50 rounded-lg transition-all inline-flex items-center gap-1"
                          >
                            <FiEye className="w-4.5 h-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-xs"
                    >
                      Previous
                    </button>
                    <span className="text-sm font-medium text-gray-600">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-xs"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <UserDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        roleData={selectedRoleData}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        onUserUpdated={handleUserUpdated}
      />
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        role="MANAGEMENT"
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default Management;
