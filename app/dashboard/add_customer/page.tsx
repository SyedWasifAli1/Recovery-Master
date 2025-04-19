"use client";

import React, { useState, useEffect } from "react";
import { firestore } from "../../lib/firebase-config"; // Adjust the path
import { collection, getDocs, addDoc } from "firebase/firestore";
import Papa from "papaparse"; // Import PapaParse
import withAuth from "@/app/lib/withauth";
import * as XLSX from "xlsx";

interface Package {
  id: string;
  name: string;
  price: number;
  size: string;
}

interface Customer {
  name: string;
  username: string;
  contactNumber: string;
  completeAddress: string;
  area: string;
  city: string;
  category: string;
  selectedPackage: string;
  selectedCollector: string;
  discount: number;
  device: number;
  finalPrice: number;
  createDate: Date;
  lastpay: Date;
}

interface Collector {
  id: string;
  name: string;
}

const AddCustomerPage = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [completeAddress, setCompleteAddress] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedCollector, setSelectedCollector] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [device, setDevice] = useState<number>(1);
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // Error state

  useEffect(() => {
    const fetchPackages = async () => {
      const snapshot = await getDocs(collection(firestore, "packages"));
      const packagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        price: doc.data().price,
        size: doc.data().size,
      }));
      setPackages(packagesData);
    };

    const fetchCollectors = async () => {
      const snapshot = await getDocs(collection(firestore, "collectors"));
      const collectorsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setCollectors(collectorsData);
    };

    fetchCollectors();
    fetchPackages();
  }, []);

  useEffect(() => {
    if (selectedPackage) {
      const selectedPkg = packages.find((pkg) => pkg.id === selectedPackage);
      if (selectedPkg) {
        // Calculate the price after applying the device multiplier
        const selectedPkgDevicePrice = selectedPkg.price * device;
        
        // Apply the discount percentage
        const finalPrice = selectedPkgDevicePrice - (selectedPkgDevicePrice * discount) / 100;
        
        // Set the final price
        setFinalPrice(finalPrice);
      }
    }
  }, [selectedPackage, discount, packages, device]);
  

  const validateInputs = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name) newErrors.name = "Name is required.";
    if (!username) newErrors.username = "Business Name is required.";
    if (!contactNumber) newErrors.contactNumber = "Contact Number is required.";
    if (!completeAddress) newErrors.completeAddress = "Complete Address is required.";
    if (!area) newErrors.area = "Area is required.";
    if (!city) newErrors.city = "City is required.";
    if (!category) newErrors.category = "Category is required.";
    if (!selectedPackage) newErrors.selectedPackage = "Package is required.";
    if (!selectedCollector) newErrors.selectedCollector = "Collector is required.";
    if (device < 1) newErrors.device = "Number of devices must be at least 1.";
    if (discount < 0 || discount > 100) newErrors.discount = "Discount must be between 0 and 100.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleAddCustomer = async () => {
    if (!validateInputs()) return; // Stop if validation fails

    setIsLoading(true);
    try {
      const currentDate = new Date();
      const lastPayDate = new Date(currentDate);
      lastPayDate.setMonth(lastPayDate.getMonth() - 1);

      const customerData = {
        name,
        username,
        contactNumber,
        completeAddress,
        area,
        city,
        category,
        selectedPackage,
        selectedCollector,
        discount,
        device,
        finalPrice,
        lastPaid:0,
        remainingamount:0,
        createDate: currentDate,
        lastpay: lastPayDate,
      };

      await addDoc(collection(firestore, "customers"), customerData);

      alert("Customer added successfully!");
      // Reset form fields
      setName("");
      setUsername("");
      setContactNumber("");
      setCompleteAddress("");
      setArea("");
      setCity("");
      setCategory("");
      setSelectedPackage(null);
      setSelectedCollector(null);
      setDiscount(0);
      setDevice(1);
      setFinalPrice(0);
      setErrors({}); // Clear errors
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Failed to add customer: " + error);
    } finally {
      setIsLoading(false);
    }
  };


//   import Papa from "papaparse";
// import { collection, addDoc } from "firebase/firestore";
// import { firestore } from "@/lib/firebase";


const handleBulkUpload = async () => {
  if (!bulkFile) {
    alert("Please select an Excel file to upload.");
    return;
  }

  setIsLoading(true);

  try {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const customers: Customer[] = XLSX.utils.sheet_to_json(sheet);

      for (const customer of customers) {
        const {
          name,
          username,
          contactNumber,
          completeAddress,
          area,
          city,
          category,
          selectedPackage,
          selectedCollector,
          discount,
          device,
          finalPrice,
        } = customer;

        // Validate required fields
        if (
          !name ||
          !username ||
          !contactNumber ||
          !completeAddress ||
          !area ||
          !city ||
          !category ||
          !selectedPackage ||
          !selectedCollector ||
          discount === undefined ||
          device === undefined ||
          finalPrice === undefined
        ) {
          console.warn("Skipping incomplete customer data:", customer);
          continue;
        }

        const currentDate = new Date();
        const lastPayDate = new Date(currentDate);
        lastPayDate.setMonth(lastPayDate.getMonth() - 1);

        const customerData = {
          name,
          username,
          contactNumber,
          completeAddress,
          area,
          city,
          category,
          selectedPackage,
          selectedCollector,
          discount,
          device,
          finalPrice,
          lastPaid: 0,
          remainingamount: 0,
          createDate: currentDate.toISOString(),
          lastpay: lastPayDate.toISOString(),
        };

        await addDoc(collection(firestore, "customers"), customerData);
      }

      alert("Bulk upload successful!");
      setBulkFile(null);
    };
    reader.readAsArrayBuffer(bulkFile);
  } catch (error) {
    console.error("Error during bulk upload:", error);
    alert("Failed to upload customers: " + error);
  } finally {
    setIsLoading(false);
  }
};

const handleDownloadFormat = () => {
  const headers = [
    [
      "Name",
      "Username",
      "Contact Number",
      "Complete Address",
      "Area",
      "City",
      "Category",
      "Selected Package",
      "Selected Collector",
      "Discount",
      "Device",
      "Final Price",
      "Create Date",
      "Last Pay",
    ],
  ];

  // 🔥 Demo Data
  const demoData = [
    {
      name: "Ali Khan",
      username: "ali123",
      contactNumber: "03001234567",
      completeAddress: "House #123, Street #4, Karachi",
      area: "Gulshan",
      city: "Karachi",
      category: "Premium",
      selectedPackage: "Gold",
      selectedCollector: "Ahmed",
      discount: 10,
      device: 2,
      finalPrice: 4500,
      createDate: new Date().toISOString(),
      lastpay: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
    },
    {
      name: "Sara Ahmed",
      username: "sara786",
      contactNumber: "03111234567",
      completeAddress: "House #56, Street #2, Lahore",
      area: "Johar Town",
      city: "Lahore",
      category: "Standard",
      selectedPackage: "Silver",
      selectedCollector: "Bilal",
      discount: 5,
      device: 1,
      finalPrice: 1000,
      createDate: new Date().toISOString(),
      lastpay: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(demoData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Customer_Format");
  XLSX.writeFile(workbook, "Customer_Demo.xlsx");
};



  // const handleBulkUpload = async () => {
  //   if (!bulkFile) {
  //     alert("Please select a CSV file to upload.");
  //     return;
  //   }
  
  //   setIsLoading(true);
  //   try {
  //     Papa.parse(bulkFile, {
  //       header: true,
  //       complete: async (result) => {
  //         const customers = result.data as Customer[];
  
  //         for (const customer of customers) {
  //           const {
  //             name,
  //             username,
  //             contactNumber,
  //             completeAddress,
  //             area,
  //             city,
  //             category,
  //             selectedPackage,
  //             selectedCollector,
  //             discount,
  //             device,
  //             finalPrice,
  //           } = customer;
  
  //           // Validate required fields
  //           if (
  //             !name ||
  //             !username ||
  //             !contactNumber ||
  //             !completeAddress ||
  //             !area ||
  //             !city ||
  //             !category ||
  //             !selectedPackage ||
  //             !selectedCollector ||
  //             discount === undefined ||
  //             device === undefined ||
  //             finalPrice === undefined
  //           ) {
  //             console.warn("Skipping incomplete customer data:", customer);
  //             continue;
  //           }
  
  //           const currentDate = new Date();
  //           const lastPayDate = new Date(currentDate);
  //           lastPayDate.setMonth(lastPayDate.getMonth() - 1);
  
  //           const customerData = {
  //             name,
  //             username,
  //             contactNumber,
  //             completeAddress,
  //             area,
  //             city,
  //             category,
  //             selectedPackage,
  //             selectedCollector,
  //             discount,
  //             device,
  //             finalPrice,
  //             lastPaid:0,
  //             remainingamount:0,
  //             createDate: currentDate,
  //             lastpay: lastPayDate,
  //           };
  
  //           await addDoc(collection(firestore, "customers"), customerData);
  //         }
  
  //         alert("Bulk upload successful!");
  //         setBulkFile(null);
  //       },
  //       error: (error) => {
  //         console.error("Error parsing CSV:", error);
  //         alert("Failed to upload CSV. Please check the file format.");
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Error during bulk upload:", error);
  //     alert("Failed to upload customers: " + error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleDownloadFormat = () => {
  //   const headers = [
  //     ["Name", "Username", "Contact Number", "Complete Address", "Area", "City", "Category", "Selected Package", "Selected Collector", "Discount","Device", "Final Price", "Create Date", "Last Pay"],
  //   ];

  //   const emptyRow = [{
  //     name: "",
  //     username: "",
  //     contactNumber: "",
  //     completeAddress: "",
  //     area: "",
  //     city: "",
  //     category: "",
  //     selectedPackage: "",
  //     selectedCollector: "",
  //     discount: "",
  //     device:"",
  //     finalPrice: "",
      
  //     createDate: "",
  //     lastpay: "",
  //   }];

  //   const worksheet = XLSX.utils.json_to_sheet(emptyRow, { header: Object.keys(emptyRow[0]) });
  //   XLSX.utils.sheet_add_aoa(worksheet, headers, { origin: "A1" });

  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Customer_Format");
  //   XLSX.writeFile(workbook, "Customer_Format.xlsx");
  // };

  return (
    <div className="container mx-auto p-6 pt-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Add Customer</h1>
        <div className="flex items-center">
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setBulkFile(e.target.files ? e.target.files[0] : null)}
            className="w-50 p-2 border rounded-lg bg-gray-100 focus:outline-none mr-4"
          />
          <button onClick={handleDownloadFormat}>Download Excel Format</button>

          <button
            onClick={handleBulkUpload}
            disabled={isLoading || !bulkFile}
            className="w-1/4 bg-black text-white p-3 rounded-lg hover:bg-[#8A56E8] focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Username */}
        <div className="bg-white shadow-md rounded p-4">
          <label className="block text-gray-700 font-medium mb-2">Business Name</label>
          <input
            type="text"
            placeholder="Business Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
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
          {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
        </div>

        {/* Select Package */}
        <div className="bg-white shadow-md rounded p-4">
          <label className="block text-gray-700 font-medium mb-2">Select Package Price</label>
          <select
            value={selectedPackage || ""}
            onChange={(e) => setSelectedPackage(e.target.value )}
            className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Package Price</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name} {pkg.size} - Rs.{pkg.price}
              </option>
            ))}
          </select>
          {errors.selectedPackage && <p className="text-red-500 text-sm mt-1">{errors.selectedPackage}</p>}
        </div>

        {/* Complete Address & area in a single row */}
        <div className="bg-white shadow-md rounded p-4 col-span-2 sm:col-span-3 lg:col-span-4 grid grid-cols-2 gap-4">
          <div className="p-4 flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-2">Select Collector</label>
              <select
                value={selectedCollector || ""}
                onChange={(e) => setSelectedCollector(e.target.value)}
                className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Collector</option>
                {collectors.map((collector) => (
                  <option key={collector.id} value={collector.id}>{collector.name}</option>
                ))}
              </select>
              {errors.selectedCollector && <p className="text-red-500 text-sm mt-1">{errors.selectedCollector}</p>}
            </div>
            <div className="flex-1">
  <label className="block text-gray-700 font-medium mb-2">Number Of Device</label>
  <input
    type="number"
    placeholder="Number Of Device"
    value={device}
    onChange={(e) => {
      const value = Number(e.target.value);
      if (value < 1) {
        setErrors({ ...errors, device: "Number of devices must be at least 1." });
      } else {
        setErrors({ ...errors, device: "" }); // Clear error
      }
      setDevice(value < 1 ? 1 : value); // Ensure value is at least 1
    }}
    min="1"
    className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
  />
  {errors.device && <p className="text-red-500 text-sm mt-1">{errors.device}</p>}
</div>
          </div>
          <div className="p-4 flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-2">Discount (%)</label>
              <input
                type="number"
                placeholder="Discount"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {errors.discount && <p className="text-red-500 text-sm mt-1">{errors.discount}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-2">Final Price</label>
              <input
                type="text"
                value={`Rs.${finalPrice.toFixed(2)}`}
                disabled
                className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Complete Address</label>
            <textarea
              placeholder="Complete Address"
              value={completeAddress}
              onChange={(e) => setCompleteAddress(e.target.value)}
              className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.completeAddress && <p className="text-red-500 text-sm mt-1">{errors.completeAddress}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Area</label>
            <input
              type="text"
              placeholder="Area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Category</label>
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">City</label>
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>
        </div>

        {/* Add Customer Button */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-4 mt-6">
          <button
            onClick={handleAddCustomer}
            disabled={isLoading}
            className="w-full bg-black text-white p-3 rounded-lg hover:bg-[#8A56E8] focus:outline-none focus:ring-2 focus:ring-blue-400"
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