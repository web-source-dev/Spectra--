'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [errorData, setErrorData] = useState({
    message: 'Something went wrong!',
    status: 500,
    stack: ''
  });

  useEffect(() => {
    // Get error data from URL parameters
    const message = searchParams.get('message') || 'Something went wrong!';
    const status = parseInt(searchParams.get('status') || '500');
    const stack = searchParams.get('stack') || '';

    setErrorData({
      message,
      status,
      stack
    });
  }, [searchParams]);

  const getErrorIcon = (status: number) => {
    if (status >= 500) {
      return 'bi-exclamation-triangle-fill text-danger';
    } else if (status >= 400) {
      return 'bi-exclamation-circle-fill text-warning';
    } else {
      return 'bi-info-circle-fill text-info';
    }
  };

  const getErrorTitle = (status: number) => {
    switch (status) {
      case 404:
        return 'Page Not Found';
      case 403:
        return 'Access Forbidden';
      case 401:
        return 'Unauthorized Access';
      case 500:
        return 'Internal Server Error';
      default:
        return 'Error Occurred';
    }
  };

  const getErrorDescription = (status: number) => {
    switch (status) {
      case 404:
        return 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.';
      case 403:
        return 'You do not have permission to access this resource. Please contact support if you believe this is an error.';
      case 401:
        return 'You need to be authenticated to access this resource. Please log in and try again.';
      case 500:
        return 'Something went wrong on our end. We are working to fix this issue. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
    }
  };

  return (
    <div className="container mt-5">
      <div className="text-center mb-4">
        <img 
          src="https://static.wixstatic.com/media/bb6757_10a18cb451534e60a77f266c95fa3657~mv2.jpg" 
          alt="Logo" 
          className="img-fluid" 
          style={{ height: '120px', maxWidth: '200px', borderRadius: '10px', mixBlendMode: 'difference' }}
        />
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body text-center p-5">
              <div className="mb-4">
                <i className={`bi ${getErrorIcon(errorData.status)}`} style={{ fontSize: '4rem' }}></i>
              </div>
              
              <h1 className="h2 mb-3">{getErrorTitle(errorData.status)}</h1>
              <h2 className="h4 text-muted mb-4">Error {errorData.status}</h2>
              
              <div className="alert alert-light mb-4">
                <p className="mb-0">{errorData.message}</p>
              </div>
              
              <p className="text-muted mb-4">
                {getErrorDescription(errorData.status)}
              </p>

              {process.env.NODE_ENV === 'development' && errorData.stack && (
                <div className="mb-4">
                  <details className="text-start">
                    <summary className="btn btn-outline-secondary btn-sm">
                      Show Technical Details
                    </summary>
                    <pre className="mt-2 p-3 bg-light rounded" style={{ fontSize: '0.8rem', overflow: 'auto' }}>
                      {errorData.stack}
                    </pre>
                  </details>
                </div>
              )}

              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <button 
                  className="btn btn-primary me-md-2" 
                  onClick={() => router.push('/')}
                >
                  <i className="bi bi-house-fill me-2"></i>
                  Go to Homepage
                </button>
                
                <button 
                  className="btn btn-outline-secondary" 
                  onClick={() => router.back()}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Go Back
                </button>
              </div>

              <div className="mt-4 pt-4 border-top">
                <p className="text-muted small mb-2">Need help? Contact our support team:</p>
                <div className="d-flex justify-content-center gap-3">
                  <a href="mailto:support@spectrametal.com" className="text-decoration-none">
                    <i className="bi bi-envelope-fill me-1"></i>
                    support@spectrametal.com
                  </a>
                  <a href="tel:+18005551234" className="text-decoration-none">
                    <i className="bi bi-telephone-fill me-1"></i>
                    1-800-555-1234
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Help Section */}
      <div className="row justify-content-center mt-5">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-question-circle-fill me-2"></i>
                Common Solutions
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>For 404 Errors:</h6>
                  <ul className="list-unstyled">
                    <li><i className="bi bi-check-circle-fill text-success me-2"></i>Check the URL spelling</li>
                    <li><i className="bi bi-check-circle-fill text-success me-2"></i>Use the navigation menu</li>
                    <li><i className="bi bi-check-circle-fill text-success me-2"></i>Try refreshing the page</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>For 500 Errors:</h6>
                  <ul className="list-unstyled">
                    <li><i className="bi bi-check-circle-fill text-success me-2"></i>Wait a few minutes and try again</li>
                    <li><i className="bi bi-check-circle-fill text-success me-2"></i>Clear your browser cache</li>
                    <li><i className="bi bi-check-circle-fill text-success me-2"></i>Contact support if persistent</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorFallback() {
  return (
    <div className="container mt-5">
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading error details...</p>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<ErrorFallback />}>
      <ErrorContent />
    </Suspense>
  );
} 