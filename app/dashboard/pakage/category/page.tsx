"use client";

import { useState, useEffect } from "react";
import { firestore, auth } from "../../../lib/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { FiEdit, FiTrash } from "react-icons/fi";
import Link from "next/link";

// Utility function to convert string to Title Case
const toTitleCase = (str: string) =>
  str.replace(/\b\w/g, (char) => char.toUpperCase());


interface DealStoreCategory {
  id: string;
  name: string;
}

const Categories = () => {
  const [dealstorecategoryName, setdealstorecategoryName] = useState("");
  const [categories, setCategories] = useState<DealStoreCategory[]>([]);
  const [dealstorecategoryError, setdealstorecategoryError] = useState("");
  const [editingdealstorecategory, setEditingdealstorecategory] = useState<DealStoreCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch categories from Firestore
  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "dealstorecategory"));
      const fetchedCategories = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: toTitleCase(doc.data().name), // Transform to Title Case
      }));
      setCategories(fetchedCategories);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setdealstorecategoryError("Failed to fetch categories.");
    }
  };

  // Authentication check and fetch categories on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/"); // Redirect if not authenticated
      } else {
        fetchCategories();
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Add or update a dealstorecategory
  const handledealstorecategorySubmit = async () => {
    if (!dealstorecategoryName.trim()) {
      setdealstorecategoryError("dealstorecategory name cannot be empty.");
      return;
    }

    try {
      const lowerCaseName = dealstorecategoryName.toLowerCase(); // Store in lowercase
      if (editingdealstorecategory) {
        // Update existing dealstorecategory
        const dealstorecategoryRef = doc(firestore, "dealstorecategory", editingdealstorecategory.id);
        await updateDoc(dealstorecategoryRef, { name: lowerCaseName });
        setEditingdealstorecategory(null);
      } else {
        // Add new dealstorecategory
        await addDoc(collection(firestore, "dealstorecategory"), {
          name: lowerCaseName,
        });
      }

      setdealstorecategoryName("");
      setdealstorecategoryError("");
      fetchCategories();
    } catch (error) {
      console.error("Error adding/updating deal store dealstorecategory:", error);
      setdealstorecategoryError("Failed to add or update dealstorecategory.");
    }
  };

  // Delete a dealstorecategory
  const deletedealstorecategory = async (dealstorecategoryId: string) => {
    try {
      const dealstorecategoryRef = doc(firestore, "dealstorecategory", dealstorecategoryId);
      await deleteDoc(dealstorecategoryRef);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting dealstorecategory:", error);
    }
  };

  // Handle edit action
  const handleEditdealstorecategory = (dealstorecategory: DealStoreCategory) => {
    setdealstorecategoryName(toTitleCase(dealstorecategory.name)); // Convert to Title Case for input
    setEditingdealstorecategory(dealstorecategory);
  };

  return (
    <div className="p-6 text-black h-[80vh]">
      {/* Add/Edit dealstorecategory Form */}
      <div className="mb-4">
        <Link href="/dashboard/dealstore/" className="bg-blue-500 text-white px-4 py-2 rounded">
        Deal List
        </Link>
      </div>
      <div className="mb-6">
        <input
          type="text"
          value={dealstorecategoryName}
          onChange={(e) => setdealstorecategoryName(e.target.value)}
          placeholder="dealstorecategory Name"
          className="border border-gray-300 bg-gray-200 text-black rounded px-4 py-2 mr-2 w-1/2 focus:outline-none focus:ring focus:ring-gray-400"
        />
        <button
          onClick={handledealstorecategorySubmit}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
        >
          {editingdealstorecategory ? "Update dealstorecategory" : "Add dealstorecategory"}
        </button>
      </div>

      {dealstorecategoryError && <p className="text-red-500 mb-4">{dealstorecategoryError}</p>}

      {/* dealstorecategory Table */}
      <div className="overflow-x-auto h-[75vh] overflow-y-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-green-600 text-white">
              <th className="border border-gray-700 px-4 py-2">Dealstorecategory Name</th>
              <th className="border border-gray-700 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((dealstorecategory) => (
              <tr
                key={dealstorecategory.id}
                className="even:bg-gray-200 odd:bg-gray-300"
              >
                <td className="border border-gray-700 px-4 py-2">{dealstorecategory.name}</td>
                <td className="border border-gray-700 px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditdealstorecategory(dealstorecategory)}
                      className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center justify-center"
                    >
                      <FiEdit className="text-white" size={20} />
                    </button>
                    <button
                      onClick={() => deletedealstorecategory(dealstorecategory.id)}
                      className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center justify-center"
                    >
                      <FiTrash className="text-white" size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Categories;
