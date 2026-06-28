import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Signup from './Signup';
import Login from './Login';
import Home from './Home';
import PropertyDetails from './PropertyDetails';
import Profile from './Profile'; // ── IMPORT THE NEW PROFILE PAGE ──
import Footer from './Footer';

import axios from 'axios';

export default function App() {
  // ── Route & Auth State ──
  const [route, setRoute] = useState('loading');
  const [isAuth, setIsAuth] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  // ── New State for Property ID ──
  const [selectedPropertyId, setSelectedPropertyId] = useState(null); 

  // ── Check Auth on Mount ──
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('https://voya-backend-cmoy.onrender.com/api/user/details', {
          withCredentials: true
        });
        setIsAuth(true);
        setUserProfile(response.data.user);
        setRoute('home');
      } catch (error) {
        setIsAuth(false);
        setUserProfile(null);
        setRoute('login');
      }
    };

    checkAuth();
  }, []);

  // ── Shared Logout Function ──
  const handleLogout = async () => {
    try {
      await axios.post('https://voya-backend-cmoy.onrender.com/api/user/logout', {}, {
        withCredentials: true
      }); 
    } catch (err) {
      console.error("Failed to log out cleanly", err);
    }
    setIsAuth(false);
    setUserProfile(null);
    setRoute('login');
    setSelectedPropertyId(null);
  };

  // ── Central Navigation Hub ──
  const handleNavigation = async (e) => {
    const target = e.target.closest('a');
    if (target) {
      const href = target.getAttribute('href');
      
      // Ignore external links
      if (!href || href.startsWith('http')) return;

      e.preventDefault(); 
      
      // 1. Handle standard routes (Added /profile here)
      if (href === '/login' || href === '/signup' || href === '/home' || href === '/' || href === '/profile') {
        const newRoute = href === '/' ? 'home' : href.replace('/', '');
        setRoute(newRoute);
        setSelectedPropertyId(null);
      }
      
      // 2. Handle Property Details route
      else if (href.startsWith('/property/')) {
        const propertyId = href.split('/')[2]; 
        setSelectedPropertyId(propertyId);
        setRoute('property');
      }
      
      // 3. Handle Logging out
      else if (href === '/logout') {
        handleLogout();
      }
    }
  };

  // Construct the full name dynamically
  const dynamicMemberName = userProfile 
    ? `${userProfile.firstname} ${userProfile.lastname}` 
    : "Guest User";

  // Show a blank screen (or a spinner) while checking the cookie on first load
  if (route === 'loading') {
    return <div className="min-h-screen bg-[#0C0E14]" />;
  }

  return (
    <div 
      onClick={handleNavigation} 
      className="min-h-screen transition-colors duration-300 bg-[#FAF8F4] dark:bg-[#0C0E14]"
    >
      {/* ── PASS THE DYNAMIC NAME HERE ── */}
      <Navbar 
        isAuthenticated={isAuth} 
        memberName={dynamicMemberName} 
        activePath={route === 'home' ? '/' : `/${route}`} 
      />
      
      {/* ── Dynamic Route Rendering ── */}
      {route === 'login' && <Login />}
      {route === 'signup' && <Signup />}
      {route === 'home' && <Home userProfile={userProfile} />}
      {route === 'property' && <PropertyDetails propertyId={selectedPropertyId} />}
      
      {/* ── Render Profile Page ── */}
      {route === 'profile' && (
        <Profile 
          userProfile={userProfile} 
          onProfileUpdate={setUserProfile} 
          onLogout={handleLogout}
        />
      )}

      {/* ── ONLY SHOW FOOTER IF NOT ON AUTH PAGES ── */}
      {route !== 'login' && route !== 'signup' && <Footer />}
    </div>
  );
}