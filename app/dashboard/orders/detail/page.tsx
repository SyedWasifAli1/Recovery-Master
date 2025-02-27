

"use client";

import OrderStatusDropdown from "@/components/dropdown";
import Image from "next/image";
import { useState, useEffect, SetStateAction } from "react";
// import { FiCheckCircle, FiClock,} from "react-icons/fi";

interface Order {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  image: string; // Add image property
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  // Simulate fetching orders (in place of an API or Firebase call)
  useEffect(() => {
    const fetchOrders = async () => {
      // Simulated fetched orders
      const fetchedOrders: Order[] = [
        {
          id: "1",
          productName: "Product 1",
          quantity: 2,
          price: 50,
          image: "https://up.yimg.com/ib/th?id=OIP.LLs4MQaIdVfxZNfmk0YkQQHaH3&pid=Api&rs=1&c=1&qlt=95&w=105&h=112", // Example image URL
        },
        {
          id: "2",
          productName: "Bread Balm",
          quantity: 3,
          price: 100,
          image: "https://up.yimg.com/ib/th?id=OIP.s9gtURohWjYwnMgYl3v4fwHaGy&pid=Api&rs=1&c=1&qlt=95&w=115&h=105", // Example image URL
        },

        {
          id: "3",
          productName: "Product 3",
          quantity: 1,
          price: 75,
          image: "https://tse1.mm.bing.net/th?id=OIP.SZFufwcZO_gs8vmF81xCjwHaI4&pid=Api&P=0&h=220", // Example image URL
        },
{
          id: "4",
          productName: "Bread Balm",
          quantity: 3,
          price: 100,
          image: "https://up.yimg.com/ib/th?id=OIP.s9gtURohWjYwnMgYl3v4fwHaGy&pid=Api&rs=1&c=1&qlt=95&w=115&h=105", // Example image URL
        },
        
        {
          id: "5",
          productName: "Product 3",
          quantity: 1,
          price: 75,
          image: "https://tse1.mm.bing.net/th?id=OIP.SZFufwcZO_gs8vmF81xCjwHaI4&pid=Api&P=0&h=220", // Example image URL
        },
        
      ];

      setOrders(fetchedOrders);
    };

    fetchOrders();
  }, []); // Empty dependency array to run once wh
  // en the component mounts
  const [orderStatus, setOrderStatus] = useState("Pending");

  const handleStatusChange = (newStatus: SetStateAction<string>) => {
    console.log("Order status changed to:", newStatus);
    setOrderStatus(newStatus);
  };
  // Handle actions like edit and delete
  // const handleEdit = (orderId: string) => {
  //   console.log("Edit order:", orderId);
  // };

  // const handleDelete = (orderId: string) => {
  //   console.log("Delete order:", orderId);
  //   setOrders(orders.filter(order => order.id !== orderId)); // Remove the order from the list
  // };

  return (
    <div className="p-1 text-black h-[80vh]">
      {/* Order Table */}
      <div className="mb-6 p-1 border rounded-md bg-gray-100">
        <h2 className="text-lg font-bold mb-2">User Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          <p><strong>User:</strong> Amir</p>
          <p><strong>Contact:</strong> 03150000000</p>
          <p><strong>Address:</strong> korangi  </p>
          <p><strong>Address Street:</strong> street no 23</p>
          <p><strong>Country:</strong> Pakistan</p>
          <p><strong>Province:</strong> Sindh</p>
          <p><strong>City:</strong> Karachi</p>
        </div>
      </div>
      <div className="overflow-x-auto h-[50vh] overflow-y-auto">
        <table className="w-full overflow-x-auto border-collapse text-left">
          <thead>
            <tr className="bg-green-600 text-white ">
              <th className="border border-gray-700 px-4 py-2" style={{ width: '12%' }}>Image</th> {/* New Image Column */}
              <th className="border border-gray-700 px-4 py-2">Product Name</th>
              <th className="border border-gray-700 px-4 py-2">Quantity</th>
              <th className="border border-gray-700 px-4 py-2">Price</th>
              <th className="border border-gray-700 px-4 py-2"style={{ width: '12%' }} >Actions</th> {/* New Actions Column */}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="even:bg-gray-200 odd:bg-gray-300">
                {/* Image */}
                <td className="border border-gray-700 px-4 py-2">
                <Image 
  src={order.image} 
  alt={order.productName || "Product image"} 
  className="w-20 h-20 object-cover rounded-md" 
/>

                </td>
                {/* Product Name */}
                <td className="border border-gray-700 px-4 py-2">{order.productName}</td>
                {/* Quantity */}
                <td className="border border-gray-700 px-4 py-2">{order.quantity}</td>
                {/* Price */}
                <td className="border border-gray-700 px-4 py-2">{order.price}</td>
                {/* Actions (Edit/Delete) */}
                <td className="border border-gray-700 px-4 py-2 ">
          <div className="flex items-center  space-x-2">
          <OrderStatusDropdown
          currentStatus={orderStatus}
          onStatusChange={handleStatusChange}
        />
        
        
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

export default Orders;
