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
import { LogOut, User, BookOpen, ShoppingCart } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
            <Link to="/student" className="text-gray-700 hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link to="/courses" className="text-gray-700 hover:text-blue-600 transition-colors">
              Courses
            </Link>
            <Link to="/my-learning" className="text-gray-700 hover:text-blue-600 transition-colors">
              My Learning
            </Link>
            <Link to="/cart" className="text-gray-700 hover:text-blue-600 transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
            </Link>
          </>
        );
      case 'educator':
        return (
          <>
            <Link to="/educator" className="text-gray-700 hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link to="/educator/courses" className="text-gray-700 hover:text-blue-600 transition-colors">
              My Courses
            </Link>
            <Link to="/educator/add-course" className="text-gray-700 hover:text-blue-600 transition-colors">
              Create Course
            </Link>
            <Link to="/educator/students" className="text-gray-700 hover:text-blue-600 transition-colors">
              Students
            </Link>
          </>
        );
      case 'admin':
        return (
          <>
            <Link to="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link to="/admin/students" className="text-gray-700 hover:text-blue-600 transition-colors">
              Students
            </Link>
            <Link to="/admin/educators" className="text-gray-700 hover:text-blue-600 transition-colors">
              Educators
            </Link>
            <Link to="/admin/courses" className="text-gray-700 hover:text-blue-600 transition-colors">
              Courses
            </Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to= '/' className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Edutainverse</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {!user && (
              <Link to="/courses" className="text-gray-700 hover:text-blue-600 transition-colors">
                Courses
              </Link>
            )}
            {getRoleBasedLinks()}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user.profileImage ? user.profileImage : undefined}
                        alt={user.name}
                      />
                      <AvatarFallback>
                        {user.name ? user.name.charAt(0) : ''}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/${user.role}/profile`} className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
