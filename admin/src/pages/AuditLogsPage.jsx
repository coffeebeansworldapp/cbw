import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '../api/auditLogs';
import { useAuth } from '../context/useAuth';
import { FileText, Search, Filter, ChevronDown, Shield } from 'lucide-react';

const actionColors = {
  ADMIN_LOGIN: 'bg-green-100 text-green-800',
  ADMIN_LOGOUT: 'bg-gray-100 text-gray-800',
  PRODUCT_CREATE: 'bg-blue-100 text-blue-800',
  PRODUCT_UPDATE: 'bg-yellow-100 text-yellow-800',
  PRODUCT_DELETE: 'bg-red-100 text-red-800',
  ORDER_STATUS_CHANGE: 'bg-purple-100 text-purple-800',
  USER_CREATE: 'bg-indigo-100 text-indigo-800',
  USER_UPDATE: 'bg-amber-100 text-amber-800',
  USER_DELETE: 'bg-red-100 text-red-800',
};

const actionOptions = [
  { value: '', label: 'All Actions' },
  { value: 'ADMIN_LOGIN', label: 'Admin Login' },
  { value: 'ADMIN_LOGOUT', label: 'Admin Logout' },
  { value: 'PRODUCT_CREATE', label: 'Product Create' },
  { value: 'PRODUCT_UPDATE', label: 'Product Update' },
  { value: 'PRODUCT_DELETE', label: 'Product Delete' },
  { value: 'ORDER_STATUS_CHANGE', label: 'Order Status Change' },
  { value: 'USER_CREATE', label: 'User Create' },
  { value: 'USER_UPDATE', label: 'User Update' },
  { value: 'USER_DELETE', label: 'User Delete' },
];

export function AuditLogsPage() {
  const { hasRole } = useAuth();
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['audit-logs', { action, page }],
    queryFn: () => getAuditLogs({ action, page, limit: 20 }),
    enabled: hasRole('OWNER', 'MANAGER'),
  });

  const logs = logsData?.data || [];
  const meta = logsData?.meta || {};

  if (!hasRole('OWNER', 'MANAGER')) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Shield className="h-12 w-12 mb-4" />
        <p>Only owners and managers can view audit logs</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-500 mt-1">Track all admin activities and changes</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none appearance-none bg-white"
            >
              {actionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <FileText className="h-12 w-12 mb-4" />
            <p>No audit logs found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Target
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(log.createdAt).toLocaleString('en-AE', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {log.adminUser?.fullName || 'System'}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {log.adminUser?.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            actionColors[log.action] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.targetModel && (
                          <span>
                            {log.targetModel}
                            {log.targetId && (
                              <span className="text-gray-400 ml-1">
                                ({log.targetId.slice(-6)})
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {log.details ? (
                          <span title={JSON.stringify(log.details)}>
                            {typeof log.details === 'string'
                              ? log.details
                              : JSON.stringify(log.details).slice(0, 50) + '...'}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * 20 + 1} to{' '}
                  {Math.min(page * 20, meta.total)} of {meta.total} logs
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= meta.totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
