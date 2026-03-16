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
  const [visibleCount, setVisibleCount]   = useState(PAGE_SIZE)
  const [expandedOrders, setExpandedOrders] = useState({})
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
    <div>
      {/* Page header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4'>
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
      <div className='flex flex-wrap border-b mb-5 gap-0'>
        {TABS.map(tab => {
          const count = getTabCount(tab.key)
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
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
        <p className='text-gray-400 text-center py-12'>No orders here.</p>
      ) : (
        <>
          {displayed.slice(0, visibleCount).map((order) => {
            const isExpanded = expandedOrders[order._id]
            const itemSummary = order.items.map(i => `${i.name} x${i.quantity}`).join(', ')
            const shortSummary = itemSummary.length > 60 ? itemSummary.slice(0, 57) + '...' : itemSummary

            return (
              <div key={order._id} className='border border-gray-200 rounded-lg mb-3 overflow-hidden'>
                {/* Compact row — always visible */}
                <div
                  onClick={() => toggleExpand(order._id)}
                  className='flex flex-col sm:flex-row sm:items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors'
                >
                  {/* Order info */}
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-800 truncate'>{shortSummary}</p>
                    <p className='text-xs text-gray-500 mt-0.5'>
                      #{order._id.slice(-8).toUpperCase()}
                      <span className='mx-1.5'>•</span>
                      {new Date(order.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      <span className='mx-1.5'>•</span>
                      {currency}{order.amount}
                      <span className='mx-1.5'>•</span>
                      {order.paymentMethod} ({order.payment ? 'Paid' : 'Pending'})
                    </p>
                  </div>

                  {/* Status + action */}
                  <div className='flex items-center gap-3 flex-shrink-0' onClick={e => e.stopPropagation()}>
                    <StatusControls order={order} />
                  </div>

                  {/* Chevron */}
                  <svg
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill='none' viewBox='0 0 24 24' stroke='currentColor'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                  </svg>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className='border-t bg-gray-50 p-4'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                      {/* Items */}
                      <div>
                        <p className='text-xs font-semibold text-gray-500 uppercase mb-2'>Items</p>
                        {order.items.map((item, i) => (
                          <p key={i} className='text-sm py-0.5'>
                            {item.name} <span className='text-gray-400'>x{item.quantity}</span>
                            {item.size ? <span className='text-gray-400'> ({item.size})</span> : ''}
                          </p>
                        ))}
                      </div>

                      {/* Customer */}
                      <div>
                        <p className='text-xs font-semibold text-gray-500 uppercase mb-2'>Customer</p>
                        <p className='text-sm font-medium'>{order.address.firstName} {order.address.lastName}</p>
                        <p className='text-sm text-gray-600'>{order.address.street}</p>
                        <p className='text-sm text-gray-600'>{order.address.city}, {order.address.state} {order.address.zipcode}</p>
                        <p className='text-sm text-gray-600'>{order.address.country}</p>
                        <p className='text-sm text-gray-600 mt-1'>{order.address.phone}</p>
                      </div>

                      {/* Tracking */}
                      <div>
                        <p className='text-xs font-semibold text-gray-500 uppercase mb-2'>Tracking</p>
                        {['Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) ? (
                          <input
                            type='text'
                            placeholder='Enter tracking number'
                            value={trackingNumbers[order._id] || ''}
                            onChange={(e) => setTrackingNumbers(prev => ({ ...prev, [order._id]: e.target.value }))}
                            onBlur={() => saveTracking(order._id, order.status)}
                            className='w-full p-2 border rounded text-sm'
                          />
                        ) : (
                          <p className='text-sm text-gray-400 italic'>Available after shipping</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          <div ref={sentinelRef} className='h-2' />
          {visibleCount < displayed.length && (
            <div className='flex justify-center items-center py-6 gap-2 text-gray-400 text-sm'>
              <div className='w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin' />
              <span>Loading more…</span>
            </div>
          )}
          {visibleCount >= displayed.length && displayed.length > PAGE_SIZE && (
            <p className='text-center text-xs text-gray-400 py-4'>All {displayed.length} orders shown</p>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={showStatusConfirm}
        onClose={() => { setShowStatusConfirm(false); setPendingStatusChange(null) }}
        onConfirm={confirmStatusUpdate}
        title='Update Order Status'
        message={pendingStatusChange ? `Move order from "${pendingStatusChange.oldStatus}" to "${pendingStatusChange.newStatus}"?` : ''}
        confirmLabel='Yes, Update'
        confirmClassName='bg-blue-600 hover:bg-blue-700 text-white'
      />
    </div>
  )
}

export default Orders
