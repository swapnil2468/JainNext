
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'

const List = ({ token }) => {

  const navigate = useNavigate()
  const [list, setList] = useState([])

  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingRemoveId, setPendingRemoveId] = useState(null)

  const fetchList = async () => {
    try {

      const response = await axios.get(backendUrl + '/api/product/list', { headers: { token } })
      if (response.data.success) {
        setList(response.data.products.reverse());
      }
      else {
        toast.error(response.data.message)
      }

    } catch (error) {
      console.error('Error fetching product list:', error)
      toast.error(error.message)
    }
  }

  const handleRemoveClick = (id) => {
    setPendingRemoveId(id);
    setShowConfirm(true);
  };

  const removeProduct = async () => {
    if (!pendingRemoveId) return;
    try {
      const response = await axios.post(backendUrl + '/api/product/remove', { id: pendingRemoveId }, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList();
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error removing product:', error)
      toast.error(error.message)
    } finally {
      setShowConfirm(false);
      setPendingRemoveId(null);
    }
  };

  // Filter and sort products
  const filteredAndSortedList = list
    .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name)
      } else {
        return b.name.localeCompare(a.name)
      }
    })

  useEffect(() => {
    fetchList()
  }, [token])

  return (
    <>
      <p className='mb-2'>All Products List</p>
      
      {/* Search and Sort Controls */}
      <div className='flex flex-col sm:flex-row gap-4 mb-6 items-center'>
        <div className='w-full sm:w-1/3'>
          <input
            type="text"
            placeholder='Search products by name...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded'
          />
        </div>
        <div className='w-full sm:w-1/4'>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded'
          >
            <option value="asc">Sort: A to Z</option>
            <option value="desc">Sort: Z to A</option>
          </select>
        </div>
      </div>

      <div className='flex flex-col gap-2'>

        {/* ------- List Table Title ---------- */}

        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1.5fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Retail / Wholesale</b>
          <b>Stock</b>
          <b className='text-center'>Action</b>
        </div>

        {/* ------ Product List ------ */}

        {
          filteredAndSortedList.map((item, index) => (
            <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1.5fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
              <img className='w-12' src={item.image[0]} alt="" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <div>
                <p className='text-gray-800'>{currency}{item.retailPrice || item.price || '—'}</p>
                <p className='text-xs text-blue-600'>{item.wholesalePrice ? `${currency}${item.wholesalePrice} (W)` : <span className='text-gray-400'>No wholesale</span>}</p>
              </div>
              <p>{item.stock || 0}</p>
              <div className='flex gap-2 justify-end md:justify-center'>
                <button 
                  onClick={() => navigate(`/edit/${item._id}`)}
                  className='px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs'
                >
                  Edit
                </button>
                <p 
                  onClick={() => handleRemoveClick(item._id)}
                  className='px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer text-center text-xs'
                >
                  Remove
                </p>
              </div>
            </div>
          ))
        }

        {filteredAndSortedList.length === 0 && (
          <p className='text-center py-4 text-gray-500'>No products found</p>
        )}

      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => { setShowConfirm(false); setPendingRemoveId(null); }}
        onConfirm={removeProduct}
        title='Remove Product'
        message='This will permanently delete the product from your catalogue. This action cannot be undone.'
        confirmLabel='Yes, Remove'
        confirmClassName='bg-red-600 hover:bg-red-700 text-white'
      />
    </>
  )
}

export default List