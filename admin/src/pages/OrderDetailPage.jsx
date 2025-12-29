import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrder, updateOrderStatus, addOrderNote } from '../api/orders';
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from 'lucide-react';

const statusColors = {
  PENDING_CONFIRMATION: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  PREPARING: 'bg-purple-100 text-purple-800 border-purple-200',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

const statusFlow = [
  'PENDING_CONFIRMATION',
  'CONFIRMED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id),
  });

  const statusMutation = useMutation({
    mutationFn: ({ status, notes }) => updateOrderStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedStatus('');
    },
  });

  const noteMutation = useMutation({
    mutationFn: (notes) => addOrderNote(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      setNewNote('');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  const order = orderData?.data;

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  const currentStatusIndex = statusFlow.indexOf(order.status);
  const address = order.fulfillment?.addressSnapshot;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Order {order.orderNo}
          </h1>
          <p className="text-gray-500 mt-1">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-AE', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <span
          className={`px-4 py-2 text-sm font-medium rounded-full border ${
            statusColors[order.status]
          }`}
        >
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Status Timeline */}
      {order.status !== 'CANCELLED' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Progress</h2>
          <div className="flex items-center justify-between">
            {statusFlow.map((status, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;

              return (
                <div key={status} className="flex-1 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-200 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-amber-100' : ''}`}
                    >
                      {index === 0 && <Clock className="h-5 w-5" />}
                      {index === 1 && <CheckCircle className="h-5 w-5" />}
                      {index === 2 && <Package className="h-5 w-5" />}
                      {index === 3 && <Truck className="h-5 w-5" />}
                      {index === 4 && <CheckCircle className="h-5 w-5" />}
                    </div>
                    <span
                      className={`text-xs mt-2 text-center ${
                        isCurrent ? 'font-medium text-amber-700' : 'text-gray-500'
                      }`}
                    >
                      {status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {index < statusFlow.length - 1 && (
                    <div
                      className={`absolute top-5 left-1/2 w-full h-0.5 ${
                        index < currentStatusIndex ? 'bg-amber-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Update Status */}
          {order.status !== 'DELIVERED' && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="">Change status...</option>
                  {statusFlow
                    .filter((s) => statusFlow.indexOf(s) > currentStatusIndex)
                    .map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, ' ')}
                      </option>
                    ))}
                  <option value="CANCELLED">CANCELLED</option>
                </select>
                <button
                  onClick={() =>
                    selectedStatus && statusMutation.mutate({ status: selectedStatus })
                  }
                  disabled={!selectedStatus || statusMutation.isPending}
                  className="px-6 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50"
                >
                  Update
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.nameSnapshot}</p>
                  <p className="text-sm text-gray-500">{item.variantSnapshot}</p>
                  <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {item.lineTotal?.toFixed(2)} AED
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.unitPrice?.toFixed(2)} AED each
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{order.pricing?.subtotal?.toFixed(2)} AED</span>
            </div>
            {order.pricing?.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{order.pricing?.discount?.toFixed(2)} AED</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery Fee</span>
              <span>{order.pricing?.deliveryFee?.toFixed(2)} AED</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">VAT (5%)</span>
              <span>{order.pricing?.vat?.toFixed(2)} AED</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-amber-700">
                {order.pricing?.grandTotal?.toFixed(2)} AED
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Delivery Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer</h2>
            <div className="space-y-3">
              <p className="font-medium text-gray-900">
                {order.customer?.fullName || address?.name || 'Guest'}
              </p>
              {order.customer?.email && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="h-4 w-4" />
                  {order.customer.email}
                </div>
              )}
              {address?.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone className="h-4 w-4" />
                  {address.phone}
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          {order.fulfillment?.type === 'DELIVERY' && address && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Delivery Address
              </h2>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p>{address.building}</p>
                  <p>{address.street}</p>
                  <p>
                    {address.area && `${address.area}, `}
                    {address.city}
                  </p>
                  <p>{address.emirate}, UAE</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment</h2>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Method</span>
              <span className="font-medium">
                {order.payment?.method === 'COD' ? 'Cash on Delivery' : order.payment?.method}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-600">Status</span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  order.payment?.status === 'PAID'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {order.payment?.status}
              </span>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h2>
            <p className="text-sm text-gray-600 mb-4">
              {order.adminNotes || 'No notes yet'}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <button
                onClick={() => newNote && noteMutation.mutate(newNote)}
                disabled={!newNote || noteMutation.isPending}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          {/* Order History */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">History</h2>
            <div className="space-y-3">
              {order.history?.map((entry, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500" />
                  <div>
                    <p className="text-gray-900">
                      {entry.status.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.at).toLocaleString('en-AE')}
                      {entry.by && ` by ${entry.by}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
