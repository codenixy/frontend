import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, BookOpen, ShoppingCart, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBasedLinks = () => {
    if (!user) return null;

    switch (user.role) {
      case 'student':
        return (
          <>
            <Link to="/student" className="text-cyan-200/80 hover:text-cyan-300 transition-colors duration-200 font-medium">
              Dashboard
            </Link>
            <Link to="/courses" className="text-cyan-200/80 hover:text-cyan-300 transition-colors duration-200 font-medium">
              Courses
            </Link>
            <Link to="/my-learning" className="text-cyan-200/80 hover:text-cyan-300 transition-colors duration-200 font-medium">
              My Learning
            </Link>
            <Link to="/cart" className="text-cyan-200/80 hover:text-cyan-300 transition-colors duration-200 relative">
              <ShoppingCart className="w-5 h-5" />
            </Link>
          </>
        );
      case 'educator':
        return (
          <>
            <Link to="/educator" className="text-cyan-200/80 hover:text-cyan-300 transition-colors duration-200 font-medium">
              Dashboard
            </Link>
            <Link to="/educator/courses" className="text-cyan-200/80 hover:text-cyan-300 transition-colors duration-200 font-medium">
              My Courses
            </Link>
            <Link to="/educator/add-course" className="text-cyan-200/80 hover:text-cyan-300 transition-colors duration-200 font-medium">
              Create Course
            </Link>
            <Link to="/educator/students" className="text-cyan-200/80 hover:text-cyan-300 transition-colors duration-200 font-medium">
              Students
            </Link>
          </>
        );
      case 'admin':
        return (
          <>
            <Link to="/admin" className="text-cyan-200/80 hover:text-cyan-300 transition-colors duration-200 font-medium">
              Dashboard
            </Link>
            <Link to="/admin/students" className="text-cyan-200/80 hover:text-cyan-300 transition-colors duration-200 font-medium">
              Students
            </Link>
            <Link to="/admin/educators" className="text-cyan-200/80 hover:text-cyan-300 transition-colors duration-200 font-medium">
              Educators
            </Link>
            <Link to="/admin/courses" className="text-cyan-200/80 hover:text-cyan-300 transition-colors duration-200 font-medium">
              Courses
            </Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-cyan-500/20 sticky top-0 z-50 shadow-lg shadow-cyan-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to='/' className="flex items-center space-x-3 group">
            <div className="relative">
              <BookOpen className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300" />
              <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg group-hover:bg-cyan-300/30 transition-all duration-300"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Edutainverse
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {!user && (
              <Link to="/courses" className="text-cyan-200/80 hover:text-cyan-300 transition-colors duration-200 font-medium">
                Courses
              </Link>
            )}
            {getRoleBasedLinks()}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {!user ? (
              <div className="hidden md:flex items-center space-x-4">
                <Button variant="ghost" asChild className="text-cyan-200 hover:text-cyan-300 hover:bg-cyan-500/10">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white border-0">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-cyan-500/10">
                    <Avatar className="h-10 w-10 border-2 border-cyan-400/30">
                      <AvatarImage
                        src={user.profileImage ? user.profileImage : undefined}
                        alt={user.name}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
                        {user.name ? user.name.charAt(0) : ''}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-slate-800/95 backdrop-blur-xl border-cyan-500/20 text-white" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-cyan-200">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-cyan-200/60">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-cyan-500/20" />
                  <DropdownMenuItem asChild className="text-cyan-200 hover:bg-cyan-500/10 focus:bg-cyan-500/10">
                    <Link to={`/${user.role}/profile`} className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-cyan-500/20" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-cyan-500/20">
            <div className="flex flex-col space-y-4">
              {!user && (
                <Link to="/courses" className="text-cyan-200/80 hover:text-cyan-300 transition-colors duration-200 font-medium">
                  Courses
                </Link>
              )}
              {getRoleBasedLinks()}
              {!user && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-cyan-500/20">
                  <Button variant="ghost" asChild className="text-cyan-200 hover:text-cyan-300 hover:bg-cyan-500/10 justify-start">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white border-0 justify-start">
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;