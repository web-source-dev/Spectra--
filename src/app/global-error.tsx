'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="container mt-5">
          <div className="text-center">
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
                    <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: '4rem' }}></i>
                  </div>
                  
                  <h1 className="h2 mb-3">Something went wrong!</h1>
                  <h2 className="h4 text-muted mb-4">Application Error</h2>
                  
                  <div className="alert alert-light mb-4">
                    <p className="mb-0">An unexpected error occurred in the application.</p>
                  </div>
                  
                  <p className="text-muted mb-4">
                    We apologize for the inconvenience. Please try refreshing the page or contact support if the problem persists.
                  </p>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                    <button 
                      className="btn btn-primary me-md-2" 
                      onClick={() => reset()}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Try Again
                    </button>
                    
                    <button 
                      className="btn btn-outline-secondary" 
                      onClick={() => window.location.href = '/'}
                    >
                      <i className="bi bi-house-fill me-2"></i>
                      Go to Homepage
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
        </div>
      </body>
    </html>
  );
} 