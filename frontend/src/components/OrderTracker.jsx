import React from 'react'
import { CheckCircle, Truck, MapPin, Home, XCircle } from 'lucide-react'

// Ordered stages (Cancelled is handled separately)
const STAGES = [
  { key: 'New',              name: 'Order Placed',     icon: CheckCircle },
  { key: 'Shipped',          name: 'Shipped',          icon: Truck       },
  { key: 'Out for Delivery', name: 'Out for Delivery', icon: MapPin      },
  { key: 'Delivered',        name: 'Delivered',        icon: Home        },
]

const OrderTracker = ({ order, showDetails = false }) => {
  const isCancelled = order.status === 'Cancelled'
  const currentStageIndex = STAGES.findIndex(s => s.key === order.status)

  const getIconStyle = (index) => {
    if (isCancelled) return 'text-gray-300 bg-gray-50'
    const isCompleted = index <= currentStageIndex
    const isCurrent   = index === currentStageIndex
    if (!isCompleted) return 'text-gray-300 bg-gray-50'
    if (isCurrent) {
      if (order.status === 'Delivered')        return 'text-green-600 bg-green-50 ring-4 ring-green-100'
      if (order.status === 'Shipped')          return 'text-orange-500 bg-orange-50 ring-4 ring-orange-100'
      if (order.status === 'Out for Delivery') return 'text-purple-500 bg-purple-50 ring-4 ring-purple-100'
      return 'text-blue-500 bg-blue-50 ring-4 ring-blue-100' // New
    }
    return 'text-green-600 bg-green-50' // past stage
  }

  const getLineStyle = (index) => {
    if (isCancelled) return 'bg-gray-200'
    return index < currentStageIndex ? 'bg-green-500' : 'bg-gray-200'
  }

  return (
    <div className='w-full'>
      {/* Cancelled banner */}
      {isCancelled && (
        <div className='flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4'>
          <XCircle size={18} className='text-red-500 shrink-0' />
          <p className='text-sm font-semibold text-red-600'>This order has been cancelled</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className='relative flex items-center justify-between mb-4'>
        {STAGES.map((stage, index) => {
          const Icon = stage.icon
          const isCompleted = !isCancelled && index <= currentStageIndex
          return (
            <React.Fragment key={stage.key}>
              <div className='flex flex-col items-center z-10'>
                <div className={`rounded-full p-2 transition-all ${getIconStyle(index)}`}>
                  <Icon size={showDetails ? 24 : 18} />
                </div>
                <p className={`text-xs mt-1 text-center max-w-[72px] leading-tight ${
                  isCompleted ? 'font-semibold text-gray-700' : 'text-gray-400'
                }`}>
                  {stage.name}
                </p>
              </div>
              {index < STAGES.length - 1 && (
                <div className='flex-1 h-1 mx-2 relative top-[-14px]'>
                  <div className={`h-full rounded transition-all ${getLineStyle(index)}`} />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Extra details (shown in modal) */}
      {showDetails && !isCancelled && (
        <div className='border-t pt-4 space-y-2 mt-2'>
          {order.trackingNumber && (
            <div className='flex items-center justify-between p-3 bg-gray-50 rounded'>
              <div>
                <p className='text-xs text-gray-500'>Tracking Number</p>
                <p className='font-mono font-semibold'>{order.trackingNumber}</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(order.trackingNumber)
                  alert('Tracking number copied!')
                }}
                className='px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700'
              >
                Copy
              </button>
            </div>
          )}
          {order.estimatedDelivery && order.status !== 'Delivered' && (
            <div className='p-3 bg-blue-50 rounded'>
              <p className='text-xs text-gray-500'>Estimated Delivery</p>
              <p className='font-semibold'>{new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}</p>
            </div>
          )}
          {order.status === 'Delivered' && (
            <div className='p-3 bg-green-50 rounded text-center'>
              <p className='text-green-700 font-semibold'>✓ Order Delivered Successfully</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default OrderTracker
