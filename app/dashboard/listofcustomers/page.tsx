"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { firestore } from "../../lib/firebase-config";
import withAuth from "@/app/lib/withauth";

interface Customer {
  customerId: string;
  name: string;
  username: string;
  contactNumber: string;
  completeAddress: string;
  createDate: string;
}
 function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const fetchCustomers = async () => {
    try {
      const customerSnapshot = await getDocs(collection(firestore, "customers"));
      const customersData: Customer[] = customerSnapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Customer, "customerId">;
        const createDate = data.createDate
          ? new Date(data.createDate).toLocaleDateString("en-CA")
          : "Unknown";
        return {
          customerId: doc.id,
          ...data,
          createDate,
        };
      });
      setCustomers(customersData);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCheckboxChange = (id: string) => {
    setSelectedCustomers((prev) => {
      const updatedSet = new Set(prev);
      if (updatedSet.has(id)) {
        updatedSet.delete(id);
      } else {
        updatedSet.add(id);
      }
      return updatedSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedCustomers(selectAll ? new Set() : new Set(customers.map((customer) => customer.customerId)));
    setSelectAll((prev) => !prev);
  };
  

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        Array.from(selectedCustomers).map((id) => deleteDoc(doc(firestore, "customers", id)))
      );

      setCustomers((prev) => prev.filter((customer) => !selectedCustomers.has(customer.customerId)));
      setSelectedCustomers(new Set());
      alert("Selected customers deleted successfully.");
    } catch (error) {
      console.error("Error deleting selected customers:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(firestore, "customers", id));
      setCustomers((prev) => prev.filter((customer) => customer.customerId !== id));
      alert("Customer deleted successfully.");
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  return (
    <div className="h-[80vh] text-black p-8">
      <h2 className="text-2xl font-bold mb-4">Customers</h2>
      {customers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <div>
          <div className="mb-4 flex items-center">
            <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="mr-2" />
            <button onClick={handleDeleteSelected} className="bg-red-500 text-white px-4 py-2 rounded">
              Delete Selected
            </button>
          </div>
          <div className="overflow-auto max-h-96">
  <table className="table-auto w-full border-collapse border border-gray-700 text-sm">
    <thead>
      <tr className="bg-white text-left">
        <th className="border border-gray-700 px-4 py-2">
          <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
        </th>
        <th className="border border-gray-700 px-4 py-2">Customer Name</th>
        <th className="border border-gray-700 px-4 py-2">Username</th>
        <th className="border border-gray-700 px-4 py-2">Contact</th>
        <th className="border border-gray-700 px-4 py-2">Address</th>
        <th className="border border-gray-700 px-4 py-2">Created Date</th>
        <th className="border border-gray-700 px-4 py-2">Actions</th>
      </tr>
    </thead>
    <tbody className="overflow-y-auto">
      {customers.map((customer) => (
        <tr key={customer.customerId} className="hover:bg-gray-100">
          <td className="border border-gray-700 px-4 py-2">
            <input
              type="checkbox"
              checked={selectedCustomers.has(customer.customerId)}
              onChange={() => handleCheckboxChange(customer.customerId)}
            />
          </td>
          <td className="border border-gray-700 px-4 py-2">{customer.name}</td>
          <td className="border border-gray-700 px-4 py-2">{customer.username}</td>
          <td className="border border-gray-700 px-4 py-2">{customer.contactNumber}</td>
          <td className="border border-gray-700 px-4 py-2">{customer.completeAddress}</td>
          <td className="border border-gray-700 px-4 py-2">{customer.createDate}</td>
          <td className="border border-gray-700 px-4 py-2">
            <button onClick={() => handleDelete(customer.customerId)} className="bg-red-500 text-white px-4 py-2 rounded">
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

        </div>
      )}
    </div>
  );
}
export default withAuth(Customers);


// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { collection, getDocs, deleteDoc, doc, updateDoc, Timestamp } from "firebase/firestore";
// import * as XLSX from "xlsx";
// import { firestore } from "../../lib/firebase-config";

// interface Product {
//   id: string;
//   sku: string;
//   name: string;
//   price: number;
//   stock: number;
//   category: string;
//   sub_category: string;
//   create_date: string;
//   images1?: string[]; // Array of image Base64 strings
// }

// interface Category {
//   id: string;
//   name: string;
// }

// interface Customer {
//   customerId: string;
//   name: string;
//   username: string;
//   contactNumber: string;
//   completeAddress: string;
//   nearby: string;
//   selectedPackage: string;
//   createDate: string;
// }

// export default function Products() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [subCategories, setSubCategories] = useState<Category[]>([]);
//   const [customers, setCustomers] = useState<Customer[]>([]); // State for customers
//   const [loading, setLoading] = useState(true);
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
//   const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
//   const [selectAll, setSelectAll] = useState(false);
//   const [filterProductName, setFilterProductsName] = useState("");
//   const [filterStartDate, setFilterStartDate] = useState("");
//   const [filterEndDate, setFilterEndDate] = useState("");

//   const isWithinDateRange = (orderDate: string) => {
//     const orderTimestamp = new Date(orderDate).getTime();
//     const startTimestamp = filterStartDate ? new Date(filterStartDate).getTime() : -Infinity;
//     const endTimestamp = filterEndDate ? new Date(filterEndDate).getTime() : Infinity;
//     return orderTimestamp >= startTimestamp && orderTimestamp <= endTimestamp;
//   };

//   const fetchCategories = async () => {
//     const categorySnapshot = await getDocs(collection(firestore, "category"));
//     const categoryData: Category[] = categorySnapshot.docs.map((doc) => ({
//       id: doc.id,
//       name: doc.data().name,
//     }));
//     setCategories(categoryData);

//     const subCategoryData: Category[] = [];
//     for (const category of categorySnapshot.docs) {
//       const subCategorySnapshot = await getDocs(
//         collection(firestore, "category", category.id, "sub_categories")
//       );
//       subCategorySnapshot.docs.forEach((subDoc) => {
//         subCategoryData.push({ id: subDoc.id, name: subDoc.data().name });
//       });
//     }
//     setSubCategories(subCategoryData);
//   };

//   const fetchCustomers = async () => {
//     try {
//       const customerSnapshot = await getDocs(collection(firestore, "customers"));
//       const customersData: Customer[] = customerSnapshot.docs.map((doc) => {
//         const data = doc.data() as Omit<Customer, "customerId">;
//         const createDate = data.createDate
//           ? new Date(data.createDate).toLocaleDateString("en-CA")
//           : "Unknown";
//         return {
//           customerId: doc.id,
//           ...data,
//           createDate,
//         };
//       });
//       setCustomers(customersData);
//     } catch (error) {
//       console.error("Error fetching customers:", error);
//     }
//   };

//   const fetchProducts = useCallback(async () => {
//     try {
//       const querySnapshot = await getDocs(collection(firestore, "products"));
//       const productsData: Product[] = querySnapshot.docs.map((doc) => {
//         const data = doc.data() as Omit<Product, "id">;
//         const create_date =
//           data.create_date && typeof data.create_date === "object" && "toDate" in data.create_date
//             ? (data.create_date as Timestamp).toDate().toLocaleDateString("en-CA")
//             : data.create_date
//             ? new Date(data.create_date).toLocaleDateString("en-CA")
//             : "Unknown"; // Default if `create_date` is missing

//         return {
//           id: doc.id,
//           ...data,
//           create_date, // Include the formatted date
//           images1: data.images1 || [], // Default to empty array
//         };
//       });
//       setProducts(productsData);
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchProducts();
//     fetchCategories();
//     fetchCustomers(); // Fetch customers data when the component mounts
//   }, [fetchProducts]);

//   const exportToExcel = () => {
//     const dataForExport = products
//       .filter(
//         (product) =>
//           (filterProductName === "" ||
//             product.name.toLowerCase().includes(filterProductName.toLowerCase())) &&
//           isWithinDateRange(product.create_date)
//       )
//       .map((product) => ({
//         ...product,
//         category_name: resolveCategoryName(product.category),
//         subcategory_name: resolveSubCategoryName(product.sub_category),
//       }));

//     const dataWithNames = dataForExport.map(({ category, sub_category, ...rest }) => rest);

//     const ws = XLSX.utils.json_to_sheet(dataWithNames);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Products");

//     XLSX.writeFile(wb, "products_report.xlsx");
//   };

//   const handleCheckboxChange = (id: string) => {
//     setSelectedProducts((prev) => {
//       const updatedSet = new Set(prev);
//       if (updatedSet.has(id)) {
//         updatedSet.delete(id);
//       } else {
//         updatedSet.add(id);
//       }
//       return updatedSet;
//     });
//   };

//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedProducts(new Set());
//     } else {
//       setSelectedProducts(new Set(products.map((product) => product.id)));
//     }
//     setSelectAll(!selectAll);
//   };

//   const handleDeleteSelected = async () => {
//     try {
//       for (const id of selectedProducts) {
//         await deleteDoc(doc(firestore, "products", id));
//       }
//       setProducts((prev) => prev.filter((product) => !selectedProducts.has(product.id)));
//       setSelectedProducts(new Set());
//       alert("Selected products deleted successfully.");
//     } catch (error) {
//       console.error("Error deleting selected products:", error);
//     }
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       await deleteDoc(doc(firestore, "products", id));
//       setProducts((prev) => prev.filter((product) => product.id !== id));
//       alert("Product deleted successfully.");
//     } catch (error) {
//       console.error("Error deleting product:", error);
//     }
//   };

//   const handleEdit = (product: Product) => {
//     setEditingProduct(product);
//   };

//   const handleSaveEdit = async () => {
//     if (!editingProduct) return;

//     try {
//       const { id, ...data } = editingProduct;
//       await updateDoc(doc(firestore, "products", id), data);
//       setProducts((prev) =>
//         prev.map((product) => (product.id === id ? editingProduct : product))
//       );
//       setEditingProduct(null);
//       alert("Product updated successfully.");
//     } catch (error) {
//       console.error("Error updating product:", error);
//     }
//   };

//   const resolveCategoryName = (id: string) =>
//     categories.find((category) => category.id === id)?.name || "Unknown";

//   const resolveSubCategoryName = (id: string) =>
//     subCategories.find((subCategory) => subCategory.id === id)?.name || "Unknown";

//   return (
//     <div className="h-[80vh] text-black p-8">
//       {/* <h1 className="text-3xl font-bold mb-8 text-center">Products & Customers List</h1> */}
      
//       <div>
//         <h2 className="text-2xl font-bold mb-4">Customers</h2>
//         {customers.length === 0 ? (
//           <p>No customers found.</p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="table-auto w-full border-collapse border border-gray-700 text-sm">
//               <thead>
//                 <tr className="bg-white text-left">
//                   <th className="border border-gray-700 px-4 py-2">Customer Name</th>
//                   <th className="border border-gray-700 px-4 py-2">Username</th>
//                   <th className="border border-gray-700 px-4 py-2">Contact</th>
//                   <th className="border border-gray-700 px-4 py-2">Address</th>
//                   <th className="border border-gray-700 px-4 py-2">Created Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {customers.map((customer) => (
//                   <tr key={customer.customerId} className="hover:bg-gray-100">
//                     <td className="border border-gray-700 px-4 py-2">{customer.name}</td>
//                     <td className="border border-gray-700 px-4 py-2">{customer.username}</td>
//                     <td className="border border-gray-700 px-4 py-2">{customer.contactNumber}</td>
//                     <td className="border border-gray-700 px-4 py-2">{customer.completeAddress}</td>
//                     <td className="border border-gray-700 px-4 py-2">{customer.createDate}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//       {/* Your existing products table here */}
//       {/* Add similar rendering logic for products here */}
//     </div>
//   );
// }
// // "use client";

// // import { useEffect, useState, useCallback } from "react";
// // import { collection, getDocs, deleteDoc, doc, updateDoc, Timestamp } from "firebase/firestore";
// // import * as XLSX from "xlsx";
// // import { firestore } from "../../lib/firebase-config";
// // import Image from "next/image";

// // interface Product {
// //   id: string;
// //   sku: string;
// //   name: string;
// //   price: number;
// //   stock: number;
// //   category: string;
// //   sub_category: string;
// //   create_date:string;
// //   images1?: string[]; // Array of image Base64 strings
// // }

// // interface Category {
// //   id: string;
// //   name: string;
// // }

// // export default function Products() {
// //   const [products, setProducts] = useState<Product[]>([]);
// //   const [categories, setCategories] = useState<Category[]>([]);
// //   const [subCategories, setSubCategories] = useState<Category[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
// //   // const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
// //   const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
// //   const [selectAll, setSelectAll] = useState(false);
// //   const [filterProductName, setFilterProductsName] = useState("");
// //   const [filterStartDate, setFilterStartDate] = useState("");
// // const [filterEndDate, setFilterEndDate] = useState("");


// // const isWithinDateRange = (orderDate: string) => {
// //   const orderTimestamp = new Date(orderDate).getTime();
// //   const startTimestamp = filterStartDate ? new Date(filterStartDate).getTime() : -Infinity;
// //   const endTimestamp = filterEndDate ? new Date(filterEndDate).getTime() : Infinity;
// //   return orderTimestamp >= startTimestamp && orderTimestamp <= endTimestamp;
// // };


// //   const fetchCategories = async () => {
// //     const categorySnapshot = await getDocs(collection(firestore, "category"));
// //     const categoryData: Category[] = categorySnapshot.docs.map((doc) => ({
// //       id: doc.id,
// //       name: doc.data().name,
// //     }));
// //     setCategories(categoryData);

// //     const subCategoryData: Category[] = [];
// //     for (const category of categorySnapshot.docs) {
// //       const subCategorySnapshot = await getDocs(
// //         collection(firestore, "category", category.id, "sub_categories")
// //       );
// //       subCategorySnapshot.docs.forEach((subDoc) => {
// //         subCategoryData.push({ id: subDoc.id, name: subDoc.data().name });
// //       });
// //     }
// //     setSubCategories(subCategoryData);
// //   };

// //   const fetchProducts = useCallback(async () => {
// //     try {
// //       const querySnapshot = await getDocs(collection(firestore, "products"));
// //       const productsData: Product[] = querySnapshot.docs.map((doc) => {
// //         const data = doc.data() as Omit<Product, "id">;
// //         const create_date =
// //         data.create_date && typeof data.create_date === "object" && "toDate" in data.create_date
// //           ? (data.create_date as Timestamp).toDate().toLocaleDateString("en-CA")
// //           : data.create_date
// //           ? new Date(data.create_date).toLocaleDateString("en-CA")
// //           : "Unknown";// Default if `create_date` is missing
  
// //         return {
// //           id: doc.id,
// //           ...data,
// //           create_date, // Include the formatted date
// //           images1: data.images1 || [], // Default to empty array
// //         };
// //       });
// //       setProducts(productsData);
// //     } catch (error) {
// //       console.error("Error fetching products:", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);
  

// //   useEffect(() => {
// //     fetchProducts();
// //     fetchCategories();
// //   }, [fetchProducts]);




// //   const exportToExcel = () => {
// //     // Map products and replace category_id and subcategory_id with names
// //     const dataForExport = products
// //       .filter(
// //         (product) =>
// //           (filterProductName === "" ||
// //             product.name.toLowerCase().includes(filterProductName.toLowerCase())) &&
// //           isWithinDateRange(product.create_date)
// //       )
// //       .map((product) => ({
// //         ...product,
// //         category_name: resolveCategoryName(product.category), // Resolve category name
// //         subcategory_name: resolveSubCategoryName(product.sub_category), // Resolve subcategory name
// //       }));
  
// //     // Remove original category_id and subcategory_id
// //     const dataWithNames = dataForExport.map(({ category, sub_category, ...rest }) => rest);
  
// //     // Convert to Excel sheet
// //     const ws = XLSX.utils.json_to_sheet(dataWithNames);
// //     const wb = XLSX.utils.book_new();
// //     XLSX.utils.book_append_sheet(wb, ws, "Products");
  
// //     // Write file
// //     XLSX.writeFile(wb, "products_report.xlsx");
// //   };
  
// //   const handleCheckboxChange = (id: string) => {
// //     setSelectedProducts((prev) => {
// //       const updatedSet = new Set(prev);
// //       if (updatedSet.has(id)) {
// //         updatedSet.delete(id);
// //       } else {
// //         updatedSet.add(id);
// //       }
// //       return updatedSet;
// //     });
// //   };

// //   const handleSelectAll = () => {
// //     if (selectAll) {
// //       setSelectedProducts(new Set());
// //     } else {
// //       setSelectedProducts(new Set(products.map((product) => product.id)));
// //     }
// //     setSelectAll(!selectAll);
// //   };

// //   const handleDeleteSelected = async () => {
// //     try {
// //       for (const id of selectedProducts) {
// //         await deleteDoc(doc(firestore, "products", id));
// //       }
// //       setProducts((prev) => prev.filter((product) => !selectedProducts.has(product.id)));
// //       setSelectedProducts(new Set());
// //       alert("Selected products deleted successfully.");
// //     } catch (error) {
// //       console.error("Error deleting selected products:", error);
// //     }
// //   };
  
// //   const handleDelete = async (id: string) => {
// //     try {
// //       await deleteDoc(doc(firestore, "products", id));
// //       setProducts((prev) => prev.filter((product) => product.id !== id));
// //       alert("Product deleted successfully.");
// //     } catch (error) {
// //       console.error("Error deleting product:", error);
// //     }
// //   };

// //   const handleEdit = (product: Product) => {
// //     setEditingProduct(product);
// //   };

// //   const handleSaveEdit = async () => {
// //     if (!editingProduct) return;

// //     try {
// //       const { id, ...data } = editingProduct; // Exclude `id`
// //       await updateDoc(doc(firestore, "products", id), data);
// //       setProducts((prev) =>
// //         prev.map((product) => (product.id === id ? editingProduct : product))
// //       );
// //       setEditingProduct(null);
// //       alert("Product updated successfully.");
// //     } catch (error) {
// //       console.error("Error updating product:", error);
// //     }
// //   };

// //   const resolveCategoryName = (id: string) =>
// //     categories.find((category) => category.id === id)?.name || "Unknown";

// //   const resolveSubCategoryName = (id: string) =>
// //     subCategories.find((subCategory) => subCategory.id === id)?.name || "Unknown";

// //   return (
// //     <div className="h-[80vh] text-black p-8">
// //       <h1 className="text-3xl font-bold mb-8 text-center">Products List</h1>
    
                
// //       <div className="mb-4 flex flex-wrap gap-4">
// //   <div className="flex-1 min-w-[200px]">
// //     <label htmlFor="orderId" className="block text-sm font-medium text-gray-700">Products Name</label>
// //     <input
// //     placeholder="Search By Products Name"
// //       type="text"
// //       id="orderId"
// //       value={filterProductName}
// //       onChange={(e) => setFilterProductsName(e.target.value)}
// //       className="w-full border border-gray-300 p-2 rounded-md"
// //     />
// //   </div>


// //   <div className="flex-1 min-w-[200px]">
// //     <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date:</label>
// //     <input
// //       type="date"
// //       id="startDate"
// //       value={filterStartDate}
// //       onChange={(e) => setFilterStartDate(e.target.value)}
// //       className="w-full border border-gray-300 p-2 rounded-md"
// //     />
// //   </div>

// //   <div className="flex-1 min-w-[200px]">
// //     <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date:</label>
// //     <input
// //       type="date"
// //       id="endDate"
// //       value={filterEndDate}
// //       onChange={(e) => setFilterEndDate(e.target.value)}
// //       className="w-full border border-gray-300 p-2 rounded-md"
// //     />
// //   </div>
// //   <div className="flex-1 min-w-[200px]">
// //     <label htmlFor="orderId" className="block text-sm font-medium text-gray-700">Export Data</label>
// //     <button
// //                   className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
// //                   onClick={() => exportToExcel()}
// //                 >
// //                   Convert to Excel Report
// //                 </button>
// // </div>
// // </div>


// //       {loading ? (
// //         <p className="text-center">Loading...</p>
// //       ) : products.length === 0 ? (
// //         <p className="text-center">No products found.</p>
// //       ) : (
// //         <div className="overflow-x-auto h-[60vh] overflow-y-auto">
// //           <table className="table-auto w-full border-collapse border border-gray-700 text-sm">
// //             <thead>
// //               <tr className="bg-white text-left">
// //                 <th className="border border-gray-700 px-4  text-center py-2">

// //                 <input
// //                 className=""
// //                     type="checkbox"
// //                     checked={selectAll}
// //                     onChange={handleSelectAll}
// //                   />
// //                 </th>
// //                 <th className="border border-gray-700 px-4 py-2">Thumbnail</th>
// //                 <th className="border border-gray-700 px-4 py-2">SKU</th>
// //                 <th className="border border-gray-700 px-4 py-2">Name</th>
// //                 <th className="border border-gray-700 px-4 py-2">Price</th>
// //                 <th className="border border-gray-700 px-4 py-2">Stock</th>
// //                 <th className="border border-gray-700 px-4 py-2">Category</th>
// //                 <th className="border border-gray-700 px-4 py-2">Sub-Category</th>
// //                 <th className="border border-gray-700 px-4 py-2">Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {products
// //              .filter(
// //               (product) =>
// //                 (filterProductName === "" || 
// //                 product.name.toLowerCase().includes(filterProductName.toLowerCase())) &&
// //                 isWithinDateRange(product.create_date)
// //             )
// //           .map((product) => (
// //                 <tr
// //                   key={product.id}
// //                   className="hover:bg-gray-100 transition duration-150 ease-in-out"
// //                 >
// //                     <td className="border border-gray-700 px-4 py-2 text-center">
// //                     <input
// //                       type="checkbox"
// //                       checked={selectedProducts.has(product.id)}
// //                       onChange={() => handleCheckboxChange(product.id)}
// //                     />
// //                     {/* <input
// //                       type="checkbox"
// //                       checked={selectedProducts.includes(product.id)}
// //                       onChange={() => toggleSelectProduct(product.id)}
// //                       className="form-checkbox"
// //                     /> */}
// //                   </td>
// //                   <td className="border border-gray-700 px-4 py-2">
// //                     {product.images1 && product.images1.length > 0 ? (
// //                       <Image
// //                         src={`data:image/png;base64,${product.images1[0]}`}
// //                         alt={`Thumbnail of ${product.name}`}
// //                         width={64}
// //                         height={64}
// //                         className="object-cover rounded"
// //                       />
// //                     ) : (
// //                       <span>No Image</span>
// //                     )}
// //                   </td>
// //                   <td className="border border-gray-700 px-4 py-2">{product.sku}</td>
// //                   <td className="border border-gray-700 px-4 py-2">{product.name}</td>
// //                   <td className="border border-gray-700 px-4 py-2">
// //                     {product.price ? `PKR:${product.price.toFixed(2)}` : "N/A"}
// //                   </td>
// //                   <td className="border border-gray-700 px-4 py-2">{product.stock}</td>
// //                   <td className="border border-gray-700 px-4 py-2">
// //                     {resolveCategoryName(product.category)}
// //                   </td>
// //                   <td className="border border-gray-700 px-4 py-2">
// //                     {resolveSubCategoryName(product.sub_category)}
// //                   </td>
// //                   <td className="border border-gray-700 px-4 py-2 flex space-x-2">
// //                     <button
// //                       onClick={() => handleEdit(product)}
// //                       className="text-blue-500 hover:underline"
// //                     >
// //                       Edit
// //                     </button>
// //                     <button
// //                       onClick={() => handleDelete(product.id)}
// //                       className="text-red-500 hover:underline"
// //                     >
// //                       Delete
// //                     </button>
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>
// //       )}
// //         <div className="m-0 flex justify-center">
// //           <button
// //             onClick={handleDeleteSelected}
// //             className="bg-red-500 px-4 py-2 rounded text-white"
// //           >
// //             Delete Selected Products
// //           </button>
// //         </div>
// //       {editingProduct && (
// //         <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white bg-opacity-50">
// //           <div className="bg-white p-8 rounded shadow-lg w-1/2">
// //             <h2 className="text-xl font-bold mb-4">Edit Product</h2>
// //             <div className="flex flex-col space-y-4">
// //               <input
// //                 type="text"
// //                 value={editingProduct.name}
// //                 onChange={(e) =>
// //                   setEditingProduct({ ...editingProduct, name: e.target.value })
// //                 }
// //                 className="w-full px-3 py-2 bg-gray-200 text-black rounded"
// //                 placeholder="Product Name"
// //               />
// //               <input
// //                 type="text"
// //                 value={editingProduct.sku}
// //                 onChange={(e) =>
// //                   setEditingProduct({ ...editingProduct, sku: e.target.value })
// //                 }
// //                 className="w-full px-3 py-2 bg-gray-200 text-black rounded"
// //                 placeholder="SKU"
// //               />
// //               <input
// //                 type="number"
// //                 value={editingProduct.price}
// //                 onChange={(e) =>
// //                   setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })
// //                 }
// //                 className="w-full px-3 py-2 bg-gray-200 text-black rounded"
// //                 placeholder="Price"
// //               />
// //               <input
// //                 type="number"
// //                 value={editingProduct.stock}
// //                 onChange={(e) =>
// //                   setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) })
// //                 }
// //                 className="w-full px-3 py-2 bg-gray-200 text-black rounded"
// //                 placeholder="Stock"
// //               />
// //               <select
// //                 value={editingProduct.category}
// //                 onChange={(e) =>
// //                   setEditingProduct({ ...editingProduct, category: e.target.value })
// //                 }
// //                 className="w-full px-3 py-2 bg-gray-200 text-black rounded"
// //               >
// //                 <option value="">Select Category</option>
// //                 {categories.map((category) => (
// //                   <option key={category.id} value={category.id}>
// //                     {category.name}
// //                   </option>
// //                 ))}
// //               </select>
// //               <select
// //                 value={editingProduct.sub_category}
// //                 onChange={(e) =>
// //                   setEditingProduct({ ...editingProduct, sub_category: e.target.value })
// //                 }
// //                 className="w-full px-3 py-2 bg-gray-200 text-black rounded"
// //               >
// //                 <option value="">Select Sub-Category</option>
// //                 {subCategories.map((subCategory) => (
// //                   <option key={subCategory.id} value={subCategory.id}>
// //                     {subCategory.name}
// //                   </option>
// //                 ))}
// //               </select>
// //               <div className="flex justify-between">
// //                 <button
// //                   onClick={handleSaveEdit}
// //                   className="bg-blue-500 px-4 py-2 rounded text-white"
// //                 >
// //                   Save
// //                 </button>
// //                 <button
// //                   onClick={() => setEditingProduct(null)}
// //                   className="bg-red-500 px-4 py-2 rounded text-white"
// //                 >
// //                   Cancel
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }
