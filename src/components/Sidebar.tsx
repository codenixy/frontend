import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  BookOpen, Users, GraduationCap, Award, Settings, 
  BarChart2, ShoppingCart, BookMarked, PlusCircle, 
  User, Home, Menu, X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

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

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile && isOpen) {
      toggleSidebar();
    }
  }, [location.pathname, isMobile]);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const renderStudentLinks = () => (
    <>
      <Link to="/student" className={`sidebar-link ${isActive('/student') ? 'active' : ''}`}>
        <Home className="w-5 h-5" />
        <span>Dashboard</span>
      </Link>
      <Link to="/courses" className={`sidebar-link ${isActive('/courses') ? 'active' : ''}`}>
        <BookOpen className="w-5 h-5" />
        <span>Browse Courses</span>
      </Link>
      <Link to="/my-learning" className={`sidebar-link ${isActive('/my-learning') ? 'active' : ''}`}>
        <BookMarked className="w-5 h-5" />
        <span>My Learning</span>
      </Link>
      <Link to="/cart" className={`sidebar-link ${isActive('/cart') ? 'active' : ''}`}>
        <ShoppingCart className="w-5 h-5" />
        <span>Cart</span>
      </Link>
      <Link to="/student/profile" className={`sidebar-link ${isActive('/student/profile') ? 'active' : ''}`}>
        <User className="w-5 h-5" />
        <span>Profile</span>
      </Link>
    </>
  );

  const renderEducatorLinks = () => (
    <>
      <Link to="/educator" className={`sidebar-link ${isActive('/educator') ? 'active' : ''}`}>
        <Home className="w-5 h-5" />
        <span>Dashboard</span>
      </Link>
      <Link to="/educator/courses" className={`sidebar-link ${isActive('/educator/courses') ? 'active' : ''}`}>
        <BookOpen className="w-5 h-5" />
        <span>My Courses</span>
      </Link>
      <Link to="/educator/add-course" className={`sidebar-link ${isActive('/educator/add-course') ? 'active' : ''}`}>
        <PlusCircle className="w-5 h-5" />
        <span>Create Course</span>
      </Link>
      <Link to="/educator/students" className={`sidebar-link ${isActive('/educator/students') ? 'active' : ''}`}>
        <Users className="w-5 h-5" />
        <span>Students</span>
      </Link>
      <Link to="/educator/profile" className={`sidebar-link ${isActive('/educator/profile') ? 'active' : ''}`}>
        <User className="w-5 h-5" />
        <span>Profile</span>
      </Link>
    </>
  );

  const renderAdminLinks = () => (
    <>
      <Link to="/admin" className={`sidebar-link ${isActive('/admin') ? 'active' : ''}`}>
        <Home className="w-5 h-5" />
        <span>Dashboard</span>
      </Link>
      <Link to="/admin/students" className={`sidebar-link ${isActive('/admin/students') ? 'active' : ''}`}>
        <Users className="w-5 h-5" />
        <span>Students</span>
      </Link>
      <Link to="/admin/educators" className={`sidebar-link ${isActive('/admin/educators') ? 'active' : ''}`}>
        <GraduationCap className="w-5 h-5" />
        <span>Educators</span>
      </Link>
      <Link to="/admin/courses" className={`sidebar-link ${isActive('/admin/courses') ? 'active' : ''}`}>
        <BookOpen className="w-5 h-5" />
        <span>Courses</span>
      </Link>
      <Link to="/admin/profile" className={`sidebar-link ${isActive('/admin/profile') ? 'active' : ''}`}>
        <User className="w-5 h-5" />
        <span>Profile</span>
      </Link>
    </>
  );

  const renderPublicLinks = () => (
    <>
      <Link to="/" className={`sidebar-link ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}>
        <Home className="w-5 h-5" />
        <span>Home</span>
      </Link>
      <Link to="/courses" className={`sidebar-link ${isActive('/courses') ? 'active' : ''}`}>
        <BookOpen className="w-5 h-5" />
        <span>Courses</span>
      </Link>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-cyan-500/20 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:static lg:z-0`}
      >
        <div className="h-full flex flex-col">
          <div className="flex-1 py-6 px-4 overflow-y-auto">
            <div className="space-y-1">
              {user ? (
                user.role === 'student' ? renderStudentLinks() :
                user.role === 'educator' ? renderEducatorLinks() :
                user.role === 'admin' ? renderAdminLinks() : renderPublicLinks()
              ) : renderPublicLinks()}
            </div>
          </div>
          
          <div className="p-4 border-t border-cyan-500/20">
            <div className="text-xs text-cyan-200/60 text-center">
              © 2024 EduFlow
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;