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
"use client"

import { useEffect, useState } from "react"
import { firestore } from "../lib/firebase-config"
import { collection, getDocs } from "firebase/firestore"
import { Bar, Pie } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js"
import withAuth from "../lib/withauth"
import {  FiLogOut,  FiUsers, FiMapPin } from "react-icons/fi"
import { signOut } from "firebase/auth"
import { auth } from '../lib/firebase-config'
import router from "next/router"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

// Define the type for the chart data
interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string | string[]
    borderColor: string
    borderWidth: number
  }[]
}

const Dashboard = () => {
  const [customersData, setCustomersData] = useState<ChartData | null>(null)
  const [collectorsData, setCollectorsData] = useState<ChartData | null>(null)
  const [totalCustomers, setTotalCustomers] = useState<number>(0)
  const [totalCollectors, setTotalCollectors] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
 const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user from Firebases
      alert('You have been logged out!');
      router.push('/'); // Redirect to login page (or wherever you want to redirect the user)
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch Customers Data
        const customersSnapshot = await getDocs(collection(firestore, "customers"))
        const customersMonthlyData: { [key: string]: number } = {}
        let totalCustomersCount = 0

        customersSnapshot.docs.forEach((customerDoc) => {
          const { createDate } = customerDoc.data()
          if (createDate && createDate.toDate) {
            const date = createDate.toDate()
            const month = date.toLocaleString("en-US", { month: "short" })
            if (!customersMonthlyData[month]) customersMonthlyData[month] = 0
            customersMonthlyData[month] += 1
            totalCustomersCount += 1
          }
        })

        // Sort months chronologically
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const sortedMonths = Object.keys(customersMonthlyData).sort((a, b) => months.indexOf(a) - months.indexOf(b))

        setCustomersData({
          labels: sortedMonths,
          datasets: [
            {
              label: "Monthly Customers",
              data: sortedMonths.map((month) => customersMonthlyData[month]),
              backgroundColor: "rgba(59, 130, 246, 0.7)",
              borderColor: "rgba(59, 130, 246, 1)",
              borderWidth: 1,
            },
          ],
        })
        setTotalCustomers(totalCustomersCount)

        // Fetch Collectors Data
        const collectorsSnapshot = await getDocs(collection(firestore, "collectors"))
        const collectorsCityData: { [key: string]: number } = {}
        let totalCollectorsCount = 0

        collectorsSnapshot.docs.forEach((collectorDoc) => {
          const { completeAddress } = collectorDoc.data()
          if (completeAddress) {
            if (!collectorsCityData[completeAddress]) collectorsCityData[completeAddress] = 0
            collectorsCityData[completeAddress] += 1
            totalCollectorsCount += 1
          }
        })

        setCollectorsData({
          labels: Object.keys(collectorsCityData),
          datasets: [
            {
              label: "Collectors by City",
              data: Object.values(collectorsCityData),
              backgroundColor: [
                "rgba(239, 68, 68, 0.7)",
                "rgba(59, 130, 246, 0.7)",
                "rgba(234, 179, 8, 0.7)",
                "rgba(16, 185, 129, 0.7)",
                "rgba(139, 92, 246, 0.7)",
              ],
              borderColor: "rgba(255, 255, 255, 0.8)",
              borderWidth: 2,
            },
          ],
        })
        setTotalCollectors(totalCollectorsCount)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen p-6 md:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-[#8A56E8]">Dashboard Overview</h1>
            <div className="flex items-center space-x-4">
              {/* <button className="p-2 rounded-full hover:bg-gray-100">
                <FiHome className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <FiPackage className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <FiMenu className="h-5 w-5 text-gray-600" />
              </button> */}
               
              <button     onClick={handleLogout}
              className="p-2 rounded-full hover:bg-gray-100">
                <FiLogOut className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
          <p className="text-gray-600">Monitor your customers and collectors at a glance</p>
        </header>

        {/* Totals Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <FiUsers className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Total Customers</h2>
            </div>
            {isLoading ? (
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="flex items-baseline">
                <p className="text-3xl font-bold text-blue-600">{totalCustomers}</p>
                <p className="ml-2 text-sm text-gray-500">registered users</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-100 rounded-lg mr-4">
                <FiMapPin className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Total Collectors</h2>
            </div>
            {isLoading ? (
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="flex items-baseline">
                <p className="text-3xl font-bold text-red-600">{totalCollectors}</p>
                <p className="ml-2 text-sm text-gray-500">active collectors</p>
              </div>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart for Customers */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Monthly Customers</h2>
            {isLoading ? (
              <div className="h-64 w-full bg-gray-100 animate-pulse rounded flex items-center justify-center">
                <p className="text-gray-400">Loading chart data...</p>
              </div>
            ) : customersData ? (
              <div className="h-64">
                <Bar
                  data={customersData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                      tooltip: {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        padding: 12,
                        titleFont: {
                          size: 14,
                        },
                        bodyFont: {
                          size: 13,
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0,
                        },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">No customer data available</p>
            )}
          </div>

          {/* Pie Chart for Collectors */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Collectors by City</h2>
            {isLoading ? (
              <div className="h-64 w-full bg-gray-100 animate-pulse rounded flex items-center justify-center">
                <p className="text-gray-400">Loading chart data...</p>
              </div>
            ) : collectorsData ? (
              <div className="h-64">
                <Pie
                  data={collectorsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "right",
                        labels: {
                          boxWidth: 15,
                          padding: 15,
                        },
                      },
                      tooltip: {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        padding: 12,
                        titleFont: {
                          size: 14,
                        },
                        bodyFont: {
                          size: 13,
                        },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">No collector data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(Dashboard)

