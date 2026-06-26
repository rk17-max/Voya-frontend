import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Signup from './Signup';
import Login from './Login';
import Home from './Home';
import PropertyDetails from './PropertyDetails';

import axios from 'axios'
export default function App() {
  // ── Route & Auth State ──
  // Default to a loading state while we check the cookie
  const [route, setRoute] = useState('loading');
  const [isAuth, setIsAuth] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  // ── New State for Property ID ──
  const [selectedPropertyId, setSelectedPropertyId] = useState(null); 

  // ── Check Auth on Mount ──
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // We will create this endpoint next! 
        // It reads the HTTP-only cookie and returns the user's profile.
        const response = await axios.get('http://localhost:5000/api/user/details', {
          withCredentials: true
        });
        setIsAuth(true);
        // Assuming your backend returns { success: true, user: { firstname, lastname, ... } }
        setUserProfile(response.data.user);
        
        // If they are logged in, send them to home!
        setRoute('home');
      } catch (error) {
        // If the request fails (no cookie, expired token, etc.), they are not logged in.
        setIsAuth(false);
        setUserProfile(null);
        setRoute('login');
      }
    };

    checkAuth();
  }, []);

  // ── Central Navigation Hub ──
  const handleNavigation = async (e) => {
    const target = e.target.closest('a');
    if (target) {
      const href = target.getAttribute('href');
      
      // Ignore external links
      if (!href || href.startsWith('http')) return;

      e.preventDefault(); 
      
      // 1. Handle standard routes
      if (href === '/login' || href === '/signup' || href === '/home' || href === '/') {
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
        try {
          // Call the backend to clear the cookie
          await axios.post('http://localhost:5000/api/user/logout', {}, {
            withCredentials: true
          }); 
        } catch (err) {
          console.error("Failed to log out cleanly", err);
        }
        setIsAuth(false);
        setUserProfile(null);
        setRoute('login');
        setSelectedPropertyId(null);
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

    </div>
  );
}