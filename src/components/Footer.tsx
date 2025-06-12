import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900/95 backdrop-blur-xl border-t border-cyan-500/20 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <BookOpen className="w-10 h-10 text-cyan-400" />
                <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                EduFlow
              </span>
            </div>
            <p className="text-cyan-200/80 mb-6 max-w-md leading-relaxed">
              Empowering learners worldwide with cutting-edge online education. 
              Join thousands of students and educators in our futuristic learning community.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-cyan-500/20 transition-all duration-300 group">
                <Github className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-cyan-500/20 transition-all duration-300 group">
                <Twitter className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-cyan-500/20 transition-all duration-300 group">
                <Linkedin className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-cyan-500/20 transition-all duration-300 group">
                <Mail className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/courses" className="text-cyan-200/80 hover:text-cyan-300 transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-cyan-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-cyan-200/80 hover:text-cyan-300 transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-cyan-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-cyan-200/80 hover:text-cyan-300 transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-cyan-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-cyan-200/80 hover:text-cyan-300 transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-cyan-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-cyan-200/80 hover:text-cyan-300 transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-cyan-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-cyan-200/80 hover:text-cyan-300 transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-cyan-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-cyan-200/80 hover:text-cyan-300 transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-cyan-400 rounded-full mr-3 group-hover:w-2 transition-all duration-200"></span>
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cyan-500/20 mt-12 pt-8 text-center">
          <p className="text-cyan-200/60">
            © 2024 EduFlow. All rights reserved. Built with ❤️ for learners everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;