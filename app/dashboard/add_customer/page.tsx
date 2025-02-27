"use client";

import React, { useState, useEffect } from "react";
import { firestore } from "../../lib/firebase-config"; // Adjust the path
import { collection, getDocs, addDoc } from "firebase/firestore";
import Papa from "papaparse"; // Import PapaParse
import withAuth from "@/app/lib/withauth";

interface Package {
  id: string;
  name: string;
}
interface Customer {
  name: string;
  username: string;
  contactNumber: string;
  completeAddress: string;
  area: string;
  selectedPackage: string;
}

const AddCustomerPage = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const   [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [completeAddress, setCompleteAddress] = useState("");
  const [area, setarea] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null); // State to store the uploaded file

  useEffect(() => {
    const fetchPackages = async () => {
      const snapshot = await getDocs(collection(firestore, "packages"));
      const packagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setPackages(packagesData);
    };
    fetchPackages();
  }, []);

  const handleAddCustomer = async () => {
    if (
      !name ||
      !username ||
      !contactNumber ||
      !completeAddress ||
      !area ||
      !selectedPackage
    ) {
      alert("Please fill all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const customerData = {
        name,
        username,
        contactNumber,
        completeAddress,
        area,
        selectedPackage,
        createDate: new Date(), // Setting the create date to the current date
      };

      // Add customer to Firestore
      await addDoc(collection(firestore, "customers"), customerData);

      alert("Customer added successfully!");
      setName("");
      setUsername("");
      setContactNumber("");
      setCompleteAddress("");
      setarea("");
      setSelectedPackage(null);
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Failed to add customer: " + error); // More specific error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      alert("Please select a CSV file to upload.");
      return;
    }

    setIsLoading(true);
    try {
      // Parse the CSV file
      Papa.parse(bulkFile, {
        header: true, // Add this line
        complete: async (result) => {
          console.log("Parsed CSV data:", result.data); // Now you should see only the customer rows
          const customers = result.data as Customer[];

          // Process each customer and add to Firestore
          for (const customer of customers) {
            const { name, username, contactNumber, completeAddress, area, selectedPackage } = customer;

            if (!name || !username || !contactNumber || !completeAddress || !area || !selectedPackage) {
              console.warn("Skipping incomplete customer data:", customer);
              continue; // Skip incomplete rows
            }

            const customerData = {
              name,
              username,
              contactNumber,
              completeAddress,
              area,
              selectedPackage,
              createDate: new Date(), // Setting the create date to the current date
            };

            // Add each customer to Firestore
            await addDoc(collection(firestore, "customers"), customerData);
          }

          alert("Bulk upload successful!");
          setBulkFile(null); // Reset the file after successful upload
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          alert("Failed to upload CSV. Please check the file format.");
        },
      });
    } catch (error) {
      console.error("Error during bulk upload:", error);
      alert("Failed to upload customers: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 pt-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Add Customer</h1>
        {/* Bulk Upload Section */}
        <div className="flex items-center">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setBulkFile(e.target.files ? e.target.files[0] : null)}
            className="w-50 p-2 border rounded-lg bg-gray-100 focus:outline-none mr-4"
          />
          <button
            onClick={handleBulkUpload}
            disabled={isLoading || !bulkFile}
            className="w-1/4 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {isLoading ? "Uploading..." : "Upload CSV"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Name */}
        <div className="bg-white shadow-md rounded p-4">
          <label className="block text-gray-700 font-medium mb-2">Name</label>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Username */}
        <div className="bg-white shadow-md rounded p-4">
          <label className="block text-gray-700 font-medium mb-2">Username</label>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Contact Number */}
        <div className="bg-white shadow-md rounded p-4">
          <label className="block text-gray-700 font-medium mb-2">Contact Number</label>
          <input
            type="text"
            placeholder="Contact Number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Select Package */}
        <div className="bg-white shadow-md rounded p-4">
          <label className="block text-gray-700 font-medium mb-2">Select Package</label>
          <select
            value={selectedPackage || ""}
            onChange={(e) => setSelectedPackage(e.target.value)}
            className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Package</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name}
              </option>
            ))}
          </select>
        </div>

        {/* Complete Address & area in a single row */}
        <div className="bg-white shadow-md rounded p-4 col-span-2 sm:col-span-3 lg:col-span-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Complete Address</label>
            <textarea
              placeholder="Complete Address"
              value={completeAddress}
              onChange={(e) => setCompleteAddress(e.target.value)}
              className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Area</label>
            <input
              type="text"
              placeholder="Area"
              value={area}
              onChange={(e) => setarea(e.target.value)}
              className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Add Customer Button */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-4 mt-6">
          <button
            onClick={handleAddCustomer}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {isLoading ? "Adding..." : "Add Customer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default withAuth(AddCustomerPage);

















// "use client";

// import React, { useState, useEffect } from "react";
// import { firestore } from "../../lib/firebase-config"; // Adjust the path
// import { collection, getDocs, addDoc } from "firebase/firestore";
// import Papa from "papaparse"; // Import PapaParse

// interface Package {
//   id: string;
//   name: string;
// }

// const AddCustomerPage = () => {
//   const [packages, setPackages] = useState<Package[]>([]);
//   const [name, setName] = useState("");
//   const [username, setUsername] = useState("");
//   const [contactNumber, setContactNumber] = useState("");
//   const [completeAddress, setCompleteAddress] = useState("");
//   const [area, setarea] = useState("");
//   const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [bulkFile, setBulkFile] = useState<File | null>(null); // State to store the uploaded file

//   useEffect(() => {
//     const fetchPackages = async () => {
//       const snapshot = await getDocs(collection(firestore, "packages"));
//       const packagesData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         name: doc.data().name,
//       }));
//       setPackages(packagesData);
//     };
//     fetchPackages();
//   }, []);

//   const handleAddCustomer = async () => {
//     if (
//       !name ||
//       !username ||
//       !contactNumber ||
//       !completeAddress ||
//       !area ||
//       !selectedPackage
//     ) {
//       alert("Please fill all fields.");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const customerData = {
//         name,
//         username,
//         contactNumber,
//         completeAddress,
//         area,
//         selectedPackage,
//         createDate: new Date(), // Setting the create date to the current date
//       };

//       // Add customer to Firestore
//       await addDoc(collection(firestore, "customers"), customerData);

//       alert("Customer added successfully!");
//       setName("");
//       setUsername("");
//       setContactNumber("");
//       setCompleteAddress("");
//       setarea("");
//       setSelectedPackage(null);
//     } catch (error) {
//       console.error("Error adding customer:", error);
//       alert("Failed to add customer: " + error); // More specific error message
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleBulkUpload = async () => {
//     if (!bulkFile) {
//       alert("Please select a CSV file to upload.");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       // Parse the CSV file
//       Papa.parse(bulkFile, {
//         header: true, // Add this line
//         complete: async (result) => {
//           console.log("Parsed CSV data:", result.data); // Now you should see only the customer rows
//           const customers = result.data as any[];

//           // Process each customer and add to Firestore
//           for (let customer of customers) {
//             const { name, username, contactNumber, completeAddress, area, selectedPackage } = customer;

//             if (!name || !username || !contactNumber || !completeAddress || !area || !selectedPackage) {
//               console.warn("Skipping incomplete customer data:", customer);
//               continue; // Skip incomplete rows
//             }

//             const customerData = {
//               name,
//               username,
//               contactNumber,
//               completeAddress,
//               area,
//               selectedPackage,
//               createDate: new Date(), // Setting the create date to the current date
//             };

//             // Add each customer to Firestore
//             await addDoc(collection(firestore, "customers"), customerData);
//           }

//           alert("Bulk upload successful!");
//           setBulkFile(null); // Reset the file after successful upload
//         },
//         error: (error) => {
//           console.error("Error parsing CSV:", error);
//           alert("Failed to upload CSV. Please check the file format.");
//         },
//       });
//     } catch (error) {
//       console.error("Error during bulk upload:", error);
//       alert("Failed to upload customers: " + error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto p-6 pt-0">
//       <div className="flex justify-between items-center mb-6">
//   <h1 className="text-3xl font-bold">Add Customer</h1>
//   {/* Bulk Upload Button */}
//   <input
//               type="file"
//               accept=".csv"
//               onChange={(e) => setBulkFile(e.target.files ? e.target.files[0] : null)}
//               className="w-3/4 p-3 border rounded-lg bg-gray-100 focus:outline-none"
//             />
//             <button
//               onClick={handleBulkUpload}
//               disabled={isLoading || !bulkFile}
//               className="w-1/4 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
//             >
//               {isLoading ? "Uploading..." : "Upload CSV"}
//             </button>
// </div>

//       {/* <h1 className="text-3xl font-bold text- mb-6">Add Customer</h1> */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {/* Name */}
//         <div className="bg-white shadow-md rounded p-4">
//           <label className="block text-gray-700 font-medium mb-2">Name</label>
//           <input
//             type="text"
//             placeholder="Name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//         </div>

//         {/* Username */}
//         <div className="bg-white shadow-md rounded p-4">
//           <label className="block text-gray-700 font-medium mb-2">Username</label>
//           <input
//             type="text"
//             placeholder="Username"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//         </div>

//         {/* Contact Number */}
//         <div className="bg-white shadow-md rounded p-4">
//           <label className="block text-gray-700 font-medium mb-2">Contact Number</label>
//           <input
//             type="text"
//             placeholder="Contact Number"
//             value={contactNumber}
//             onChange={(e) => setContactNumber(e.target.value)}
//             className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//         </div>

//         {/* Select Package (after contact number) */}
//         <div className="bg-white shadow-md rounded p-4">
//           <label className="block text-gray-700 font-medium mb-2">Select Package</label>
//           <select
//             value={selectedPackage || ""}
//             onChange={(e) => setSelectedPackage(e.target.value)}
//             className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           >
//             <option value="">Select Package</option>
//             {packages.map((pkg) => (
//               <option key={pkg.id} value={pkg.id}>
//                 {pkg.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Complete Address & area in a single row */}
//         <div className="bg-white shadow-md rounded p-4 col-span-2 sm:col-span-3 lg:col-span-4">
//           <label className="block text-gray-700 font-medium mb-2">Complete Address</label>
//           <textarea
//             placeholder="Complete Address"
//             value={completeAddress}
//             onChange={(e) => setCompleteAddress(e.target.value)}
//             className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//         </div>

//         <div className="bg-white shadow-md rounded p-4 col-span-2 sm:col-span-3 lg:col-span-4">
//           <label className="block text-gray-700 font-medium mb-2">area</label>
//           <input
//             type="text"
//             placeholder="area"
//             value={area}
//             onChange={(e) => setarea(e.target.value)}
//             className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//         </div>

//         {/* Add Customer Button */}
//         <div className="col-span-2 sm:col-span-3 lg:col-span-4 mt-6">
//           <button
//             onClick={handleAddCustomer}
//             disabled={isLoading}
//             className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           >
//             {isLoading ? "Adding..." : "Add Customer"}
//           </button>
//         </div>

//         {/* Bulk Upload Section (previous button style) */}
        
//       </div>
//     </div>
//   );
// };

// export default AddCustomerPage;

// "use client";

// import React, { useState, useEffect } from "react";
// import { firestore } from "../../lib/firebase-config"; // Adjust the path
// import { collection, getDocs, addDoc } from "firebase/firestore";
// import Papa from "papaparse"; // Import PapaParse

// interface Package {
//   id: string;
//   name: string;
// }

// const AddCustomerPage = () => {
//   const [packages, setPackages] = useState<Package[]>([]);
//   const [customerId, setCustomerId] = useState("");
//   const [name, setName] = useState("");
//   const [username, setUsername] = useState("");
//   const [contactNumber, setContactNumber] = useState("");
//   const [completeAddress, setCompleteAddress] = useState("");
//   const [area, setarea] = useState("");
//   const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [bulkFile, setBulkFile] = useState<File | null>(null); // State to store the uploaded file

//   useEffect(() => {
//     const fetchPackages = async () => {
//       const snapshot = await getDocs(collection(firestore, "packages"));
//       const packagesData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         name: doc.data().name,
//       }));
//       setPackages(packagesData);
//     };
//     fetchPackages();
//   }, []);

//   const handleAddCustomer = async () => {
//     if (
//       !customerId ||
//       !name ||
//       !username ||
//       !contactNumber ||
//       !completeAddress ||
//       !area ||
//       !selectedPackage
//     ) {
//       alert("Please fill all fields.");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const customerData = {
//         customerId,
//         name,
//         username,
//         contactNumber,
//         completeAddress,
//         area,
//         selectedPackage,
//         createDate: new Date(), // Setting the create date to the current date
//       };

//       // Add customer to Firestore
//       await addDoc(collection(firestore, "customers"), customerData);

//       alert("Customer added successfully!");
//       setCustomerId("");
//       setName("");
//       setUsername("");
//       setContactNumber("");
//       setCompleteAddress("");
//       setarea("");
//       setSelectedPackage(null);
//     } catch (error) {
//       console.error("Error adding customer:", error);
//       alert("Failed to add customer: " + error); // More specific error message
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleBulkUpload = async () => {
//     if (!bulkFile) {
//       alert("Please select a CSV file to upload.");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       // Parse the CSV file
//       Papa.parse(bulkFile, {
//         header: true, // Add this line
//         complete: async (result) => {
//           console.log("Parsed CSV data:", result.data); // Now you should see only the customer rows
//           const customers = result.data as any[];

//           // Process each customer and add to Firestore
//           for (let customer of customers) {
//             const { customerId, name, username, contactNumber, completeAddress, area, selectedPackage } = customer;

//             if (!customerId || !name || !username || !contactNumber || !completeAddress || !area || !selectedPackage) {
//               console.warn("Skipping incomplete customer data:", customer);
//               continue; // Skip incomplete rows
//             }

//             const customerData = {
//               customerId,
//               name,
//               username,
//               contactNumber,
//               completeAddress,
//               area,
//               selectedPackage,
//               createDate: new Date(), // Setting the create date to the current date
//             };

//             // Add each customer to Firestore
//             await addDoc(collection(firestore, "customers"), customerData);
//           }

//           alert("Bulk upload successful!");
//           setBulkFile(null); // Reset the file after successful upload
//         },
//         error: (error) => {
//           console.error("Error parsing CSV:", error);
//           alert("Failed to upload CSV. Please check the file format.");
//         },
//       });
//     } catch (error) {
//       console.error("Error during bulk upload:", error);
//       alert("Failed to upload customers: " + error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-3xl font-bold text-center mb-6">Add Customer</h1>
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {/* Customer ID */}
//         <div className="bg-white shadow-md rounded p-4">
//           <label className="block text-gray-700 font-medium mb-2">Customer ID</label>
//           <input
//             type="text"
//             placeholder="Customer ID"
//             value={customerId}
//             onChange={(e) => setCustomerId(e.target.value)}
//             className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//         </div>

//         {/* Name */}
//         <div className="bg-white shadow-md rounded p-4">
//           <label className="block text-gray-700 font-medium mb-2">Name</label>
//           <input
//             type="text"
//             placeholder="Name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//         </div>

//         {/* Username */}
//         <div className="bg-white shadow-md rounded p-4">
//           <label className="block text-gray-700 font-medium mb-2">Username</label>
//           <input
//             type="text"
//             placeholder="Username"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//         </div>

//         {/* Contact Number */}
//         <div className="bg-white shadow-md rounded p-4">
//           <label className="block text-gray-700 font-medium mb-2">Contact Number</label>
//           <input
//             type="text"
//             placeholder="Contact Number"
//             value={contactNumber}
//             onChange={(e) => setContactNumber(e.target.value)}
//             className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//         </div>

//         {/* Complete Address */}
//         <div className="bg-white shadow-md rounded p-4 col-span-2 sm:col-span-3 lg:col-span-4">
//           <label className="block text-gray-700 font-medium mb-2">Complete Address</label>
//           <textarea
//             placeholder="Complete Address"
//             value={completeAddress}
//             onChange={(e) => setCompleteAddress(e.target.value)}
//             className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//         </div>

//         {/* area */}
//         <div className="bg-white shadow-md rounded p-4 col-span-2 sm:col-span-3 lg:col-span-4">
//           <label className="block text-gray-700 font-medium mb-2">area</label>
//           <input
//             type="text"
//             placeholder="area"
//             value={area}
//             onChange={(e) => setarea(e.target.value)}
//             className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           />
//         </div>

//         {/* Package Selection */}
//         <div className="bg-white shadow-md rounded p-4 col-span-2 sm:col-span-3 lg:col-span-4">
//           <label className="block text-gray-700 font-medium mb-2">Select Package</label>
//           <select
//             value={selectedPackage || ""}
//             onChange={(e) => setSelectedPackage(e.target.value)}
//             className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           >
//             <option value="">Select Package</option>
//             {packages.map((pkg) => (
//               <option key={pkg.id} value={pkg.id}>
//                 {pkg.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Add Customer Button */}
//         <div className="col-span-2 sm:col-span-3 lg:col-span-4 mt-6">
//           <button
//             onClick={handleAddCustomer}
//             disabled={isLoading}
//             className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           >
//             {isLoading ? "Adding..." : "Add Customer"}
//           </button>
//         </div>

//         {/* Bulk Upload Section */}
//         <div className="col-span-2 sm:col-span-3 lg:col-span-4 mt-6 bg-white shadow-md rounded p-4">
//           <label className="block text-gray-700 font-medium mb-2">Bulk Upload (CSV)</label>
//           <div className="flex items-center space-x-4">
//             <input
//               type="file"
//               accept=".csv"
//               onChange={(e) => setBulkFile(e.target.files ? e.target.files[0] : null)}
//               className="p-3 border rounded-lg bg-gray-100 w-full focus:outline-none"
//             />
//             <button
//               onClick={handleBulkUpload}
//               disabled={isLoading || !bulkFile}
//               className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
//             >
//               {isLoading ? "Uploading..." : "Upload CSV"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddCustomerPage;
// "use client";

// import React, { useState, useEffect } from "react";
// import { firestore } from "../../lib/firebase-config"; // Adjust the path
// import { collection, getDocs, addDoc } from "firebase/firestore";
// import Papa from "papaparse"; // Import PapaParse

// interface Package {
//   id: string;
//   name: string;
// }

// const AddCustomerPage = () => {
//   const [packages, setPackages] = useState<Package[]>([]);
//   const [customerId, setCustomerId] = useState("");
//   const [name, setName] = useState("");
//   const [username, setUsername] = useState("");
//   const [contactNumber, setContactNumber] = useState("");
//   const [completeAddress, setCompleteAddress] = useState("");
//   const [area, setarea] = useState("");
//   const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [bulkFile, setBulkFile] = useState<File | null>(null); // State to store the uploaded file

//   useEffect(() => {
//     const fetchPackages = async () => {
//       try {
//         const snapshot = await getDocs(collection(firestore, "packages"));
//         const packagesData = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           name: doc.data().name,
//         }));
//         setPackages(packagesData);
//       } catch (error) {
//         console.error("Error fetching packages:", error);
//         alert("Failed to fetch packages.");
//       }
//     };
//     fetchPackages();
//   }, []);

//   const handleAddCustomer = async () => {
//     if (
//       !customerId ||
//       !name ||
//       !username ||
//       !contactNumber ||
//       !completeAddress ||
//       !area ||
//       !selectedPackage
//     ) {
//       alert("Please fill all fields.");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const customerData = {
//         customerId,
//         name,
//         username,
//         contactNumber,
//         completeAddress,
//         area,
//         selectedPackage,
//         createDate: new Date(), // Setting the create date to the current date
//       };

//       // Add customer to Firestore
//       await addDoc(collection(firestore, "customers"), customerData);

//       alert("Customer added successfully!");
//       setCustomerId("");
//       setName("");
//       setUsername("");
//       setContactNumber("");
//       setCompleteAddress("");
//       setarea("");
//       setSelectedPackage(null);
//     } catch (error) {
//       console.error("Error adding customer:", error);
//       alert("Failed to add customer: " + error); // More specific error message
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleBulkUpload = async () => {
//     if (!bulkFile) {
//       alert("Please select a CSV file to upload.");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       // Parse the CSV file
//       Papa.parse(bulkFile, {
//         header: true, // Add this line
//         complete: async (result) => {
//           console.log("Parsed CSV data:", result.data); // Now you should see only the customer rows
//           const customers = result.data as any[];

//           // Process each customer and add to Firestore
//           for (let customer of customers) {
//             const { customerId, name, username, contactNumber, completeAddress, area, selectedPackage } = customer;

//             if (!customerId || !name || !username || !contactNumber || !completeAddress || !area || !selectedPackage) {
//               console.warn("Skipping incomplete customer data:", customer);
//               continue; // Skip incomplete rows
//             }

//             const customerData = {
//               customerId,
//               name,
//               username,
//               contactNumber,
//               completeAddress,
//               area,
//               selectedPackage,
//               createDate: new Date(), // Setting the create date to the current date
//             };

//             // Add each customer to Firestore
//             await addDoc(collection(firestore, "customers"), customerData);
//           }

//           alert("Bulk upload successful!");
//           setBulkFile(null); // Reset the file after successful upload
//         },
//         error: (error) => {
//           console.error("Error parsing CSV:", error);
//           alert("Failed to upload CSV. Please check the file format.");
//         },
//       });
//     } catch (error) {
//       console.error("Error during bulk upload:", error);
//       alert("Failed to upload customers: " + error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-6">Add Customer</h1>
//       <div className="grid grid-cols-6 gap-4">
//         <input
//           type="text"
//           placeholder="Customer ID"
//           value={customerId}
//           onChange={(e) => setCustomerId(e.target.value)}
//           className="col-span-3 p-2 border rounded"
//         />
//         <input
//           type="text"
//           placeholder="Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           className="col-span-3 p-2 border rounded"
//         />
//         <input
//           type="text"
//           placeholder="Username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           className="col-span-3 p-2 border rounded"
//         />
//         <input
//           type="text"
//           placeholder="Contact Number"
//           value={contactNumber}
//           onChange={(e) => setContactNumber(e.target.value)}
//           className="col-span-3 p-2 border rounded"
//         />
//         <textarea
//           placeholder="Complete Address"
//           value={completeAddress}
//           onChange={(e) => setCompleteAddress(e.target.value)}
//           className="col-span-6 p-2 border rounded"
//         />
//         <input
//           type="text"
//           placeholder="area"
//           value={area}
//           onChange={(e) => setarea(e.target.value)}
//           className="col-span-6 p-2 border rounded"
//         />

//         {/* Dropdown for selecting package from Firestore */}
//         <select
//           value={selectedPackage || ""}
//           onChange={(e) => setSelectedPackage(e.target.value)}
//           className="col-span-3 p-2 border rounded"
//         >
//           <option value="">Select Package</option>
//           {packages.map((pkg) => (
//             <option key={pkg.id} value={pkg.id}>
//               {pkg.name}
//             </option>
//           ))}
//         </select>

//         <button
//           onClick={handleAddCustomer}
//           disabled={isLoading}
//           className="col-span-6 bg-black text-white p-2 rounded"
//         >
//           {isLoading ? "Adding..." : "Add Customer"}
//         </button>

//         {/* Bulk Upload Section */}
//         <div className="col-span-6 mt-6">
//           <input
//             type="file"
//             accept=".csv"
//             onChange={(e) => setBulkFile(e.target.files ? e.target.files[0] : null)}
//             className="p-2 border rounded"
//           />
//           <button
//             onClick={handleBulkUpload}
//             disabled={isLoading || !bulkFile}
//             className="bg-blue-500 text-white p-2 rounded ml-2"
//           >
//             {isLoading ? "Uploading..." : "Upload Bulk CSV"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddCustomerPage;
// "use client";

// import React, { useState, useEffect } from "react";
// import { firestore } from "../../lib/firebase-config"; // Adjust the path
// import { collection, getDocs, addDoc } from "firebase/firestore";
// import Papa from "papaparse"; // Import PapaParse


// interface Package {
//   id: string;
//   name: string;
// }

// const AddCustomerPage = () => {
//   const [packages, setPackages] = useState<Package[]>([]);
//   const [customerId, setCustomerId] = useState("");
//   const [name, setName] = useState("");
//   const [username, setUsername] = useState("");
//   const [contactNumber, setContactNumber] = useState("");
//   const [completeAddress, setCompleteAddress] = useState("");
//   const [area, setarea] = useState("");
//   const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [bulkFile, setBulkFile] = useState<File | null>(null); // State to store the uploaded file

//   useEffect(() => {
//     const fetchPackages = async () => {
//       const snapshot = await getDocs(collection(firestore, "packages"));
//       const packagesData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         name: doc.data().name,
//       }));
//       setPackages(packagesData);
//     };
//     fetchPackages();
//   }, []);

//   const handleAddCustomer = async () => {
//     if (
//       !customerId ||
//       !name ||
//       !username ||
//       !contactNumber ||
//       !completeAddress ||
//       !area ||
//       !selectedPackage
//     ) {
//       alert("Please fill all fields.");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const customerData = {
//         customerId,
//         name,
//         username,
//         contactNumber,
//         completeAddress,
//         area,
//         selectedPackage,
//         createDate: new Date(), // Setting the create date to the current date
//       };

//       // Add customer to Firestore
//       await addDoc(collection(firestore, "customers"), customerData);

//       alert("Customer added successfully!");
//       setCustomerId("");
//       setName("");
//       setUsername("");
//       setContactNumber("");
//       setCompleteAddress("");
//       setarea("");
//       setSelectedPackage(null);
//     } catch (error) {
//       console.error("Error adding customer:", error);
//       alert("Failed to add customer: " + error); // More specific error message
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleBulkUpload = async () => {
//     if (!bulkFile) {
//       alert("Please select a CSV file to upload.");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       // Parse the CSV file
//       Papa.parse(bulkFile, {
//         header: true, // Add this line
//         complete: async (result) => {
//           console.log("Parsed CSV data:", result.data); // Now you should see only the customer rows
//           const customers = result.data as any[];
      
//           // Process each customer and add to Firestore
//           for (let customer of customers) {
//             const { customerId, name, username, contactNumber, completeAddress, area, selectedPackage } = customer;
      
//             if (!customerId || !name || !username || !contactNumber || !completeAddress || !area || !selectedPackage) {
//               console.warn("Skipping incomplete customer data:", customer);
//               continue; // Skip incomplete rows
//             }
      
//             const customerData = {
//               customerId,
//               name,
//               username,
//               contactNumber,
//               completeAddress,
//               area,
//               selectedPackage,
//               createDate: new Date(), // Setting the create date to the current date
//             };
      
//             // Add each customer to Firestore
//             await addDoc(collection(firestore, "customers"), customerData);
//           }
      
//           alert("Bulk upload successful!");
//           setBulkFile(null); // Reset the file after successful upload
//         },
//         error: (error) => {
//           console.error("Error parsing CSV:", error);
//           alert("Failed to upload CSV. Please check the file format.");
//         },
//       });
      
//       // Papa.parse(bulkFile, {
//       //   complete: async (result) => {
//       //     console.log("Parsed CSV data:", result.data); // Add this line to inspect the data
//       //     const customers = result.data as any[];
      
//       //     // Process each customer and add to Firestore
//       //     for (let customer of customers) {
//       //       const { customerId, name, username, contactNumber, completeAddress, area, selectedPackage } = customer;
      
//       //       if (!customerId || !name || !username || !contactNumber || !completeAddress || !area || !selectedPackage) {
//       //         console.warn("Skipping incomplete customer data:", customer);
//       //         continue; // Skip incomplete rows
//       //       }
      
//       //       const customerData = {
//       //         customerId,
//       //         name,
//       //         username,
//       //         contactNumber,
//       //         completeAddress,
//       //         area,
//       //         selectedPackage,
//       //         createDate: new Date(), // Setting the create date to the current date
//       //       };
      
//       //       // Add each customer to Firestore
//       //       await addDoc(collection(firestore, "customers"), customerData);
//       //     }
      
//       //     alert("Bulk upload successful!");
//       //     setBulkFile(null); // Reset the file after successful upload
//       //   },
//       //   error: (error) => {
//       //     console.error("Error parsing CSV:", error);
//       //     alert("Failed to upload CSV. Please check the file format.");
//       //   },
//       // });
      
//       // Papa.parse(bulkFile, {
//       //   complete: async (result) => {
//       //     const customers = result.data as any[];

//       //     // Process each customer and add to Firestore
//       //     for (let customer of customers) {
//       //       const { customerId, name, username, contactNumber, completeAddress, area, selectedPackage } = customer;

//       //       if (!customerId || !name || !username || !contactNumber || !completeAddress || !area || !selectedPackage) {
//       //         console.warn("Skipping incomplete customer data:", customer);
//       //         continue; // Skip incomplete rows
//       //       }

//       //       const customerData = {
//       //         customerId,
//       //         name,
//       //         username,
//       //         contactNumber,
//       //         completeAddress,
//       //         area,
//       //         selectedPackage,
//       //         createDate: new Date(), // Setting the create date to the current date
//       //       };

//       //       // Add each customer to Firestore
//       //       await addDoc(collection(firestore, "customers"), customerData);
//       //     }

//       //     alert("Bulk upload successful!");
//       //     setBulkFile(null); // Reset the file after successful upload
//       //   },
//       //   error: (error) => {
//       //     console.error("Error parsing CSV:", error);
//       //     alert("Failed to upload CSV. Please check the file format.");
//       //   },
//       // });
//     } catch (error) {
//       console.error("Error during bulk upload:", error);
//       alert("Failed to upload customers: " + error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-6">Add Customer</h1>
//       <div className="grid grid-cols-6 gap-4">
//         <input
//           type="text"
//           placeholder="Customer ID"
//           value={customerId}
//           onChange={(e) => setCustomerId(e.target.value)}
//           className="col-span-3 p-2 border rounded"
//         />
//         <input
//           type="text"
//           placeholder="Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           className="col-span-3 p-2 border rounded"
//         />
//         <input
//           type="text"
//           placeholder="Username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           className="col-span-3 p-2 border rounded"
//         />
//         <input
//           type="text"
//           placeholder="Contact Number"
//           value={contactNumber}
//           onChange={(e) => setContactNumber(e.target.value)}
//           className="col-span-3 p-2 border rounded"
//         />
//         <textarea
//           placeholder="Complete Address"
//           value={completeAddress}
//           onChange={(e) => setCompleteAddress(e.target.value)}
//           className="col-span-6 p-2 border rounded"
//         />
//         <input
//           type="text"
//           placeholder="area"
//           value={area}
//           onChange={(e) => setarea(e.target.value)}
//           className="col-span-6 p-2 border rounded"
//         />
//         <select
//           value={selectedPackage || ""}
//           onChange={(e) => setSelectedPackage(e.target.value)}
//           className="col-span-3 p-2 border rounded"
//         >
//           <option value="">Select Package</option>
//           <option value="15 Mbps">15 Mbps</option>
//           <option value="20 Mbps">20 Mbps</option>
//           {/* {packages.map((pkg) => (
//             <option key={pkg.id} value={pkg.id}>
//               {pkg.name}
//             </option>
//           ))} */}
//         </select>
//         <button
//           onClick={handleAddCustomer}
//           disabled={isLoading}
//           className="col-span-6 bg-black text-white p-2 rounded"
//         >
//           {isLoading ? "Adding..." : "Add Customer"}
//         </button>

//         {/* Bulk Upload Section */}
//         <div className="col-span-6 mt-6">
//           <input
//             type="file"
//             accept=".csv"
//             onChange={(e) => setBulkFile(e.target.files ? e.target.files[0] : null)}
//             className="p-2 border rounded"
//           />
//           <button
//             onClick={handleBulkUpload}
//             disabled={isLoading || !bulkFile}
//             className="bg-blue-500 text-white p-2 rounded ml-2"
//           >
//             {isLoading ? "Uploading..." : "Upload Bulk CSV"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddCustomerPage;
// "use client";

// import React, { useState, useEffect } from "react";
// import { firestore } from "../../lib/firebase-config"; // Adjust the path
// import { collection, getDocs, addDoc } from "firebase/firestore";

// interface Package {
//   id: string;
//   name: string;
// }

// const AddCustomerPage = () => {
//   const [packages, setPackages] = useState<Package[]>([]);
//   const [customerId, setCustomerId] = useState("");
//   const [name, setName] = useState("");
//   const [username, setUsername] = useState("");
//   const [contactNumber, setContactNumber] = useState("");
//   const [completeAddress, setCompleteAddress] = useState("");
//   const [area, setarea] = useState("");
//   const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const fetchPackages = async () => {
//       const snapshot = await getDocs(collection(firestore, "packages"));
//       const packagesData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         name: doc.data().name,
//       }));
//       setPackages(packagesData);
//     };
//     fetchPackages();
//   }, []);

//   const handleAddCustomer = async () => {
//     if (
//       !customerId ||
//       !name ||
//       !username ||
//       !contactNumber ||
//       !completeAddress ||
//       !area ||
//       !selectedPackage
//     ) {
//       alert("Please fill all fields.");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const customerData = {
//         customerId,
//         name,
//         username,
//         contactNumber,
//         completeAddress,
//         area,
//         selectedPackage,
//         createDate: new Date(), // Setting the create date to the current date
//       };

//       // Add customer to Firestore
//       await addDoc(collection(firestore, "customers"), customerData);

//       alert("Customer added successfully!");
//       setCustomerId("");
//       setName("");
//       setUsername("");
//       setContactNumber("");
//       setCompleteAddress("");
//       setarea("");
//       setSelectedPackage(null);
//     } catch (error) {
//       console.error("Error adding customer:", error);
//       alert("Failed to add customer: " + error); // More specific error message
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-6">Add Customer</h1>
//       <div className="grid grid-cols-6 gap-4">
//         <input
//           type="text"
//           placeholder="Customer ID"
//           value={customerId}
//           onChange={(e) => setCustomerId(e.target.value)}
//           className="col-span-3 p-2 border rounded"
//         />
//         <input
//           type="text"
//           placeholder="Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           className="col-span-3 p-2 border rounded"
//         />
//         <input
//           type="text"
//           placeholder="Username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           className="col-span-3 p-2 border rounded"
//         />
//         <input
//           type="text"
//           placeholder="Contact Number"
//           value={contactNumber}
//           onChange={(e) => setContactNumber(e.target.value)}
//           className="col-span-3 p-2 border rounded"
//         />
//         <textarea
//           placeholder="Complete Address"
//           value={completeAddress}
//           onChange={(e) => setCompleteAddress(e.target.value)}
//           className="col-span-6 p-2 border rounded"
//         />
//         <input
//           type="text"
//           placeholder="area"
//           value={area}
//           onChange={(e) => setarea(e.target.value)}
//           className="col-span-6 p-2 border rounded"
//         />
//         <select
//           value={selectedPackage || ""}
//           onChange={(e) => setSelectedPackage(e.target.value)}
//           className="col-span-3 p-2 border rounded"
//         >
//           <option value="">Select Package</option>
//           <option value="15 Mbps">15 Mbps</option>
//           <option value="20 Mbps">20 Mbps</option>
//           {/* {packages.map((pkg) => (
//             <option key={pkg.id} value={pkg.id}>
//               {pkg.name}
//             </option>
//           ))} */}
//         </select>
//         <button
//           onClick={handleAddCustomer}
//           disabled={isLoading}
//           className="col-span-6 bg-black text-white p-2 rounded"
//         >
//           {isLoading ? "Adding..." : "Add Customer"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AddCustomerPage;