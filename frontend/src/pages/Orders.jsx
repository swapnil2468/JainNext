import React, { useContext, useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
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
  const navigate = useNavigate()
  const { backendUrl, token, currency } = useContext(ShopContext)
  const [orderData, setOrderData]         = useState([])
  const [activeTab, setActiveTab]         = useState('orders')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal]         = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [pendingCancelId, setPendingCancelId]     = useState(null)
  const [visibleCount, setVisibleCount]   = useState(PAGE_SIZE)
  const observerRef = useRef(null)
  
  // Helper to parse selectedVariant string and find matching variant
  const findVariantByString = (product, variantString) => {
    if (!product.variants?.length || !variantString) return null
    
    // Check if it's new format (contains ':')
    if (variantString.includes(':') && variantString.includes('::')) {
      const attributes = {}
      const pairs = variantString.split('::')
      pairs.forEach(pair => {
        const [type, value] = pair.split(':')
        if (type && value) attributes[type] = value
      })
      return product.variants.find(v => {
        for (const [type, value] of Object.entries(attributes)) {
          const variantValue = type === 'color' ? (v.color || v.attributes?.color) : v.attributes?.[type]
          if (variantValue !== value) return false
        }
        return true
      })
    }
    
    // Fallback: old format (just color)
    return product.variants.find(v => v.color === variantString)
  }
  
  // Helper to format selectedVariant for display
  const formatVariantDisplay = (variantString) => {
    if (!variantString) return ''
    
    // Check if it's new format
    if (variantString.includes(':') && variantString.includes('::')) {
      const values = []
      const pairs = variantString.split('::')
      pairs.forEach(pair => {
        const [_, value] = pair.split(':')
        if (value) values.push(value)
      })
      return values.join(' - ')
    }
    
    // Old format or simple string
    return variantString
  }
  
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
    const itemNames = order.items.map(i => 
      i.selectedVariant 
        ? `${i.name} (${formatVariantDisplay(i.selectedVariant)})` 
        : i.name
    )
    const summaryText = itemNames.length <= 2
      ? itemNames.join(', ')
      : `${itemNames.slice(0, 2).join(', ')} +${itemNames.length - 2} more`
    const totalQty = order.items.reduce((s, i) => s + i.quantity, 0)
    
    // Status-specific border color
    const statusBorderColor = {
      'Delivered': 'border-l-green-500',
      'Cancelled': 'border-l-red-500'
    }[order.status] || 'border-l-gray-400'

    return (
      <div className={`bg-white rounded-2xl border border-neutral-200/60 shadow-sm mb-3 overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 ${statusBorderColor}`}>
        <div
          onClick={() => toggleExpand(order._id)}
          className='flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors'
        >
          <div className='w-14 h-14 rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100 flex-shrink-0'>
            {order.items[0] && (
              (() => {
                const item = order.items[0]
                let imageUrl = null
                if (item.selectedVariant && item.variants && item.variants.length > 0) {
                  const variant = findVariantByString(item, item.selectedVariant)
                  if (variant && variant.images && variant.images.length > 0) {
                    imageUrl = variant.images[0]
                  }
                }
                if (!imageUrl && item.image && item.image.length > 0) {
                  imageUrl = item.image[0]
                }
                return imageUrl ? (
                  <img className='w-full h-full object-cover' src={imageUrl} alt={item.name} onError={(e) => e.target.style.display = 'none'} />
                ) : null
              })()
            )}
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-semibold text-neutral-900 truncate'>{summaryText}</p>
            <p className='text-xs text-neutral-500 mt-0.5'>
              {new Date(order.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
              <span className='mx-1.5'>·</span>
              {totalQty} item{totalQty > 1 ? 's' : ''}
              <span className='mx-1.5'>·</span>
              {currency}{order.amount}
            </p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 ${STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-600'}`}>
            {STATUS_DISPLAY[order.status] || order.status}
          </span>
          <i className={`ri-arrow-down-s-line text-neutral-400 text-xl flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
        </div>

        {isExpanded && (
          <div className='border-t border-neutral-100 bg-gray-50 p-4'>
            <p className='text-xs text-neutral-500 mb-3'>
              Order <span className='font-mono font-semibold text-neutral-700'>#{order._id.slice(-8).toUpperCase()}</span>
            </p>
            {/* Items */}
            <div className='space-y-2 mb-4 pb-4 border-b border-neutral-200'>
              {order.items.map((item, idx) => {
                // Get image from variant if available, otherwise from product
                let imageUrl = null
                if (item.selectedVariant && item.variants && item.variants.length > 0) {
                  const variant = findVariantByString(item, item.selectedVariant)
                  if (variant && variant.images && variant.images.length > 0) {
                    imageUrl = variant.images[0]
                  }
                }
                // Fall back to product image
                if (!imageUrl && item.image && item.image.length > 0) {
                  imageUrl = item.image[0]
                }
                
                return (
                  <div key={idx} className='flex items-center gap-3 text-xs'>
                    <div className='w-10 h-10 rounded-lg overflow-hidden bg-white border border-neutral-100 flex-shrink-0'>
                      <img className='w-full h-full object-cover' src={imageUrl || ''} alt={item.name} onError={(e) => e.target.style.display = 'none'} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium text-neutral-800 line-clamp-1'>{item.name}</p>
                      <p className='text-neutral-500'>
                        Qty: {item.quantity}
                        {item.selectedVariant && ` · ${formatVariantDisplay(item.selectedVariant)}`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            {order.status !== 'Cancelled' && (
              <div className='mb-4'>
                <OrderTracker order={order} showDetails={false} />
              </div>
            )}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm pt-3 border-t border-neutral-200'>
              <div className='flex flex-wrap items-center gap-3'>
                <span className='font-semibold text-neutral-900'>{currency}{order.amount}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${order.payment ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}>
                  {order.payment ? '✓ Paid' : 'Pending'}
                </span>
                <span className='text-xs text-neutral-400'>{order.paymentMethod}</span>
              </div>
              {order.status !== 'Cancelled' && (
                <button
                  onClick={(e) => { e.stopPropagation(); openModal(order) }}
                  className='px-4 py-2 text-sm font-medium rounded-xl border-2 border-gray-900 text-gray-900 hover:bg-gray-50 transition-all w-fit'
                >
                  <i className='ri-map-pin-line mr-1'></i>
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
  const OrderCard = ({ order }) => {
    // Status-specific accent colors
    const statusColors = {
      'New': { border: 'border-l-gray-900', bg: 'bg-gray-50', icon: 'ri-box-3-line', iconBg: 'bg-gray-100' },
      'Shipped': { border: 'border-l-orange-500', bg: 'bg-orange-50', icon: 'ri-truck-line', iconBg: 'bg-orange-100' },
      'Out for Delivery': { border: 'border-l-purple-500', bg: 'bg-purple-50', icon: 'ri-map-pin-line', iconBg: 'bg-purple-100' }
    }
    const colors = statusColors[order.status] || { border: 'border-l-gray-400', bg: 'bg-gray-50', icon: 'ri-package-line', iconBg: 'bg-gray-100' }
    
    return (
    <div className={`bg-white rounded-2xl border border-neutral-200/60 shadow-sm mb-4 overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 ${colors.border}`}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-6 border-b border-neutral-100 ${colors.bg}`}>
        <div className='flex items-center gap-3'>
          <div className={`w-10 h-10 ${colors.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
            <i className={`${colors.icon} text-neutral-700`}></i>
          </div>
          <div>
            <p className='text-sm font-semibold text-neutral-900'>
              Order <span className='font-mono text-gray-900'>#{order._id.slice(-8).toUpperCase()}</span>
            </p>
            <p className='text-xs text-neutral-600 mt-0.5'>
              {new Date(order.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full self-start sm:self-auto ${STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-600'}`}>
          {STATUS_DISPLAY[order.status] || order.status}
        </span>
      </div>

      {/* Items */}
      <div className='p-6 space-y-2'>
        {order.items.map((item, idx) => (
          <div key={idx} className='flex items-center gap-3 text-sm'>
            <div className='w-14 h-14 rounded-lg overflow-hidden bg-white border border-neutral-100 flex-shrink-0'>
              {item.selectedVariant && item.variants && item.variants.length > 0 ? (
                (() => {
                  const variant = findVariantByString(item, item.selectedVariant)
                  return variant && variant.images && variant.images.length > 0 ? (
                    <img className='w-full h-full object-cover' src={variant.images[0]} alt={item.name} onError={(e) => e.target.style.display = 'none'} />
                  ) : item.image && item.image.length > 0 ? (
                    <img className='w-full h-full object-cover' src={item.image[0]} alt={item.name} onError={(e) => e.target.style.display = 'none'} />
                  ) : null
                })()
              ) : item.image && item.image.length > 0 ? (
                <img className='w-full h-full object-cover' src={item.image[0]} alt={item.name} onError={(e) => e.target.style.display = 'none'} />
              ) : null}
            </div>
            <div className='flex-1 min-w-0'>
              <p className='font-medium text-neutral-900 line-clamp-1'>{item.name}</p>
              <div className='flex items-center gap-2 text-xs text-neutral-500 mt-0.5'>
                <span>{currency}{item.retailPrice ?? item.price}</span>
                <span className='w-1 h-1 bg-neutral-300 rounded-full'></span>
                <span>Qty: {item.quantity}</span>
                {item.selectedVariant && (
                  <>
                    <span className='w-1 h-1 bg-neutral-300 rounded-full'></span>
                    <span className='capitalize'>{formatVariantDisplay(item.selectedVariant)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tracker */}
      {order.status !== 'Cancelled' && (
        <div className='px-6 pb-4'>
          <OrderTracker order={order} showDetails={false} />
        </div>
      )}

      {/* Footer */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 bg-neutral-50 border-t border-neutral-100'>
        <div className='flex flex-wrap items-center gap-4 text-sm'>
          <span className='font-semibold text-neutral-900'>{currency}{order.amount}</span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${order.payment ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}>
            {order.payment ? '✓ Paid' : 'Payment Pending'}
          </span>
          <span className='text-xs text-neutral-400'>{order.paymentMethod}</span>
        </div>
        <div className='flex gap-2'>
          {order.status !== 'Cancelled' && (
            <button
              onClick={() => openModal(order)}
              className='px-4 py-2 text-sm font-medium rounded-xl border-2 border-gray-900 text-gray-900 hover:bg-gray-50 transition-all'
            >
              <i className='ri-map-pin-line mr-1'></i>
              Track Order
            </button>
          )}
          {canCancel(order) && (
            <button
              onClick={() => { setPendingCancelId(order._id); setShowCancelConfirm(true) }}
              className='px-4 py-2 text-sm font-medium rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:border-neutral-300 transition-all'
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-neutral-50 via-white to-neutral-50 pt-24 px-6 lg:px-8'>
      <div className='mb-8'>
        <h1 className='text-4xl font-light text-neutral-900'>
          My <span className='font-medium text-gray-900'>Orders</span>
        </h1>
        <div className='w-16 h-0.5 bg-gray-900 mt-2'></div>
      </div>

      {/* Tabs */}
      <div className='flex gap-2 mb-8 bg-gray-100 rounded-full p-1 w-fit'>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Active Orders
          {activeOrders.length > 0 && (
            <span className={`text-xs rounded-full px-2 py-0.5 ${activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-gray-900 text-white'}`}>
              {activeOrders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Order History
          {historyOrders.length > 0 && (
            <span className={`text-xs rounded-full px-2 py-0.5 ${activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-neutral-400 text-white'}`}>
              {historyOrders.length}
            </span>
          )}
        </button>
      </div>

      {/* Orders list */}
      {displayed.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-32'>
          <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6'>
            <i className='ri-shopping-bag-line text-4xl text-gray-400'></i>
          </div>
          <h2 className='text-2xl font-light text-neutral-900 mb-2'>
            {activeTab === 'orders' ? 'No Active Orders' : 'No Order History'}
          </h2>
          <p className='text-neutral-500 mb-8'>
            {activeTab === 'orders' ? 'You have no active orders right now' : 'Your completed orders will appear here'}
          </p>
          <button
            onClick={() => navigate('/collection')}
            className='bg-gradient-to-r from-gray-900 to-gray-800 text-white px-8 py-4 rounded-full font-medium hover:from-gray-800 hover:to-gray-700 transition-all hover:shadow-lg hover:-translate-y-0.5'
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          {displayed.slice(0, visibleCount).map((order, i) => (
            activeTab === 'history'
              ? <CompactOrderCard key={order._id} order={order} />
              : <OrderCard key={order._id} order={order} />
          ))}
          <div ref={sentinelRef} className='h-2' />
          {visibleCount < displayed.length && (
            <div className='flex justify-center items-center py-6 gap-3 text-neutral-400 text-sm'>
              <div className='w-5 h-5 border-2 border-neutral-200 border-t-gray-900 rounded-full animate-spin'></div>
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
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl'>
            <div className='sticky top-0 bg-white border-b border-neutral-100 p-6 flex justify-between items-center rounded-t-2xl'>
              <div>
                <h2 className='text-xl font-light text-neutral-900'>Track <span className='font-medium text-gray-900'>Order</span></h2>
                <p className='text-sm text-neutral-500 mt-1'>#{selectedOrder._id.slice(-8).toUpperCase()}</p>
              </div>
              <button onClick={closeModal} className='w-9 h-9 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors'>
                <i className='ri-close-line text-xl'></i>
              </button>
            </div>
            <div className='p-6'>
              <OrderTracker order={selectedOrder} showDetails={true} />
              <div className='mt-6 border-t border-neutral-100 pt-6'>
                <h3 className='font-medium text-neutral-900 mb-4'>Order Summary</h3>
                <div className='space-y-2 bg-neutral-50 rounded-xl p-4'>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className='flex justify-between text-sm'>
                      <span className='text-neutral-700'>{item.name} x {item.quantity}</span>
                      <span className='font-medium text-neutral-900'>{currency}{(item.retailPrice || item.price) * item.quantity}</span>
                    </div>
                  ))}
                  <div className='flex justify-between font-semibold pt-3 border-t border-neutral-200 mt-2'>
                    <span>Total</span>
                    <span className='text-gray-900'>{currency}{selectedOrder.amount}</span>
                  </div>
                </div>
              </div>
              <div className='mt-4 border-t border-neutral-100 pt-4'>
                <h3 className='font-medium text-neutral-900 mb-3'>Delivery Address</h3>
                <div className='text-sm text-neutral-600 space-y-1 bg-neutral-50 rounded-xl p-4'>
                  <p className='font-medium text-neutral-900'>{selectedOrder.address.firstName} {selectedOrder.address.lastName}</p>
                  <p>{selectedOrder.address.street}</p>
                  <p>{selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.zipcode}</p>
                  <p>{selectedOrder.address.country}</p>
                  <p className='mt-2 flex items-center gap-2'><i className='ri-phone-line text-gray-900'></i>{selectedOrder.address.phone}</p>
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
