"use client";

import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  Home,
  UserCircle,
  LogOut,
  FileText,
  MessageCircle,
  Users,
  Search,
  Moon,
  Sun,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import axios from "axios";

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  // Check for dark mode preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark =
        localStorage.getItem("darkMode") === "true" ||
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest("nav")) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when search is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Handle search
  const handleSearch = async (term) => {
    setSearchTerm(term);

    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No auth token found");
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSearchResults(response.data || []);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        handleSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const NavLink = ({
    href,
    icon: Icon,
    label,
    isMobile = false,
    onClick = null,
  }) => (
    <a
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all duration-200 group ${
        isMobile ? "w-full" : ""
      }`}
    >
      <Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
      <span>{label}</span>
    </a>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50 shadow-sm transition-all duration-200">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <a href="/posts" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Social
                </span>
              </a>
            </div>

            {/* Search Bar - Desktop */}
            <div
              className="hidden md:flex items-center flex-1 max-w-md mx-4 lg:mx-8 relative"
              ref={searchRef}
            >
              <div className="relative w-full">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 dark:text-gray-200 text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {isSearchOpen && searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50 max-h-[300px] overflow-y-auto animate-fade-in-down">
                  {searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((user, index) => (
                        <a
                          key={user._id}
                          href={`/profile/${user._id}`}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>
                          <ChevronRight
                            size={16}
                            className="text-gray-400 dark:text-gray-500"
                          />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                      {searchTerm.length > 0
                        ? "No users found"
                        : "Type to search users"}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:gap-1 lg:gap-2">
              <NavLink href="/" icon={Home} label="Home" />
              <NavLink href="/posts" icon={FileText} label="Posts" />
              <NavLink href="/jobs" icon={Briefcase} label="Post Jobs" />
              <NavLink href="/applyjobs" icon={Briefcase} label="Find Jobs" />
              <NavLink href="/profiles" icon={Users} label="People" />
              <NavLink href="/profile" icon={UserCircle} label="Profile" />
              <NavLink href="/chat" icon={MessageCircle} label="Chat" />

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-1"
                aria-label={
                  isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Logout Button */}
              <a
                href="/logout"
                className="ml-1 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              {/* Search Button - Mobile */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Dark Mode Toggle - Mobile */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={
                  isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Menu Toggle - Mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            isSearchOpen
              ? "max-h-16 opacity-100 border-b border-gray-200 dark:border-gray-700"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 py-2" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 dark:text-gray-200 text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>

            {/* Mobile Search Results */}
            {isSearchOpen && searchTerm && (
              <div className="absolute left-0 right-0 mt-1 mx-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50 max-h-[300px] overflow-y-auto animate-fade-in-down">
                {searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((user, index) => (
                      <a
                        key={user._id}
                        href={`/profile/${user._id}`}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                        <ChevronRight
                          size={16}
                          className="text-gray-400 dark:text-gray-500"
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                    {searchTerm.length > 0
                      ? "No users found"
                      : "Type to search users"}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-1 px-4 py-2">
            <NavLink
              href="/"
              icon={Home}
              label="Home"
              isMobile={true}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <NavLink
              href="/posts"
              icon={FileText}
              label="Posts"
              isMobile={true}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <NavLink
              href="/jobs"
              icon={Briefcase}
              label="Post Jobs"
              isMobile={true}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <NavLink
              href="/applyjobs"
              icon={Briefcase}
              label="Find Jobs"
              isMobile={true}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <NavLink
              href="/profiles"
              icon={Users}
              label="People"
              isMobile={true}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <NavLink
              href="/profile"
              icon={UserCircle}
              label="Profile"
              isMobile={true}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <NavLink
              href="/chat"
              icon={MessageCircle}
              label="Chat"
              isMobile={true}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <NavLink
              href="/logout"
              icon={LogOut}
              label="Logout"
              isMobile={true}
              onClick={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-600 dark:text-gray-400">
              © 2025 Social Platform. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a
                href="/terms"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Terms
              </a>
              <a
                href="/privacy"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Privacy
              </a>
              <a
                href="/help"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
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
