import React, { useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router';
import { ExternalLink, Trash2 } from 'lucide-react';
import { useUserPanel } from '../context/UserPanelContext';
import { useUserAlerts, useToggleAlertStatus, useDeleteAlert } from '../hooks/useUserApi';

export function Alerts() {
  const { alerts: mockAlerts } = useUserPanel();
  
  // Real API hooks
  const { data: alertsData, loading, error, refetch } = useUserAlerts();
  const { toggleStatus, loading: toggleLoading } = useToggleAlertStatus();
  const { deleteAlert: deleteAlertAPI, loading: deleteLoading } = useDeleteAlert();
  
  // Use real alerts from API, fallback to mock data
  const alerts = alertsData?.alerts || mockAlerts;
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'triggered'>('all');
  const [optimisticUpdates, setOptimisticUpdates] = useState<{[key: string]: string}>({});

  const filteredAlerts = useMemo(
    () => (activeFilter === 'all' ? alerts : alerts.filter((a) => {
      const status = optimisticUpdates[a.id] || a.status;
      return status.toLowerCase() === activeFilter;
    })),
    [activeFilter, alerts, optimisticUpdates]
  );

  const handleToggleAlert = useCallback(async (alertId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Triggered' : 'Active';
    setOptimisticUpdates(prev => ({ ...prev, [alertId]: newStatus }));
    
    try {
      await toggleStatus(alertId, newStatus);
      refetch();
    } catch (err) {
      console.error('Failed to toggle alert:', err);
      setOptimisticUpdates(prev => {
        const updated = { ...prev };
        delete updated[alertId];
        return updated;
      });
    }
  }, [toggleStatus, refetch]);

  const handleDeleteAlert = useCallback(async (alertId: string) => {
    try {
      await deleteAlertAPI(alertId);
      refetch();
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  }, [deleteAlertAPI, refetch]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Price Alerts
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Manage your price tracking alerts
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-2">
        {['all', 'active', 'triggered'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter as typeof activeFilter)}
            className="px-4 py-2 text-sm rounded-lg font-medium transition-all"
            style={{
              backgroundColor:
                activeFilter === filter ? 'var(--accent)' : 'var(--card-background)',
              color: activeFilter === filter ? 'white' : 'var(--text-primary)',
              border: `1px solid ${activeFilter === filter ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Alerts Table */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{
          backgroundColor: 'var(--card-background)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="border-b"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--background)',
                }}
              >
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Product
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Alert Condition
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Status
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Toggle
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="border-b hover:bg-opacity-50 transition-colors"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor:
                        alert.status === 'Triggered'
                          ? 'rgba(16, 185, 129, 0.03)'
                          : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (alert.status !== 'Triggered') {
                        e.currentTarget.style.backgroundColor = 'var(--background)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (alert.status !== 'Triggered') {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={alert.product.image}
                          alt={alert.product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <div
                            className="text-sm font-medium"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {alert.product.name}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Current: ${alert.product.currentPrice}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {alert.condition}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Target: ${alert.targetPrice}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor:
                            alert.status === 'Triggered'
                              ? 'rgba(16, 185, 129, 0.1)'
                              : 'rgba(37, 99, 235, 0.1)',
                          color:
                            alert.status === 'Triggered' ? 'var(--success)' : 'var(--accent)',
                        }}
                      >
                        {alert.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(optimisticUpdates[alert.id] || alert.status) === 'Active'}
                          onChange={() => handleToggleAlert(alert.id, alert.status)}
                          disabled={toggleLoading}
                          className="sr-only peer"
                        />
                        <div
                          className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                          style={{
                            backgroundColor:
                              (optimisticUpdates[alert.id] || alert.status) === 'Active' ? 'var(--accent)' : 'var(--border)',
                            opacity: toggleLoading ? 0.5 : 1,
                            cursor: toggleLoading ? 'not-allowed' : 'pointer',
                          }}
                        ></div>
                      </label>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/product/${alert.productId}`}
                          className="text-sm font-medium flex items-center gap-1 hover:opacity-70 transition-opacity"
                          style={{ color: 'var(--accent)' }}
                        >
                          View
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={() => handleDeleteAlert(alert.id)}
                          disabled={deleteLoading}
                          className="p-1 hover:opacity-70 transition-opacity"
                          style={{ 
                            color: 'var(--danger)',
                            opacity: deleteLoading ? 0.5 : 1,
                            cursor: deleteLoading ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      No alerts found
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
