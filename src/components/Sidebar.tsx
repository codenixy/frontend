import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen, Users, GraduationCap, ShoppingCart, Home, 
  BookMarked, Award, Settings, ChevronLeft, ChevronRight,
  LayoutDashboard, Library, Video, UserPlus, Sparkles
} from 'lucide-react';

type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const renderNavLinks = () => {
    // Public links (when not logged in)
    if (!user) {
      return (
        <>
          <NavItem to="/" icon={<Home />} label="Home" active={isActive('/')} />
          <NavItem to="/courses" icon={<BookOpen />} label="Courses" active={isActive('/courses')} />
          <NavItem to="/login" icon={<BookMarked />} label="Login" active={isActive('/login')} />
          <NavItem to="/signup" icon={<UserPlus />} label="Sign Up" active={isActive('/signup')} />
        </>
      );
    }

    // Student links
    if (user.role === 'student') {
      return (
        <>
          <NavItem to="/student" icon={<LayoutDashboard />} label="Dashboard" active={isActive('/student')} />
          <NavItem to="/courses" icon={<BookOpen />} label="Courses" active={isActive('/courses')} />
          <NavItem to="/my-learning" icon={<BookMarked />} label="My Learning" active={isActive('/my-learning')} />
          <NavItem to="/cart" icon={<ShoppingCart />} label="Cart" active={isActive('/cart')} />
          <NavItem to="/student/profile" icon={<Settings />} label="Profile" active={isActive('/student/profile')} />
        </>
      );
    }

    // Educator links
    if (user.role === 'educator') {
      return (
        <>
          <NavItem to="/educator" icon={<LayoutDashboard />} label="Dashboard" active={isActive('/educator')} />
          <NavItem to="/educator/courses" icon={<Library />} label="My Courses" active={isActive('/educator/courses')} />
          <NavItem to="/educator/add-course" icon={<BookOpen />} label="Create Course" active={isActive('/educator/add-course')} />
          <NavItem to="/educator/students" icon={<Users />} label="Students" active={isActive('/educator/students')} />
          <NavItem to="/educator/profile" icon={<Settings />} label="Profile" active={isActive('/educator/profile')} />
        </>
      );
    }

    // Admin links
    if (user.role === 'admin') {
      return (
        <>
          <NavItem to="/admin" icon={<LayoutDashboard />} label="Dashboard" active={isActive('/admin')} />
          <NavItem to="/admin/students" icon={<Users />} label="Students" active={isActive('/admin/students')} />
          <NavItem to="/admin/educators" icon={<GraduationCap />} label="Educators" active={isActive('/admin/educators')} />
          <NavItem to="/admin/courses" icon={<BookOpen />} label="Courses" active={isActive('/admin/courses')} />
          <NavItem to="/admin/profile" icon={<Settings />} label="Profile" active={isActive('/admin/profile')} />
        </>
      );
    }

    return null;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-cyan-500/20 z-50 transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-0 lg:w-20'
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-cyan-500/20 px-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <BookOpen className={`text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300 ${isOpen ? 'w-8 h-8' : 'w-10 h-10'}`} />
                <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg group-hover:bg-cyan-300/30 transition-all duration-300"></div>
              </div>
              {isOpen && (
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Edutainverse
                </span>
              )}
            </Link>
          </div>

          {/* Toggle button */}
          <button 
            className="absolute top-4 -right-3 w-6 h-6 bg-slate-800 border border-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 hover:text-cyan-300 transition-colors duration-200 z-50 lg:block hidden"
            onClick={toggleSidebar}
          >
            {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>

          {/* Nav items */}
          <div className="flex-1 overflow-y-auto py-6 px-4">
            <nav className="space-y-2">
              {renderNavLinks()}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-cyan-500/20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              {isOpen && (
                <div className="text-xs text-slate-400">
                  <div>Edutainverse</div>
                  <div>v1.0.0</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active }) => {
  return (
    <Link to={to}>
      <Button
        variant="ghost"
        className={`w-full justify-start mb-1 ${
          active 
            ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border-l-2 border-cyan-400' 
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <span className="mr-3">{icon}</span>
        <span>{label}</span>
      </Button>
    </Link>
  );
};

export default Sidebar;