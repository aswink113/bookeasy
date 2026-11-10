import React, { useState } from 'react';
import IntroScreen from './screens/IntroScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import CustomerHome from './screens/CustomerHome';
import SubscriptionScreen from './screens/SubscriptionScreen';
import MerchantDashboard from './screens/MerchantDashboard';
import AdminDashboard from './screens/AdminDashboard';
import { apiService } from './services/apiService';

export default function App() {
  // Navigation router state
  // 'intro' | 'login' | 'signup' | 'customer-home' | 'subscription' | 'merchant-dashboard'
  const [currentScreen, setCurrentScreen] = useState('intro');

  const navigateTo = (screen) => {
    setCurrentScreen(screen);
  };

  const handleIntroFinish = () => {
    const user = apiService.getUser();
    if (user.token) {
      if (user.role === 'customer') {
        setCurrentScreen('customer-home');
      } else {
        setCurrentScreen('merchant-dashboard');
      }
    } else {
      setCurrentScreen('login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}>
      {currentScreen === 'intro' && <IntroScreen onFinish={handleIntroFinish} />}
      {currentScreen === 'login' && <LoginScreen onNavigate={navigateTo} />}
      {currentScreen === 'signup' && <SignupScreen onNavigate={navigateTo} />}
      {currentScreen === 'customer-home' && <CustomerHome onNavigate={navigateTo} />}
      {currentScreen === 'subscription' && <SubscriptionScreen onNavigate={navigateTo} />}
      {currentScreen === 'merchant-dashboard' && <MerchantDashboard onNavigate={navigateTo} />}
      {currentScreen === 'admin' && <AdminDashboard onNavigate={navigateTo} />}
    </div>
  );
}
