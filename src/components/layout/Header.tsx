import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { toast } from 'sonner';
import { LogOut, Menu, X } from 'lucide-react';
import logodatacareer from '../../../public/logoDataCareer.png';

const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      dispatch(logout());
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo (Home) */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center">
              <img src={logodatacareer} alt="DataCareer App Logo" className="h-8 md:h-10 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 items-center gap-4">
            <Link to="/">
              <Button variant="ghost" className="text-datacareer-blue hover:text-datacareer-darkBlue text-lg px-6">
                SQL Practice Questions
              </Button>
            </Link>
            <Link to="/job-database">
              <Button variant="ghost" className="text-datacareer-blue hover:text-datacareer-darkBlue text-lg px-6">
                Job Database
              </Button>
            </Link>
          </nav>

          {/* Desktop Logout Button */}
          <div className="hidden lg:flex items-center space-x-2">
            <Button
              variant="ghost"
              className="text-datacareer-blue hover:text-datacareer-darkBlue flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col space-y-2">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-datacareer-blue hover:text-datacareer-darkBlue text-base"
                >
                  SQL Practice Questions
                </Button>
              </Link>
              <Link to="/job-database" onClick={() => setIsMobileMenuOpen(false)}>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-datacareer-blue hover:text-datacareer-darkBlue text-base"
                >
                  Job Database
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start text-datacareer-blue hover:text-datacareer-darkBlue flex items-center gap-2"
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
