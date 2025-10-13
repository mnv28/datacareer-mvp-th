import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';
import logodatacareer from '../../../public/logoDataCareer.png';

const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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
      <div className="container mx-auto px-4 py-4 flex items-center justify-between relative">
        {/* Logo (Home) */}
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center">
            <img src={logodatacareer} alt="DataCareer App Logo" className="h-10 w-auto" />
          </Link>
        </div>

        {/* Centered Navigation */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
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
        </div>

        {/* Logout Button on the right */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            className="text-datacareer-blue hover:text-datacareer-darkBlue flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
