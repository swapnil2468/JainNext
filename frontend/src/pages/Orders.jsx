import React, { useContext, useEffect, useState, useRef, useCallback } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import axios from 'axios'
import { toast } from 'react-toastify'
import OrderTracker from '../components/OrderTracker'
import ConfirmModal from '../components/ConfirmModal'

// Status classification
const ACTIVE_STATUSES  = ['New', 'Shipped', 'Out for Delivery']
const HISTORY_STATUSES = ['Delivered', 'Cancelled']

// Map internal DB status → display label
const STATUS_DISPLAY = {
  'New':              'Order Placed',
  'Shipped':          'Shipped',
  'Out for Delivery': 'Out for Delivery',
  'Delivered':        'Delivered',
  'Cancelled':        'Cancelled',
}

const STATUS_BADGE = {
  'New':              'bg-blue-100 text-blue-700',
  'Shipped':          'bg-blue-100 text-blue-700',
  'Out for Delivery': 'bg-purple-100 text-purple-700',
  'Delivered':        'bg-green-100 text-green-700',
  'Cancelled':        'bg-red-100 text-red-700',
}

const Orders = () => {
  const PAGE_SIZE = 10
  const { backendUrl, token, currency } = useContext(ShopContext)
  const [orderData, setOrderData]         = useState([])
  const [activeTab, setActiveTab]         = useState('orders')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal]         = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [pendingCancelId, setPendingCancelId]     = useState(null)
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

  const [expandedOrders, setExpandedOrders] = useState({})

  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }))
  }

  const loadOrderData = async () => {
    try {
      if (!token) return
      const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } })
      if (response.data.success) {
        setOrderData(response.data.orders.reverse())
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load orders')
    }
  }

  useEffect(() => { loadOrderData() }, [token])

  // Reset visible count when tab switches
  useEffect(() => { setVisibleCount(PAGE_SIZE) }, [activeTab])

  const activeOrders  = orderData.filter(o => ACTIVE_STATUSES.includes(o.status))
  const historyOrders = orderData.filter(o => HISTORY_STATUSES.includes(o.status))
  const displayed     = activeTab === 'orders' ? activeOrders : historyOrders

  const openModal  = (order) => { setSelectedOrder(order); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setSelectedOrder(null) }

  // Order is cancellable only if status is 'New' and placed within 24 hours
  const canCancel = (order) => {
    if (order.status !== 'New') return false
    const hoursSincePlaced = (Date.now() - order.date) / (1000 * 60 * 60)
    return hoursSincePlaced <= 24
  }

  const cancelOrder = async () => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/cancel',
        { orderId: pendingCancelId },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success('Order cancelled successfully')
        await loadOrderData()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order')
    } finally {
      setShowCancelConfirm(false)
      setPendingCancelId(null)
    }
  }

  // Compact card for Order History (Delivered / Cancelled)
  const CompactOrderCard = ({ order }) => {
    const isExpanded = expandedOrders[order._id]
    // Summarise item names: "Product A, Product B" (max 2 shown)
    const itemNames = order.items.map(i => i.name)
    const summaryText = itemNames.length <= 2
      ? itemNames.join(', ')
      : `${itemNames.slice(0, 2).join(', ')} +${itemNames.length - 2} more`
    const totalQty = order.items.reduce((s, i) => s + i.quantity, 0)

    return (
      <div className='border border-gray-200 rounded-lg mb-3 overflow-hidden'>
        {/* Compact row — always visible */}
        <div
          onClick={() => toggleExpand(order._id)}
          className='flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors'
        >
          {/* Thumbnail (first item image) */}
          <img
            className='w-14 h-14 object-cover rounded flex-shrink-0'
            src={order.items[0]?.image?.[0]}
            alt=''
          />

          {/* Order summary */}
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-medium text-gray-800 truncate'>{summaryText}</p>
            <p className='text-xs text-gray-500 mt-0.5'>
              {new Date(order.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
              <span className='mx-1.5'>•</span>
              {totalQty} item{totalQty > 1 ? 's' : ''}
              <span className='mx-1.5'>•</span>
              {currency}{order.amount}
            </p>
          </div>

          {/* Status badge */}
          <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-600'}`}>
            {STATUS_DISPLAY[order.status] || order.status}
          </span>

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
            {/* Order ID */}
            <p className='text-xs text-gray-500 mb-3'>
              Order ID: <span className='font-mono font-semibold text-gray-700'>#{order._id.slice(-8).toUpperCase()}</span>
            </p>

            {/* Items list */}
            {/* Tracker */}
            {order.status !== 'Cancelled' && (
              <div className='mb-4'>
                <OrderTracker order={order} showDetails={false} />
              </div>
            )}

            {/* Footer */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm'>
              <div className='flex flex-wrap items-center gap-4'>
                <span><span className='text-gray-500'>Total:</span> <span className='font-semibold'>{currency}{order.amount}</span></span>
                <span>
                  <span className='text-gray-500'>Payment:</span>{' '}
                  <span className={order.payment ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {order.payment ? 'Paid' : 'Pending'}
                  </span>
                </span>
                <span className='text-gray-400'>{order.paymentMethod}</span>
              </div>
              {order.status !== 'Cancelled' && (
                <button
                  onClick={(e) => { e.stopPropagation(); openModal(order) }}
                  className='border border-red-600 px-4 py-2 text-sm font-medium rounded text-red-600 hover:bg-red-600 hover:text-white transition-all'
                >
                  Track Order
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Full card for Active Orders (New / Shipped / Out for Delivery)
  const OrderCard = ({ order }) => (
    <div className='py-6 border-t border-b text-gray-700'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4'>
        <div>
          <p className='text-sm text-gray-500'>
            Order ID: <span className='font-mono font-semibold text-gray-700'>#{order._id.slice(-8).toUpperCase()}</span>
          </p>
          <p className='text-sm text-gray-500 mt-0.5'>
            Date: <span className='text-gray-700'>{new Date(order.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full self-start ${STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-600'}`}>
          {STATUS_DISPLAY[order.status] || order.status}
        </span>
      </div>

      {/* Items */}
      <div className='space-y-3 mb-4'>
        {order.items.map((item, idx) => (
          <div key={idx} className='flex items-start gap-4 text-sm bg-gray-50 p-3 rounded'>
            <img className='w-16 sm:w-20 object-cover' src={item.image[0]} alt='' />
            <div className='flex-1'>
              <p className='sm:text-base font-medium'>{item.name}</p>
              <div className='flex flex-wrap items-center gap-3 mt-1 text-gray-500'>
                <span>{currency}{item.retailPrice ?? item.price}</span>
                <span>Qty: {item.quantity}</span>
                {item.size && <span>Size: {item.size}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tracker (skip for cancelled) */}
      {order.status !== 'Cancelled' && (
        <div className='mb-4'>
          <OrderTracker order={order} showDetails={false} />
        </div>
      )}

      {/* Footer */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
        <div className='flex flex-wrap items-center gap-4 text-sm'>
          <span><span className='text-gray-500'>Total:</span> <span className='font-semibold'>{currency}{order.amount}</span></span>
          <span>
            <span className='text-gray-500'>Payment:</span>{' '}
            <span className={order.payment ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {order.payment ? 'Paid' : 'Pending'}
            </span>
          </span>
          <span className='text-gray-400'>{order.paymentMethod}</span>
        </div>
        <div className='flex flex-wrap gap-2'>
          {order.status !== 'Cancelled' && (
            <button
              onClick={() => openModal(order)}
              className='border border-red-600 px-4 py-2 text-sm font-medium rounded text-red-600 hover:bg-red-600 hover:text-white transition-all'
            >
              Track Order
            </button>
          )}
          {canCancel(order) && (
            <button
              onClick={() => { setPendingCancelId(order._id); setShowCancelConfirm(true) }}
              className='border border-gray-400 px-4 py-2 text-sm font-medium rounded text-gray-500 hover:bg-gray-100 transition-all'
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl mb-6'>
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      {/* Tabs */}
      <div className='flex border-b mb-6'>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'orders' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Orders
          {activeOrders.length > 0 && (
            <span className='ml-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5'>{activeOrders.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'history' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Order History
          {historyOrders.length > 0 && (
            <span className='ml-2 bg-gray-400 text-white text-xs rounded-full px-1.5 py-0.5'>{historyOrders.length}</span>
          )}
        </button>
      </div>

      {/* Orders list */}
      {displayed.length === 0 ? (
        <p className='text-gray-400 text-center py-12'>
          {activeTab === 'orders' ? 'No active orders.' : 'No order history yet.'}
        </p>
      ) : (
        <>
          {displayed.slice(0, visibleCount).map((order, i) => (
            activeTab === 'history'
              ? <CompactOrderCard key={order._id} order={order} />
              : <OrderCard key={order._id} order={order} />
          ))}
          <div ref={sentinelRef} className='h-2' />
          {visibleCount < displayed.length && (
            <div className='flex justify-center items-center py-6 gap-2 text-gray-400 text-sm'>
              <div className='w-5 h-5 border-2 border-gray-300 border-t-red-400 rounded-full animate-spin' />
              <span>Loading more orders…</span>
            </div>
          )}
          {visibleCount >= displayed.length && displayed.length > PAGE_SIZE && (
            <p className='text-center text-xs text-gray-400 py-4'>Showing all {displayed.length} orders</p>
          )}
        </>
      )}

      {/* Track Order Modal */}
      {showModal && selectedOrder && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='sticky top-0 bg-white border-b p-6 flex justify-between items-center'>
              <div>
                <h2 className='text-xl font-bold'>Track Your Order</h2>
                <p className='text-sm text-gray-500 mt-1'>Order #{selectedOrder._id.slice(-8).toUpperCase()}</p>
              </div>
              <button onClick={closeModal} className='text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center'>×</button>
            </div>
            <div className='p-6'>
              <OrderTracker order={selectedOrder} showDetails={true} />

              <div className='mt-6 border-t pt-4'>
                <h3 className='font-semibold mb-3'>Order Summary</h3>
                <div className='space-y-2'>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className='flex justify-between text-sm'>
                      <span>{item.name} x {item.quantity}</span>
                      <span className='font-medium'>{currency}{(item.retailPrice || item.price) * item.quantity}</span>
                    </div>
                  ))}
                  <div className='flex justify-between font-semibold pt-2 border-t'>
                    <span>Total Amount</span>
                    <span>{currency}{selectedOrder.amount}</span>
                  </div>
                </div>
              </div>

              <div className='mt-4 border-t pt-4'>
                <h3 className='font-semibold mb-2'>Delivery Address</h3>
                <div className='text-sm text-gray-700 space-y-0.5'>
                  <p className='font-medium'>{selectedOrder.address.firstName} {selectedOrder.address.lastName}</p>
                  <p>{selectedOrder.address.street}</p>
                  <p>{selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.zipcode}</p>
                  <p>{selectedOrder.address.country}</p>
                  <p className='mt-1'>Phone: {selectedOrder.address.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => { setShowCancelConfirm(false); setPendingCancelId(null) }}
        onConfirm={cancelOrder}
        title='Cancel Order'
        message='Your order will be cancelled and any stock will be restored. This cannot be undone.'
        confirmLabel='Yes, Cancel Order'
        confirmClassName='bg-gray-700 hover:bg-gray-800 text-white'
      />
    </div>
  )
}

export default Orders
