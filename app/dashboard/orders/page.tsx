"use client";

import { useState, useEffect } from "react";

interface Order {
  id: string;
  user: string;
  contact: string;
  quantity: number;
  price: number;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const fetchedOrders: Order[] = [
        { id: "1", user: "Amir@gmail.com", contact: "1234567890", quantity: 2, price: 50 },
        { id: "2", user: "Wasif21@gmail.com", contact: "2345678901", quantity: 3, price: 100 },
        { id: "3", user: "Ali123@gmail.com", contact: "3456789012", quantity: 1, price: 75 },
        { id: "4", user: "Amir@gmail.com", contact: "1234567890", quantity: 3, price: 100 },
        { id: "5", user: "Umar@gmail.com", contact: "4567890123", quantity: 1, price: 75 },
      ];
      setOrders(fetchedOrders);
    };

    fetchOrders();
  }, []);

  return (
    <div className="p-6 text-black h-[80vh]">
      <div className="overflow-x-auto h-[75vh] overflow-y-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-green-600 text-white">
              <th className="border border-gray-700 px-4 py-2">S. No.</th>
              <th className="border border-gray-700 px-4 py-2">User</th>
              <th className="border border-gray-700 px-4 py-2">Contact No.</th>
              <th className="border border-gray-700 px-4 py-2">No. of Items</th>
              <th className="border border-gray-700 px-4 py-2" style={{ width: "12%" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order.id} className="even:bg-gray-200 odd:bg-gray-300">
                {/* Serial Number */}
                <td className="border border-gray-700 px-4 py-2">{index + 1}</td>
                {/* User Email */}
                <td className="border border-gray-700 px-4 py-2">{order.user}</td>
                {/* Contact Number */}
                <td className="border border-gray-700 px-4 py-2">{order.contact}</td>
                {/* Number of Items */}
                <td className="border border-gray-700 px-4 py-2">{order.quantity}</td>
                {/* Actions */}
                <td className="border border-gray-700 px-4 py-2">
                  <button
                    className="px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none"
                    onClick={() => console.log("Order Detail for ID:", order.id)}
                  >
                    Order Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;



// "use client";

// import OrderStatusDropdown from "@/components/dropdown";
// import { useState, useEffect, SetStateAction } from "react";
// // import { FiCheckCircle, FiClock,} from "react-icons/fi";

// interface Order {
//   id: string;
//   productName: string;
//   user: string;
//   quantity: number;
//   price: number;
//   image: string; // Add image property
// }

// const Orders = () => {
//   const [orders, setOrders] = useState<Order[]>([]);

//   // Simulate fetching orders (in place of an API or Firebase call)
//   useEffect(() => {
//     const fetchOrders = async () => {
//       // Simulated fetched orders
//       const fetchedOrders: Order[] = [
//         {
//           id: "1",
//           productName: "Product 1",
//           user: "Amir@gmail.com ",
//           quantity: 2,
//           price: 50,
//           image: "https://up.yimg.com/ib/th?id=OIP.LLs4MQaIdVfxZNfmk0YkQQHaH3&pid=Api&rs=1&c=1&qlt=95&w=105&h=112", // Example image URL
//         },
//         {
//           id: "2",
//           productName: "Bread Balm",
//           user: "Wasif21@gmail.com ",
//           quantity: 3,
//           price: 100,
//           image: "https://up.yimg.com/ib/th?id=OIP.s9gtURohWjYwnMgYl3v4fwHaGy&pid=Api&rs=1&c=1&qlt=95&w=115&h=105", // Example image URL
//         },

//         {
//           id: "3",
//           productName: "Product 3",
//           user: "Ali123@gmail.com ",
//           quantity: 1,
//           price: 75,
//           image: "https://tse1.mm.bing.net/th?id=OIP.SZFufwcZO_gs8vmF81xCjwHaI4&pid=Api&P=0&h=220", // Example image URL
//         },
// {
//           id: "4",
//           productName: "Bread Balm",
//           user: "Amir@gmail.com",
//           quantity: 3,
//           price: 100,
//           image: "https://up.yimg.com/ib/th?id=OIP.s9gtURohWjYwnMgYl3v4fwHaGy&pid=Api&rs=1&c=1&qlt=95&w=115&h=105", // Example image URL
//         },
        
//         {
//           id: "5",
//           productName: "Product 3",
//           user: "Umar@gmail.com ",
//           quantity: 1,
//           price: 75,
//           image: "https://tse1.mm.bing.net/th?id=OIP.SZFufwcZO_gs8vmF81xCjwHaI4&pid=Api&P=0&h=220", // Example image URL
//         },
        
//       ];

//       setOrders(fetchedOrders);
//     };

//     fetchOrders();
//   }, []); // Empty dependency array to run once wh
//   // en the component mounts
//   const [orderStatus, setOrderStatus] = useState("Pending");

//   const handleStatusChange = (newStatus: SetStateAction<string>) => {
//     console.log("Order status changed to:", newStatus);
//     setOrderStatus(newStatus);
//   };
//   // Handle actions like edit and delete
//   // const handleEdit = (orderId: string) => {
//   //   console.log("Edit order:", orderId);
//   // };

//   // const handleDelete = (orderId: string) => {
//   //   console.log("Delete order:", orderId);
//   //   setOrders(orders.filter(order => order.id !== orderId)); // Remove the order from the list
//   // };

//   return (
//     <div className="p-6 text-black h-[80vh]">
//       {/* Order Table */}
//       <div className="overflow-x-auto h-[75vh] overflow-y-auto">
//         <table className="w-full overflow-x-auto border-collapse text-left">
//           <thead>
//             <tr className="bg-green-600 text-white ">
//               <th className="border border-gray-700 px-4 py-2" style={{ width: '12%' }}>Image</th> {/* New Image Column */}
//               <th className="border border-gray-700 px-4 py-2">Product Name</th>
//               <th className="border border-gray-700 px-4 py-2">User</th>
//               <th className="border border-gray-700 px-4 py-2">Quantity</th>
//               <th className="border border-gray-700 px-4 py-2">Price</th>
//               <th className="border border-gray-700 px-4 py-2"style={{ width: '12%' }} >Actions</th> {/* New Actions Column */}
//             </tr>
//           </thead>
//           <tbody>
//             {orders.map((order) => (
//               <tr key={order.id} className="even:bg-gray-200 odd:bg-gray-300">
//                 {/* Image */}
//                 <td className="border border-gray-700 px-4 py-2">
//                   <img src={order.image} alt={order.productName} className="w-20 h-20 object-cover rounded-md" />
//                 </td>
//                 {/* Product Name */}
//                 <td className="border border-gray-700 px-4 py-2">{order.productName}</td>
//                 <td className="border border-gray-700 px-4 py-2">{order.user}</td>
//                 {/* Quantity */}
//                 <td className="border border-gray-700 px-4 py-2">{order.quantity}</td>
//                 {/* Price */}
//                 <td className="border border-gray-700 px-4 py-2">{order.price}</td>
//                 {/* Actions (Edit/Delete) */}
//                 <td className="border border-gray-700 px-4 py-2 ">
//           <div className="flex items-center  space-x-2">
//           <OrderStatusDropdown
//           currentStatus={orderStatus}
//           onStatusChange={handleStatusChange}
//         />
        
        
//           </div>
//         </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default Orders;



// "use client";

// import { useState, useEffect } from "react";
// import { firestore, auth } from "../../lib/firebase-config";
// import { onAuthStateChanged } from "firebase/auth";
// import { useRouter } from "next/navigation";
// import {
//   collection,
//   addDoc,
//   getDocs,
//   updateDoc,
//   doc,
//   deleteDoc,
// } from "firebase/firestore";
// import { FiEdit, FiTrash } from "react-icons/fi";

// interface Order {
//   id: string;
//   userId: string;
//   categoryId: string;
//   subCategoryId: string;
//   quantity: number;
//   status: string;
// }

// const Orders = () => {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [orderError, setOrderError] = useState("");
//   const [newOrder, setNewOrder] = useState({
//     userId: "",
//     categoryId: "",
//     subCategoryId: "",
//     quantity: 0,
//     status: "Pending",
//   });
//   const [isEditingOrder, setIsEditingOrder] = useState<Order | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   const fetchOrders = async () => {
//     try {
//       const querySnapshot = await getDocs(collection(firestore, "orders"));
//       const fetchedOrders = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       })) as Order[];
//       setOrders(fetchedOrders);
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//       setOrderError("Failed to fetch orders.");
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (!user) {
//         router.push("/"); // Redirect if not authenticated
//       } else {
//         fetchOrders();
//         setLoading(false);
//       }
//     });

//     return () => unsubscribe();
//   }, [router]);

//   const addOrder = async () => {
//     if (!newOrder.userId || !newOrder.categoryId || !newOrder.subCategoryId || newOrder.quantity <= 0) {
//       setOrderError("Please fill all the fields correctly.");
//       return;
//     }

//     try {
//       if (isEditingOrder) {
//         // Update existing order
//         const orderRef = doc(firestore, "orders", isEditingOrder.id);
//         await updateDoc(orderRef, { ...newOrder });
//         setIsEditingOrder(null);
//       } else {
//         // Add new order
//         await addDoc(collection(firestore, "orders"), {
//           ...newOrder,
//         });
//       }

//       setNewOrder({
//         userId: "",
//         categoryId: "",
//         subCategoryId: "",
//         quantity: 0,
//         status: "Pending",
//       });
//       fetchOrders();
//     } catch (error) {
//       console.error("Error adding/updating order:", error);
//       setOrderError("Failed to add or update order.");
//     }
//   };

//   const deleteOrder = async (orderId: string) => {
//     try {
//       const orderRef = doc(firestore, "orders", orderId);
//       await deleteDoc(orderRef);
//       fetchOrders();
//     } catch (error) {
//       console.error("Error deleting order:", error);
//     }
//   };

//   const handleEditOrder = (order: Order) => {
//     setIsEditingOrder(order);
//     setNewOrder({
//       userId: order.userId,
//       categoryId: order.categoryId,
//       subCategoryId: order.subCategoryId,
//       quantity: order.quantity,
//       status: order.status,
//     });
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="p-0 text-black h-[80vh]">
//       {/* Add/Edit Order Form */}
//       <div className="mb-6">
//         <input
//           type="text"
//           value={newOrder.userId}
//           onChange={(e) => setNewOrder({ ...newOrder, userId: e.target.value })}
//           placeholder="User ID"
//           className="border border-gray-300 bg-gray-200 text-black rounded px-4 py-2 mr-2 w-1/2 focus:outline-none focus:ring focus:ring-gray-400"
//         />
//         <input
//           type="text"
//           value={newOrder.categoryId}
//           onChange={(e) => setNewOrder({ ...newOrder, categoryId: e.target.value })}
//           placeholder="Category ID"
//           className="border border-gray-300 bg-gray-200 text-black rounded px-4 py-2 mr-2 w-1/2 focus:outline-none focus:ring focus:ring-gray-400"
//         />
//         <input
//           type="text"
//           value={newOrder.subCategoryId}
//           onChange={(e) => setNewOrder({ ...newOrder, subCategoryId: e.target.value })}
//           placeholder="Subcategory ID"
//           className="border border-gray-300 bg-gray-200 text-black rounded px-4 py-2 mr-2 w-1/2 focus:outline-none focus:ring focus:ring-gray-400"
//         />
//         <input
//           type="number"
//           value={newOrder.quantity}
//           onChange={(e) => setNewOrder({ ...newOrder, quantity: parseInt(e.target.value) })}
//           placeholder="Quantity"
//           className="border border-gray-300 bg-gray-200 text-black rounded px-4 py-2 mr-2 w-1/2 focus:outline-none focus:ring focus:ring-gray-400"
//         />
//         <button
//           onClick={addOrder}
//           className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
//         >
//           {isEditingOrder ? "Update Order" : "Add Order"}
//         </button>
//       </div>

//       {orderError && <p className="text-red-500 mb-4">{orderError}</p>}

//       {/* Order Table */}
//       <div className="overflow-x-auto h-[75vh] overflow-y-auto">
//         <table className="w-full border-collapse text-left">
//           <thead>
//             <tr className="bg-green-600 text-white">
//               <th className="border border-gray-700 px-4 py-2">User ID</th>
//               <th className="border border-gray-700 px-4 py-2">Category ID</th>
//               <th className="border border-gray-700 px-4 py-2">Subcategory ID</th>
//               <th className="border border-gray-700 px-4 py-2">Quantity</th>
//               <th className="border border-gray-700 px-4 py-2">Status</th>
//               <th className="border border-gray-700 px-4 py-2">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {orders.map((order) => (
//               <tr key={order.id} className="even:bg-gray-200 odd:bg-gray-300">
//                 <td className="border border-gray-700 px-4 py-2">{order.userId}</td>
//                 <td className="border border-gray-700 px-4 py-2">{order.categoryId}</td>
//                 <td className="border border-gray-700 px-4 py-2">{order.subCategoryId}</td>
//                 <td className="border border-gray-700 px-4 py-2">{order.quantity}</td>
//                 <td className="border border-gray-700 px-4 py-2">{order.status}</td>
//                 <td className="border border-gray-700 px-4 py-2">
//                   <div className="flex items-center space-x-2">
//                     <button
//                       onClick={() => handleEditOrder(order)}
//                       className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded"
//                     >
//                       <FiEdit className="text-white" size={20} />
//                     </button>
//                     <button
//                       onClick={() => deleteOrder(order.id)}
//                       className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded"
//                     >
//                       <FiTrash className="text-white" size={20} />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default Orders;
