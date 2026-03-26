import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import LandingPage from './components/LandingPage';
import { User } from './types';

// A mock user for guest access. All data will be stored under this user's ID in Firestore.
const guestUser: User = {
  uid: 'guest_user_001', // A unique ID for the guest user
  email: 'guest@finsight.ai',
};

const Site: React.FC = () => {
  const [showApp, setShowApp] = useState(false);

  if (showApp) {
    return (
      <BrowserRouter>
        <App user={guestUser} />
      </BrowserRouter>
    );
  }
  
  return <LandingPage onLaunchApp={() => setShowApp(true)} />;
};

export default Site;
