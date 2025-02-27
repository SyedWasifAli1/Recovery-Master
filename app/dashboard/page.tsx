/* eslint-disable prefer-const */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// "use client";
// import { useEffect, useState } from "react";
// import { getDocs, collection } from "firebase/firestore";
// import { firestore } from "../lib/firebase-config";

// interface User {
//   uid: string;
//   email: string;
// }

// interface Product {
//   id: string;
//   name: string;
//   price: number;
// }

// interface Category {
//   id: string;
//   name: string;
// }

// export default function Dashboard() {
//   const [users, setUsers] = useState<number>(0);
//   const [productsCount, setProductsCount] = useState<number>(0);
//   const [categoriesCount, setCategoriesCount] = useState<number>(0); // Categories count state
//   const [allSubCategoriesCount, setAllSubCategoriesCount] = useState<number>(0); // Total subcategories count across all categories
//   const [ordersCount, setOrdersCount] = useState<number>(0); // Total orders count from user_orders
//   const [loadingUsers, setLoadingUsers] = useState(true);
//   const [loadingProducts, setLoadingProducts] = useState(true);
//   const [loadingCategories, setLoadingCategories] = useState(true);
//   const [loadingSubCategories, setLoadingSubCategories] = useState(true); // Subcategories loading state
//   const [loadingOrders, setLoadingOrders] = useState(true); // Orders loading state

//   // Fetch users, products, categories, subcategories, and orders
//   useEffect(() => {
    
//     async function fetchUsers() {
//       try {
//         const querySnapshot = await getDocs(collection(firestore, "customers")); // Replace "customers" with your collection name
//         setUsers(querySnapshot.size); // Get the count of documents in the customers collection
//         setLoadingUsers(false);
//       } catch (error) {
//         console.error("Error fetching customers count:", error);
//         setLoadingUsers(false);
//       }
//     }
    
//     async function fetchProductsCount() {
//       try {
//         const querySnapshot = await getDocs(collection(firestore, "products"));
//         setProductsCount(querySnapshot.size); // Get the count of documents in the products collection
//         setLoadingProducts(false);
//       } catch (error) {
//         console.error("Error fetching products count:", error);
//         setLoadingProducts(false);
//       }
//     }


//     async function fetchCategoriesCount() {
//       try {
//         const querySnapshot = await getDocs(collection(firestore, "category"));
//         setCategoriesCount(querySnapshot.size); // Get the count of documents in the category collection
//         setLoadingCategories(false);
//       } catch (error) {
//         console.error("Error fetching categories count:", error);
//         setLoadingCategories(false);
//       }
//     }

//     async function fetchAllSubCategoriesCount() {
//       try {
//         const categorySnapshot = await getDocs(collection(firestore, "category"));
//         let totalSubCategories = 0;

//         // For each category, fetch its subcategories
//         for (const categoryDoc of categorySnapshot.docs) {
//           const categoryId = categoryDoc.id;
//           const subCategorySnapshot = await getDocs(collection(firestore, `category/${categoryId}/sub_categories`));
//           totalSubCategories += subCategorySnapshot.size; // Add the count of subcategories for this category
//         }

//         setAllSubCategoriesCount(totalSubCategories); // Set the total subcategories count
//         setLoadingSubCategories(false);
//       } catch (error) {
//         console.error("Error fetching subcategories count:", error);
//         setLoadingSubCategories(false);
//       }
//     }

//     async function fetchOrdersCount() {
//       try {
//         const categorySnapshot = await getDocs(collection(firestore, "orders"));
//         let totalorder = 0;

//         // For each category, fetch its subcategories
//         for (const categoryDoc of categorySnapshot.docs) {
//           const categoryId = categoryDoc.id;
//           const subCategorySnapshot = await getDocs(collection(firestore, `orders/${categoryId}/user_orders`));
//           totalorder += subCategorySnapshot.size; // Add the count of subcategories for this category
//         }

//         setOrdersCount(totalorder); // Set the total subcategories count
//         setLoadingOrders(false);
//       } catch (error) {
//         console.error("Error fetching subcategories count:", error);
//         setLoadingOrders(false);
//       }
//     }
    
    
    

//     fetchUsers();
//     fetchProductsCount();
//     fetchCategoriesCount();
//     fetchAllSubCategoriesCount(); // Fetch total subcategories count across all categories
//     fetchOrdersCount(); // Fetch total orders count from user_orders subcollections
//   }, []);

//   return (
//     <div className="h-[80vh]  text-black p-8">
//       <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
//       <div className="grid grid-cols-2 gap-4">
//         <div className="bg-gray-200 p-4 rounded">
//           <h2 className="text-xl font-bold mb-2">Users</h2>
//           {loadingUsers ? (
//             <p>Loading users...</p>
//           ) : (
//             <p className="text-lg font-semibold">Total Users: {users}</p>
//           )}
//         </div>
//         <div className="bg-gray-200 p-4 rounded">
//           <h2 className="text-xl font-bold mb-2">Products</h2>
//           {loadingProducts ? (
//             <p>Loading products...</p>
//           ) : (
//             <p className="text-lg font-semibold">Total Products: {productsCount}</p>
//           )}
//         </div>
//         <div className="bg-gray-200 p-4 rounded">
//           <h2 className="text-xl font-bold mb-2">Categories</h2>
//           {loadingCategories ? (
//             <p>Loading categories...</p>
//           ) : (
//             <p className="text-lg font-semibold">Total Categories: {categoriesCount}</p>
//           )}
//         </div>
//         <div className="bg-gray-200 p-4 rounded">
//           <h2 className="text-xl font-bold mb-2">Sub Categories</h2>
//           {loadingSubCategories ? (
//             <p>Loading subcategories...</p>
//           ) : (
//             <p className="text-lg font-semibold">Total Sub Categories: {allSubCategoriesCount}</p>
//           )}
//         </div>
      
//         <div className="bg-gray-200 p-4 rounded">
//           <h2 className="text-xl font-bold mb-2">All Orders</h2>
//           {loadingOrders ? (
//             <p>Loading All Orders...</p>
//           ) : (
//             <p className="text-lg font-semibold">Total Sub Categories: {ordersCount}</p>
//           )}
//         </div>
      
//       </div>
//     </div>
//   );
// }



// /* eslint-disable @typescript-eslint/no-unused-vars */

// "use client";
// import { useEffect, useState } from "react";
// import { getDocs, collection } from "firebase/firestore";
// import { firestore } from "../lib/firebase-config";
// import { Bar, Pie, Line } from "react-chartjs-2";
// import { Chart, registerables } from "chart.js";

// Chart.register(...registerables);

// export default function Dashboard() {
//   const [users, setUsers] = useState<number>(0);
//   const [productsCount, setProductsCount] = useState<number>(0);
//   const [categoriesCount, setCategoriesCount] = useState<number>(0);
//   const [allSubCategoriesCount, setAllSubCategoriesCount] = useState<number>(0);
//   const [ordersCount, setOrdersCount] = useState<number>(0);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const usersData = await getDocs(collection(firestore, "customers"));
//         const productsData = await getDocs(collection(firestore, "products"));
//         const categoriesData = await getDocs(collection(firestore, "category"));

//         let totalSubCategories = 0;
//         for (const categoryDoc of categoriesData.docs) {
//           const subCategoryData = await getDocs(
//             collection(firestore, `category/${categoryDoc.id}/sub_categories`)
//           );
//           totalSubCategories += subCategoryData.size;
//         }

//         let totalOrders = 0;
//         const ordersData = await getDocs(collection(firestore, "orders"));
//         for (const orderDoc of ordersData.docs) {
//           const userOrders = await getDocs(
//             collection(firestore, `orders/${orderDoc.id}/user_orders`)
//           );
//           totalOrders += userOrders.size;
//         }

//         setUsers(usersData.size);
//         setProductsCount(productsData.size);
//         setCategoriesCount(categoriesData.size);
//         setAllSubCategoriesCount(totalSubCategories);
//         setOrdersCount(totalOrders);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setLoading(false);
//       }
//     }

//     fetchData();
//   }, []);

//   const data = {
//     labels: ["Users", "Products", "Categories", "Subcategories", "Orders"],
//     datasets: [
//       {
//         label: "Counts",
//         data: [users, productsCount, categoriesCount, allSubCategoriesCount, ordersCount],
//         backgroundColor: ["#4CAF50", "#2E7D32", "#66BB6A", "#A5D6A7", "#81C784"],
//         borderColor: "#388E3C",
//         borderWidth: 2,
//         borderRadius: 10,
//       },
//     ],
//   };

//   return (
//     <div className="h-screen p-8 text-black bg-white">
//       <h1 className="text-3xl font-bold text-orange-700 mb-6">Dashboard Overview</h1>

//       {loading ? (
//         <p className="text-center text-lg font-semibold text-gray-700">Loading data...</p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {/* Bar Chart */}
//           <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
//             <h2 className="text-xl font-bold text-orange-400 mb-3">Data Overview</h2>
//             <Bar data={data} />
//           </div>

//           {/* Pie Chart */}
//           <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
//             <h2 className="text-xl font-bold text-orange-400 mb-3">Category Distribution</h2>
//             <Pie data={data} />
//           </div>

//           {/* Line Chart */}
//           <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
//             <h2 className="text-xl font-bold text-orange-400 mb-3">Growth Trend</h2>
//             <Line data={data} />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


"use client";
import { useEffect, useState } from "react";
import { firestore } from "../lib/firebase-config";
import { collection, getDocs } from "firebase/firestore";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from "chart.js";
import withAuth from "../lib/withauth";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement // Register PointElement for Line chart
);

// Define the type for the chart data
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor: string;
    borderWidth: number;
    fill?: boolean;  // Add the fill property for Line chart
  }[];
}

const OrdersChart = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [pieData, setPieData] = useState<ChartData | null>(null);
  const [lineData, setLineData] = useState<ChartData | null>(null); // New state for Line chart

  useEffect(() => {
    const fetchOrdersAndUsers = async () => {
      let monthlyData: { [key: string]: number } = {};
      let cityData: { [key: string]: number } = {};  // Grouping by city for Pie chart
      let usersData: { [key: string]: number } = {};  // Grouping users by month for Line chart

      const ordersSnapshot = await getDocs(collection(firestore, "orders"));
      const customersSnapshot = await getDocs(collection(firestore, "customers")); // Fetch users data

      // Fetching orders data and processing
      for (const orderDoc of ordersSnapshot.docs) {
        const userOrdersSnapshot = await getDocs(collection(firestore, `orders/${orderDoc.id}/user_orders`));

        userOrdersSnapshot.docs.forEach(userOrderDoc => {
          const { datetime, deliveryDetails } = userOrderDoc.data(); // Fetch deliveryDetails

          if (datetime && datetime.toDate) {
            const date = datetime.toDate(); // Convert Firestore Timestamp to JavaScript Date
            const month = date.toLocaleString("en-US", { month: "short" }); // Get short month name

            // Group by month and increment count for Bar chart
            if (!monthlyData[month]) monthlyData[month] = 0;
            monthlyData[month] += 1;

            // Group by city and increment count for Pie chart
            if (deliveryDetails && deliveryDetails.city) {
              const city = deliveryDetails.city;  // Extract city from deliveryDetails
              if (!cityData[city]) cityData[city] = 0;
              cityData[city] += 1;
            }
          }
        });
      }

      // Fetching users data and processing
      customersSnapshot.docs.forEach(customerDoc => {
        const { datetime } = customerDoc.data(); // Assuming createdAt is a timestamp for when user joined

        if (datetime && datetime.toDate) {
          const date = datetime.toDate(); // Convert Firestore Timestamp to JavaScript Date
          const month = date.toLocaleString("en-US", { month: "short" }); // Get short month name

          // Group by month and increment count for Line chart
          if (!usersData[month]) usersData[month] = 0;
          usersData[month] += 1;
        }
      });

      // Prepare the Bar chart data
      const barLabels = Object.keys(monthlyData);
      const barDataValues = Object.values(monthlyData);

      // Prepare the Pie chart data (grouped by city)
      const pieLabels = Object.keys(cityData);
      const pieDataValues = Object.values(cityData);

      // Prepare the Line chart data (grouped by users' creation month)
      const lineLabels = Object.keys(usersData);
      const lineDataValues = Object.values(usersData);

      // Set chart data with explicit typing for Bar chart
      setChartData({
        labels: barLabels,
        datasets: [
          {
            label: "Monthly Customers",
            data: barDataValues,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      });

      // Set chart data with explicit typing for Pie chart
      setPieData({
        labels: pieLabels,
        datasets: [
          {
            label: "Collectors",
            data: pieDataValues,
            backgroundColor: [
              "rgba(75, 192, 192, 0.6)",
              "rgba(255, 99, 132, 0.6)",
              "rgba(255, 159, 64, 0.6)",
              "rgba(153, 102, 255, 0.6)",
              "rgba(54, 162, 235, 0.6)",
            ],  // Array of colors for each pie slice
            borderColor: "rgba(0, 0, 0, 1)",
            borderWidth: 1,
          },
        ],
      });

      // Set chart data with explicit typing for Line chart (users over time)
      setLineData({ 
        labels: lineLabels,
        datasets: [
          {
            label: "Monthly Payments",
            data: lineDataValues,
            backgroundColor: "rgba(153, 102, 255, 0.6)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 2,
            fill: false,  // Fill property works now
          },
        ],
      });
    };

    fetchOrdersAndUsers();
  }, []);

  return (
        <div className="m-screen p-8 text-black bg-white">
      <h1 className="text-3xl font-bold text-[#283593] mb-6">Dashboard Overview</h1>

  
{/*         <p className="text-center text-lg font-semibold text-gray-700">Loading data...</p> */}
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-[#283593] mb-3">Total Customers</h2>
            {chartData ? <Bar data={chartData} /> : <p>Loading...</p>}
          </div>

          {/* Pie Chart */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-[#283593] mb-3">Total Collectors</h2>
            {pieData ? <Pie data={pieData} /> : <p>Loading...</p>}
          </div>

          {/* Line Chart */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-[#283593] mb-3">Total Remaining Payments</h2>
            {lineData ? <Line data={lineData} /> : <p>Loading...</p>}
          </div>
        </div>
    
    </div>

    // <div className="w-full max-w-2xl mx-auto bg-white p-4 rounded-lg shadow">
    //   <h2 className="text-xl font-semibold text-center mb-4">Monthly Orders</h2>
      
    //   {/* Bar Chart */}
    //   {chartData ? <Bar data={chartData} /> : <p>Loading...</p>}

    //   <h2 className="text-xl font-semibold text-center mb-4 mt-8">Orders by City</h2>
      
    //   {/* Pie Chart */}
    //   {pieData ? <Pie data={pieData} /> : <p>Loading...</p>}

    //   <h2 className="text-xl font-semibold text-center mb-4 mt-8">Monthly Users</h2>
      
    //   {/* Line Chart for Users */}
    //   {lineData ? <Line data={lineData} /> : <p>Loading...</p>}
    // </div>
  );
};

export default withAuth(OrdersChart);
