import React from 'react';

interface CompanyLogoProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  logo?: string;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getRandomColor = (name: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-teal-500',
  ];
  
  // Use the company name to consistently generate the same color for the same company
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

export const CompanyLogo: React.FC<CompanyLogoProps> = ({ name, size = 'md', className = '', logo }) => {
  console.log("logo-===",logo );
  
  const initials = getInitials(name);
  const bgColor = getRandomColor(name);

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  if (logo) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
        <img 
          src={logo} 
          alt={`${name} logo`}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${bgColor}
        rounded-full
        flex
        items-center
        justify-center
        text-white
        font-medium
        ${className}
      `}
    >
      {initials}
    </div>
  );
}; 