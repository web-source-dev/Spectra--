'use client';

import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

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
                <i className="bi bi-exclamation-circle-fill text-warning" style={{ fontSize: '4rem' }}></i>
              </div>
              
              <h1 className="h2 mb-3">Page Not Found</h1>
              <h2 className="h4 text-muted mb-4">Error 404</h2>
              
              <div className="alert alert-light mb-4">
                <p className="mb-0">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
              </div>
              
              <p className="text-muted mb-4">
                Please check the URL spelling or use the navigation menu to find what you&apos;re looking for.
              </p>

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
                  <h6>Check the URL:</h6>
                  <ul className="list-unstyled">
                    <li><i className="bi bi-check-circle-fill text-success me-2"></i>Verify the spelling</li>
                    <li><i className="bi bi-check-circle-fill text-success me-2"></i>Check for typos</li>
                    <li><i className="bi bi-check-circle-fill text-success me-2"></i>Ensure proper formatting</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>Try these options:</h6>
                  <ul className="list-unstyled">
                    <li><i className="bi bi-check-circle-fill text-success me-2"></i>Use the navigation menu</li>
                    <li><i className="bi bi-check-circle-fill text-success me-2"></i>Refresh the page</li>
                    <li><i className="bi bi-check-circle-fill text-success me-2"></i>Clear browser cache</li>
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