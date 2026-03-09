import React, { useEffect, useState, useRef, useCallback } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import ConfirmModal from '../components/ConfirmModal'


// ── Status configuration ────────────────────────────────────────────────────
// Forward-only pipeline. Cancelled is a special terminal state set by user only.
const PIPELINE = ['New', 'Shipped', 'Out for Delivery', 'Delivered']
const ADMIN_SELECTABLE = ['Shipped', 'Out for Delivery', 'Delivered'] // Admin picks only forward statuses

const STATUS_STYLES = {
  'New':              { active: 'bg-blue-500 text-white border-blue-500',    done: 'bg-blue-100 text-blue-600 border-blue-200'    },
  'Shipped':          { active: 'bg-orange-500 text-white border-orange-500',done: 'bg-orange-100 text-orange-600 border-orange-200'},
  'Out for Delivery': { active: 'bg-purple-500 text-white border-purple-500',done: 'bg-purple-100 text-purple-600 border-purple-200'},
  'Delivered':        { active: 'bg-green-500 text-white border-green-500',  done: 'bg-green-100 text-green-600 border-green-200'  },
  'Cancelled':        { active: 'bg-red-500 text-white border-red-500',      done: 'bg-red-100 text-red-600 border-red-200'        },
}

// Admin tab definitions
const TABS = [
  { key: 'all',              label: 'All Orders',      filter: () => true                                },
  { key: 'New',              label: 'Order Confirmed',  filter: o => o.status === 'New'                   },
  { key: 'Shipped',          label: 'Shipped',         filter: o => o.status === 'Shipped'               },
  { key: 'Out for Delivery', label: 'Out for Delivery',filter: o => o.status === 'Out for Delivery'      },
  { key: 'Delivered',        label: 'Delivered',       filter: o => o.status === 'Delivered'             },
  { key: 'Cancelled',        label: 'Cancelled',       filter: o => o.status === 'Cancelled'             },
]

const Orders = ({ token }) => {
  const PAGE_SIZE = 10
  const [orders, setOrders]               = useState([])
  const [activeTab, setActiveTab]         = useState('all')
  const [sortBy, setSortBy]               = useState('date_desc')
  const [visibleCount, setVisibleCount]   = useState(PAGE_SIZE)
  const observerRef = useRef(null)
  const sentinelRef = useCallback((node) => {
    if (observerRef.current) { observerRef.current.disconnect(); observerRef.current = null }
    if (!node) return
    observerRef.current = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setVisibleCount(prev => prev + PAGE_SIZE) },
      { rootMargin: '200px' }
    )
    observerRef.current.observe(node)
  }, [])
  const [trackingNumbers, setTrackingNumbers]           = useState({})
  const [estimatedDeliveries, setEstimatedDeliveries]   = useState({})
  const [pendingStatusUpdates, setPendingStatusUpdates] = useState({}) // { orderId: selectedStatus }
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [pendingDeleteId, setPendingDeleteId]     = useState(null)
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [pendingStatusChange, setPendingStatusChange] = useState(null) // { orderId, newStatus }

  const fetchAllOrders = async () => {
    if (!token) return
    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        setOrders(response.data.orders)
        const trackingData = {}
        const deliveryData = {}
        response.data.orders.forEach(order => {
          if (order.trackingNumber)  trackingData[order._id] = order.trackingNumber
          if (order.estimatedDelivery) deliveryData[order._id] = order.estimatedDelivery.split('T')[0]
        })
        setTrackingNumbers(trackingData)
        setEstimatedDeliveries(deliveryData)
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
        trackingNumber: trackingNumbers[orderId] || '',
        estimatedDelivery: estimatedDeliveries[orderId] || ''
      }, { headers: { token } })
      if (response.data.success) {
        // Clear the pending selection for this order
        setPendingStatusUpdates(prev => { const n = { ...prev }; delete n[orderId]; return n })
        await fetchAllOrders()
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Just locally select a status pill — does NOT save to DB
  const selectStatus = (orderId, status) => {
    setPendingStatusUpdates(prev => ({ ...prev, [orderId]: status }))
  }

  const confirmStatusUpdate = () => {
    if (!pendingStatusChange) return
    statusHandler(pendingStatusChange.newStatus, pendingStatusChange.orderId)
    setShowStatusConfirm(false)
    setPendingStatusChange(null)
  }

  const deleteOrderHandler = async () => {
    try {
      const response = await axios.post(backendUrl + '/api/order/delete', { orderId: pendingDeleteId }, { headers: { token } })
      if (response.data.success) {
        toast.success('Order removed')
        await fetchAllOrders()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setShowDeleteConfirm(false)
      setPendingDeleteId(null)
    }
  }

  useEffect(() => { fetchAllOrders() }, [token])

  // Reset visible count when tab or sort changes
  useEffect(() => { setVisibleCount(PAGE_SIZE) }, [activeTab, sortBy])

  // Filter by active tab then sort
  const currentTabFilter = TABS.find(t => t.key === activeTab)?.filter ?? (() => true)
  const displayed = [...orders]
    .filter(currentTabFilter)
    .sort((a, b) => {
      if (sortBy === 'date_desc')   return b.date - a.date
      if (sortBy === 'date_asc')    return a.date - b.date
      if (sortBy === 'amount_desc') return b.amount - a.amount
      if (sortBy === 'amount_asc')  return a.amount - b.amount
      return 0
    })

  const getTabCount = (tabKey) => {
    const tab = TABS.find(t => t.key === tabKey)
    return tab ? orders.filter(tab.filter).length : 0
  }

  return (
    <div>
      {/* Page header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6'>
        <h3 className='text-xl font-semibold'>Orders</h3>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className='px-3 py-2 border rounded text-sm'
        >
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="amount_desc">Amount: High → Low</option>
          <option value="amount_asc">Amount: Low → High</option>
        </select>
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
              className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${
                  isActive ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'
                }`}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Order list */}
      {displayed.length === 0 ? (
        <p className='text-gray-400 text-center py-12'>No orders in this category.</p>
      ) : (
        <>
          {displayed.slice(0, visibleCount).map((order, index) => (
          <div
            className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700'
            key={index}
          >
            <img className='w-12' src={assets.parcel_icon} alt='' />

            {/* Customer + items */}
            <div>
              <div>
                {order.items.map((item, i) => (
                  <p className='py-0.5' key={i}>
                    {item.name} x {item.quantity}{item.size ? ` (${item.size})` : ''}{i < order.items.length - 1 ? ',' : ''}
                  </p>
                ))}
              </div>
              <p className='mt-3 mb-2 font-medium'>{order.address.firstName} {order.address.lastName}</p>
              <p>{order.address.street},</p>
              <p>{order.address.city}, {order.address.state}, {order.address.country}, {order.address.zipcode}</p>
              <p>{order.address.phone}</p>
            </div>

            {/* Meta */}
            <div>
              <p className='text-sm sm:text-[15px]'>Items: {order.items.length}</p>
              <p className='mt-3'>Method: {order.paymentMethod}</p>
              <p>Payment: {order.payment ? 'Done' : 'Pending'}</p>
              <p>Date: {new Date(order.date).toLocaleDateString()}</p>
            </div>

            {/* Amount */}
            <p className='text-sm sm:text-[15px]'>{currency}{order.amount}</p>

            {/* Status controls */}
            <div className='flex flex-col gap-2'>
              {order.status === 'Cancelled' ? (
                /* Cancelled by customer — no status controls */
                <span className='inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200 self-start'>
                  ✕ Cancelled by Customer
                </span>
              ) : order.status === 'New' ? (
                /* New orders — show badge only, admin can't go back to New */
                <>
                  <span className='inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-200 self-start'>
                    <span className='w-1.5 h-1.5 rounded-full bg-blue-500 inline-block'></span>
                    Order Confirmed
                  </span>
                  <p className='text-xs text-gray-400'>Advance to start processing</p>
                  {/* Estimated delivery date for new orders */}
                  <input
                    type='date'
                    value={estimatedDeliveries[order._id] || ''}
                    onChange={(e) => setEstimatedDeliveries(prev => ({ ...prev, [order._id]: e.target.value }))}
                    className='p-2 border rounded text-sm'
                  />
                  {/* Only allow advancing to Shipped */}
                  <button
                    onClick={() => {
                      setPendingStatusChange({ orderId: order._id, newStatus: 'Shipped', oldStatus: 'New' })
                      setShowStatusConfirm(true)
                    }}
                    className='px-3 py-1.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded transition-colors'
                  >
                    Mark as Shipped →
                  </button>
                </>
              ) : (
                <>
                  {/* Status pills — clicking only selects locally */}
                  <div className='flex flex-wrap gap-1'>
                    {ADMIN_SELECTABLE.map((s) => {
                      const displayStatus = pendingStatusUpdates[order._id] || order.status
                      const displayIdx = PIPELINE.indexOf(displayStatus)
                      const sIdx       = PIPELINE.indexOf(s)
                      const isSelected = displayStatus === s
                      const isSaved    = order.status === s
                      const isDone     = sIdx !== -1 && sIdx < displayIdx
                      const isPending  = isSelected && !isSaved

                      let style
                      if (isSelected) {
                        style = STATUS_STYLES[s].active + (isPending ? ' ring-2 ring-offset-1 ring-gray-400' : '')
                      } else if (isDone) {
                        style = STATUS_STYLES[s].done
                      } else {
                        style = 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200 hover:text-gray-600'
                      }

                      return (
                        <button
                          key={s}
                          onClick={() => selectStatus(order._id, s)}
                          className={`px-2 py-1 text-xs rounded-full border font-medium transition-all cursor-pointer ${style}`}
                          title={`Select ${s}`}
                        >
                          {isSelected && <span className='mr-1'>●</span>}{s}
                        </button>
                      )
                    })}
                  </div>

                  {/* Pending change indicator */}
                  {pendingStatusUpdates[order._id] && pendingStatusUpdates[order._id] !== order.status && (
                    <p className='text-xs text-amber-600 font-medium'>
                      Unsaved: {order.status} → {pendingStatusUpdates[order._id]}
                    </p>
                  )}

                  {/* Tracking number — only when shipped or later */}
                  {['Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) && (
                    <input
                      type='text'
                      placeholder='Tracking Number'
                      value={trackingNumbers[order._id] || ''}
                      onChange={(e) => setTrackingNumbers(prev => ({ ...prev, [order._id]: e.target.value }))}
                      className='p-2 border rounded text-sm'
                    />
                  )}

                  {/* Estimated delivery date */}
                  {order.status !== 'Delivered' && (
                    <input
                      type='date'
                      value={estimatedDeliveries[order._id] || ''}
                      onChange={(e) => setEstimatedDeliveries(prev => ({ ...prev, [order._id]: e.target.value }))}
                      className='p-2 border rounded text-sm'
                    />
                  )}
                </>
              )}

              {/* Action buttons */}
              <div className='flex gap-2 mt-1 flex-wrap'>
                {order.status !== 'Cancelled' && order.status !== 'New' && (
                  <button
                    onClick={() => {
                      const newStatus = pendingStatusUpdates[order._id] || order.status
                    setPendingStatusChange({ orderId: order._id, newStatus, oldStatus: order.status })
                      setShowStatusConfirm(true)
                    }}
                    className='px-3 py-1 text-xs text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors'
                  >
                    Update Status
                  </button>
                )}
                <button
                  onClick={() => { setPendingDeleteId(order._id); setShowDeleteConfirm(true) }}
                  className='px-3 py-1 text-xs text-red-500 border border-red-300 rounded hover:bg-red-50 transition-colors'
                >
                  Remove Order
                </button>
              </div>
            </div>
          </div>
        ))}
          <div ref={sentinelRef} className='h-2' />
          {visibleCount < displayed.length && (
            <div className='flex justify-center items-center py-6 gap-2 text-gray-400 text-sm'>
              <div className='w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin' />
              <span>Loading more orders…</span>
            </div>
          )}
          {visibleCount >= displayed.length && displayed.length > PAGE_SIZE && (
            <p className='text-center text-xs text-gray-400 py-4'>Showing all {displayed.length} orders</p>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={showStatusConfirm}
        onClose={() => { setShowStatusConfirm(false); setPendingStatusChange(null) }}
        onConfirm={confirmStatusUpdate}
        title='Update Order Status'
        message={pendingStatusChange ? `Change status from "${pendingStatusChange.oldStatus}" to "${pendingStatusChange.newStatus}"?` : ''}
        confirmLabel='Yes, Update'
        confirmClassName='bg-blue-600 hover:bg-blue-700 text-white'
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setPendingDeleteId(null) }}
        onConfirm={deleteOrderHandler}
        title='Remove Order'
        message='This will permanently delete the order record. This action cannot be undone.'
        confirmLabel='Yes, Remove'
        confirmClassName='bg-red-600 hover:bg-red-700 text-white'
      />
    </div>
  )
}

export default Orders
