"use client";

import React, { useState, useEffect } from "react";
import { firestore } from "../../lib/firebase-config";
import { collection, getDocs, addDoc,  updateDoc, doc } from "firebase/firestore";
import withAuth from "@/app/lib/withauth";

// Interface for package data
interface Package {
  id: string;
  name: string;
  price: number;
  // size: string;
  createDate: Date;
}

const AddPackagePage: React.FC = () => {
  const [packageName, setPackageName] = useState<string>("");
  const [packagePrice, setPackagePrice] = useState<number | "">("");
  // const [packageSize, setPackageSize] = useState<string>("MB");
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);
      try {
        const snapshot = await getDocs(collection(firestore, "packages"));
        const packagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Package[];
        setPackages(packagesData);
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handleAddOrUpdatePackage = async () => {
    if (!packageName || !packagePrice) {
      alert("Please enter package name and price.");
      return;
    }

    setIsLoading(true);
    try {
      const packageData: Omit<Package, "id"> = {
        name: packageName,
        price: Number(packagePrice),
        // size: packageSize,
        createDate: new Date(),
      };

      if (editingPackage) {
        await updateDoc(doc(firestore, "packages", editingPackage.id), packageData);
        setPackages((prevPackages) =>
          prevPackages.map((pkg) =>
            pkg.id === editingPackage.id ? { id: editingPackage.id, ...packageData } : pkg
          )
        );
        alert("Package updated successfully!");
      } else {
        const docRef = await addDoc(collection(firestore, "packages"), packageData);
        setPackages((prevPackages) => [...prevPackages, { id: docRef.id, ...packageData }]);
        alert("Package added successfully!");
      }
      resetForm();
    } catch (error) {
      console.error("Error saving package:", error);
      alert("Failed to save package: " + error);
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  // const handleDeletePackage = async (packageId: string) => {
  //   if (!window.confirm("Are you sure you want to delete this package?")) return;

  //   setIsLoading(true);
  //   try {
  //     await deleteDoc(doc(firestore, "packages", packageId));
  //     setPackages((prevPackages) => prevPackages.filter((pkg) => pkg.id !== packageId));
  //     alert("Package deleted successfully!");
  //   } catch (error) {
  //     console.error("Error deleting package:", error);
  //     alert("Failed to delete package: " + error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleEditPackage = (pkg: Package) => {
    setPackageName(pkg.name);
    setPackagePrice(pkg.price);
    // setPackageSize(pkg.size);
    setEditingPackage(pkg);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setPackageName("");
    setPackagePrice("");
    // setPackageSize("MB");
    setEditingPackage(null);
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-indigo-600">Manage Packages</h1>
      <button
  onClick={() => {
    setEditingPackage(null); // Reset editing state
    setPackageName(""); // Reset package name
    setPackagePrice(""); // Reset package price
    setIsModalOpen(true);
  }}
  className="w-80 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
>
  Add New Package
</button>

      <h2 className="text-xl font-semibold text-center mt-6 mb-4">Existing Packages</h2>
      {isLoading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <ul className="space-y-4">
          {packages.map((pkg) => (
            <li key={pkg.id} className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
              <span className="text-lg">
                {pkg.name} - Rs.{pkg.price}
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => handleEditPackage(pkg)}
                  className="bg-blue-500 text-white px-4 py-1 rounded-full"
                >
                  Edit
                </button>
                <button
                  // onClick={() => handleDeletePackage(pkg.id)}
                  // onClick={}
                  className="bg-red-500 text-white px-4 py-1 rounded-full"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold mb-4">{editingPackage ? "Edit Package" : "Add Package"}</h2>
            <input
              type="text"
              placeholder="Enter Package Name"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className="w-full p-3 border-2 border-indigo-500 rounded-md"
            />
            <input
              type="number"
              placeholder="Enter Package Price"
              value={packagePrice}
              onChange={(e) => setPackagePrice(Number(e.target.value))}
              className="w-full p-3 border-2 border-indigo-500 rounded-md"
            />
            {/* <select
              value={packageSize}
              onChange={(e) => setPackageSize(e.target.value)}
              className="w-full p-3 border-2 border-indigo-500 rounded-md"
            >
              <option value="MB">MB</option>
              <option value="GB">GB</option>
              <option value="Mbps">Mbps</option>
            </select> */}
            <button
              onClick={handleAddOrUpdatePackage}
              disabled={isLoading}
              className="w-full py-3 mt-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {isLoading ? "Processing..." : editingPackage ? "Update Package" : "Add Package"}
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full py-2 mt-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(AddPackagePage);
