"use client";

import React, { useState, useEffect } from "react";
import { firestore } from "../../../lib/firebase-config"; // Adjust to your config
import {
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import Link from "next/link";

// Define types for category and deals
interface Category {
  id: string;
  name: string;
}


const HeroSectionSlider = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [newDealName, setNewDealName] = useState("");
  const [newDealDetails, setNewDealDetails] = useState("");
  const [newDealLocation, setNewDealLocation] = useState("");
  const [newDealPolicy, setNewDealPolicy] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [isTrending, setIsTrending] = useState(false);

  // Fetch categories from Firestore
  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(firestore, "dealstorecategory"));
    const fetchedCategories = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));
    setCategories(fetchedCategories);
    setSelectedCategory(fetchedCategories[0]?.id || "");
  };



  // Handle adding a new deal
  const handleAddDeal = async () => {
    if (
      !newImage ||
      !newDealName ||
      !selectedCategory ||
      !newDealDetails ||
      !newDealLocation ||
      !newDealPolicy
    ) {
      return alert("Please fill out all fields and select an image.");
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result as string;
      try {
        await addDoc(collection(firestore, "dealstore"), {
          url: base64Image,
          name: newDealName,
          category: selectedCategory,
          details: newDealDetails,
          location: newDealLocation,
          policy: newDealPolicy,
          isTrending: isTrending,
        });
        alert("Deal added successfully!");
        setNewImage(null);
        setNewDealName("");
        setNewDealDetails("");
        setNewDealLocation("");
        setNewDealPolicy("");
        setIsTrending(false);
      } catch (error) {
        console.error("Error adding deal:", error);
      }
    };

    reader.readAsDataURL(newImage); // Convert the image to base64
  };

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch deals when category changes
  useEffect(() => {
    if (selectedCategory) {
    }
  }, [selectedCategory]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Deal Store</h1>
      <div className="mb-4">
        <Link href="/dashboard/dealstore" className="bg-blue-500 text-white px-4 py-2 rounded">
           Deal List
        </Link>
      </div>

      {/* Category Selector */}
      <div className="mb-4">
        <label className="block mb-2">Select Category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 bg-gray-200 text-black rounded px-4 py-2 w-full"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Add Deal Form */}
      <div className="mt-6">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNewImage(e.target.files?.[0] || null)}
          className="mb-4"
        />
        <div className="mb-4">
          <label className="block mb-2">Deal Name:</label>
          <input
            type="text"
            value={newDealName}
            onChange={(e) => setNewDealName(e.target.value)}
            className="border border-gray-300 bg-gray-200 text-black rounded px-4 py-2 w-full"
            placeholder="Enter deal name"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Details:</label>
          <textarea
            value={newDealDetails}
            onChange={(e) => setNewDealDetails(e.target.value)}
            className="border border-gray-300 bg-gray-200 text-black rounded px-4 py-2 w-full"
            placeholder="Enter deal details"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Location:</label>
          <input
            type="text"
            value={newDealLocation}
            onChange={(e) => setNewDealLocation(e.target.value)}
            className="border border-gray-300 bg-gray-200 text-black rounded px-4 py-2 w-full"
            placeholder="Enter location"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Policy:</label>
          <textarea
            value={newDealPolicy}
            onChange={(e) => setNewDealPolicy(e.target.value)}
            className="border border-gray-300 bg-gray-200 text-black rounded px-4 py-2 w-full"
            placeholder="Enter policy details"
          />
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isTrending}
              onChange={() => setIsTrending(!isTrending)}
              className="mr-2"
            />
            Trending Deal
          </label>
        </div>
        <button
          onClick={handleAddDeal}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Deal
        </button>
      </div>

     
    </div>
  );
};

export default HeroSectionSlider;
