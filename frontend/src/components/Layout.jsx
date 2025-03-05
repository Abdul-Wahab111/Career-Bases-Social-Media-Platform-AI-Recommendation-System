import { useState } from "react";
import {
  Menu,
  X,
  Home,
  UserCircle,
  LogOut,
  FileText,
  
} from "lucide-react";

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavLink = ({ href, icon: Icon, label }) => (
    <a
      href={href}
      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 group"
    >
      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
      <span>{label}</span>
    </a>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <a href="/posts" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Social
                </span>
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:gap-6">
              <NavLink href="/" icon={Home} label="Home" />
              <NavLink href="/posts" icon={FileText} label="Post" />
              <NavLink href="/profile" icon={UserCircle} label="Profile" />
              <NavLink href="/chat" icon={Home} label="Chat" />

              {/* Logout Button */}
              <a
                href="/logout"
                className="ml-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-2">
            <div className="space-y-1 px-4">
              <NavLink href="/" icon={Home} label="Home" />
              <NavLink href="/posts" icon={FileText} label="Home" />
              <NavLink href="/profile" icon={UserCircle} label="Profile" />
              <NavLink href="/logout" icon={LogOut} label="Logout" />
              <NavLink href="/chat" icon={Home} label="Chat" />
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-600">
              © 2024 Social Platform. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="/terms" className="text-gray-600 hover:text-blue-600">
                Terms
              </a>
              <a href="/privacy" className="text-gray-600 hover:text-blue-600">
                Privacy
              </a>
              <a href="/help" className="text-gray-600 hover:text-blue-600">
                Help
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
