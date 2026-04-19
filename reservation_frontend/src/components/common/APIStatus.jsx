import React, { useState, useEffect } from 'react';
import { Badge, Alert, Button, Spinner } from 'react-bootstrap';
import api from '../../services/api';

const APIStatus = ({ showDetails = false }) => {
  const [status, setStatus] = useState('checking');
  const [lastCheck, setLastCheck] = useState(null);
  const [error, setError] = useState(null);
  const [responseTime, setResponseTime] = useState(null);

  const checkAPIStatus = async () => {
    const startTime = Date.now();
    
    try {
      setStatus('checking');
      setError(null);
      
      const response = await api.get('/health/', { timeout: 5000 });
      const endTime = Date.now();
      
      if (response.data.status === 'healthy') {
        setStatus('healthy');
        setResponseTime(endTime - startTime);
      } else {
        setStatus('unhealthy');
        setError('API reporting unhealthy status');
      }
    } catch (error) {
      const endTime = Date.now();
      setStatus('error');
      setError(error.message);
      setResponseTime(endTime - startTime);
    } finally {
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkAPIStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkAPIStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = () => {
    switch (status) {
      case 'healthy':
        return <Badge bg="success">Connected</Badge>;
      case 'checking':
        return <Badge bg="warning">
          <Spinner as="span" animation="border" size="sm" /> Checking...
        </Badge>;
      case 'error':
        return <Badge bg="danger">Disconnected</Badge>;
      case 'unhealthy':
        return <Badge bg="warning">Issues</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'checking':
        return 'warning';
      case 'error':
        return 'danger';
      case 'unhealthy':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const formatLastCheck = () => {
    if (!lastCheck) return 'Never';
    
    const now = new Date();
    const diff = now - lastCheck;
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  if (!showDetails) {
    return (
      <div className="api-status">
        {getStatusBadge()}
      </div>
    );
  }

  return (
    <div className="api-status-details">
      <Alert variant={getStatusColor()} className="d-flex align-items-center">
        <div className="flex-grow-1">
          <div className="d-flex align-items-center mb-2">
            <h6 className="mb-0 me-2">API Status</h6>
            {getStatusBadge()}
          </div>
          
          {status === 'healthy' && (
            <div>
              <small className="text-muted">
                Backend is running normally
                {responseTime && ` (${responseTime}ms response time)`}
              </small>
            </div>
          )}
          
          {status === 'checking' && (
            <div>
              <small className="text-muted">
Checking backend connection...
              </small>
            </div>
          )}
          
          {status === 'error' && (
            <div>
              <small className="text-danger">
Cannot connect to backend
              </small>
              {error && (
                <div className="mt-1">
                  <small>Error: {error}</small>
                </div>
              )}
            </div>
          )}
          
          {status === 'unhealthy' && (
            <div>
              <small className="text-warning">
Backend is running but reporting issues
              </small>
            </div>
          )}
          
          <div className="mt-2">
            <small className="text-muted">
              Last checked: {formatLastCheck()}
            </small>
          </div>
        </div>
        
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={checkAPIStatus}
          disabled={status === 'checking'}
        >
          {status === 'checking' ? (
            <Spinner as="span" animation="border" size="sm" />
          ) : (
            'Refresh'
          )}
        </Button>
      </Alert>
      
      {/* Additional connection info */}
      {showDetails && (
        <div className="mt-3">
          <h6>Connection Details</h6>
          <table className="table table-sm">
            <tbody>
              <tr>
                <td>API Base URL:</td>
                <td>
                  <code>{api.defaults.baseURL}</code>
                </td>
              </tr>
              <tr>
                <td>Authentication:</td>
                <td>
                  {api.defaults.headers.Authorization ? (
                    <Badge bg="success">Configured</Badge>
                  ) : (
                    <Badge bg="warning">Not configured</Badge>
                  )}
                </td>
              </tr>
              <tr>
                <td>User Agent:</td>
                <td>
                  <small className="text-muted">{navigator.userAgent}</small>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default APIStatus;
