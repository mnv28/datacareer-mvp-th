import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';

const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-01 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <span className="ml-2 text-2xl font-bold text-datacareer-darkBlue">
              datacareer<span className="text-datacareer-orange">.app</span>
            </span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-1">
          <Button variant="ghost" className="text-datacareer-blue hover:text-datacareer-darkBlue">
            SQL Practice Questions
          </Button>
          {/* <Button variant="ghost" className="text-datacareer-blue hover:text-datacareer-darkBlue">
            Companies
          </Button>
          <Button variant="ghost" className="text-datacareer-blue hover:text-datacareer-darkBlue">
            About
          </Button> */}
        </div>
        
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
