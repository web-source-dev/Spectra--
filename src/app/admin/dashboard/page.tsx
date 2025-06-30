'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '../../../services/api';
import { AdminDashboardData, AdminSubmission, AdminOrder, AdminSubscription } from '../../../types';

type ModalItem = (AdminSubmission | AdminOrder | AdminSubscription) & { type: 'submission' | 'order' | 'subscription' };

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'submissions' | 'orders' | 'subscriptions'>('submissions');
  const [selectedItem, setSelectedItem] = useState<ModalItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'delete'>('view');
  const router = useRouter();

  // Custom styles for better button appearance
  const buttonStyles = {
    actionButton: {
      minWidth: '32px',
      padding: '4px 8px',
      border: '1px solid',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      margin: '0 1px'
    }
  };

  const checkAuthAndLoadData = useCallback(async () => {
    const authToken = localStorage.getItem('spectra_admin_auth');
    
    if (!authToken) {
      router.push('/admin/login');
      return;
    }

    try {
      const isValid = await apiService.verifyAdminToken(authToken);
      if (!isValid.valid) {
        localStorage.removeItem('spectra_admin_auth');
        router.push('/admin/login');
        return;
      }

      await loadDashboardData(authToken);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('spectra_admin_auth');
      router.push('/admin/login');
    }
  }, [router]);

  useEffect(() => {
    checkAuthAndLoadData();
  }, [checkAuthAndLoadData]);

  // Add keyboard support for modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showModal) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const loadDashboardData = async (token: string) => {
    try {
      setLoading(true);
      console.log('Loading admin dashboard data with token:', token);
      const dashboardData = await apiService.getAdminDashboardData(token);
      console.log('Received dashboard data:', dashboardData);
      setData(dashboardData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('spectra_admin_auth');
    router.push('/admin/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
      case 'failed':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const handleView = (item: AdminSubmission | AdminOrder | AdminSubscription, type: 'submission' | 'order' | 'subscription') => {
    setSelectedItem({ ...item, type } as ModalItem);
    setModalType('view');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        fontSize: '1.5rem',
        color: '#007bff',
        fontWeight: 700
      }}>
        Loading Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning" role="alert">
          No data available.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
    }}>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-success">
        <div className="container">
          <div className="navbar-brand d-flex align-items-center">
            <img 
              src="https://static.wixstatic.com/media/bb6757_10a18cb451534e60a77f266c95fa3657~mv2.jpg" 
              alt="Spectra Metals Logo" 
              style={{ height: '40px', marginRight: '15px' }}
            />
            <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>Admin Dashboard</span>
          </div>
          <div className="navbar-nav ms-auto">
            <button 
              className="btn btn-outline-light" 
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-4 mb-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Total Submissions
                </h5>
                <h2 className="card-text">{data?.submissions?.length || 0}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-cart-check me-2"></i>
                  Total Orders
                </h5>
                <h2 className="card-text">{data?.orders?.length || 0}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card bg-info text-white">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-credit-card me-2"></i>
                  Active Subscriptions
                </h5>
                <h2 className="card-text">
                  {data?.subscriptions?.filter(sub => sub.status === 'active').length || 0}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'submissions' ? 'active' : ''}`}
              onClick={() => setActiveTab('submissions')}
            >
              <i className="bi bi-file-earmark-text me-2"></i>
              Submissions ({data?.submissions?.length || 0})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <i className="bi bi-cart-check me-2"></i>
              Orders ({data?.orders?.length || 0})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'subscriptions' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscriptions')}
            >
              <i className="bi bi-credit-card me-2"></i>
              Subscriptions ({data?.subscriptions?.length || 0})
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <div className="tab-pane fade show active">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Recent Submissions</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>SKU</th>
                          <th>Metal</th>
                          <th>Grams</th>
                          <th>Action</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.submissions?.map((submission: AdminSubmission) => (
                          <tr key={submission._id}>
                            <td>{submission.id}</td>
                            <td>{submission.name}</td>
                            <td>{submission.email}</td>
                            <td>{submission.sku || 'N/A'}</td>
                            <td>{submission.metal}</td>
                            <td>{submission.grams}g</td>
                            <td>
                              <span className={`badge bg-${submission.action === 'buy' ? 'success' : submission.action === 'sell' ? 'danger' : 'warning'}`}>
                                {submission.action}
                              </span>
                            </td>
                            <td>{formatDate(submission.timestamp)}</td>
                            <td>
                              <div className="btn-group" role="group" style={{ gap: '2px' }}>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleView(submission, 'submission')}
                                  title="View Details"
                                  style={buttonStyles.actionButton}
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )) || (
                          <tr>
                            <td colSpan={9} className="text-center text-muted">No submissions found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="tab-pane fade show active">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Recent Orders</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Customer</th>
                          <th>Email</th>
                          <th>Metal</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Payment</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.orders?.map((order: AdminOrder) => (
                          <tr key={order._id}>
                            <td>{order.orderNumber}</td>
                            <td>{order.name}</td>
                            <td>{order.email}</td>
                            <td>{order.metal}</td>
                            <td>{order.calculatedPrice}</td>
                            <td>
                              <span className={`badge bg-${getStatusBadgeColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td>
                              <span className={`badge bg-${getStatusBadgeColor(order.paymentStatus)}`}>
                                {order.paymentStatus}
                              </span>
                            </td>
                            <td>{formatDate(order.createdAt)}</td>
                            <td>
                              <div className="btn-group" role="group" style={{ gap: '2px' }}>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleView(order, 'order')}
                                  title="View Details"
                                  style={buttonStyles.actionButton}
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )) || (
                          <tr>
                            <td colSpan={9} className="text-center text-muted">No orders found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscriptions Tab */}
          {activeTab === 'subscriptions' && (
            <div className="tab-pane fade show active">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Active Subscriptions</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Email</th>
                          <th>SKU</th>
                          <th>Plan</th>
                          <th>Status</th>
                          <th>Next Payment</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.subscriptions?.map((subscription: AdminSubscription) => (
                          <tr key={subscription._id}>
                            <td>{subscription.product?.name || 'N/A'}</td>
                            <td>{subscription.email}</td>
                            <td>{subscription.sku}</td>
                            <td>
                              <span className={`badge bg-${subscription.plan === 'monthly' ? 'primary' : 'info'}`}>
                                {subscription.plan}
                              </span>
                            </td>
                            <td>
                              <span className={`badge bg-${getStatusBadgeColor(subscription.status)}`}>
                                {subscription.status}
                              </span>
                            </td>
                            <td>{formatDate(subscription.currentPeriodEnd)}</td>
                            <td>{formatDate(subscription.createdAt)}</td>
                            <td>
                              <div className="btn-group" role="group" style={{ gap: '2px' }}>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleView(subscription, 'subscription')}
                                  title="View Details"
                                  style={buttonStyles.actionButton}
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )) || (
                          <tr>
                            <td colSpan={8} className="text-center text-muted">No subscriptions found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for View/Delete */}
      {showModal && selectedItem && (
        <>
          <div 
            className="modal fade show" 
            style={{ display: 'block', zIndex: 1050 }} 
            tabIndex={-1}
            onClick={closeModal}
          >
            <div 
              className="modal-dialog modal-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {modalType === 'view' ? 'View Details' : 'Confirm Delete'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                  ></button>
                </div>
                <div className="modal-body">
                  {modalType === 'view' ? (
                    <div>
                      <h6 className="text-capitalize mb-3">{selectedItem.type} Details</h6>
                      <div className="row">
                        {Object.entries(selectedItem).map(([key, value]) => {
                          if (key === '_id' || key === 'type') return null;
                          if (typeof value === 'object' && value !== null) {
                            return (
                              <div key={key} className="col-md-6 mb-2">
                                <strong>{key}:</strong>
                                <pre className="small bg-light p-2 mt-1 rounded">
                                  {JSON.stringify(value, null, 2)}
                                </pre>
                              </div>
                            );
                          }
                          return (
                            <div key={key} className="col-md-6 mb-2">
                              <strong>{key}:</strong> {String(value)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="modal-footer">
                  {modalType === 'delete' && (
                    <>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {modalType === 'view' && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeModal}
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div 
            style={{ zIndex: 1040, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          ></div>
        </>
      )}
    </div>
  );
} 