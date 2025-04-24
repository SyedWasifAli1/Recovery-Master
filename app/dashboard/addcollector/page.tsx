"use client";

import React, { useState } from "react";
import { firestore, auth } from "../../lib/firebase-config";
import { collection, doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import withAuth from "@/app/lib/withauth";
import crypto from "crypto";

const AddCollectorPage = () => {
  const [name, setName] = useState("");
  const [cnic, setCnic] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [completeAddress, setCompleteAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    cnic: "",
    contactNumber: "",
    completeAddress: "",
    email: "",
    password: ""
  });

  const validateCNIC = (cnic: string) => {
    const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/;
    return cnicRegex.test(cnic) || /^[0-9]{13}$/.test(cnic);
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^(\+92|0)[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: "",
      cnic: "",
      contactNumber: "",
      completeAddress: "",
      email: "",
      password: ""
    };

    if (!name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    if (!cnic.trim()) {
      newErrors.cnic = "CNIC is required";
      valid = false;
    } else if (!validateCNIC(cnic)) {
      newErrors.cnic = "Please enter a valid CNIC (13 digits)";
      valid = false;
    }

    if (!contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
      valid = false;
    } else if (!validatePhoneNumber(contactNumber)) {
      newErrors.contactNumber = "Please enter a valid phone number (e.g. 03001234567)";
      valid = false;
    }

    if (!completeAddress.trim()) {
      newErrors.completeAddress = "Address is required";
      valid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (!validatePassword(password)) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleAddClick = () => {
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmAdd = async () => {
    setShowConfirmation(false);
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const codenumber = generateNumericHash(user.uid);

      const collectorData = {
        name,
        cnic: cnic.replace(/-/g, ''),
        contactNumber: contactNumber.startsWith('0') ? contactNumber : `0${contactNumber}`,
        completeAddress,
        email,
        password: password,
        role: "collector",
        totalPayments: 0,
        uid: codenumber,
        createDate: new Date(),
      };

      await setDoc(doc(collection(firestore, "collectors"), user.uid), collectorData);

      alert("Collector added successfully!");
      resetForm();
    } catch (error: unknown) {
      console.error("Error adding collector:", error);
      if (error === 'auth/email-already-in-use') {
        setErrors(prev => ({...prev, email: "Email is already in use"}));
      } else {
        alert("Failed to add collector: " + error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAdd = () => {
    setShowConfirmation(false);
  };

  const resetForm = () => {
    setName("");
    setCnic("");
    setContactNumber("");
    setCompleteAddress("");
    setEmail("");
    setPassword("");
    setErrors({
      name: "",
      cnic: "",
      contactNumber: "",
      completeAddress: "",
      email: "",
      password: ""
    });
  };

  const generateNumericHash = (id: string) => {
    const hash = crypto.createHash("sha256").update(id).digest("hex");
    return parseInt(hash.substring(0, 10), 16) % 1000000;
  };

  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 13) value = value.substring(0, 13);
    
    if (value.length > 5) {
      value = value.substring(0, 5) + '-' + value.substring(5);
    }
    if (value.length > 13) {
      value = value.substring(0, 13) + '-' + value.substring(13);
    }
    
    setCnic(value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.startsWith('92')) {
      value = '0' + value.substring(2);
    }
    if (value.length > 11) value = value.substring(0, 11);
    setContactNumber(value);
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Add Collector</h1>

      <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Name</label>
            <input 
              type="text" 
              placeholder="Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400" 
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">CNIC</label>
            <input 
              type="text" 
              placeholder="XXXXX-XXXXXXX-X" 
              value={cnic} 
              onChange={handleCnicChange} 
              className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400" 
            />
            {errors.cnic && <p className="text-red-500 text-sm mt-1">{errors.cnic}</p>}
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Contact Number</label>
            <input 
              type="text" 
              placeholder="03001234567" 
              value={contactNumber} 
              onChange={handlePhoneChange} 
              className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400" 
            />
            {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Complete Address</label>
          <textarea 
            placeholder="Complete Address" 
            value={completeAddress} 
            onChange={(e) => setCompleteAddress(e.target.value)} 
            className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400" 
          />
          {errors.completeAddress && <p className="text-red-500 text-sm mt-1">{errors.completeAddress}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400" 
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400" 
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
        </div>

        <div className="flex justify-center">
          <button 
            onClick={handleAddClick} 
            disabled={isLoading} 
            className="w-full sm:w-1/3 bg-black text-white p-4 rounded-lg hover:bg-[#8A56E8] focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {isLoading ? "Adding..." : "Add Collector"}
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Add Collector</h2>
            <p className="mb-6">Are you sure you want to add this collector?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelAdd}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAdd}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-[#8A56E8]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(AddCollectorPage);
// "use client";

// import React, { useState } from "react";
// import { firestore } from "../../lib/firebase-config"; // Adjust the path
// import { collection, addDoc } from "firebase/firestore";

// const AddCollectorPage = () => {
//   const [collectorId, setCollectorId] = useState("");
//   const [name, setName] = useState("");
//   const [cnic, setCnic] = useState("");
//   const [contactNumber, setContactNumber] = useState("");
//   const [completeAddress, setCompleteAddress] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const handleAddCollector = async () => {
//     if (!collectorId || !name || !cnic || !contactNumber || !completeAddress) {
//       alert("Please fill all fields.");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const collectorData = {
//         collectorId,
//         name,
//         cnic,
//         contactNumber,
//         completeAddress,
//         createDate: new Date(), // Setting the create date to the current date
//       };

//       // Add collector to Firestore
//       await addDoc(collection(firestore, "collectors"), collectorData);

//       alert("Collector added successfully!");
//       setCollectorId("");
//       setName("");
//       setCnic("");
//       setContactNumber("");
//       setCompleteAddress("");
//     } catch (error) {
//       console.error("Error adding collector:", error);
//       alert("Failed to add collector: " + error); // More specific error message
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-2xl font-bold mb-6">Add Collector</h1>
//       <div className="grid grid-cols-6 gap-4">
//         <input
//           type="text"
//           placeholder="Collector ID"
//           value={collectorId}
//           onChange={(e) => setCollectorId(e.target.value)}
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
//           placeholder="CNIC"
//           value={cnic}
//           onChange={(e) => setCnic(e.target.value)}
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
//         <button
//           onClick={handleAddCollector}
//           disabled={isLoading}
//           className="col-span-6 bg-black text-white p-2 rounded"
//         >
//           {isLoading ? "Adding..." : "Add Collector"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AddCollectorPage;