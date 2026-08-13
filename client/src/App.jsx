import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Explore from './pages/Explore';
import CreatePost from './pages/CreatePost';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import PostDetails from './pages/PostDetails';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';

// ScrollToTop – resets window scroll position to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

const ROUTE_INDEXES = {
  '/': 0,
  '/explore': 0,
  '/create-post': 1,
  '/messages': 2,
  '/profile': 3
};

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const [slideDirection, setSlideDirection] = React.useState('slide-from-right');
  const prevIndexRef = React.useRef(ROUTE_INDEXES[location.pathname] ?? 0);

  React.useEffect(() => {
    const currentIndex = ROUTE_INDEXES[location.pathname] ?? 0;
    const prevIndex = prevIndexRef.current;

    if (currentIndex > prevIndex) {
      setSlideDirection('slide-from-right');
    } else if (currentIndex < prevIndex) {
      setSlideDirection('slide-from-left');
    }
    prevIndexRef.current = currentIndex;
  }, [location.pathname]);

  return (
    <div className={`App ${isAdminRoute ? 'admin-app' : 'user-app'}`}>
      {!isAdminRoute && <Header />}
      <ScrollToTop />
      <main className={`page-transition-wrapper ${slideDirection}`} key={location.pathname}>
        <Routes location={location}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/post/:id" element={<PostDetails />} />
          
          {/* Protected Routes (Requires Login) */}
          <Route 
            path="/create-post" 
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/messages" 
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
      {!isAdminRoute && <Navbar />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
