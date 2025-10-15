import React from 'react';

const Header = () => {

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
      <div className="px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Page Title / Breadcrumb - Optional */}
          <div className="flex items-center space-x-2 ml-12 lg:ml-0">
            <h1 className="text-lg font-semibold text-gray-800">
              Welcome to DataCareer
            </h1>
          </div>

          {/* Right Side - User Info or Actions */}
          <div className="flex items-center space-x-4">
            {/* You can add notification bell, user avatar, etc. here */}
            <div className="text-sm text-gray-600">
              {/* Optional: User name or other info */}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
