"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { firestore } from "../../lib/firebase-config";

interface Payment {
  paymentDate: string;
  amount: number;
  collectorName: string;
}

interface Customer {
  customerId: string;
  name: string;
  username: string;
  contactNumber: string;
  completeAddress: string;
  nearby: string;
  selectedPackage: string;
  createDate: string;
  payments?: Payment[]; // Added payments to the customer interface
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]); // State for customers
  // const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const fetchPayments = async (customerId: string) => {
    // Fetch the payment records for the given customer
    const paymentSnapshot = await getDocs(collection(firestore, "payments"));
    const paymentsData: Payment[] = paymentSnapshot.docs
      .filter((doc) => doc.data().customerId === customerId) // Filter payments by customerId
      .map((doc) => {
        const data = doc.data();
        return {
          paymentDate: new Date(data.paymentDate.seconds * 1000).toLocaleDateString("en-CA"), // Format payment date
          amount: data.amount,
          collectorName: data.collectorName,
        };
      });
    return paymentsData;
  };

  const fetchCustomers = async () => {
    try {
      const customerSnapshot = await getDocs(collection(firestore, "customers"));
      const customersData: Customer[] = [];
      for (const doc of customerSnapshot.docs) {
        const data = doc.data() as Omit<Customer, "customerId">;
        const createDate = data.createDate
          ? new Date(data.createDate).toLocaleDateString("en-CA")
          : "Unknown";

        // Fetch payment data for each customer
        const payments = await fetchPayments(doc.id);

        customersData.push({
          customerId: doc.id,
          ...data,
          createDate,
          payments, // Include payments in the customer data
        });
      }
      setCustomers(customersData);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(); // Fetch customer and payment data when the component mounts
  }, []);

  const handleCheckboxChange = (id: string) => {
    setSelectedProducts((prev) => {
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
    if (selectAll) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(customers.map((customer) => customer.customerId)));
    }
    setSelectAll(!selectAll);
  };

  const handleDeleteSelected = async () => {
    try {
      for (const id of selectedProducts) {
        await deleteDoc(doc(firestore, "customers", id));
      }
      setCustomers((prev) => prev.filter((customer) => !selectedProducts.has(customer.customerId)));
      setSelectedProducts(new Set());
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
      <div>
        <h2 className="text-2xl font-bold mb-4">Customers</h2>
        {customers.length === 0 ? (
          <p>No customers found.</p>
        ) : (
          <div>
            {/* Bulk Action */}
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="mr-2"
              />
              <button
                onClick={handleDeleteSelected}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete Selected
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="table-auto w-full border-collapse border border-gray-700 text-sm">
                <thead>
                  <tr className="bg-white text-left">
                    <th className="border border-gray-700 px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="mr-2"
                      />
                    </th>
                    <th className="border border-gray-700 px-4 py-2">Customer Name</th>
                    <th className="border border-gray-700 px-4 py-2">Username</th>
                    <th className="border border-gray-700 px-4 py-2">Contact</th>
                    <th className="border border-gray-700 px-4 py-2">Address</th>
                    <th className="border border-gray-700 px-4 py-2">Created Date</th>
                    <th className="border border-gray-700 px-4 py-2">Payments</th> {/* Added Payment info */}
                    <th className="border border-gray-700 px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.customerId} className="hover:bg-gray-100">
                      <td className="border border-gray-700 px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(customer.customerId)}
                          onChange={() => handleCheckboxChange(customer.customerId)}
                        />
                      </td>
                      <td className="border border-gray-700 px-4 py-2">{customer.name}</td>
                      <td className="border border-gray-700 px-4 py-2">{customer.username}</td>
                      <td className="border border-gray-700 px-4 py-2">{customer.contactNumber}</td>
                      <td className="border border-gray-700 px-4 py-2">{customer.completeAddress}</td>
                      <td className="border border-gray-700 px-4 py-2">{customer.createDate}</td>
                      <td className="border border-gray-700 px-4 py-2">
                        {customer.payments?.map((payment, index) => (
                          <div key={index}>
                            <div>{payment.paymentDate}</div>
                            <div>{payment.collectorName}</div>
                            <div>{payment.amount}</div>
                          </div>
                        ))}
                      </td>
                      <td className="border border-gray-700 px-4 py-2">
                        <button
                          onClick={() => handleDelete(customer.customerId)}
                          className="bg-red-500 text-white px-4 py-2 rounded"
                        >
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
    </div>
  );
}
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

// interface Payment {
//   paymentDate: string;
//   amount: number;
//   collectorName: string;
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
//   payments?: Payment[]; // Added payments to the customer interface
// }

// export default function Customers() {
//   const [customers, setCustomers] = useState<Customer[]>([]); // State for customers
//   const [loading, setLoading] = useState(true);
//   const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
//   const [selectAll, setSelectAll] = useState(false);
//   const [filterProductName, setFilterProductsName] = useState("");
//   const [filterStartDate, setFilterStartDate] = useState("");
//   const [filterEndDate, setFilterEndDate] = useState("");

//   const fetchPayments = async (customerId: string) => {
//     // Fetch the payment records for the given customer
//     const paymentSnapshot = await getDocs(collection(firestore, "payments"));
//     const paymentsData: Payment[] = paymentSnapshot.docs
//       .filter((doc) => doc.data().customerId === customerId) // Filter payments by customerId
//       .map((doc) => {
//         const data = doc.data();
//         return {
//           paymentDate: new Date(data.paymentDate.seconds * 1000).toLocaleDateString("en-CA"), // Format payment date
//           amount: data.amount,
//           collectorName: data.collectorName,
//         };
//       });
//     return paymentsData;
//   };

//   const fetchCustomers = async () => {
//     try {
//       const customerSnapshot = await getDocs(collection(firestore, "customers"));
//       const customersData: Customer[] = [];
//       for (const doc of customerSnapshot.docs) {
//         const data = doc.data() as Omit<Customer, "customerId">;
//         const createDate = data.createDate
//           ? new Date(data.createDate).toLocaleDateString("en-CA")
//           : "Unknown";

//         // Fetch payment data for each customer
//         const payments = await fetchPayments(doc.id);

//         customersData.push({
//           customerId: doc.id,
//           ...data,
//           createDate,
//           payments, // Include payments in the customer data
//         });
//       }
//       setCustomers(customersData);
//     } catch (error) {
//       console.error("Error fetching customers:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCustomers(); // Fetch customer and payment data when the component mounts
//   }, []);

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
//       setSelectedProducts(new Set(customers.map((customer) => customer.customerId)));
//     }
//     setSelectAll(!selectAll);
//   };

//   const handleDeleteSelected = async () => {
//     try {
//       for (const id of selectedProducts) {
//         await deleteDoc(doc(firestore, "customers", id));
//       }
//       setCustomers((prev) => prev.filter((customer) => !selectedProducts.has(customer.customerId)));
//       setSelectedProducts(new Set());
//       alert("Selected customers deleted successfully.");
//     } catch (error) {
//       console.error("Error deleting selected customers:", error);
//     }
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       await deleteDoc(doc(firestore, "customers", id));
//       setCustomers((prev) => prev.filter((customer) => customer.customerId !== id));
//       alert("Customer deleted successfully.");
//     } catch (error) {
//       console.error("Error deleting customer:", error);
//     }
//   };

//   return (
//     <div className="h-[80vh] text-black p-8">
//       <div>
//         <h2 className="text-2xl font-bold mb-4">Customers</h2>
//         {customers.length === 0 ? (
//           <p>No customers found.</p>
//         ) : (
//           <div>
//             {/* Bulk Action */}
//             <div className="mb-4 flex items-center">
//               <input
//                 type="checkbox"
//                 checked={selectAll}
//                 onChange={handleSelectAll}
//                 className="mr-2"
//               />
//               <button
//                 onClick={handleDeleteSelected}
//                 className="bg-red-500 text-white px-4 py-2 rounded"
//               >
//                 Delete Selected
//               </button>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="table-auto w-full border-collapse border border-gray-700 text-sm">
//                 <thead>
//                   <tr className="bg-white text-left">
//                     <th className="border border-gray-700 px-4 py-2">
//                       <input
//                         type="checkbox"
//                         checked={selectAll}
//                         onChange={handleSelectAll}
//                         className="mr-2"
//                       />
//                     </th>
//                     <th className="border border-gray-700 px-4 py-2">Customer Name</th>
//                     <th className="border border-gray-700 px-4 py-2">Username</th>
//                     <th className="border border-gray-700 px-4 py-2">Contact</th>
//                     <th className="border border-gray-700 px-4 py-2">Address</th>
//                     <th className="border border-gray-700 px-4 py-2">Created Date</th>
//                     <th className="border border-gray-700 px-4 py-2">Payments</th> {/* Added Payment info */}
//                     <th className="border border-gray-700 px-4 py-2">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {customers.map((customer) => (
//                     <tr key={customer.customerId} className="hover:bg-gray-100">
//                       <td className="border border-gray-700 px-4 py-2">
//                         <input
//                           type="checkbox"
//                           checked={selectedProducts.has(customer.customerId)}
//                           onChange={() => handleCheckboxChange(customer.customerId)}
//                         />
//                       </td>
//                       <td className="border border-gray-700 px-4 py-2">{customer.name}</td>
//                       <td className="border border-gray-700 px-4 py-2">{customer.username}</td>
//                       <td className="border border-gray-700 px-4 py-2">{customer.contactNumber}</td>
//                       <td className="border border-gray-700 px-4 py-2">{customer.completeAddress}</td>
//                       <td className="border border-gray-700 px-4 py-2">{customer.createDate}</td>
//                       <td className="border border-gray-700 px-4 py-2">
//                         {customer.payments?.map((payment, index) => (
//                           <div key={index}>
//                             <div>{payment.paymentDate}</div>
//                             <div>{payment.collectorName}</div>
//                             <div>{payment.amount}</div>
//                           </div>
//                         ))}
//                       </td>
//                       <td className="border border-gray-700 px-4 py-2">
//                         <button
//                           onClick={() => handleDelete(customer.customerId)}
//                           className="bg-red-500 text-white px-4 py-2 rounded"
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
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
//       setSelectedProducts(new Set(customers.map((customer) => customer.customerId)));
//     }
//     setSelectAll(!selectAll);
//   };

//   const handleDeleteSelected = async () => {
//     try {
//       for (const id of selectedProducts) {
//         await deleteDoc(doc(firestore, "customers", id));
//       }
//       setCustomers((prev) => prev.filter((customer) => !selectedProducts.has(customer.customerId)));
//       setSelectedProducts(new Set());
//       alert("Selected customers deleted successfully.");
//     } catch (error) {
//       console.error("Error deleting selected customers:", error);
//     }
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       await deleteDoc(doc(firestore, "customers", id));
//       setCustomers((prev) => prev.filter((customer) => customer.customerId !== id));
//       alert("Customer deleted successfully.");
//     } catch (error) {
//       console.error("Error deleting customer:", error);
//     }
//   };

//   return (
//     <div className="h-[80vh] text-black p-8">
//       <div>
//         <h2 className="text-2xl font-bold mb-4">Customers</h2>
//         {customers.length === 0 ? (
//           <p>No customers found.</p>
//         ) : (
//           <div>
//             {/* Bulk Action */}
//             <div className="mb-4 flex items-center">
//               <input
//                 type="checkbox"
//                 checked={selectAll}
//                 onChange={handleSelectAll}
//                 className="mr-2"
//               />
//               <button
//                 onClick={handleDeleteSelected}
//                 className="bg-red-500 text-white px-4 py-2 rounded"
//               >
//                 Delete Selected
//               </button>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="table-auto w-full border-collapse border border-gray-700 text-sm">
//                 <thead>
//                   <tr className="bg-white text-left">
//                     <th className="border border-gray-700 px-4 py-2">
//                       <input
//                         type="checkbox"
//                         checked={selectAll}
//                         onChange={handleSelectAll}
//                         className="mr-2"
//                       />
//                     </th>
//                     <th className="border border-gray-700 px-4 py-2">Customer Name</th>
//                     <th className="border border-gray-700 px-4 py-2">Username</th>
//                     <th className="border border-gray-700 px-4 py-2">Contact</th>
//                     <th className="border border-gray-700 px-4 py-2">Address</th>
//                     <th className="border border-gray-700 px-4 py-2">Created Date</th>
//                     <th className="border border-gray-700 px-4 py-2">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {customers.map((customer) => (
//                     <tr key={customer.customerId} className="hover:bg-gray-100">
//                       <td className="border border-gray-700 px-4 py-2">
//                         <input
//                           type="checkbox"
//                           checked={selectedProducts.has(customer.customerId)}
//                           onChange={() => handleCheckboxChange(customer.customerId)}
//                         />
//                       </td>
//                       <td className="border border-gray-700 px-4 py-2">{customer.name}</td>
//                       <td className="border border-gray-700 px-4 py-2">{customer.username}</td>
//                       <td className="border border-gray-700 px-4 py-2">{customer.contactNumber}</td>
//                       <td className="border border-gray-700 px-4 py-2">{customer.completeAddress}</td>
//                       <td className="border border-gray-700 px-4 py-2">{customer.createDate}</td>
//                       <td className="border border-gray-700 px-4 py-2">
//                         <button
//                           onClick={() => handleDelete(customer.customerId)}
//                           className="bg-red-500 text-white px-4 py-2 rounded"
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
// // "use client";
// // import Image from 'next/image';
// // import { useEffect, useState } from "react";
// // import * as XLSX from "xlsx"
// // import {
// //   collection,
// //   getDocs,
// //   query,
// //   collectionGroup,
// //   updateDoc,
// //   where,
// //   Timestamp,
// // } from "firebase/firestore";
// // import { firestore } from "../../lib/firebase-config";
// // import { FiPrinter } from "react-icons/fi";

// // interface Product {
// //   id: string;
// //   name: string;
// //   price: number;
// //   quantity: number;
// //   images1: string[];
// // }

// // interface DeliveryDetails {
// //   address: string;
// //   city: string;
// //   country: string;
// //   phone: string;
// //   province: string;
// //   street: string;
// // }

// // interface Order {
// //   orderId: string;
// //   userId: string;
// //   status: string;
// //   datetime:string;
// //   totalPrice: number;
// //   products: Product[];
// //   userEmail: string;
// //   deliveryDetails: DeliveryDetails;
// //   contactNumber: string;
// //   city: string;
// // }

// // export default function Orders() {
// //   const [orders, setOrders] = useState<Order[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [selectedItems, setSelectedItems] = useState<Product[]>([]);
// //   const [selectedDelivery, setSelectedDelivery] = useState<DeliveryDetails | null>(null);
// //   const [filterOrderId, setFilterOrderId] = useState("");
// //   const [filterStatus, setFilterStatus] = useState("");
// //   const [filterStartDate, setFilterStartDate] = useState("");
// // const [filterEndDate, setFilterEndDate] = useState("");

// //   // Fetch emails from the custom API
// //   async function fetchEmails(): Promise<{ [userId: string]: string }> {
// //     try {
// //       const customersQuery = collection(firestore, "customers");
// //       const querySnapshot = await getDocs(customersQuery);
  
// //       const emailMap: { [userId: string]: string } = {};
// //       querySnapshot.forEach((doc) => {
// //         const customerData = doc.data();
// //         const userId = doc.id;
// //         emailMap[userId] = customerData.email || "No Email";
// //       });
  
// //       return emailMap;
// //     } catch (error) {
// //       console.error("Error fetching customer emails:", error);
// //       return {};
// //     }
// //   }
  
  

// //   // Fetch orders and match emails with user IDs
// //   useEffect(() => {
// //     async function fetchOrders() {
// //       try {
// //         setLoading(true);

// //         const emailMap = await fetchEmails();

// //         const ordersQuery = query(collectionGroup(firestore, "user_orders"));
// //         const querySnapshot = await getDocs(ordersQuery);

// //         const ordersData: Order[] = querySnapshot.docs.map((orderDoc) => {
// //           const orderData = orderDoc.data();
// //           const userId = orderDoc.ref.parent.parent?.id || "Unknown User";
// //           const datetime = orderData.datetime
// //           ? orderData.datetime instanceof Timestamp
// //             ? orderData.datetime.toDate().toLocaleDateString("en-CA") // Extract local date in YYYY-MM-DD format
// //             : new Date(orderData.datetime).toLocaleDateString("en-CA") // Handle string case if needed
// //           : "Unknown";
        
// //           return {
// //             orderId: orderDoc.id,
// //             userId,
// //             datetime,
// //             userEmail: emailMap[userId] || "No Email",
// //             status: orderData.status || "Unknown",
// //             totalPrice: orderData.totalPrice || 0,
// //             products: orderData.products || [],
// //             deliveryDetails: orderData.deliveryDetails || {},
// //             contactNumber: orderData.deliveryDetails?.phone || "N/A",
// //             city: orderData.deliveryDetails?.city || "N/A",
// //           } as Order;
// //         });

// //         setOrders(ordersData);
// //       } catch (error) {
// //         console.error("Error fetching orders:", error);
// //       } finally {
// //         setLoading(false);
// //       }
// //     }

// //     fetchOrders();
// //   }, []);

// //   const isWithinDateRange = (orderDate: string) => {
// //     const orderTimestamp = new Date(orderDate).getTime();
// //     const startTimestamp = filterStartDate ? new Date(filterStartDate).getTime() : -Infinity;
// //     const endTimestamp = filterEndDate ? new Date(filterEndDate).getTime() : Infinity;
// //     return orderTimestamp >= startTimestamp && orderTimestamp <= endTimestamp;
// //   };
 
// //   const setSelectedproducts = async (productsWithQuantities: { id: string; quantity: number }[]) => {
// //     try {
// //       if (productsWithQuantities.length === 0) {
// //         console.error("No product IDs provided");
// //         return;
// //       }
  
// //       const productsRef = collection(firestore, "products");
// //       const productIds = productsWithQuantities.map((p) => p.id);
// //       const querySnapshot = await getDocs(query(productsRef, where("__name__", "in", productIds)));
  
// //       const products: Product[] = querySnapshot.docs.map((doc) => {
// //         const productData = doc.data() as Product;
// //         const quantity = productsWithQuantities.find((p) => p.id === doc.id)?.quantity || 0;
  
// //         return {
// //           id: doc.id,
// //           name: productData.name,
// //           price: productData.price,
// //           quantity, // Include quantity from `user_orders`
// //           images1: productData.images1,
// //         };
// //       });
  
// //       setSelectedItems(products);
// //     } catch (error) {
// //       console.error("Error fetching products:", error);
// //     }
// //   };
  

// //     const handleShowItems = (order: Order) => {
// //       const productIdsWithQuantities = order.products.map((product) => ({
// //         id: product.id,
// //         quantity: product.quantity,
// //       }));
// //       setSelectedproducts(productIdsWithQuantities);
// //     };
    

// //   // Handle showing delivery details
// //   const handleShowDeliveryDetails = (deliveryDetails: DeliveryDetails) => {
// //     setSelectedDelivery(deliveryDetails);
// //   };

// //   const handleCloseModal = () => {
// //     setSelectedItems([]);
// //     setSelectedDelivery(null);
// //   };
  
  

// //   const handleUpdateStatus = async (orderId: string, newStatus: string) => {
// //     try {
// //       // Confirmation alert
// //       const confirmUpdate = window.confirm(
// //         `Are you sure you want to update the status to "${newStatus}"?`
// //       );

// //       if (!confirmUpdate) {
// //         console.log("Status update cancelled by the user.");
// //         return;
// //       }

// //       // Adjust the path to locate the correct document in the "user_orders" collection
// //       const ordersCollectionRef = query(collectionGroup(firestore, "user_orders"));
// //       const querySnapshot = await getDocs(ordersCollectionRef);
// //       const orderDocRef = querySnapshot.docs.find((doc) => doc.id === orderId)?.ref;

// //       if (!orderDocRef) {
// //         console.error("Order document not found for orderId:", orderId);
// //         return;
// //       }

// //       // Update the document with the new status
// //       await updateDoc(orderDocRef, { status: newStatus });

// //       // Update the local state
// //       setOrders((prevOrders) =>
// //         prevOrders.map((order) =>
// //           order.orderId === orderId ? { ...order, status: newStatus } : order
// //         )
// //       );

// //       console.log("Status updated successfully.");
// //     } catch (error) {
// //       console.error("Error updating status:", error);
// //     }
// //   };



// //   const exportToExcel = () => {
// //     const ws = XLSX.utils.json_to_sheet(
// //       orders.filter(
// //         (order) =>
// //           (filterOrderId === "" || order.orderId.toLowerCase().includes(filterOrderId.toLowerCase()) || order.userEmail.includes(filterOrderId)) &&
// //           (filterStatus === "" || order.status === filterStatus) &&
// //           isWithinDateRange(order.datetime)
// //       )
// //     );
// //     const wb = XLSX.utils.book_new();
// //     XLSX.utils.book_append_sheet(wb, ws, "Orders");
// //     XLSX.writeFile(wb, "orders_report.xlsx");
// //   };


// //   const handlePrintOrderSlip = (order: Order) => {
// //     const printWindow = window.open("", "_blank");
// //     if (printWindow) {
// //       printWindow.document.write(`
// //         <html>
// //           <head>
// //             <style>
// //               body { 
// //                 font-family: Arial, sans-serif; 
// //                 line-height: 1.6; 
// //                 margin: 20px; 
// //                 padding: 20px; 
// //               }
// //               h1 { 
// //                 text-align: center; 
// //                 padding-bottom: 20px; 
// //               }
// //               table { 
// //                 width: 100%; 
// //                 border-collapse: collapse; 
// //                 margin: 20px 0; 
// //               }
// //               th, td { 
// //                 border: 1px solid #ddd; 
// //                 padding: 12px; 
// //                 text-align: left; 
// //               }
// //               th { 
// //                 background-color: #f4f4f4; 
// //               }
// //               p { 
// //                 margin-bottom: 10px; 
// //                 font-size: 16px;
// //               }
// //               /* Style for the print button */
// //               #printButton {
// //                 display: block;
// //                 margin-bottom: 20px;
// //                 padding: 10px 20px;
// //                 background-color: #4CAF50;
// //                 color: white;
// //                 border: none;
// //                 font-size: 16px;
// //                 cursor: pointer;
// //               }
// //               #printButton:hover {
// //                 background-color: #45a049;
// //               }
// //               @media print {
// //                 @page {
// //                   margin: 0;
// //                   size: auto;
// //                 }
// //                 body {
// //                   margin: 50px;
// //                   padding: 0;
// //                 }
// //                 header, footer, .no-print {
// //                   display: none !important;
// //                 }
// //                 /* Hide the print button when printing */
// //                 #printButton {
// //                   display: none;
// //                 }
// //               }
// //             </style>
// //           </head>
// //           <body>
// //             <!-- Print button -->
// //             <button id="printButton" onclick="window.print();">Print Order Slip</button>
  
// //             <h1>Order Slip</h1>
// //             <p><strong>Order ID:</strong> ${order.orderId}</p>
// //             <p><strong>User Email:</strong> ${order.userEmail}</p>
// //             <p><strong>Contact Number:</strong> ${order.contactNumber}</p>
// //             <p><strong>Delivery Address:</strong> ${order.deliveryDetails.street}, ${order.deliveryDetails.city}, ${order.deliveryDetails.province}, ${order.deliveryDetails.country}</p>
// //             <h2>Products</h2>
// //             <table>
// //               <thead>
// //                 <tr>
// //                   <th>Product Name</th>
// //                   <th>Price</th>
// //                   <th>Quantity</th>
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 ${order.products
// //                   .map(
// //                     (product) => `
// //                     <tr>
// //                       <td>${product.name}</td>
// //                       <td>Rs${product.price}</td>
// //                       <td>${product.quantity}</td>
// //                     </tr>
// //                   `
// //                   )
// //                   .join("")}
// //               </tbody>
// //             </table>
// //             <p><strong>Total Price:</strong> Rs${order.totalPrice}</p>
// //           </body>
// //         </html>
// //       `);
// //       printWindow.document.close();
// //   printWindow.print();
// //       // Trigger the print action
// //       // printWindow.document.execCommand('print', false);
// //     }
// //   };

  
// //   return (
// //     <div className="h-[80vh]  text-black-200 p-8">
// //       <h1 className="text-3xl font-bold mb-8">All Users Orders</h1>
    
// //       <div className="mb-4 flex flex-wrap gap-4">

// //   <div className="flex-1 min-w-[200px]">
// //     <label htmlFor="orderId" className="block text-sm font-medium text-gray-700">Order ID And User Email</label>
// //     <input
// //       type="text"
// //       id="orderId"
// //       value={filterOrderId}
// //       onChange={(e) => setFilterOrderId(e.target.value)}
// //       className="w-full border border-gray-300 p-2 rounded-md"
// //     />
// //   </div>

// //   <div className="flex-1 min-w-[200px]">
// //     <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status:</label>
// //     <select
// //       id="status"
// //       value={filterStatus}
// //       onChange={(e) => setFilterStatus(e.target.value)}
// //       className="w-full border border-gray-300 p-2 rounded-md"
// //     >
// //       <option value="">All</option>
// //       <option value="Pending">Pending</option>
// //       <option value="Shipped">Shipped</option>
// //       <option value="Delivered">Delivered</option>
// //       <option value="Cancelled">Cancelled</option>
// //     </select>
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
// //   </div>
// // </div>


// //       {loading ? (
// //   <p className="text-center">Loading...</p>
// // ) : orders.length === 0 ? (
// //   <p className="text-center">No orders found.</p>
// // ) : (
// //   <div className="overflow-x-auto h-[60vh] overflow-y-auto">
// //     <table className="table-auto w-full border-collapse border border-white">
// //       <thead>
// //         <tr className="bg-white">
// //           <th className="border border-gray-700 px-4 py-2">Order ID</th>
// //           <th className="border border-gray-700 px-4 py-2">User Email</th>
// //           <th className="border border-gray-700 px-4 py-2">Contact</th>
// //           <th className="border border-gray-700 px-4 py-2">City</th>
// //           <th className="border border-gray-700 px-4 py-2">Date</th>
// //           <th className="border border-gray-700 px-4 py-2">Status</th>
// //           <th className="border border-gray-700 px-4 py-2">Total Price</th>
// //           <th className="border border-gray-700 px-4 py-2">Items Count</th>
// //           <th className="border border-gray-700 px-4 py-2">Actions</th>
// //         </tr>
// //       </thead>
// //       <tbody>
// //         {orders
// //           .filter(
// //             (order) =>
// //               (filterOrderId === "" || order.orderId.toLowerCase().includes(filterOrderId.toLowerCase()) || order.userEmail.includes(filterOrderId)) &&
// //               (filterStatus === "" || order.status === filterStatus) &&
// //               isWithinDateRange(order.datetime) 
// //           )

// //           .map((order) => (
// //             <tr key={order.orderId} className="hover:bg-gray-100">
// //               <td className="border border-gray-700 px-4 py-2">{order.orderId}</td>
// //               <td className="border border-gray-700 px-4 py-2">{order.userEmail}</td>
// //               <td className="border border-gray-700 px-4 py-2">{order.contactNumber}</td>
// //               <td className="border border-gray-700 px-4 py-2">{order.city}</td>
// //               <td className="border border-gray-700 px-4 py-2">{order.datetime}</td>
// //               <td className="border border-gray-700 px-4 py-2">
// //                 <select
// //                   className="bg-gray-500 text-white px-2 py-1 rounded"
// //                   value={order.status}
// //                   onChange={(e) => handleUpdateStatus(order.orderId, e.target.value)}
// //                 >
// //                   <option value="Pending">Pending</option>
// //                   <option value="Shipped">Shipped</option>
// //                   <option value="Delivered">Delivered</option>
// //                   <option value="Cancelled">Cancelled</option>
// //                 </select>
// //               </td>
// //               <td className="border border-gray-700 px-4 py-2">PKR:{order.totalPrice}</td>
// //               <td className="border border-gray-700 px-4 py-2">{order.products.length}</td>
// //               <td className="border border-gray-700 px-4 py-2 space-y-2">
// //                 <button
// //                   className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
// //                   onClick={() => handleShowItems(order)}
// //                 >
// //                   View Items
// //                 </button>
// //                 <button
// //                   className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
// //                   onClick={() => handleShowDeliveryDetails(order.deliveryDetails)}
// //                 >
// //                   View Delivery
// //                 </button>
// //                 <button
// //                   className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
// //                   onClick={() => handlePrintOrderSlip(order)}
// //                 >
// //                   <FiPrinter size={20} style={{ marginRight: "5px" }} />
// //                 </button>
// //               </td>
// //             </tr>
// //           ))}
// //       </tbody>
// //     </table>
// //   </div>
// // )}


// //       {/* Modal for displaying items */}
    
// //       {/* Modal for displaying product details */}
// //       {selectedItems.length > 0 && (
// //   <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
// //     <div className="bg-white p-12 rounded-lg max-w-4xl w-full relative">
// //       <h2 className="text-2xl font-bold mb-6 text-center text-black">Product Details</h2>
// //       <button
// //         className="text-black absolute top-4 right-4 text-2xl"
// //         onClick={handleCloseModal}
// //       >
// //         X
// //       </button>
// //       <div className="overflow-y-auto max-h-[400px]">
// //         <table className="table-auto w-full text-left text-black border-collapse border border-gray-300">
// //           <thead>
// //             <tr>
// //               <th className="border border-gray-300 px-6 py-4">Image</th>
// //               <th className="border border-gray-300 px-6 py-4">Product Name</th>
// //               <th className="border border-gray-300 px-6 py-4">Price</th>
// //               <th className="border border-gray-300 px-6 py-4">Quantity</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {selectedItems.map((product) => (
// //               <tr key={product.id}>
// //                 <td className="border border-gray-300 px-6 py-4">
// //                   {product.images1 && product.images1.length > 0 ? (
// //                     <Image
// //                       src={
// //                         product.images1[0].startsWith("data:image")
// //                           ? product.images1[0]
// //                           : `data:image/jpeg;base64,${product.images1[0]}`
// //                       }
// //                       alt="Product"
// //                       width={80} // Set the width
// //                       height={80} // Set the height
// //                       className="object-cover rounded"
// //                     />
// //                   ) : (
// //                     <span>No image</span>
// //                   )}
// //                 </td>
// //                 <td className="border border-gray-300 px-6 py-4">{product.name}</td>
// //                 <td className="border border-gray-300 px-6 py-4">{product.price}</td>
// //                 <td className="border border-gray-300 px-6 py-4">{product.quantity}</td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   </div>
// // )}






// //       {/* Modal for displaying delivery details */}
// //       {selectedDelivery && (
// //   <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
// //     <div className="bg-gray-900 p-8 rounded relative">
// //       <h2 className="text-2xl font-bold mb-4">Delivery Details</h2>
// //       <button
// //         className="text-white absolute top-4 right-4 text-lg"
// //         onClick={handleCloseModal}
// //       >
// //         X
// //       </button>
// //       <table className="table-auto w-full text-left text-white border-collapse border border-gray-700">
      
// //         <tbody>
// //         <tr>
// //             <td className="border border-gray-700 px-4 py-2"><b>Phone</b></td>
// //             <td className="border border-gray-700 px-4 py-2">{selectedDelivery.phone}</td>
// //           </tr>
// //           <tr>
// //             <td className="border border-gray-700 px-4 py-2"> <b>Address</b></td>
// //             <td className="border border-gray-700 px-4 py-2">{selectedDelivery.street}</td>
// //           </tr>
// //           <tr>
// //             <td className="border border-gray-700 px-4 py-2"><b>City</b></td>
// //             <td className="border border-gray-700 px-4 py-2">{selectedDelivery.city}</td>
// //           </tr>
// //           <tr>
// //             <td className="border border-gray-700 px-4 py-2"><b>Province</b></td>
// //             <td className="border border-gray-700 px-4 py-2">{selectedDelivery.province}</td>
// //           </tr>
// //           <tr>
// //             <td className="border border-gray-700 px-4 py-2"><b>Country</b></td>
// //             <td className="border border-gray-700 px-4 py-2">{selectedDelivery.country}</td>
// //           </tr>
       
// //         </tbody>
// //       </table>
// //     </div>
// //   </div>
// // )}

// //     </div>
// //   );
// // }