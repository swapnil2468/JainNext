import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Wholesale = ({ token }) => {
  const [wholesaleUsers, setWholesaleUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('new'); // new, approved, revoked, all
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [revokeConfirm, setRevokeConfirm] = useState(null);
  const [grantConfirm, setGrantConfirm] = useState(null);
  const [removeConfirm, setRemoveConfirm] = useState(null);
  const PAGE_SIZE = 10;

  const fetchWholesaleUsers = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/user/wholesale-users', {
        headers: { token }
      });

      if (response.data.success) {
        setWholesaleUsers(response.data.users);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchWholesaleUsers();
    }
  }, [token]);

  const handleApprove = async (userId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/user/update-wholesale-status',
        { userId, isApproved: true },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Wholesale account approved');
        fetchWholesaleUsers(); // Refresh list
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReject = async (userId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/user/update-wholesale-status',
        { userId, isApproved: false, isRevoked: true },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Wholesale access revoked');
        fetchWholesaleUsers(); // Refresh list
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleGrantAccess = async (userId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/user/update-wholesale-status',
        { userId, isApproved: true, isRevoked: false },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Wholesale access granted');
        fetchWholesaleUsers(); // Refresh list
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRemoveWholesaler = async (userId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/user/remove-wholesale-application',
        { userId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Wholesaler removed. They must reapply.');
        fetchWholesaleUsers(); // Refresh list
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRejectApplication = async (userId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/user/update-wholesale-status',
        { userId, isApproved: false, isRejected: true },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Application rejected');
        fetchWholesaleUsers(); // Refresh list
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filteredUsers = wholesaleUsers
    .filter(user => {
      if (filter === 'new') return !user.isApproved && !user.isRevoked && !user.isRejected;
      if (filter === 'approved') return user.isApproved && !user.isRevoked;
      if (filter === 'revoked') return user.isRevoked;
      if (filter === 'rejected') return user.isRejected;
      if (filter === 'all') return !user.isRevoked; // all shows approved + new, not revoked
      return true;
    })
    .filter(user => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.businessName.toLowerCase().includes(searchLower) ||
        user.gstNumber.includes(searchTerm)
      );
    });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const getTabCount = (filterType) => {
    if (filterType === 'all') return wholesaleUsers.filter(u => !u.isRevoked).length;
    if (filterType === 'new') return wholesaleUsers.filter(u => !u.isApproved && !u.isRevoked && !u.isRejected).length;
    if (filterType === 'approved') return wholesaleUsers.filter(u => u.isApproved && !u.isRevoked).length;
    if (filterType === 'revoked') return wholesaleUsers.filter(u => u.isRevoked).length;
    if (filterType === 'rejected') return wholesaleUsers.filter(u => u.isRejected).length;
    return 0;
  };

  if (loading) {
    return <div className='p-6'>Loading wholesale accounts...</div>;
  }

  return (
    <div className='w-full p-4 sm:p-10'>
      <div className='bg-white border border-gray-200 rounded-2xl overflow-hidden'>
        
        {/* Header */}
        <div className='flex justify-between items-start border-b border-gray-200 p-6'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-1 antialiased'>Wholesale Accounts</h1>
            <p className='text-gray-600 text-sm font-medium antialiased'>Efficiently manage and verify your B2B partner relationships.</p>
          </div>
          <button className='px-4 py-2 bg-red-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-all antialiased tracking-wide'>
            📮 Invite Partner
          </button>
        </div>

        {/* Tab Navigation */}
        <div className='flex flex-wrap border-b border-gray-200 gap-0 px-6'>
          {[
            { key: 'new', label: 'New' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' },
            { key: 'revoked', label: 'Revoked' },
            { key: 'all', label: 'All' }
          ].map(tab => {
            const count = getTabCount(tab.key);
            const isActive = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => { setFilter(tab.key); setCurrentPage(1); }}
                className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 antialiased ${
                  isActive 
                    ? 'text-red-600 border-red-600' 
                    : 'text-gray-500 border-transparent hover:text-red-600'
                }`}
              >
                {tab.label}
                {count > 0 && <span className={`ml-2 font-bold ${isActive ? 'text-red-600' : 'text-gray-500'}`}>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Search & Filters Bar */}
        <div className='flex justify-between items-center border-b border-gray-200 p-6 gap-4'>
          <div className='relative flex-1 max-w-sm'>
            <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900'>🔍</span>
            <input
              type="text"
              placeholder='Search accounts, GST, or business...'
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 text-sm'
            />
          </div>
          <div className='flex gap-2'>
            <button className='px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors antialiased'>
              🔽 Filter
            </button>
            <button className='px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors antialiased'>
              💾 Export
            </button>
          </div>
        </div>

        {/* Table */}
        {paginatedUsers.length === 0 ? (
          <div className='p-6 text-center text-gray-500'>
            <p className='text-sm font-medium antialiased'>No wholesale accounts found</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className='hidden md:grid grid-cols-[2fr_1.2fr_1.2fr_1.3fr_1.3fr] gap-4 items-center bg-gray-50 border-b border-gray-200 px-6 py-4'>
              <p className='font-semibold text-xs text-[#64748B] leading-4 tracking-wider antialiased'>NAME & CONTACT</p>
              <p className='font-semibold text-xs text-[#64748B] leading-4 tracking-wider antialiased'>BUSINESS ENTITY</p>
              <p className='font-semibold text-xs text-[#64748B] leading-4 tracking-wider antialiased'>GST DETAILS</p>
              <p className='font-semibold text-xs text-[#64748B] leading-4 tracking-wider antialiased'>STATUS</p>
              <p className='font-semibold text-xs text-[#64748B] leading-4 tracking-wider antialiased text-right pr-2'>ACTIONS</p>
            </div>

            {/* Table Rows */}
            {paginatedUsers.map((user) => (
              <div key={user._id} className='hidden md:grid grid-cols-[2fr_1.2fr_1.2fr_1.3fr_1.3fr] gap-4 items-center px-6 py-4 border-b border-gray-200 hover:bg-gray-50'>
                {/* Name & Contact */}
                <div>
                  <p className='font-bold text-gray-900 text-sm leading-5 antialiased'>{user.name}</p>
                  <p className='normal text-[#64748B] text-sm leading-5 antialiased'>{user.email}</p>
                  <p className='normal text-[#64748B] text-xs antialiased'>+91{user.businessPhone || 'N/A'}</p>
                </div>

                {/* Business Entity */}
                <p className='text-base font-medium text-[#334155] leading-5 antialiased'>{user.businessName}</p>

                {/* GST Details */}
                <p className='bg-[#E8ECEF] px-3 py-1 rounded-xl w-fit text-[14px] font-normal text-black leading-4 antialiased tracking-normal'>{user.gstNumber}</p>

                {/* Status */}
                {user.isRejected ? (
                  <span className='bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-semibold antialiased w-fit'>
                    ✗ Rejected
                  </span>
                ) : user.isRevoked ? (
                  <span className='bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-semibold antialiased w-fit'>
                    ✗ Revoked
                  </span>
                ) : user.isApproved ? (
                  <span className='bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold antialiased w-fit'>
                    ✓ Approved
                  </span>
                ) : (
                  <span className='bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold antialiased w-fit'>
                    ⏳ Pending Review
                  </span>
                )}

                {/* Actions */}
                {user.isRejected ? (
                  <div className='flex gap-12 items-center justify-end'>
                    <button
                      onClick={() => setSelectedUser(user)}
                      className='text-blue-600 hover:text-blue-800 font-bold text-sm transition-colors'
                      title='Review Application'
                    >
                      Review Docs
                    </button>
                  </div>
                ) : user.isRevoked ? (
                  <div className='flex gap-12 items-center justify-end'>
                    <button
                      onClick={() => setGrantConfirm(user)}
                      className='text-green-600 hover:text-green-800 font-bold text-sm transition-colors'
                      title='Grant Access'
                    >
                      Grant Access
                    </button>
                    <button
                      onClick={() => setRemoveConfirm(user)}
                      className='text-red-600 hover:text-red-800 font-bold text-sm transition-colors'
                      title='Remove Wholesaler'
                    >
                      Remove
                    </button>
                  </div>
                ) : user.isApproved ? (
                  <div className='flex gap-12 items-center justify-end'>
                    <button
                      onClick={() => setRevokeConfirm(user)}
                      className='text-red-600 hover:text-red-800 font-bold text-sm transition-colors'
                      title='Revoke Access'
                    >
                      Revoke
                    </button>
                    <button
                      onClick={() => setRemoveConfirm(user)}
                      className='text-red-600 hover:text-red-800 font-bold text-sm transition-colors'
                      title='Remove Wholesaler'
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className='flex gap-12 items-center justify-end'>
                    <button
                      onClick={() => setSelectedUser(user)}
                      className='text-red-600 hover:text-red-800 font-bold text-sm transition-colors'
                      title='Verify Docs'
                    >
                      Verify Docs
                    </button>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Pagination */}
        {filteredUsers.length > PAGE_SIZE && (
          <div className='flex justify-between items-center border-t border-gray-200 p-6'>
            <p className='text-sm text-gray-600 antialiased'>
              Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length} entries
            </p>
            <div className='flex gap-2 items-center'>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className='px-2 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 antialiased'
              >
                ←
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                if (totalPages <= 5) return i + 1;
                if (currentPage <= 3) return i + 1;
                if (currentPage >= totalPages - 2) return totalPages - 4 + i;
                return currentPage - 2 + i;
              }).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors antialiased ${
                    currentPage === page
                      ? 'bg-red-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className='text-gray-400'>...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className='px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 antialiased'
                  >
                    {totalPages}
                  </button>
                </>
              )}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className='px-2 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 antialiased'
              >
                →
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Info Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
        {/* Account Approval Process */}
        <div className='bg-red-50 border border-red-200 rounded-2xl p-6'>
          <div className='flex gap-3 mb-3'>
            <span className='text-2xl'>ℹ️</span>
            <h3 className='text-lg font-bold text-gray-900 antialiased'>Account Approval Process</h3>
          </div>
          <p className='text-sm text-gray-700 antialiased'>New accounts are placed in "Pending" status until their GST registration is manually verified by the operations team. Once approved, the partner can place bulk orders.</p>
        </div>

        {/* Wholesale Trends */}
        <div className='bg-blue-50 border border-blue-200 rounded-2xl p-6'>
          <div className='flex gap-3 mb-3'>
            <span className='text-2xl'>📈</span>
            <h3 className='text-lg font-bold text-gray-900 antialiased'>Wholesale Trends</h3>
          </div>
          <p className='text-sm text-gray-700 antialiased'>Partner registration has increased by 14% this quarter compared to last. Most new partners are from the Western region.</p>
        </div>
      </div>

      {/* Details Modal */}
      {selectedUser && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto'>
            {/* Modal Header */}
            <div className='flex justify-between items-center border-b border-gray-200 p-6 sticky top-0 bg-white'>
              <h2 className='text-2xl font-bold text-gray-900 antialiased'>Wholesale Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className='text-gray-400 hover:text-gray-600 text-2xl transition-colors'
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className='p-6 space-y-4'>
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <p className='text-xs font-semibold text-[#64748B] tracking-wider uppercase mb-1 antialiased'>Full Name</p>
                  <p className='text-sm font-medium text-gray-900 antialiased'>{selectedUser.name}</p>
                </div>
                <div>
                  <p className='text-xs font-semibold text-[#64748B] tracking-wider uppercase mb-1 antialiased'>Email</p>
                  <p className='text-sm font-medium text-gray-900 antialiased'>{selectedUser.email}</p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <p className='text-xs font-semibold text-[#64748B] tracking-wider uppercase mb-1 antialiased'>Business Name</p>
                  <p className='text-sm font-medium text-gray-900 antialiased'>{selectedUser.businessName}</p>
                </div>
                <div>
                  <p className='text-xs font-semibold text-[#64748B] tracking-wider uppercase mb-1 antialiased'>GST Number</p>
                  <p className='bg-[#E8ECEF] px-3 py-1.5 rounded-lg w-fit text-sm font-medium text-black antialiased'>{selectedUser.gstNumber}</p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <p className='text-xs font-semibold text-[#64748B] tracking-wider uppercase mb-1 antialiased'>Business Phone</p>
                  <p className='text-sm font-medium text-gray-900 antialiased'>+91{selectedUser.businessPhone || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-xs font-semibold text-[#64748B] tracking-wider uppercase mb-1 antialiased'>Address</p>
                  <p className='text-sm font-medium text-gray-900 antialiased'>{selectedUser.businessAddress || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className='text-xs font-semibold text-[#64748B] tracking-wider uppercase mb-1 antialiased'>Business Description</p>
                <p className='text-sm font-medium text-gray-900 antialiased'>{selectedUser.businessDescription || 'N/A'}</p>
              </div>

              <div>
                <p className='text-xs font-semibold text-[#64748B] tracking-wider uppercase mb-1 antialiased'>Status</p>
                {selectedUser.isRejected ? (
                  <span className='inline-block bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-semibold antialiased'>
                    ✗ Rejected
                  </span>
                ) : selectedUser.isRevoked ? (
                  <span className='inline-block bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-semibold antialiased'>
                    ✗ Revoked
                  </span>
                ) : selectedUser.isApproved ? (
                  <span className='inline-block bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold antialiased'>
                    ✓ Approved
                  </span>
                ) : (
                  <span className='inline-block bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold antialiased'>
                    ⏳ Pending Review
                  </span>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className='border-t border-gray-200 p-6 flex gap-3 sticky bottom-0 bg-white'>
              {!selectedUser.isApproved && !selectedUser.isRejected && (
                <button
                  onClick={() => {
                    handleApprove(selectedUser._id);
                    setSelectedUser(null);
                  }}
                  className='flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors antialiased'
                >
                  Approve Account
                </button>
              )}
              {!selectedUser.isRejected && !selectedUser.isApproved && (
                <button
                  onClick={() => {
                    handleRejectApplication(selectedUser._id);
                    setSelectedUser(null);
                  }}
                  className='flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors antialiased'
                >
                  Reject
                </button>
              )}
              <button
                onClick={() => setSelectedUser(null)}
                className='flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold transition-colors antialiased'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Confirmation Modal */}
      {revokeConfirm && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl max-w-md w-full shadow-2xl'>
            {/* Modal Header */}
            <div className='border-b border-gray-200 p-6 bg-gradient-to-r from-red-50 to-pink-50'>
              <div className='flex items-center gap-3 mb-2'>
                <span className='text-2xl'>⚠️</span>
                <h2 className='text-xl font-bold text-gray-900 antialiased'>Revoke Access</h2>
              </div>
              <p className='text-sm text-gray-600 antialiased ml-11'>This account will lose wholesale privileges immediately.</p>
            </div>

            {/* Modal Content */}
            <div className='p-6 bg-gray-50'>
              <div className='space-y-4'>
                <div className='bg-white p-4 rounded-xl border border-gray-200'>
                  <p className='text-xs font-semibold text-[#64748B] tracking-wider uppercase mb-2 antialiased'>Account Name</p>
                  <p className='text-sm font-semibold text-gray-900 antialiased'>{revokeConfirm.name}</p>
                </div>
                <div className='bg-white p-4 rounded-xl border border-gray-200'>
                  <p className='text-xs font-semibold text-[#64748B] tracking-wider uppercase mb-2 antialiased'>Business</p>
                  <p className='text-sm font-semibold text-gray-900 antialiased'>{revokeConfirm.businessName}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className='border-t border-gray-200 p-6 flex gap-3 bg-white'>
              <button
                onClick={() => {
                  handleReject(revokeConfirm._id);
                  setRevokeConfirm(null);
                }}
                className='flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors antialiased'
              >
                Revoke Access
              </button>
              <button
                onClick={() => setRevokeConfirm(null)}
                className='flex-1 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold transition-colors antialiased'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grant Access Confirmation Modal */}
      {grantConfirm && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl max-w-md w-full shadow-2xl'>
            {/* Modal Header */}
            <div className='border-b border-gray-200 p-6 bg-gradient-to-r from-green-50 to-emerald-50'>
              <div className='flex items-center gap-3 mb-2'>
                <span className='text-2xl'>✓</span>
                <h2 className='text-xl font-bold text-gray-900 antialiased'>Grant Access</h2>
              </div>
              <p className='text-sm text-gray-600 antialiased ml-11'>This account will regain wholesale privileges.</p>
            </div>

            {/* Modal Content */}
            <div className='p-6 bg-gray-50'>
              <div className='space-y-4'>
                <div className='bg-white p-4 rounded-xl border border-gray-200'>
                  <p className='text-xs font-semibold text-[#64748B] tracking-wider uppercase mb-2 antialiased'>Account Name</p>
                  <p className='text-sm font-semibold text-gray-900 antialiased'>{grantConfirm.name}</p>
                </div>
                <div className='bg-white p-4 rounded-xl border border-gray-200'>
                  <p className='text-xs font-semibold text-[#64748B] tracking-wider uppercase mb-2 antialiased'>Business</p>
                  <p className='text-sm font-semibold text-gray-900 antialiased'>{grantConfirm.businessName}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className='border-t border-gray-200 p-6 flex gap-3 bg-white'>
              <button
                onClick={() => {
                  handleGrantAccess(grantConfirm._id);
                  setGrantConfirm(null);
                }}
                className='flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors antialiased'
              >
                Grant Access
              </button>
              <button
                onClick={() => setGrantConfirm(null)}
                className='flex-1 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold transition-colors antialiased'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Wholesaler Confirmation Modal */}
      {removeConfirm && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl max-w-md w-full shadow-2xl'>
            {/* Modal Header */}
            <div className='border-b border-gray-200 p-6 bg-gradient-to-r from-orange-50 to-red-50'>
              <div className='flex items-center gap-3 mb-2'>
                <span className='text-2xl'>🗑️</span>
                <h2 className='text-xl font-bold text-gray-900 antialiased'>Remove Wholesaler</h2>
              </div>
              <p className='text-sm text-gray-600 antialiased ml-11'>They must reapply with correct details.</p>
            </div>

            {/* Modal Content */}
            <div className='p-6 bg-gray-50'>
              <div className='space-y-4'>
                <div className='bg-white p-4 rounded-xl border border-gray-200'>
                  <p className='text-xs font-semibold text-[#64748B] tracking-wider uppercase mb-2 antialiased'>Account Name</p>
                  <p className='text-sm font-semibold text-gray-900 antialiased'>{removeConfirm.name}</p>
                </div>
                <div className='bg-white p-4 rounded-xl border border-gray-200'>
                  <p className='text-xs font-semibold text-[#64748B] tracking-wider uppercase mb-2 antialiased'>Business</p>
                  <p className='text-sm font-semibold text-gray-900 antialiased'>{removeConfirm.businessName}</p>
                </div>
                <div className='bg-orange-50 border border-orange-200 rounded-xl p-3'>
                  <p className='text-xs text-orange-800 antialiased'>⚠️ This action cannot be undone. They will need to reapply with all details.</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className='border-t border-gray-200 p-6 flex gap-3 bg-white'>
              <button
                onClick={() => {
                  handleRemoveWholesaler(removeConfirm._id);
                  setRemoveConfirm(null);
                }}
                className='flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors antialiased'
              >
                Remove Wholesaler
              </button>
              <button
                onClick={() => setRemoveConfirm(null)}
                className='flex-1 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold transition-colors antialiased'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wholesale;
