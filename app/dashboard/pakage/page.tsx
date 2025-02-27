"use client";

import React, { useState, useEffect } from "react";
import { firestore } from "../../lib/firebase-config"; // Adjust the path
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import withAuth from "@/app/lib/withauth";

const AddPackagePage = () => {
  const [packageName, setPackageName] = useState(""); // State for the package input
  const [packages, setPackages] = useState<{ id: string; name: string }[]>([]); // State to store fetched packages
  const [isLoading, setIsLoading] = useState(false);

  // Fetch packages from Firestore
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

  // Handle adding a new package to Firestore
  const handleAddPackage = async () => {
    if (!packageName) {
      alert("Please enter a package name.");
      return;
    }

    setIsLoading(true);
    try {
      const packageData = {
        name: packageName,
        createDate: new Date(), // Setting the create date to the current date
      };

      // Add package to Firestore
      const docRef = await addDoc(collection(firestore, "packages"), packageData);

      alert("Package added successfully!");
      setPackageName(""); // Reset the input field after successful addition

      // Add the new package to the local state (UI update)
      setPackages((prevPackages) => [
        ...prevPackages,
        { id: docRef.id, name: packageName },
      ]);
    } catch (error) {
      console.error("Error adding package:", error);
      alert("Failed to add package: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a package from Firestore
  const handleDeletePackage = async (packageId: string) => {
    const confirmation = window.confirm("Are you sure you want to delete this package?");
    if (!confirmation) return;

    setIsLoading(true);
    try {
      // Delete the package from Firestore
      const packageDoc = doc(firestore, "packages", packageId);
      console.log("Deleting package with ID:", packageId);  // Debugging log

      await deleteDoc(packageDoc);
      
      // After successful deletion, update the UI
      setPackages((prevPackages) =>
        prevPackages.filter((pkg) => pkg.id !== packageId)
      );

      alert("Package deleted successfully!");
    } catch (error) {
      console.error("Error deleting package:", error);
      alert("Failed to delete package: " + error); // Displaying error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-indigo-600">Add Package</h1>

      {/* Input field to add package */}
      <div className="flex flex-col items-center mb-6 space-y-4">
        <input
          type="text"
          placeholder="Enter Package Name"
          value={packageName}
          onChange={(e) => setPackageName(e.target.value)}
          className="w-80 p-3 border-2 border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 transition duration-200"
        />
        <button
          onClick={handleAddPackage}
          disabled={isLoading}
          className="w-80 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
        >
          {isLoading ? "Adding..." : "Add Package"}
        </button>
      </div>

      {/* List of existing packages */}
      <div>
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-800">Existing Packages</h2>
        <ul className="space-y-4">
          {packages.map((pkg) => (
            <li
              key={pkg.id}
              className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-sm hover:bg-indigo-50 transition duration-200"
            >
              <span className="text-lg text-gray-700">{pkg.name}</span>
              <button
                onClick={() => handleDeletePackage(pkg.id)}
                className="bg-red-500 text-white px-4 py-1 rounded-full text-sm hover:bg-red-600 transition duration-200"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default withAuth(AddPackagePage);
