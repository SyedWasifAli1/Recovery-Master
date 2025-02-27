"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { firestore } from "../../lib/firebase-config"; // Update the path to your Firebase config
import * as XLSX from "xlsx";
interface Customer {
  id: string;
  email: string;
  datetime:string;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEmail, setFilterEmail] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
const [filterEndDate, setFilterEndDate] = useState("");

  // Fetch customers from Firestore
  useEffect(() => {
    async function fetchCustomers() {
      try {
        const querySnapshot = await getDocs(collection(firestore, "customers")); // Fetch 'customers' collection
        
        const customerData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const datetime = data.datetime
            ? data.datetime instanceof Timestamp
              ? data.datetime.toDate().toLocaleDateString("en-CA") // Extract local date in YYYY-MM-DD format
              : new Date(data.datetime).toLocaleDateString("en-CA") // Handle string case if needed
            : "Unknown"; // Default value if datetime is not available
      
          return {
            id: doc.id, // Get document ID
            email: data.email, // Get email from document data
            datetime, // Processed datetime field
          };
        });
        
        setCustomers(customerData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setLoading(false);
      }
      
    }

    fetchCustomers();
  }, []);

 const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      customers.filter(
        (customer) =>
          (filterEmail === "" || customer.email.includes(filterEmail)) &&
        isWithinDateRange(customer.datetime) 
      )
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "users_report.xlsx");
  };



  const isWithinDateRange = (orderDate: string) => {
    const orderTimestamp = new Date(orderDate).getTime();
    const startTimestamp = filterStartDate ? new Date(filterStartDate).getTime() : -Infinity;
    const endTimestamp = filterEndDate ? new Date(filterEndDate).getTime() : Infinity;
    return orderTimestamp >= startTimestamp && orderTimestamp <= endTimestamp;
  };
  return (
    <div className="h-[80vh]  text-gray-800 p-8">
      <h1 className="text-3xl font-bold mb-4">Customer List</h1>

           
    


<div className="mb-4 flex flex-wrap gap-4">
  <div className="flex-1 min-w-[200px]">
    <label htmlFor="orderId" className="block text-sm font-medium text-gray-700">User Email</label>
    <input
      type="text"
      placeholder="Search By Email"
      id="orderId"
      value={filterEmail}
      onChange={(e) => setFilterEmail(e.target.value)}
      className="w-full border border-gray-300 p-2 rounded-md"
    />
  </div>

  <div className="flex-1 min-w-[200px]">
    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date:</label>
    <input
      type="date"
      id="startDate"
      value={filterStartDate}
      onChange={(e) => setFilterStartDate(e.target.value)}
      className="w-full border border-gray-300 p-2 rounded-md"
    />
  </div>

  <div className="flex-1 min-w-[200px]">
    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date:</label>
    <input
      type="date"
      id="endDate"
      value={filterEndDate}
      onChange={(e) => setFilterEndDate(e.target.value)}
      className="w-full border border-gray-300 p-2 rounded-md"
    />
  </div>

  <div className="flex-1 min-w-[200px]">
    <label htmlFor="orderId" className="block text-sm font-medium text-gray-700">Export Data</label>
    <button
                  className="bg-black hover:bg-gray-600 text-white px-4 py-2 rounded"
                  onClick={() => exportToExcel()}
                >
                  Convert to Excel Report
                </button> 
  </div>
</div>


      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <>
          <p className="mb-4">Total Customers: {customers.length}</p>
          {customers.length === 0 ? (
            <p className="text-center">No customers found.</p>
          ) : (
            <div className="overflow-x-auto h-[60vh] overflow-y-auto">
              <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-white">
                    <th className="border border-gray-300 px-4 py-2">ID</th>
                    <th className="border border-gray-300 px-4 py-2">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {customers
                  .filter(
                    (customer) =>
                      (filterEmail === "" || customer.email.includes(filterEmail)) &&
                    isWithinDateRange(customer.datetime) 
                      // (filterStatus === "" || order.status === filterStatus) &&
                  )
                  .map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-2">{customer.id}</td>
                      <td className="border border-gray-300 px-4 py-2">{customer.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}


// "use client";
// import { useEffect, useState } from "react";

// interface User {
//   uid: string;
//   email: string;
//   createdAt: string;
//   lastSignInTime: string;
// }

// export default function Users() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch users from API
//   useEffect(() => {
//     async function fetchUsers() {
//       try {
//         const response = await fetch("/api/fetchUsers");
//         const data: User[] = await response.json();
//         setUsers(data);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching users:", error);
//         setLoading(false);
//       }
//     }

//     fetchUsers();
//   }, []);

//   return (
//     <div className="h-[80vh] bg-gray-900 text-gray-200 p-8">
//       <h1 className="text-3xl font-bold mb-8">User List</h1>
//       {loading ? (
//         <p className="text-center">Loading...</p>
//       ) : users.length === 0 ? (
//         <p className="text-center">No users found.</p>
//       ) : (
//         <div className="overflow-x-auto h-[60vh] overflow-y-auto">
//           <table className="table-auto w-full border-collapse border border-gray-700">
//             <thead>
//               <tr className="bg-gray-800">
//                 <th className="border border-gray-700 px-4 py-2">UID</th>
//                 <th className="border border-gray-700 px-4 py-2">Email</th>
//                 <th className="border border-gray-700 px-4 py-2">Created At</th>
//                 <th className="border border-gray-700 px-4 py-2">Last Sign-In</th>
//               </tr>
//             </thead>
//             <tbody>
//               {users.map((user) => (
//                 <tr key={user.uid} className="hover:bg-gray-800">
//                   <td className="border border-gray-700 px-4 py-2">{user.uid}</td>
//                   <td className="border border-gray-700 px-4 py-2">{user.email}</td>
//                   <td className="border border-gray-700 px-4 py-2">{user.createdAt}</td>
//                   <td className="border border-gray-700 px-4 py-2">{user.lastSignInTime}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }
