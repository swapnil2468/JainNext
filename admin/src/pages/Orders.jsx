import React, { useEffect, useState, useRef, useCallback } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import ConfirmModal from '../components/ConfirmModal'


// ── Status configuration ────────────────────────────────────────────────────
const PIPELINE = ['New', 'Shipped', 'Out for Delivery', 'Delivered']
const ADMIN_SELECTABLE = ['Shipped', 'Out for Delivery', 'Delivered']

const STATUS_STYLES = {
  'New':              { active: 'bg-blue-500 text-white border-blue-500',    done: 'bg-blue-100 text-blue-600 border-blue-200'    },
  'Shipped':          { active: 'bg-orange-500 text-white border-orange-500',done: 'bg-orange-100 text-orange-600 border-orange-200'},
  'Out for Delivery': { active: 'bg-purple-500 text-white border-purple-500',done: 'bg-purple-100 text-purple-600 border-purple-200'},
  'Delivered':        { active: 'bg-green-500 text-white border-green-500',  done: 'bg-green-100 text-green-600 border-green-200'  },
  'Cancelled':        { active: 'bg-red-500 text-white border-red-500',      done: 'bg-red-100 text-red-600 border-red-200'        },
}

// Tabs in pipeline order — "All" at end as overview
const TABS = [
  { key: 'New',              label: 'New',             filter: o => o.status === 'New'                   },
  { key: 'Shipped',          label: 'Shipped',         filter: o => o.status === 'Shipped'               },
  { key: 'Out for Delivery', label: 'Out for Delivery',filter: o => o.status === 'Out for Delivery'      },
  { key: 'Delivered',        label: 'Delivered',       filter: o => o.status === 'Delivered'             },
  { key: 'Cancelled',        label: 'Cancelled',       filter: o => o.status === 'Cancelled'             },
  { key: 'all',              label: 'All',             filter: () => true                                },
]

const Orders = ({ token }) => {
  const PAGE_SIZE = 10
  const [orders, setOrders]               = useState([])
  const [activeTab, setActiveTab]         = useState('New')
  const [sortBy, setSortBy]               = useState('date_desc')
  const [currentPage, setCurrentPage]     = useState(1)
  const [searchTerm, setSearchTerm]       = useState('')
  const [expandedOrders, setExpandedOrders] = useState({})
  const [trackingNumbers, setTrackingNumbers] = useState({})
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [pendingStatusChange, setPendingStatusChange] = useState(null)

  const fetchAllOrders = async () => {
    if (!token) return
    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        setOrders(response.data.orders)
        const trackingData = {}
        response.data.orders.forEach(order => {
          if (order.trackingNumber) trackingData[order._id] = order.trackingNumber
        })
        setTrackingNumbers(trackingData)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const statusHandler = async (newStatus, orderId) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/status', {
        orderId,
        status: newStatus,
        trackingNumber: trackingNumbers[orderId] || ''
      }, { headers: { token } })
      if (response.data.success) {
        await fetchAllOrders()
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Auto-save tracking number without changing status
  const saveTracking = async (orderId, currentStatus) => {
    const saved = orders.find(o => o._id === orderId)?.trackingNumber || ''
    const current = trackingNumbers[orderId] || ''
    if (current === saved) return
    try {
      await axios.post(backendUrl + '/api/order/status', {
        orderId,
        status: currentStatus,
        trackingNumber: current
      }, { headers: { token } })
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, trackingNumber: current } : o))
    } catch (_) { /* silent */ }
  }

  const confirmStatusUpdate = () => {
    if (!pendingStatusChange) return
    statusHandler(pendingStatusChange.newStatus, pendingStatusChange.orderId)
    setShowStatusConfirm(false)
    setPendingStatusChange(null)
  }

  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }))
  }

  useEffect(() => { fetchAllOrders() }, [token])

  // Reset to page 1 when tab or sort changes
  useEffect(() => { setCurrentPage(1) }, [activeTab, sortBy])

  // Filter by active tab and search, then sort
  const currentTabFilter = TABS.find(t => t.key === activeTab)?.filter ?? (() => true)
  const displayed = [...orders]
    .filter(currentTabFilter)
    .filter(order => {
      const searchLower = searchTerm.toLowerCase()
      const itemSummary = order.items.map(i => i.name).join(' ')
      return (
        itemSummary.toLowerCase().includes(searchLower) ||
        order._id.toLowerCase().includes(searchLower) ||
        order.address.firstName.toLowerCase().includes(searchLower) ||
        order.address.lastName.toLowerCase().includes(searchLower) ||
        order.address.phone.includes(searchTerm)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc')   return b.date - a.date
      if (sortBy === 'date_asc')    return a.date - b.date
      if (sortBy === 'amount_desc') return b.amount - a.amount
      if (sortBy === 'amount_asc')  return a.amount - b.amount
      return 0
    })

  // Pagination
  const totalPages = Math.ceil(displayed.length / PAGE_SIZE)
  const paginatedOrders = displayed.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const getTabCount = (tabKey) => {
    const tab = TABS.find(t => t.key === tabKey)
    return tab ? orders.filter(tab.filter).length : 0
  }

  // Status controls for an order
  const StatusControls = ({ order }) => {
    if (order.status === 'Cancelled') {
      return (
        <span className='inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200'>
          ✕ Cancelled
        </span>
      )
    }

    if (order.status === 'New') {
      return (
        <div className='flex items-center gap-2'>
          <span className='inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200'>
            <span className='w-1.5 h-1.5 rounded-full bg-blue-500 inline-block'></span>
            New
          </span>
          <button
            onClick={() => {
              setPendingStatusChange({ orderId: order._id, newStatus: 'Shipped', oldStatus: 'New' })
              setShowStatusConfirm(true)
            }}
            className='px-3 py-1 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded transition-colors'
          >
            Ship →
          </button>
        </div>
      )
    }

    if (order.status === 'Delivered') {
      return (
        <span className='inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-200'>
          <span className='w-1.5 h-1.5 rounded-full bg-green-500 inline-block'></span>
          Delivered
        </span>
      )
    }

    // Shipped / Out for Delivery — show forward action button
    const nextStatus = order.status === 'Shipped' ? 'Out for Delivery' : 'Delivered'
    const btnStyle = order.status === 'Shipped'
      ? 'bg-purple-500 hover:bg-purple-600'
      : 'bg-green-500 hover:bg-green-600'

    return (
      <div className='flex items-center gap-2'>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_STYLES[order.status].active} border`}>
          <span className='w-1.5 h-1.5 rounded-full bg-white inline-block'></span>
          {order.status}
        </span>
        <button
          onClick={() => {
            setPendingStatusChange({ orderId: order._id, newStatus: nextStatus, oldStatus: order.status })
            setShowStatusConfirm(true)
          }}
          className={`px-3 py-1 text-xs font-semibold text-white rounded transition-colors ${btnStyle}`}
        >
          {nextStatus} →
        </button>
      </div>
    )
  }

  return (
    <div className='w-full'>
      {/* Header */}
      <div className='flex justify-between items-start mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 mb-1 antialiased'>Orders</h1>
          <p className='text-gray-900 text-sm font-medium antialiased'>Manage and track customer orders.</p>
        </div>
        <div className='relative w-60'>
          <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900'>🔍</span>
          <input
            type="text"
            placeholder='Search orders...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-red-500 text-sm'
          />
        </div>
      </div>

      {/* Tab navigation */}
      <div className='flex flex-wrap border-b mb-6 gap-0'>
        {TABS.map(tab => {
          const count = getTabCount(tab.key)
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-bold transition-colors whitespace-nowrap border-b-2 antialiased ${
                isActive 
                  ? 'text-red-600 border-red-600' 
                  : 'text-gray-500 border-transparent hover:text-red-600'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-2 text-xs font-bold antialiased ${
                  isActive ? 'text-red-600' : 'text-gray-500'
                }`}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Orders List */}
      {displayed.length === 0 ? (
        <div>
          <p className='text-gray-900 text-center py-12 font-medium antialiased'>No orders found</p>
        </div>
      ) : (
        <>
          <div className='space-y-4'>
            {paginatedOrders.map((order) => (
              <div key={order._id} className='bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm'>
                {/* Top Section */}
                <div className='p-6 flex items-start gap-4 justify-between border-b border-gray-200'>
                  {/* Left - Info Only (No Image) */}
                  <div className='flex-1'>
                    <div className='mb-2'>
                      <h3 className='text-gray-900 font-bold text-base antialiased'>
                        {(() => {
                          const productNames = order.items.map(item => item.name)
                          const uniqueNames = [...new Set(productNames)]
                          
                          if (uniqueNames.length <= 2) {
                            return uniqueNames.join(', ')
                          } else {
                            return `${uniqueNames.slice(0, 2).join(', ')} + ${uniqueNames.length - 2} more`
                          }
                        })()}
                      </h3>
                    </div>
                    <p className='text-sm mb-1 antialiased'>
                      <span className='text-gray-400'>Order ID: </span>
                      <span className='text-gray-900 font-semibold'>#{order._id.slice(-8).toUpperCase()}</span>
                      <span className='text-gray-400'> • {new Date(order.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </p>
                    <p className='text-xs text-gray-700 font-medium mb-2'>{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                    <p className='text-2xl font-bold text-red-600 antialiased'>{currency}{order.amount.toFixed(2)}</p>
                  </div>

                  {/* Right - Status & Buttons */}
                  <div className='flex flex-col items-end gap-3'>
                    {/* Status Badge */}
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full antialiased ${
                      order.paymentMethod?.toLowerCase() === 'cod' 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {order.paymentMethod?.toLowerCase() === 'cod' ? 'COD PENDING' : 'PAID ONLINE'}
                    </span>

                    {/* Action Buttons */}
                    <div className='flex flex-col gap-2 items-end'>
                      {order.status === 'New' && (
                        <button
                          onClick={() => {
                            setPendingStatusChange({ orderId: order._id, newStatus: 'Shipped', oldStatus: 'New' })
                            setShowStatusConfirm(true)
                          }}
                          className='px-4 py-2 bg-red-600 hover:bg-orange-500 hover:shadow-lg text-white rounded-lg text-xs font-medium transition-all antialiased tracking-wide'
                        >
                          Mark as Shipped
                        </button>
                      )}
                      {order.status && order.status !== 'New' && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <button
                          onClick={() => {
                            const nextStatus = order.status === 'Shipped' ? 'Out for Delivery' : 'Delivered'
                            setPendingStatusChange({ orderId: order._id, newStatus: nextStatus, oldStatus: order.status })
                            setShowStatusConfirm(true)
                          }}
                          className='px-4 py-2 bg-red-600 hover:bg-orange-500 hover:shadow-lg text-white rounded-lg text-xs font-medium transition-all antialiased tracking-wide'
                        >
                          Update Status
                        </button>
                      )}
                      <button
                        onClick={() => toggleExpand(order._id)}
                        className='px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg text-xs font-medium transition-all antialiased tracking-wide flex items-center gap-2'
                      >
                        {expandedOrders[order._id] ? 'Hide Details' : 'View Details'}
                        <i className={`ri-arrow-down-s-line transition-transform ${expandedOrders[order._id] ? 'rotate-180' : ''}`}></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Items Section - PROMINENTLY DISPLAYED */}
                {expandedOrders[order._id] && (
                  <div className='p-6 bg-white border-t border-gray-200 animate-in fade-in duration-200'>
                    <p className='text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 antialiased'>📦 PRODUCTS ORDERED ({order.items.length})</p>
                    <div className='space-y-4'>
                      {order.items.map((item, idx) => {
                        let imageUrl = null
                        
                        // Parse the selectedVariant string to extract color
                        let variantColor = null
                        if (item.selectedVariant && item.selectedVariant.includes(':')) {
                          // Format: "color:Red::length:5m"
                          const colorMatch = item.selectedVariant.match(/color:([^:]+)(?:::|\s|$)/)
                          if (colorMatch) {
                            variantColor = colorMatch[1]
                          }
                        } else if (item.selectedVariant) {
                          // Fallback: treat whole thing as color
                          variantColor = item.selectedVariant
                        }
                        
                        // Try to get variant image first
                        if (variantColor && item.variants && item.variants.length > 0) {
                          const variant = item.variants.find(v => v.color === variantColor)
                          if (variant && variant.images && variant.images.length > 0) {
                            imageUrl = variant.images[0]
                          }
                        }
                        
                        // Fallback to product image
                        if (!imageUrl && item.image && item.image.length > 0) {
                          imageUrl = item.image[0]
                        }
                        
                        return (
                          <div key={idx} className='flex items-start gap-4 p-4 bg-gradient-to-r from-rose-50 to-red-50 rounded-xl border-2 border-red-200 hover:border-red-400 transition-all'>
                            {/* Product Image */}
                            <div className='flex-shrink-0'>
                              <img 
                                src={imageUrl || assets.upload_area}
                                alt={item.name} 
                                className='w-28 h-28 object-cover rounded-lg shadow-md border border-red-300' 
                                onError={(e) => { e.target.src = assets.upload_area }}
                              />
                            </div>
                            
                            {/* Product Details */}
                            <div className='flex-1'>
                              <div className='flex items-start justify-between gap-4'>
                                <div>
                                  <p className='text-base font-bold text-gray-900 mb-1'>{item.name}</p>
                                  
                                  {/* Variant Info */}
                                  {item.selectedVariant && (
                                    <div className='mb-2'>
                                      <p className='text-xs text-gray-800 font-bold mb-1.5 tracking-wide'>SPECIFICATIONS:</p>
                                      <ul className='text-sm font-semibold text-gray-800 space-y-1'>
                                        {item.selectedVariant.split('::').map((spec, idx) => (
                                          <li key={idx} className='flex items-center gap-2.5'>
                                            <span className='w-2 h-2 bg-red-600 rounded-full flex-shrink-0'></span>
                                            <span className='capitalize font-bold text-gray-900'>{spec.trim().split(':').join(' : ')}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {/* Quantity & Price */}
                                  <div className='flex items-center gap-4 text-sm'>
                                    <div className='flex items-center gap-2'>
                                      <span className='text-gray-800 font-bold'>Quantity:</span>
                                      <span className='bg-white px-3 py-1 rounded-lg font-bold text-gray-900 border border-gray-300'>{item.quantity}</span>
                                    </div>
                                    <div className='text-gray-800 font-medium'>
                                      <span className='font-bold'>Unit Price: </span>
                                      <span className='font-bold text-gray-900'>{currency}{(item.retailPrice || item.price || 0).toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Total for this item */}
                                <div className='text-right'>
                                  <p className='text-xs text-gray-800 font-bold mb-1'>SUBTOTAL</p>
                                  <p className='text-lg font-bold text-red-600'>{currency}{(item.quantity * (item.retailPrice || item.price || 0)).toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Details Section - Collapsible */}
                {expandedOrders[order._id] && (
                  <div className='p-6 bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 animate-in fade-in duration-200'>
                    
                    {/* Left Column */}
                    <div>
                      {/* Customer Information */}
                      <div className='bg-white p-4 rounded-xl border border-gray-200 mb-6'>
                        <p className='text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 antialiased flex items-center gap-2'>
                          <span>👤</span> Customer Information
                        </p>
                        <p className='text-sm font-bold text-gray-900 antialiased mb-1'>{order.address.firstName} {order.address.lastName}</p>
                        <p className='text-sm text-gray-800 font-medium antialiased mb-1 flex items-center gap-2'>
                          <span>📱</span>
                          +91 {order.address.phone || 'N/A'}
                        </p>
                        {order.address.email && (
                          <p className='text-sm text-gray-800 font-medium antialiased flex items-center gap-2'>
                            <span>✉️</span>{order.address.email}
                          </p>
                        )}
                      </div>

                      {/* Shipping Address */}
                      <div className='bg-white p-4 rounded-xl border border-gray-200'>
                        <p className='text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 antialiased flex items-center gap-2'>
                          <span>📍</span> Shipping Address
                        </p>
                        <p className='text-sm text-gray-900 antialiased font-medium mb-1'>{order.address.street}</p>
                        <p className='text-sm text-gray-800 font-medium antialiased mb-1'>{order.address.city}, {order.address.state} {order.address.zipcode}</p>
                        <p className='text-sm text-gray-800 font-medium antialiased'>{order.address.country}</p>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div>
                      {/* Tracking Details */}
                      <div className='bg-white p-4 rounded-xl border border-gray-200 h-full'>
                        <p className='text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 antialiased flex items-center gap-2'>
                          <span>📦</span> Tracking Details
                        </p>
                        {['Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) ? (
                          <>
                            <input
                              type='text'
                              placeholder='Enter Tracking ID'
                              value={trackingNumbers[order._id] || ''}
                              onChange={(e) => setTrackingNumbers(prev => ({ ...prev, [order._id]: e.target.value }))}
                              onBlur={() => saveTracking(order._id, order.status)}
                              className='w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500 font-medium antialiased mb-3'
                            />
                            <p className='text-xs text-gray-700 font-medium italic antialiased'>✓ Tracking info will be sent via SMS once saved</p>
                          </>
                        ) : (
                          <div className='bg-blue-50 p-3 rounded-lg border border-blue-200'>
                            <p className='text-xs text-blue-600 italic antialiased font-medium'>⏳ Tracking available after shipping</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-between mt-8 px-6 py-4 bg-white rounded-2xl border border-gray-200'>
              <p className='text-xs text-gray-900 font-semibold antialiased'>
                Showing {Math.max(1, (currentPage - 1) * PAGE_SIZE + 1)} to {Math.min(currentPage * PAGE_SIZE, displayed.length)} of {displayed.length} orders
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
        </>
      )}

      <ConfirmModal
        isOpen={showStatusConfirm}
        onClose={() => { setShowStatusConfirm(false); setPendingStatusChange(null) }}
        onConfirm={confirmStatusUpdate}
        title='Update Order Status'
        message={pendingStatusChange ? (
          <>
            Move order from <strong className='text-gray-900'>"{pendingStatusChange.oldStatus}"</strong> to <strong className='text-gray-900'>"{pendingStatusChange.newStatus}"</strong>?
          </>
        ) : ''}
        confirmLabel='Yes, Update'
        confirmClassName='bg-red-600 hover:bg-orange-500 text-white font-medium transition-all'
      />
    </div>
  )
}

export default Orders
