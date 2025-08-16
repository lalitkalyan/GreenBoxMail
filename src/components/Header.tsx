import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between py-4 px-4 border-b border-gray-200 dark:border-gray-700">
      <div className="text-2xl font-bold text-green-700 dark:text-green-400">GreenBoxMail</div>
      {/* Language switcher placeholder */}
      <div>
        <select className="bg-transparent text-sm text-gray-700 dark:text-gray-300">
          <option value="en">EN</option>
          <option value="pl">PL</option>
        </select>
      </div>
    </header>
  );
};

export default Header;
