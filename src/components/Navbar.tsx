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
import { LogOut, User, BookOpen, Menu, X } from 'lucide-react';

interface NavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-cyan-500/20 sticky top-0 z-40 shadow-lg shadow-cyan-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Menu toggle and logo for mobile */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200 lg:hidden"
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <Link to='/' className="flex items-center space-x-3 group lg:hidden ml-3">
              <div className="relative">
                <BookOpen className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300" />
                <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg group-hover:bg-cyan-300/30 transition-all duration-300"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Edutainverse
              </span>
            </Link>
          </div>

          {/* Right side - Auth Buttons */}
          <div className="flex items-center space-x-4">
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
      </div>
    </nav>
  );
};

export default Navbar;