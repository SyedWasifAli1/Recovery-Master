"use client";
import React from 'react';
import { FiSearch, FiBell, FiUser } from 'react-icons/fi';
// import { usePathname } from 'next/navigation';
import Image from "next/image";
const Header: React.FC = () => {
  // const pathname = usePathname();

  // Format the current route for display, replacing slashes with hyphens
  // const routeTitle = pathname === null ? 'Default Title' : (pathname === '/' ? 'Dashboard' : pathname.replace(/\//g, '/').replace("/", ''));

  return (
    <header className="bg-black bg-[#283593] shadow-md p-4 flex justify-between items-center">
      {/* Dynamic Route Title with Split Styling */}
      {/* <h1 className="text-xl font-bold capitalize">
        <span className="text-black">{routeTitle}</span>
      </h1>  */}


      <div className="flex-grow flex justify-start">
        <Image
          src="/log.png" // Path to the logo in the public folder
          alt="Logo"
          width={50} // Adjust width as needed
          // width={120} // Adjust width as needed
          height={20} // Adjust height as needed
          className="object-contain" // Ensure the logo scales properly
        />
      </div>
       {/* Dynamic Route Title with Split Styling */}
      {/* <h1 className="text-xl font-bold capitalize flex-grow flex justify-start">
        <span className="text-white">Add Customer</span>
        <span className="text-black">{routeTitle}</span>
      </h1>  */}
      {/* Search Bar and Other Actions */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-64 px-4 py-2 border rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-full hover:bg-gray-100">
          <FiBell className="text-gray-600" size={20} />
        </button>

        {/* User Profile */}
        <button className="p-2 rounded-full hover:bg-gray-100 flex items-center">
          <FiUser className="text-gray-600" size={20} />
          <span className="ml-2 hidden md:block text-gray-600">Profile</span>
        </button>
      </div>
    </header>
  );
};

export default Header;














// import React from 'react';
// import { FiSearch, FiBell, FiUser } from 'react-icons/fi';

// const Header: React.FC = () => {
//   return (
//     <header className="bg-white shadow-md p-4 flex justify-between items-center">
//       {/* Logo or Title */}
//       <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>

//       {/* Search Bar */}
//       <div className="flex items-center gap-2">
//         <div className="relative">
//           <input
//             type="text"
//             placeholder="Search..."
//             className="w-64 px-4 py-2 border rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//         </div>

//         {/* Notifications */}
//         <button className="p-2 rounded-full hover:bg-gray-100">
//           <FiBell className="text-gray-600" size={20} />
//         </button>

//         {/* User Profile */}
//         <button className="p-2 rounded-full hover:bg-gray-100 flex items-center">
//           <FiUser className="text-gray-600" size={20} />
//           <span className="ml-2 hidden md:block text-gray-600">Profile</span>
//         </button>
//       </div>
//     </header>
//   );
// };

// export default Header;
