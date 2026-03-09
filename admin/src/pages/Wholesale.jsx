import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Wholesale = ({ token }) => {
  const [wholesaleUsers, setWholesaleUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved

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
      console.error('Error fetching wholesale users:', error);
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
      console.error('Error approving wholesale:', error);
      toast.error(error.message);
    }
  };

  const handleReject = async (userId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/user/update-wholesale-status',
        { userId, isApproved: false },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Wholesale account rejected');
        fetchWholesaleUsers(); // Refresh list
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error rejecting wholesale:', error);
      toast.error(error.message);
    }
  };

  const filteredUsers = wholesaleUsers.filter(user => {
    if (filter === 'pending') return !user.isApproved;
    if (filter === 'approved') return user.isApproved;
    return true;
  });

  if (loading) {
    return <div className='p-6'>Loading wholesale users...</div>;
  }

  return (
    <div className='p-4 sm:p-10 w-full'>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold mb-4'>Wholesale Account Management</h2>
        
        {/* Filter Tabs */}
        <div className='flex gap-2 mb-6'>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All ({wholesaleUsers.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}
          >
            Pending ({wholesaleUsers.filter(u => !u.isApproved).length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Approved ({wholesaleUsers.filter(u => u.isApproved).length})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className='overflow-x-auto'>
        <table className='w-full border'>
          <thead>
            <tr className='bg-gray-100 border-b'>
              <th className='p-3 text-left'>Name</th>
              <th className='p-3 text-left'>Email</th>
              <th className='p-3 text-left'>Business Name</th>
              <th className='p-3 text-left'>GST Number</th>
              <th className='p-3 text-left'>Phone</th>
              <th className='p-3 text-left'>Status</th>
              <th className='p-3 text-left'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan='7' className='p-6 text-center text-gray-500'>
                  No wholesale users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id} className='border-b hover:bg-gray-50'>
                  <td className='p-3'>{user.name}</td>
                  <td className='p-3'>{user.email}</td>
                  <td className='p-3'>{user.businessName}</td>
                  <td className='p-3'>{user.gstNumber}</td>
                  <td className='p-3'>{user.businessPhone}</td>
                  <td className='p-3'>
                    {user.isApproved ? (
                      <span className='bg-green-100 text-green-700 px-2 py-1 rounded text-sm'>
                        Approved
                      </span>
                    ) : (
                      <span className='bg-orange-100 text-orange-700 px-2 py-1 rounded text-sm'>
                        Pending
                      </span>
                    )}
                  </td>
                  <td className='p-3'>
                    {!user.isApproved ? (
                      <button
                        onClick={() => handleApprove(user._id)}
                        className='bg-green-600 text-white px-4 py-1 rounded text-sm mr-2 hover:bg-green-700'
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReject(user._id)}
                        className='bg-red-600 text-white px-4 py-1 rounded text-sm hover:bg-red-700'
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Business Address Details */}
      {filteredUsers.length > 0 && (
        <div className='mt-8'>
          <h3 className='text-lg font-semibold mb-4'>Business Addresses</h3>
          <div className='grid gap-4'>
            {filteredUsers.map((user) => (
              <div key={user._id} className='border p-4 rounded bg-gray-50'>
                <p className='font-semibold text-gray-800'>{user.businessName}</p>
                <p className='text-sm text-gray-600 mt-1'>{user.businessAddress}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wholesale;
