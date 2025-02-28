"use client";
import Link from 'next/link';
import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation'; // For redirecting to login page after sign-out
import { auth } from '../app/lib/firebase-config'
import { FiHome, FiLogOut, FiMenu,  FiPackage, FiUsers } from 'react-icons/fi';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user from Firebases
      alert('You have been logged out!');
      router.push('/'); // Redirect to login page (or wherever you want to redirect the user)
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };
  return (
    <div className={`flex flex-col bg-red-700 text-white ${isOpen ? 'w-64' : 'w-20'} h-screen transition-all`}>
    {/* <div className={`flex flex-col bg-[#283593] text-white ${isOpen ? 'w-64' : 'w-20'} h-screen transition-all`}> */}
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 text-white focus:outline-none hover:text-white"
      >
        <FiMenu size={24} />
      </button>

      {/* Navigation Links */}
      <nav className="flex-grow">
        <ul>
          {/* <li className="p-4 hover:bg-gray-700 flex items-center">
            <FiHome size={20} className="mr-2" />
            {isOpen && 'Dashboard'}
          </li> */}
          <li className="p-4 hover:bg-black flex items-center cursor-pointer">
            <Link href="/dashboard/" className="flex items-center w-full">
              <FiHome size={20} className="mr-2" />
              {isOpen && 'Dashboard'}
            </Link>
          </li>          
          <li className="p-4 hover:bg-black flex items-center cursor-pointer">
            <Link href="/dashboard/add_customer" className="flex items-center w-full">
              <FiPackage size={20} className="mr-2" />
              {isOpen && 'Add Customer'}
            </Link>
          </li>
          <li className="p-4 hover:bg-black flex items-center cursor-pointer">
            <Link href="/dashboard/payments" className="flex items-center w-full">
              <FiPackage size={20} className="mr-2" />
              {isOpen && 'Payments'}
            </Link>
          </li>
          <li className="p-4 hover:bg-black flex items-center cursor-pointer">
            <Link href="/dashboard/listofcustomers" className="flex items-center w-full">
              <FiUsers size={20} className="mr-2" />
              {isOpen && ' List of Users'}
            </Link>
          </li> 
          <li className="p-4 hover:bg-black flex items-center cursor-pointer">
            <Link href="/dashboard/transfers" className="flex items-center w-full">
              <FiPackage size={20} className="mr-2" />
              {isOpen && 'Collector Transfers'}
            </Link>
          </li>
          <li className="p-4 hover:bg-black flex items-center cursor-pointer">
            <Link href="/dashboard/addcollector" className="flex items-center w-full">
              <FiPackage size={20} className="mr-2" />
              {isOpen && 'Add Collector'}
            </Link>
          </li>
          <li className="p-4 hover:bg-black flex items-center cursor-pointer">
            <Link href="/dashboard/fetchCollector" className="flex items-center w-full">
              <FiUsers size={20} className="mr-2" />
              {isOpen && 'List of Collectors'}
            </Link>
          </li>                           
          <li className="p-4 hover:bg-black flex items-center cursor-pointer">
            <Link href="/dashboard/pakage" className="flex items-center w-full">
              <FiUsers size={20} className="mr-2" />
              {isOpen && 'Internet Package'}
            </Link>
          </li>                           
        </ul>
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="p-4 hover:bg-black flex items-center"
      >
        <FiLogOut size={20} className="mr-2" />
        {isOpen && 'Logout'}
      </button>
    </div>
  );
};

export default Sidebar;
