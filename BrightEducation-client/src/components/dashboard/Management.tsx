import React, { useState, useEffect } from 'react';
import { FiPlus, FiCalendar, FiMail, FiEdit, FiTrash2 } from 'react-icons/fi';
import axiosInstance from '../../lib/axios';
import UserDetailModal from '../common/UserDetailModal';
import CreateUserModal from '../common/CreateUserModal';
import UserAvatar from '../common/UserAvatar';
import BulkManagementTable, { type Column, type Action } from '../common/BulkManagementTable';

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

  useEffect(() => {
    fetchUsers();
  }, [page, searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const response = await axiosInstance.get(`/user/all?page=${page}&limit=${limit}&role=MANAGEMENT${searchParam}`);
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

  const handleDeleteSelected = async (selectedIds: string[]) => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} management member(s)?`)) return;
    
    try {
      await Promise.all(selectedIds.map(id => axiosInstance.delete(`/user/${id}`)));
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to delete management:', err);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export functionality to be implemented');
  };

  const handleFilter = () => {
    // Keep existing filter logic
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const columns: Column<User>[] = [
    {
      key: 'member',
      label: 'Member',
      render: (user) => (
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
      ),
    },
    {
      key: 'gender',
      label: 'Gender',
      render: (user) => <span className="text-sm text-gray-600 capitalize">{user.gender?.toLowerCase() || 'N/A'}</span>,
    },
    {
      key: 'dateOfBirth',
      label: 'Date of Birth',
      render: (user) => (
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <FiCalendar className="w-4 h-4 text-gray-400" />
          {formatDate(user.dateOfBirth)}
        </div>
      ),
    },
  ];

  const rowActions: Action<User>[] = [
    {
      label: 'Edit',
      icon: <FiEdit className="w-4 h-4" />,
      onClick: (user) => handleRowClick(user),
    },
    {
      label: 'Delete',
      icon: <FiTrash2 className="w-4 h-4" />,
      onClick: (user) => {
        if (confirm(`Are you sure you want to delete ${user.firstname} ${user.lastname}?`)) {
          axiosInstance.delete(`/user/${user.id}`).then(() => fetchUsers());
        }
      },
      danger: true,
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Management</h1>
      </div>

      <BulkManagementTable
        data={users}
        columns={columns}
        rowKey="id"
        statusColumn={{
          key: 'isActive',
          getStatus: (value) => {
            switch (value) {
              case 'CREATED':
                return { label: 'Created', color: 'bg-blue-50 text-blue-700 border border-blue-100' };
              case 'ACTIVE':
                return { label: 'Active', color: 'bg-green-50 text-green-700 border border-green-100' };
              case 'RESET':
                return { label: 'Reset', color: 'bg-amber-50 text-amber-700 border border-amber-100' };
              case 'DELETED':
                return { label: 'Deleted', color: 'bg-red-50 text-red-700 border border-red-100' };
              default:
                return { label: value || 'N/A', color: 'bg-gray-50 text-gray-700 border border-gray-100' };
            }
          },
        }}
        rowActions={rowActions}
        onRowClick={handleRowClick}
        loading={loading}
        error={error}
        emptyMessage="No management found"
        primaryAction={{
          label: 'Create Management',
          icon: <FiPlus className="w-4 h-4" />,
          onClick: () => setIsCreateModalOpen(true),
        }}
        onDeleteSelected={handleDeleteSelected}
        onExport={handleExport}
        onFilter={handleFilter}
        searchPlaceholder="Search by name or email..."
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setPage(1);
          fetchUsers();
        }}
        pagination={{
          currentPage: page,
          totalPages: totalPages,
          onPageChange: setPage,
        }}
      />

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
