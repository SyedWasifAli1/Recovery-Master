"use client";

import React, { useState } from "react";
import { firestore, auth } from "../../lib/firebase-config"; // Adjust the path
import { collection, doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import withAuth from "@/app/lib/withauth";
import crypto from "crypto";


const AddCollectorPage = () => {
  // const [collectorId, setCollectorId] = useState("");
  const [name, setName] = useState("");
  const [cnic, setCnic] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [completeAddress, setCompleteAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCollector = async () => {
    if ( !name || !cnic || !contactNumber || !completeAddress || !email || !password) {
      alert("Please fill all fields.");
      return;
    }

    setIsLoading(true);
    try {
      // Register user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
    const  codenumber =generateNumericHash(user.uid);
      // Prepare collector data
      const collectorData = {
        // collectorId,
        name,
        cnic,
        contactNumber,
        completeAddress,
        email,
        password :password,
        role:"collector",
        totalPayments:0,
        uid:codenumber,
        createDate: new Date(),
      };

      // Save collector data in Firestore with UID as document ID
      await setDoc(doc(collection(firestore, "collectors"), user.uid), collectorData);

      alert("Collector added successfully!");
      // setCollectorId("");
      setName("");
      setCnic("");
      setContactNumber("");
      setCompleteAddress("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Error adding collector:", error);
      // alert("Failed to add collector: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
const generateNumericHash = (id:string) => {
  const hash = crypto.createHash("sha256").update(id).digest("hex");
  return parseInt(hash.substring(0,10), 16) % 1000000; // ✅ Same modulo logic as Dart
};
  return (
    <div className="container mx-auto p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Add Collector</h1>

      <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* <div>
            <label className="block text-gray-700 font-semibold mb-2">Collector ID</label>
            <input type="text" placeholder="Collector ID" value={collectorId} onChange={(e) => setCollectorId(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div> */}

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Name</label>
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">CNIC</label>
            <input type="text" placeholder="CNIC" value={cnic} onChange={(e) => setCnic(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Contact Number</label>
            <input type="text" placeholder="Contact Number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>

       

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Complete Address</label>
          <textarea placeholder="Complete Address" value={completeAddress} onChange={(e) => setCompleteAddress(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>

        <div className="flex justify-center">
          <button onClick={handleAddCollector} disabled={isLoading} className="w-full sm:w-1/3 bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
            {isLoading ? "Adding..." : "Add Collector"}
          </button>
        </div>
      </div>
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