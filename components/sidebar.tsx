// "use client";
// import Link from 'next/link';
// import React, { useState } from 'react';
// import { signOut } from 'firebase/auth';
// import { useRouter } from 'next/navigation'; // For redirecting to login page after sign-out
// import { auth } from '../app/lib/firebase-config'
// import { FiHome, FiLogOut, FiMenu,  FiPackage, FiUsers } from 'react-icons/fi';

// const Sidebar: React.FC = () => {
//   const [isOpen, setIsOpen] = useState(true);
//   const router = useRouter();

//   const handleLogout = async () => {
//     try {
//       await signOut(auth); // Sign out the user from Firebases
//       alert('You have been logged out!');
//       router.push('/'); // Redirect to login page (or wherever you want to redirect the user)
//     } catch (error) {
//       console.error('Error signing out:', error);
//       alert('Failed to sign out. Please try again.');
//     }
//   };
//   return (
//     <div className={`flex flex-col bg-[#8A56E8] text-white ${isOpen ? 'w-64' : 'w-20'} h-screen transition-all`}>
//     {/* <div className={`flex flex-col bg-[#283593] text-white ${isOpen ? 'w-64' : 'w-20'} h-screen transition-all`}> */}
//       {/* Toggle Button */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="p-4 text-white focus:outline-none hover:text-white"
//       >
//         <FiMenu size={24} />
//       </button>

//       {/* Navigation Links */}
//       <nav className="flex-grow">
//         <ul>
//           {/* <li className="p-4 hover:bg-gray-700 flex items-center">
//             <FiHome size={20} className="mr-2" />
//             {isOpen && 'Dashboard'}
//           </li> */}
//           <li className="p-4 hover:bg-black flex items-center cursor-pointer">
//             <Link href="/dashboard/" className="flex items-center w-full">
//               <FiHome size={20} className="mr-2" />
//               {isOpen && 'Dashboard'}
//             </Link>
//           </li>          
//           <li className="p-4 hover:bg-black flex items-center cursor-pointer">
//             <Link href="/dashboard/add_customer" className="flex items-center w-full">
//               <FiPackage size={20} className="mr-2" />
//               {isOpen && 'Add Customer'}
//             </Link>
//           </li>
//           <li className="p-4 hover:bg-black flex items-center cursor-pointer">
//             <Link href="/dashboard/listofcustomers" className="flex items-center w-full">
//               <FiUsers size={20} className="mr-2" />
//               {isOpen && ' List of Customers'}
//             </Link>
//           </li> 
//           <li className="p-4 hover:bg-black flex items-center cursor-pointer">
//             <Link href="/dashboard/paymentstatus" className="flex items-center w-full">
//             <FiPackage size={20} className="mr-2" />
//               {isOpen && 'Payment Status'}
//             </Link>
//           </li> 
//           <li className="p-4 hover:bg-black flex items-center cursor-pointer">
//             <Link href="/dashboard/payments" className="flex items-center w-full">
//               <FiPackage size={20} className="mr-2" />
//               {isOpen && 'Payments'}
//             </Link>
//           </li>

//           <li className="p-4 hover:bg-black flex items-center cursor-pointer">
//             <Link href="/dashboard/transfers" className="flex items-center w-full">
//               <FiPackage size={20} className="mr-2" />
//               {isOpen && 'Collector Transfers'}
//             </Link>
//           </li>
//           <li className="p-4 hover:bg-black flex items-center cursor-pointer">
//             <Link href="/dashboard/addcollector" className="flex items-center w-full">
//               <FiPackage size={20} className="mr-2" />
//               {isOpen && 'Add Collector'}
//             </Link>
//           </li>
//           <li className="p-4 hover:bg-black flex items-center cursor-pointer">
//             <Link href="/dashboard/fetchCollector" className="flex items-center w-full">
//               <FiUsers size={20} className="mr-2" />
//               {isOpen && 'List of Collectors'}
//             </Link>
//           </li>                           
//           <li className="p-4 hover:bg-black flex items-center cursor-pointer">
//             <Link href="/dashboard/pakage" className="flex items-center w-full">
//               <FiPackage size={20} className="mr-2" />
//               {isOpen && 'Package'}
//             </Link>
//           </li>                           
//         </ul>
//       </nav>

//       {/* Logout Button */}
//       <button
//         onClick={handleLogout}
//         className="p-4 hover:bg-black flex items-center"
//       >
//         <FiLogOut size={20} className="mr-2" />
//         {isOpen && 'Logout'}
//       </button>
//     </div>
//   );
// };

// export default Sidebar;


"use client";
import Link from 'next/link';
import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../app/lib/firebase-config'
import { FiHome, FiLogOut, FiMenu, FiPackage, FiUsers, FiChevronDown, FiChevronRight, FiPlus } from 'react-icons/fi';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('You have been logged out!');
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  const togglePaymentsMenu = () => {
    setIsPaymentsOpen(!isPaymentsOpen);
  };

  return (
    <div className={`flex flex-col bg-[#8A56E8] text-white ${isOpen ? 'w-64' : 'w-20'} h-screen transition-all`}>
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
          <li className="p-4 hover:bg-black flex items-center cursor-pointer">
            <Link href="/dashboard/" className="flex items-center w-full">
              <FiHome size={20} className="mr-2" />
              {isOpen && 'Dashboard'}
            </Link>
          </li>          
          <hr />
          <li>
            <div 
              className="p-4 hover:bg-black flex items-center justify-between cursor-pointer"
              onClick={togglePaymentsMenu}
            >
              <div className="flex items-center">
                <FiPackage size={20} className="mr-2" />
                {isOpen && ' All Payments'}
              </div>
              {isOpen && (isPaymentsOpen ? <FiChevronDown /> : <FiChevronRight />)}
            </div>
            
            {isPaymentsOpen && isOpen && (
              <ul className="pl-8 bg-[#6a42c4]">
                <li className="p-3 hover:bg-black flex items-center cursor-pointer">
                  <Link href="/dashboard/payments" className="flex items-center w-full">
                    <FiPackage size={16} className="mr-2" />
                    Customers Payments
                  </Link>
                </li>
                <li className="p-3 hover:bg-black flex items-center cursor-pointer">
                  <Link href="/dashboard/transfers" className="flex items-center w-full">
                    <FiPackage size={16} className="mr-2" />
                    Collector Payments
                  </Link>
                </li>
                <li className="p-3 hover:bg-black flex items-center cursor-pointer">
                  {/* <Link href="/dashboard/addcollector" className="flex items-center w-full">
                    <FiPackage size={16} className="mr-2" />
                    Add Collector
                  </Link> */}
                  <Link href="/dashboard/paymentstatus" className="flex items-center w-full">
              <FiPackage size={20} className="mr-2" />
              {isOpen && 'Cus Payment Status'}
            </Link>
                </li>
              </ul>
            )}
          </li>
          <hr />
          <li className="p-4 hover:bg-black flex items-center cursor-pointer">
            <Link href="/dashboard/add_customer" className="flex items-center w-full">
              <FiPlus size={20} className="mr-2" />
              {isOpen && 'Add Customer'}
            </Link>
          </li>
          <li className="p-4 hover:bg-black flex items-center cursor-pointer">
            <Link href="/dashboard/listofcustomers" className="flex items-center w-full">
              <FiUsers size={20} className="mr-2" />
              {isOpen && ' List of Customers'}
            </Link>
          </li> 
          <hr />
          <li className="p-4 hover:bg-black flex items-center cursor-pointer">
          <Link href="/dashboard/addcollector" className="flex items-center w-full">
                    <FiPlus size={16} className="mr-2" />
                    Add Collector
                  </Link>
          </li>
          <li className="p-4 hover:bg-black flex items-center cursor-pointer">
            <Link href="/dashboard/fetchCollector" className="flex items-center w-full">
              <FiUsers size={20} className="mr-2" />
              {isOpen && 'List of Collectors'}
            </Link>
          </li> 
          {/* Payments Dropdown */}
          <hr />
          <li className="p-4 hover:bg-black flex items-center cursor-pointer">
            <Link href="/dashboard/pakage" className="flex items-center w-full">
              <FiPackage size={20} className="mr-2" />
              {isOpen && 'Package'}
            </Link>
          </li>
          <hr />
        

                                  
                                     
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
