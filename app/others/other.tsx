


// 'use client';

// import { useState } from 'react';
// import { auth, firestore } from '../lib/firebase-config';  // Adjust import as per your setup
// import { signInWithEmailAndPassword, UserCredential } from 'firebase/auth';
// import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// // Define a type for the category document structure
// interface CategoryDocument {
//   name: string;
//   description: string;
// }

// interface FormState {
//   email: string;
//   password: string;
//   categoryName: string;
//   categoryDescription: string;
// }

// const Home = () => {
//   const [formState, setFormState] = useState<FormState>({
//     email: '',
//     password: '',
//     categoryName: '',
//     categoryDescription: '',
//   });

//   const [user, setUser] = useState<UserCredential | null>(null);
//   const [loginError, setLoginError] = useState<string>('');
//   const [categoryError, setCategoryError] = useState<string>('');
//   const [fetchedCategory, setFetchedCategory] = useState<CategoryDocument | null>(null);  // Specify type for fetched category

//   // Handle login form submission
//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, formState.email, formState.password);
//       setUser(userCredential);
//       setLoginError('');
//       console.log('Logged in user:', userCredential.user);

//       // After login, fetch user-specific category data
//       await fetchCategoryData(userCredential.user.uid);
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (error: any) {
//       setLoginError(error.message);
//     }
//   };

//   // Fetch category data from Firestore using the UID
//   const fetchCategoryData = async (uid: string) => {
//     try {
//       const docRef = doc(firestore, 'categories', uid);  // Use UID to fetch the category document
//       const docSnap = await getDoc(docRef);
//       if (docSnap.exists()) {
//         // Use the CategoryDocument type for the fetched data
//         const docData = docSnap.data() as CategoryDocument;
//         setFetchedCategory(docData);  // Update state with typed category data
//         console.log('Fetched Category Data:', docData);
//       } else {
//         console.log('No such category document!');
//       }
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (error: any) {
//       setCategoryError(error.message);
//     }
//   };

//   // Handle Firestore category creation
//   const handleAddCategory = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!user) {
//       setCategoryError('You must be logged in to add a category.');
//       return;
//     }

//     try {
//       // Create a new category or overwrite an existing one
//       await setDoc(doc(firestore, 'categories', user.user.uid), {
//         name: formState.categoryName,
//         description: formState.categoryDescription,
//       });
//       setCategoryError('');
//       console.log('Category successfully added!');
//       // After adding the category, fetch it to update the fetched data
//       await fetchCategoryData(user.user.uid);
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (error: any) {
//       setCategoryError(error.message);
//     }
//   };

//   // Handle category update
//   const handleUpdateCategory = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!user) {
//       setCategoryError('You must be logged in to update a category.');
//       return;
//     }

//     try {
//       // Update the category with new values
//       const docRef = doc(firestore, 'categories', user.user.uid);
//       await updateDoc(docRef, {
//         name: formState.categoryName,
//         description: formState.categoryDescription,
//       });
//       setCategoryError('');
//       console.log('Category successfully updated!');
//       // Fetch the updated category
//       await fetchCategoryData(user.user.uid);
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (error: any) {
//       setCategoryError(error.message);
//     }
//   };

//   // Handle category deletion
//   const handleDeleteCategory = async () => {
//     if (!user) {
//       setCategoryError('You must be logged in to delete a category.');
//       return;
//     }

//     try {
//       // Delete the category document from Firestore
//       const docRef = doc(firestore, 'categories', user.user.uid);
//       await deleteDoc(docRef);
//       setCategoryError('');
//       setFetchedCategory(null);  // Clear fetched category data after deletion
//       console.log('Category successfully deleted!');
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (error: any) {
//       setCategoryError(error.message);
//     }
//   };

//   // Handle form state change
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormState((prevState) => ({
//       ...prevState,
//       [name]: value,
//     }));
//   };

//   return (
//     <div>
//       <h1>Next.js Firebase Auth and Firestore</h1>

//       <div>
//         <h2>Login Form</h2>
//         <form onSubmit={handleLogin}>
//           <div>
//             <label>Email</label>
//             <input
//               type="email"
//               name="email"
//               value={formState.email}
//               onChange={handleChange}
//               required
//             />
//           </div>
//           <div>
//             <label>Password</label>
//             <input
//               type="password"
//               name="password"
//               value={formState.password}
//               onChange={handleChange}
//               required
//             />
//           </div>
//           <button type="submit">Login</button>
//         </form>

//         {loginError && <p style={{ color: 'red' }}>Error: {loginError}</p>}
//         {user && <p>Welcome, {user.user.email}</p>}
//       </div>

//       <div>
//         <h2>Add Category</h2>
//         <form onSubmit={handleAddCategory}>
//           <div>
//             <label>Category Name</label>
//             <input
//               type="text"
//               name="categoryName"
//               value={formState.categoryName}
//               onChange={handleChange}
//               required
//             />
//           </div>
//           <div>
//             <label>Category Description</label>
//             <input
//               type="text"
//               name="categoryDescription"
//               value={formState.categoryDescription}
//               onChange={handleChange}
//               required
//             />
//           </div>
//           <button type="submit">Add Category</button>
//         </form>

//         {categoryError && <p style={{ color: 'red' }}>Error: {categoryError}</p>}
//       </div>

//       <div>
//         <h2>Update Category</h2>
//         <form onSubmit={handleUpdateCategory}>
//           <div>
//             <label>Category Name</label>
//             <input
//               type="text"
//               name="categoryName"
//               value={formState.categoryName}
//               onChange={handleChange}
//               required
//             />
//           </div>
//           <div>
//             <label>Category Description</label>
//             <input
//               type="text"
//               name="categoryDescription"
//               value={formState.categoryDescription}
//               onChange={handleChange}
//               required
//             />
//           </div>
//           <button type="submit">Update Category</button>
//         </form>
//       </div>

//       <div>
//         <h2>Delete Category</h2>
//         <button onClick={handleDeleteCategory}>Delete Category</button>
//       </div>

//       <div>
//         <h2>Fetched Category Data</h2>
//         {fetchedCategory ? (
//           <div>
//             <p><strong>Category Name:</strong> {fetchedCategory.name}</p>
//             <p><strong>Category Description:</strong> {fetchedCategory.description}</p>
//           </div>
//         ) : (
//           <p>No category data fetched yet</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Home;
