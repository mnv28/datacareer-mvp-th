
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const Header = () => {
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
          {/* <Button variant="ghost" className="text-datacareer-blue hover:text-datacareer-darkBlue">
            Sign In
          </Button>
          <Button className="bg-datacareer-orange hover:bg-opacity-90 text-white">
            Sign Up
          </Button> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
