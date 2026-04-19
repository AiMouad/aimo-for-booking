import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, Building2, CreditCard, Shield, Check, 
  AlertCircle, Crown, Zap, Star, Settings, Bell, Lock,
  Eye, EyeOff, Save, Plus, X, ArrowRight
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuthUser } from '../../store/authSlice';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import './OwnerSettingsPage.css';

const OwnerSettingsPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);
  
  const [activeTab, setActiveTab] = useState('account');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState(null);
  
  const [accountData, setAccountData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    companyName: user?.company_name || '',
    businessAddress: user?.business_address || '',
    taxId: user?.tax_id || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const subscriptionPlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 0,
      features: [
        'Up to 5 properties',
        'Basic analytics',
        'Email support',
        'Standard booking management'
      ],
      current: user?.subscription_plan === 'basic'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 29.99,
      features: [
        'Up to 25 properties',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
        'Advanced booking features',
        'API access'
      ],
      current: user?.subscription_plan === 'professional',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99.99,
      features: [
        'Unlimited properties',
        'White-label solution',
        'Dedicated support',
        'Custom integrations',
        'Advanced security',
        'Full API access',
        'Priority updates'
      ],
      current: user?.subscription_plan === 'enterprise'
    }
  ];

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, American Express'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: Shield,
      description: 'Fast and secure PayPal payments'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: Building2,
      description: 'Direct bank transfer for enterprise plans'
    }
  ];

  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Account information updated successfully!');
    } catch (error) {
      toast.error('Failed to update account information');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpgradePlan = (plan) => {
    setUpgradePlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (paymentMethod) => {
    setIsSaving(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Successfully upgraded to ${upgradePlan.name} plan!`);
      setShowPaymentModal(false);
      setUpgradePlan(null);
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="owner-settings-page">
      <div className="settings-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="settings-header"
        >
          <h1>Settings</h1>
          <p>Manage your account, subscription, and preferences</p>
        </motion.div>

        {/* Settings Navigation */}
        <div className="settings-nav">
          {[
            { id: 'account', label: 'Account', icon: User },
            { id: 'subscription', label: 'Subscription', icon: Crown },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'notifications', label: 'Notifications', icon: Bell },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Account Settings */}
        {activeTab === 'account' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="settings-content"
          >
            <form onSubmit={handleAccountUpdate} className="account-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={accountData.firstName}
                    onChange={(e) => setAccountData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={accountData.lastName}
                    onChange={(e) => setAccountData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter your last name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={accountData.email}
                    onChange={(e) => setAccountData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={accountData.phone}
                    onChange={(e) => setAccountData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+213 123 456 789"
                  />
                </div>
                
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    value={accountData.companyName}
                    onChange={(e) => setAccountData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Your company name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Business Address</label>
                  <input
                    type="text"
                    value={accountData.businessAddress}
                    onChange={(e) => setAccountData(prev => ({ ...prev, businessAddress: e.target.value }))}
                    placeholder="Your business address"
                  />
                </div>
                
                <div className="form-group">
                  <label>Tax ID</label>
                  <input
                    type="text"
                    value={accountData.taxId}
                    onChange={(e) => setAccountData(prev => ({ ...prev, taxId: e.target.value }))}
                    placeholder="Your tax identification number"
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                variant="primary"
                disabled={isSaving}
                className="save-button"
              >
                {isSaving ? (
                  <>
                    <div className="btn-spinner"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        )}

        {/* Subscription Settings */}
        {activeTab === 'subscription' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="settings-content"
          >
            <div className="current-plan">
              <h3>Current Plan</h3>
              <div className="plan-card current">
                <div className="plan-header">
                  <h4>{user?.subscription_plan?.toUpperCase() || 'BASIC'}</h4>
                  <span className="plan-price">Free</span>
                </div>
                <div className="plan-features">
                  <Check size={16} className="check-icon" />
                  <span>Basic features included</span>
                </div>
              </div>
            </div>

            <div className="upgrade-plans">
              <h3>Upgrade Your Plan</h3>
              <div className="plans-grid">
                {subscriptionPlans.filter(plan => !plan.current).map((plan) => (
                  <div key={plan.id} className={`plan-card ${plan.popular ? 'popular' : ''}`}>
                    {plan.popular && (
                      <div className="popular-badge">
                        <Zap size={14} />
                        Most Popular
                      </div>
                    )}
                    <div className="plan-header">
                      <h4>{plan.name}</h4>
                      <span className="plan-price">${plan.price}/month</span>
                    </div>
                    <div className="plan-features-list">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="feature-item">
                          <Check size={14} className="check-icon" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant={plan.popular ? 'primary' : 'outline'}
                      onClick={() => handleUpgradePlan(plan)}
                      className="upgrade-button"
                    >
                      {plan.price === 0 ? 'Get Started' : `Upgrade to ${plan.name}`}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="settings-content"
          >
            <form onSubmit={handlePasswordChange} className="security-form">
              <h3>Change Password</h3>
              
              <div className="form-group">
                <label>Current Password</label>
                <div className="password-input">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                  </div>
                </div>
              
              <div className="form-group">
                <label>New Password</label>
                <div className="password-input">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                  </div>
                </div>
              
              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="password-input">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                variant="primary"
                disabled={isSaving}
                className="save-button"
              >
                {isSaving ? (
                  <>
                    <div className="btn-spinner"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        )}

        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="settings-content"
          >
            <div className="notifications-settings">
              <h3>Notification Preferences</h3>
              
              <div className="notification-options">
                {[
                  { id: 'bookings', label: 'New Bookings', description: 'Get notified when someone books your property' },
                  { id: 'messages', label: 'Guest Messages', description: 'Receive messages from guests' },
                  { id: 'payments', label: 'Payment Updates', description: 'Updates about payments and invoices' },
                  { id: 'marketing', label: 'Marketing Emails', description: 'News, updates, and promotional offers' },
                ].map((option) => (
                  <div key={option.id} className="notification-option">
                    <div className="option-info">
                      <h4>{option.label}</h4>
                      <p>{option.description}</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked={option.id !== 'marketing'} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && upgradePlan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="payment-modal-overlay"
          onClick={() => setShowPaymentModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="payment-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Complete Your Upgrade</h3>
              <button onClick={() => setShowPaymentModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="upgrade-summary">
                <div className="plan-summary">
                  <h4>{upgradePlan.name} Plan</h4>
                  <p className="plan-price">${upgradePlan.price}/month</p>
                  <p className="billing-cycle">Billed monthly • Cancel anytime</p>
                </div>
                
                <div className="payment-methods">
                  <h5>Choose Payment Method</h5>
                  <div className="payment-options">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => handlePaymentSubmit(method)}
                        className="payment-option"
                      >
                        <method.icon size={24} />
                        <div className="payment-info">
                          <h6>{method.name}</h6>
                          <p>{method.description}</p>
                        </div>
                        <ArrowRight size={16} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default OwnerSettingsPage;
