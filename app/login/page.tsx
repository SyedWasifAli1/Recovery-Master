"use client";
// pages/index.tsx
import { useState, useEffect } from "react";
import { firestore } from "../lib/firebase-config";
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";

interface Category {
  id: string;
  name: string;
}

const Home = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryError, setCategoryError] = useState("");

  // Fetch categories from Firestore
  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, "category"));
      const fetchedCategories = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategoryError("Failed to fetch categories.");
    }
  };

  // Add a new category
  const addCategory = async () => {
    if (!categoryName.trim()) {
      setCategoryError("Category name cannot be empty.");
      return;
    }

    try {
      await addDoc(collection(firestore, "category"), {
        name: categoryName,
      });
      setCategoryName("");
      setCategoryError("");
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
      setCategoryError("Failed to add category.");
    }
  };

  // Update category
  const updateCategory = async (categoryId: string, newCategoryName: string) => {
    try {
      const categoryRef = doc(firestore, "category", categoryId);
      await updateDoc(categoryRef, {
        name: newCategoryName,
      });
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      setCategoryError("Failed to update category.");
    }
  };

  // Delete category
  const deleteCategory = async (categoryId: string) => {
    try {
      const categoryRef = doc(firestore, "category", categoryId);
      await deleteDoc(categoryRef);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      setCategoryError("Failed to delete category.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div>
      <h1>Home - Categories</h1>

      {/* Add Category Form */}
      <div>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Category Name"
        />
        <button onClick={addCategory}>Add Category</button>
      </div>

      {categoryError && <p style={{ color: "red" }}>{categoryError}</p>}

      {/* Category Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Category Name</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{category.name}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <button
                  onClick={() => updateCategory(category.id, "Updated Category Name")}
                  style={{ marginRight: "10px" }}
                >
                  Update
                </button>
                <button onClick={() => deleteCategory(category.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Home;





