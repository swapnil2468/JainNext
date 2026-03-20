
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
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [statusFilter, setStatusFilter] = useState('Status: All')
  const [stockFilter, setStockFilter] = useState('Stock: High to Low')
  const [currentPage, setCurrentPage] = useState(1)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingRemoveId, setPendingRemoveId] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState(new Set())
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusToUpdate, setStatusToUpdate] = useState('active')
  const [showSelectedPanel, setShowSelectedPanel] = useState(false)
  const [quickFilter, setQuickFilter] = useState(null) // 'active', 'lowStock', 'outOfStock', or null
  const itemsPerPage = 10

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

  const handleSelectProduct = (productId) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedProducts.size === paginatedList.length && paginatedList.length > 0) {
      setSelectedProducts(new Set())
    } else {
      const allIds = new Set(paginatedList.map(item => item._id))
      setSelectedProducts(allIds)
    }
  }

  // Get selected product details
  const selectedProductDetails = list.filter(item => selectedProducts.has(item._id))

  const updateProductStatus = async () => {
    if (selectedProducts.size === 0) {
      toast.error('Please select products first')
      return
    }

    try {
      const response = await axios.post(
        backendUrl + '/api/product/updateStatus',
        {
          productIds: Array.from(selectedProducts),
          status: statusToUpdate
        },
        { headers: { token } }
      )
      
      if (response.data.success) {
        toast.success(response.data.message)
        setShowStatusModal(false)
        setSelectedProducts(new Set())
        await fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error(error.message)
    }
  }

  // Get unique categories
  const categories = ['All Categories', ...new Set(list.map(item => item.category))]

  // Filter products
  let filteredList = list.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'All Categories' || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Apply quick filter from stats cards
  if (quickFilter === 'active') {
    filteredList = filteredList.filter(item => (item.status === 'active' || !item.status) && item.stock && item.stock > 0)
  } else if (quickFilter === 'lowStock') {
    filteredList = filteredList.filter(item => (item.status === 'active' || !item.status) && item.stock && item.stock > 0 && item.stock <= 10)
  } else if (quickFilter === 'outOfStock') {
    filteredList = filteredList.filter(item => !item.stock || item.stock === 0)
  }

  // Sort products
  const sortedList = [...filteredList].sort((a, b) => {
    if (stockFilter === 'Stock: High to Low') {
      return (b.stock || 0) - (a.stock || 0)
    } else {
      return (a.stock || 0) - (b.stock || 0)
    }
  })

  // Paginate
  const totalPages = Math.ceil(sortedList.length / itemsPerPage)
  const paginatedList = sortedList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Calculate stats
  const totalItems = list.length
  const activeItems = list.filter(item => (item.status === 'active' || !item.status) && item.stock && item.stock > 0).length
  const lowStockItems = list.filter(item => (item.status === 'active' || !item.status) && item.stock && item.stock > 0 && item.stock <= 10).length
  const outOfStockItems = list.filter(item => !item.stock || item.stock === 0).length

  useEffect(() => {
    fetchList()
  }, [token])

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when quick filter changes
  }, [quickFilter])

  return (
    <div className='w-full'>
      {/* Header */}
      <div className='flex justify-between items-start mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800 mb-1'>Product Catalog</h1>
          <p className='text-gray-500 text-sm'>Manage your inventory, pricing, and product visibility.</p>
        </div>
        <button 
          onClick={() => navigate('/add')}
          className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2'
        >
          + Add New Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <button onClick={() => setQuickFilter(null)} className={`text-left border rounded-2xl p-5 transition ${quickFilter === null ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0'>📦</div>
            <div>
              <p className='text-gray-600 text-xs font-medium mb-1'>TOTAL ITEMS</p>
              <p className='text-2xl font-bold text-gray-800'>{totalItems}</p>
            </div>
          </div>
        </button>

        <button onClick={() => setQuickFilter('active')} className={`text-left border rounded-2xl p-5 transition ${quickFilter === 'active' ? 'bg-green-50 border-green-400' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0'>✓</div>
            <div>
              <p className='text-gray-600 text-xs font-medium mb-1'>ACTIVE</p>
              <p className='text-2xl font-bold text-gray-800'>{activeItems}</p>
            </div>
          </div>
        </button>

        <button onClick={() => setQuickFilter('lowStock')} className={`text-left border rounded-2xl p-5 transition ${quickFilter === 'lowStock' ? 'bg-orange-50 border-orange-400' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0'>⚠️</div>
            <div>
              <p className='text-gray-600 text-xs font-medium mb-1'>LOW STOCK</p>
              <p className='text-2xl font-bold text-gray-800'>{lowStockItems}</p>
            </div>
          </div>
        </button>

        <button onClick={() => setQuickFilter('outOfStock')} className={`text-left border rounded-2xl p-5 transition ${quickFilter === 'outOfStock' ? 'bg-red-50 border-red-400' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0'>✕</div>
            <div>
              <p className='text-gray-600 text-xs font-medium mb-1'>OUT OF STOCK</p>
              <p className='text-2xl font-bold text-gray-800'>{outOfStockItems}</p>
            </div>
          </div>
        </button>
      </div>

      {/* Search and Filters */}
      <div className='bg-white border border-gray-200 rounded-2xl p-5 mb-6'>
        {/* First Row - Search and Dropdowns */}
        <div className='flex flex-col md:flex-row gap-3 mb-4 items-center'>
          <div className='flex-1 relative'>
            <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>🔍</span>
            <input
              type="text"
              placeholder='Search by product name, SKU or category...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 text-sm'
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 text-sm bg-white cursor-pointer'
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 text-sm bg-white cursor-pointer'
          >
            <option value="Status: All">Status: All</option>
            <option value="Status: Active">Status: Active</option>
            <option value="Status: Draft">Status: Draft</option>
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 text-sm bg-white cursor-pointer'
          >
            <option value="Stock: High to Low">Stock: High to Low</option>
            <option value="Stock: Low to High">Stock: Low to High</option>
          </select>
        </div>

        {/* Quick Filter Indicator */}
        {quickFilter && (
          <div className='mb-4 p-3 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-between'>
            <p className='text-sm text-gray-700'>
              <span className='font-semibold'>Active Filter:</span> Showing {
                quickFilter === 'active' ? 'Active Products' : 
                quickFilter === 'lowStock' ? 'Low Stock Products' : 
                'Out of Stock Products'
              }
            </p>
            <button
              onClick={() => setQuickFilter(null)}
              className='text-red-600 hover:text-red-800 font-medium text-sm'
            >
              ✕ Clear
            </button>
          </div>
        )}

        {/* Second Row - Action Buttons and Showing Info */}
        <div className='flex flex-col sm:flex-row gap-2 items-center justify-between'>
          <div className='flex flex-wrap gap-2'>
            <button 
              onClick={handleSelectAll}
              className='px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-xs'
            >
              {selectedProducts.size === paginatedList.length && paginatedList.length > 0 ? '☑️' : '☐'} Select All Visible
            </button>
            <button className='px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-xs'>
              🗑️ Bulk Delete
            </button>
            <button 
              onClick={() => setShowStatusModal(true)}
              disabled={selectedProducts.size === 0}
              className={`px-3 py-2 border border-gray-300 rounded-lg font-medium text-xs ${
                selectedProducts.size === 0 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-50 cursor-pointer'
              }`}
            >
              ✏️ Update Status
            </button>
            <button className='px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-xs'>
              ⬇️ Export CSV
            </button>
            <button
              onClick={() => setShowSelectedPanel(!showSelectedPanel)}
              className={`px-3 py-2 border border-gray-300 rounded-lg font-medium text-xs ${
                selectedProducts.size > 0
                  ? 'text-red-600 border-red-300 bg-red-50 hover:bg-red-100'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              📋 Selected ({selectedProducts.size})
            </button>
          </div>
          <p className='text-gray-400 text-xs font-medium'>
            SHOWING {Math.max(1, (currentPage - 1) * itemsPerPage + 1)} TO {Math.min(currentPage * itemsPerPage, sortedList.length)} OF {sortedList.length} PRODUCTS
          </p>
        </div>
      </div>

      {/* Selected Products Panel */}
      {showSelectedPanel && selectedProducts.size > 0 && (
        <div className='bg-red-50 border border-red-200 rounded-2xl p-5 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-red-900'>Selected Products ({selectedProducts.size})</h3>
            <button
              onClick={() => setShowSelectedPanel(false)}
              className='text-red-600 hover:text-red-800 text-xl'
            >
              ✕
            </button>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto'>
            {selectedProductDetails.map((product) => (
              <div key={product._id} className='bg-white border border-red-200 rounded-xl p-3 flex items-start gap-3'>
                <img src={product.image[0]} alt={product.name} className='w-12 h-12 rounded object-cover flex-shrink-0' />
                <div className='flex-1'>
                  <p className='font-medium text-gray-800 text-sm'>{product.name}</p>
                  <p className='text-xs text-gray-500 mb-2'>{product.category}</p>
                  <button
                    onClick={() => handleSelectProduct(product._id)}
                    className='text-xs text-red-600 hover:text-red-800 font-medium'
                  >
                    ✕ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className='mt-4 pt-4 border-t border-red-200 flex gap-2'>
            <button
              onClick={() => setSelectedProducts(new Set())}
              className='flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm'
            >
              Clear All Selection
            </button>
            <button
              onClick={() => setShowStatusModal(true)}
              className='flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm'
            >
              Update Status for All
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className='bg-white border border-gray-200 rounded-2xl overflow-hidden'>
        {/* Table Header */}
        <div className='hidden md:grid grid-cols-[60px_2fr_1.5fr_1.5fr_1.2fr_1.2fr_0.8fr] gap-4 items-center bg-gray-50 border-b border-gray-200 px-6 py-3'>
          <input 
            type="checkbox" 
            checked={selectedProducts.size === paginatedList.length && paginatedList.length > 0}
            onChange={handleSelectAll}
            className='w-5 h-5 cursor-pointer' 
          />
          <p className='font-semibold text-gray-700 text-xs'>PRODUCT</p>
          <p className='font-semibold text-gray-700 text-xs'>CATEGORY</p>
          <p className='font-semibold text-gray-700 text-xs'>PRICING</p>
          <p className='font-semibold text-gray-700 text-xs'>INVENTORY</p>
          <p className='font-semibold text-gray-700 text-xs'>STATUS</p>
          <p className='font-semibold text-gray-700 text-xs'>ACTIONS</p>
        </div>

        {/* Table Rows */}
        {paginatedList.map((item, index) => (
          <div 
            key={index}
            className='hidden md:grid grid-cols-[60px_2fr_1.5fr_1.5fr_1.2fr_1.2fr_0.8fr] gap-4 items-center px-6 py-3 border-b border-gray-200 hover:bg-gray-50'
          >
            <input 
              type="checkbox" 
              checked={selectedProducts.has(item._id)}
              onChange={() => handleSelectProduct(item._id)}
              className='w-5 h-5 cursor-pointer' 
            />
            
            <div className='flex items-center gap-3 min-w-0'>
              <img src={item.image[0]} alt={item.name} className='w-12 h-12 rounded object-cover flex-shrink-0' />
              <div className='overflow-hidden min-w-0'>
                <p className='font-medium text-gray-800 text-sm'>{item.name}</p>
                <p className='text-xs text-gray-500'>{item._id?.substring(0, 8)}</p>
              </div>
            </div>

            <p className='text-gray-700 text-sm'>{item.category}</p>

            <div>
              <p className='text-base'>
                <span className='font-semibold text-red-600'>{currency}{item.retailPrice || item.price || '—'}</span>
                <span className='text-gray-400 text-xs ml-2'>(Retail)</span>
              </p>
              <p className='text-xs text-gray-500'>
                <span>{currency}{item.wholesalePrice || '—'}</span>
                <span className='text-gray-400 ml-2'>(Wholesale)</span>
              </p>
            </div>

            <div>
              <p className='font-semibold text-gray-800 text-sm mb-1'>
                {item.stock && item.stock > 0 ? `${item.stock} units` : <span className='text-red-600'>0 units</span>}
              </p>
              {/* Status Indicator Bar */}
              {item.stock > 10 ? (
                <div className='w-12 h-1.5 bg-green-500 rounded-full'></div>
              ) : item.stock > 0 && item.stock <= 10 ? (
                <div className='w-2 h-2 bg-orange-500 rounded-full'></div>
              ) : item.stock === 0 ? (
                <div className='w-12 h-1.5 bg-gray-300 rounded-full'></div>
              ) : (
                <div className='w-12 h-1.5 bg-blue-500 rounded-full'></div>
              )}
            </div>

            <div>
              {item.status === 'draft' ? (
                <span className='inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full'>● Draft</span>
              ) : item.status === 'archived' ? (
                <span className='inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full'>● Archived</span>
              ) : item.stock > 10 ? (
                <span className='inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full'>● Active</span>
              ) : item.stock > 0 && item.stock <= 10 ? (
                <span className='inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full'>● Low Stock</span>
              ) : (
                <span className='inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full'>● Out of Stock</span>
              )}
            </div>

            <div className='flex gap-10'>
              <button 
                onClick={() => navigate(`/edit/${item._id}`)}
                className='text-blue-500 hover:text-blue-700 font-medium text-sm'
              >
                ✏️
              </button>
              <button 
                onClick={() => handleRemoveClick(item._id)}
                className='text-red-500 hover:text-red-700 font-medium text-sm'
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

        {paginatedList.length === 0 && (
          <div className='px-6 py-8 text-center'>
            <p className='text-gray-500 font-medium text-sm'>No products found</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50'>
            <p className='text-xs text-gray-600'>
              Showing {Math.max(1, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(currentPage * itemsPerPage, sortedList.length)} of {sortedList.length} products
            </p>
            <div className='flex gap-2'>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className='px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-white disabled:opacity-50 text-sm'
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded text-xs font-medium ${
                    currentPage === page
                      ? 'bg-red-500 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className='px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-white disabled:opacity-50 text-sm'
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <ConfirmModal 
          title="Delete Product"
          message="Are you sure you want to delete this product?"
          onConfirm={removeProduct}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl p-6 w-96 shadow-lg'>
            <h2 className='text-lg font-bold text-gray-800 mb-4'>Update Product Status</h2>
            
            <p className='text-sm text-gray-600 mb-4'>
              You are updating the status of <span className='font-semibold'>{selectedProducts.size}</span> product(s)
            </p>

            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-3'>Select New Status</label>
              <div className='space-y-2'>
                <button
                  onClick={() => setStatusToUpdate('active')}
                  className={`w-full px-4 py-3 border rounded-lg text-left transition ${
                    statusToUpdate === 'active'
                      ? 'bg-green-50 border-green-500 text-green-700 font-medium'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className='text-lg'>●</span> Active - Product is visible and available
                </button>
                <button
                  onClick={() => setStatusToUpdate('draft')}
                  className={`w-full px-4 py-3 border rounded-lg text-left transition ${
                    statusToUpdate === 'draft'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className='text-lg'>●</span> Draft - Hidden from customers
                </button>
                <button
                  onClick={() => setStatusToUpdate('archived')}
                  className={`w-full px-4 py-3 border rounded-lg text-left transition ${
                    statusToUpdate === 'archived'
                      ? 'bg-gray-50 border-gray-500 text-gray-700 font-medium'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className='text-lg'>●</span> Archived - No longer in use
                </button>
              </div>
            </div>

            <div className='flex gap-3'>
              <button
                onClick={(()=> {setShowStatusModal(false)})}
                className='flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm'
              >
                Cancel
              </button>
              <button
                onClick={updateProductStatus}
                className='flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm'
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default List