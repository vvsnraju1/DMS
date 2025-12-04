import React, { useEffect, useState } from 'react';
import { auditService } from '@/services/audit.service';
import { AuditLog } from '@/types';
import { Search, Filter, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { formatISTDateTime } from '../utils/dateUtils';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [usernameFilter, setUsernameFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Available options
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [availableEntityTypes, setAvailableEntityTypes] = useState<string[]>([]);

  const pageSize = 50;

  useEffect(() => {
    fetchAvailableFilters();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityFilter, usernameFilter, startDateFilter, endDateFilter]);

  const fetchAvailableFilters = async () => {
    try {
      const [actions, entityTypes] = await Promise.all([
        auditService.getActions(),
        auditService.getEntityTypes(),
      ]);
      setAvailableActions(actions);
      setAvailableEntityTypes(entityTypes);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const filters: any = { page, page_size: pageSize };
      if (actionFilter) filters.action = actionFilter;
      if (entityFilter) filters.entity_type = entityFilter;
      if (usernameFilter) filters.username = usernameFilter;
      if (startDateFilter) filters.start_date = startDateFilter;
      if (endDateFilter) filters.end_date = endDateFilter;

      const response = await auditService.getAuditLogs(filters);
      setLogs(response.logs);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setActionFilter('');
    setEntityFilter('');
    setUsernameFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
    setPage(1);
  };

  const toggleExpand = (logId: number) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('CREATED')) return 'badge-green';
    if (action.includes('DELETED')) return 'badge-red';
    if (action.includes('FAILED')) return 'badge-red';
    if (action.includes('LOGIN')) return 'badge-blue';
    if (action.includes('UPDATED')) return 'badge-blue';
    return 'badge-gray';
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">System activity and compliance trail</p>
        </div>
        <button
          onClick={() => fetchLogs()}
          className="btn btn-secondary flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button onClick={handleClearFilters} className="text-sm text-primary-600 hover:text-primary-700">
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="label">Action</label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="input"
            >
              <option value="">All Actions</option>
              {availableActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Entity Type</label>
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(1);
              }}
              className="input"
            >
              <option value="">All Types</option>
              {availableEntityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Username</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={usernameFilter}
                onChange={(e) => {
                  setUsernameFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="Search username..."
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="label">Start Date</label>
            <input
              type="datetime-local"
              value={startDateFilter}
              onChange={(e) => {
                setStartDateFilter(e.target.value);
                setPage(1);
              }}
              className="input"
            />
          </div>

          <div>
            <label className="label">End Date</label>
            <input
              type="datetime-local"
              value={endDateFilter}
              onChange={(e) => {
                setEndDateFilter(e.target.value);
                setPage(1);
              }}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="card mb-6 bg-primary-50 border-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Audit Entries</p>
            <p className="text-2xl font-bold text-primary-900">{total.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Current Page</p>
            <p className="text-2xl font-bold text-primary-900">{page} of {totalPages}</p>
          </div>
        </div>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No audit logs found</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="card hover:shadow-lg transition-shadow">
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => toggleExpand(log.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`badge ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-sm text-gray-500">{log.entity_type}</span>
                      <span className="text-sm font-medium text-gray-900">{log.username}</span>
                      <span className="text-sm text-gray-500">
                        {formatISTDateTime(log.timestamp)} IST
                      </span>
                    </div>
                    <p className="text-gray-700">{log.description}</p>
                  </div>
                  <button className="ml-4 text-gray-400 hover:text-gray-600">
                    {expandedLog === log.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Expanded Details */}
                {expandedLog === log.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 font-medium">Log ID</p>
                        <p className="text-gray-900">{log.id}</p>
                      </div>
                      {log.user_id && (
                        <div>
                          <p className="text-gray-500 font-medium">User ID</p>
                          <p className="text-gray-900">{log.user_id}</p>
                        </div>
                      )}
                      {log.entity_id && (
                        <div>
                          <p className="text-gray-500 font-medium">Entity ID</p>
                          <p className="text-gray-900">{log.entity_id}</p>
                        </div>
                      )}
                      {log.ip_address && (
                        <div>
                          <p className="text-gray-500 font-medium">IP Address</p>
                          <p className="text-gray-900">{log.ip_address}</p>
                        </div>
                      )}
                    </div>

                    {log.user_agent && (
                      <div className="mt-4">
                        <p className="text-gray-500 font-medium text-sm mb-1">User Agent</p>
                        <p className="text-gray-700 text-sm">{log.user_agent}</p>
                      </div>
                    )}

                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="mt-4">
                        <p className="text-gray-500 font-medium text-sm mb-2">Details</p>
                        <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing {(page - 1) * pageSize + 1} to{' '}
                {Math.min(page * pageSize, total)} of {total} logs
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-2 rounded ${
                          page === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Compliance Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Compliance Note:</strong> This audit trail is maintained for FDA 21 CFR Part 11 compliance. 
          All logs are immutable and retained for {Math.floor(2555 / 365)} years.
        </p>
      </div>
    </div>
  );
};

export default AuditLogs;

