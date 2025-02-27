"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../app/lib/firebase-config";
import Image from "next/image";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push("/dashboard"); // اگر یوزر لاگ ان ہے تو ڈیش بورڈ پر ری ڈائریکٹ کرو
      } else if (pathname !== "/") {
        router.push("/"); // اگر یوزر لاگ ان نہیں اور کسی اور پیج پر ہے تو سائن ان پر ری ڈائریکٹ کرو
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Sign-in successful!");
      router.push("/dashboard");
    } catch (err) {
      setError("Failed to sign in. Please check your credentials.");
      console.error("Sign-in error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSignIn}
        className="bg-white p-8 rounded shadow-md w-80"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/icon.png"
            alt="Logo"
            width={100}
            height={100}
            priority
          />
        </div>
        <h1 className="text-xl font-bold mb-4 text-center">Sign In</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#f97316] text-white py-2 rounded hover:bg-[#ea580c]"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}


// "use client";
// // pages/index.tsx
// import { useState, useEffect } from "react";
// import { firestore } from "../app/lib/firebase-config";
// import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";

// interface Category {
//   id: string;
//   name: string;
// }

// const Home = () => {
//   const [categoryName, setCategoryName] = useState("");
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [categoryError, setCategoryError] = useState("");

//   // Fetch categories from Firestore
//   const fetchCategories = async () => {
//     try {
//       const querySnapshot = await getDocs(collection(firestore, "category"));
//       const fetchedCategories = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         name: doc.data().name,
//       }));
//       setCategories(fetchedCategories);
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//       setCategoryError("Failed to fetch categories.");
//     }
//   };

//   // Add a new category
//   const addCategory = async () => {
//     if (!categoryName.trim()) {
//       setCategoryError("Category name cannot be empty.");
//       return;
//     }

//     try {
//       await addDoc(collection(firestore, "category"), {
//         name: categoryName,
//       });
//       setCategoryName("");
//       setCategoryError("");
//       fetchCategories();
//     } catch (error) {
//       console.error("Error adding category:", error);
//       setCategoryError("Failed to add category.");
//     }
//   };

//   // Update category
//   const updateCategory = async (categoryId: string, newCategoryName: string) => {
//     try {
//       const categoryRef = doc(firestore, "category", categoryId);
//       await updateDoc(categoryRef, {
//         name: newCategoryName,
//       });
//       fetchCategories();
//     } catch (error) {
//       console.error("Error updating category:", error);
//       setCategoryError("Failed to update category.");
//     }
//   };

//   // Delete category
//   const deleteCategory = async (categoryId: string) => {
//     try {
//       const categoryRef = doc(firestore, "category", categoryId);
//       await deleteDoc(categoryRef);
//       fetchCategories();
//     } catch (error) {
//       console.error("Error deleting category:", error);
//       setCategoryError("Failed to delete category.");
//     }
//   };

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   return (
//     <div>
//       <h1>Home - Categories</h1>

//       {/* Add Category Form */}
//       <div>
//         <input
//           type="text"
//           value={categoryName}
//           onChange={(e) => setCategoryName(e.target.value)}
//           placeholder="Category Name"
//         />
//         <button onClick={addCategory}>Add Category</button>
//       </div>

//       {categoryError && <p style={{ color: "red" }}>{categoryError}</p>}

//       {/* Category Table */}
//       <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
//         <thead>
//           <tr>
//             <th style={{ border: "1px solid #ddd", padding: "8px" }}>Category Name</th>
//             <th style={{ border: "1px solid #ddd", padding: "8px" }}>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {categories.map((category) => (
//             <tr key={category.id}>
//               <td style={{ border: "1px solid #ddd", padding: "8px" }}>{category.name}</td>
//               <td style={{ border: "1px solid #ddd", padding: "8px" }}>
//                 <button
//                   onClick={() => updateCategory(category.id, "Updated Category Name")}
//                   style={{ marginRight: "10px" }}
//                 >
//                   Update
//                 </button>
//                 <button onClick={() => deleteCategory(category.id)}>Delete</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default Home;









// // 'use client';

// // import { useState } from 'react';
// // import { auth, firestore } from '../lib/firebase-config';  // Adjust import as per your setup
// // import { signInWithEmailAndPassword, UserCredential } from 'firebase/auth';
// // import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// // // Define a type for the category document structure
// // interface CategoryDocument {
// //   name: string;
// //   description: string;
// // }

// // interface FormState {
// //   email: string;
// //   password: string;
// //   categoryName: string;
// //   categoryDescription: string;
// // }

// // const Home = () => {
// //   const [formState, setFormState] = useState<FormState>({
// //     email: '',
// //     password: '',
// //     categoryName: '',
// //     categoryDescription: '',
// //   });

// //   const [user, setUser] = useState<UserCredential | null>(null);
// //   const [loginError, setLoginError] = useState<string>('');
// //   const [categoryError, setCategoryError] = useState<string>('');
// //   const [fetchedCategory, setFetchedCategory] = useState<CategoryDocument | null>(null);  // Specify type for fetched category

// //   // Handle login form submission
// //   const handleLogin = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     try {
// //       const userCredential = await signInWithEmailAndPassword(auth, formState.email, formState.password);
// //       setUser(userCredential);
// //       setLoginError('');
// //       console.log('Logged in user:', userCredential.user);

// //       // After login, fetch user-specific category data
// //       await fetchCategoryData(userCredential.user.uid);
// //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
// //     } catch (error: any) {
// //       setLoginError(error.message);
// //     }
// //   };

// //   // Fetch category data from Firestore using the UID
// //   const fetchCategoryData = async (uid: string) => {
// //     try {
// //       const docRef = doc(firestore, 'categories', uid);  // Use UID to fetch the category document
// //       const docSnap = await getDoc(docRef);
// //       if (docSnap.exists()) {
// //         // Use the CategoryDocument type for the fetched data
// //         const docData = docSnap.data() as CategoryDocument;
// //         setFetchedCategory(docData);  // Update state with typed category data
// //         console.log('Fetched Category Data:', docData);
// //       } else {
// //         console.log('No such category document!');
// //       }
// //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
// //     } catch (error: any) {
// //       setCategoryError(error.message);
// //     }
// //   };

// //   // Handle Firestore category creation
// //   const handleAddCategory = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (!user) {
// //       setCategoryError('You must be logged in to add a category.');
// //       return;
// //     }

// //     try {
// //       // Create a new category or overwrite an existing one
// //       await setDoc(doc(firestore, 'categories', user.user.uid), {
// //         name: formState.categoryName,
// //         description: formState.categoryDescription,
// //       });
// //       setCategoryError('');
// //       console.log('Category successfully added!');
// //       // After adding the category, fetch it to update the fetched data
// //       await fetchCategoryData(user.user.uid);
// //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
// //     } catch (error: any) {
// //       setCategoryError(error.message);
// //     }
// //   };

// //   // Handle category update
// //   const handleUpdateCategory = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (!user) {
// //       setCategoryError('You must be logged in to update a category.');
// //       return;
// //     }

// //     try {
// //       // Update the category with new values
// //       const docRef = doc(firestore, 'categories', user.user.uid);
// //       await updateDoc(docRef, {
// //         name: formState.categoryName,
// //         description: formState.categoryDescription,
// //       });
// //       setCategoryError('');
// //       console.log('Category successfully updated!');
// //       // Fetch the updated category
// //       await fetchCategoryData(user.user.uid);
// //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
// //     } catch (error: any) {
// //       setCategoryError(error.message);
// //     }
// //   };

// //   // Handle category deletion
// //   const handleDeleteCategory = async () => {
// //     if (!user) {
// //       setCategoryError('You must be logged in to delete a category.');
// //       return;
// //     }

// //     try {
// //       // Delete the category document from Firestore
// //       const docRef = doc(firestore, 'categories', user.user.uid);
// //       await deleteDoc(docRef);
// //       setCategoryError('');
// //       setFetchedCategory(null);  // Clear fetched category data after deletion
// //       console.log('Category successfully deleted!');
// //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
// //     } catch (error: any) {
// //       setCategoryError(error.message);
// //     }
// //   };

// //   // Handle form state change
// //   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     const { name, value } = e.target;
// //     setFormState((prevState) => ({
// //       ...prevState,
// //       [name]: value,
// //     }));
// //   };

// //   return (
// //     <div>
// //       <h1>Next.js Firebase Auth and Firestore</h1>

// //       <div>
// //         <h2>Login Form</h2>
// //         <form onSubmit={handleLogin}>
// //           <div>
// //             <label>Email</label>
// //             <input
// //               type="email"
// //               name="email"
// //               value={formState.email}
// //               onChange={handleChange}
// //               required
// //             />
// //           </div>
// //           <div>
// //             <label>Password</label>
// //             <input
// //               type="password"
// //               name="password"
// //               value={formState.password}
// //               onChange={handleChange}
// //               required
// //             />
// //           </div>
// //           <button type="submit">Login</button>
// //         </form>

// //         {loginError && <p style={{ color: 'red' }}>Error: {loginError}</p>}
// //         {user && <p>Welcome, {user.user.email}</p>}
// //       </div>

// //       <div>
// //         <h2>Add Category</h2>
// //         <form onSubmit={handleAddCategory}>
// //           <div>
// //             <label>Category Name</label>
// //             <input
// //               type="text"
// //               name="categoryName"
// //               value={formState.categoryName}
// //               onChange={handleChange}
// //               required
// //             />
// //           </div>
// //           <div>
// //             <label>Category Description</label>
// //             <input
// //               type="text"
// //               name="categoryDescription"
// //               value={formState.categoryDescription}
// //               onChange={handleChange}
// //               required
// //             />
// //           </div>
// //           <button type="submit">Add Category</button>
// //         </form>

// //         {categoryError && <p style={{ color: 'red' }}>Error: {categoryError}</p>}
// //       </div>

// //       <div>
// //         <h2>Update Category</h2>
// //         <form onSubmit={handleUpdateCategory}>
// //           <div>
// //             <label>Category Name</label>
// //             <input
// //               type="text"
// //               name="categoryName"
// //               value={formState.categoryName}
// //               onChange={handleChange}
// //               required
// //             />
// //           </div>
// //           <div>
// //             <label>Category Description</label>
// //             <input
// //               type="text"
// //               name="categoryDescription"
// //               value={formState.categoryDescription}
// //               onChange={handleChange}
// //               required
// //             />
// //           </div>
// //           <button type="submit">Update Category</button>
// //         </form>
// //       </div>

// //       <div>
// //         <h2>Delete Category</h2>
// //         <button onClick={handleDeleteCategory}>Delete Category</button>
// //       </div>

// //       <div>
// //         <h2>Fetched Category Data</h2>
// //         {fetchedCategory ? (
// //           <div>
// //             <p><strong>Category Name:</strong> {fetchedCategory.name}</p>
// //             <p><strong>Category Description:</strong> {fetchedCategory.description}</p>
// //           </div>
// //         ) : (
// //           <p>No category data fetched yet</p>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default Home;
