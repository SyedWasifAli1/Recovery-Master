"use client"

import { useEffect, useState } from "react"
import { firestore } from "../lib/firebase-config"
import { collection, getDocs, query, orderBy, onSnapshot, doc, getDoc, Timestamp } from "firebase/firestore"
import { Bar, Pie } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js"
import withAuth from "../lib/withauth"
import {  FiLogOut,  FiUsers, FiMapPin, FiDollarSign } from "react-icons/fi"
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

// Interface for Payment
interface Payment {
  id: string;
  amount: number;
  remainingAmount: number;
  totalAmount: number;
  customerName: string;
  collectorName: string;
  BusinessName:string;
  paymentDate: string;
  paymentDatefilter: string;
}

const Dashboard = () => {
  const [customersData, setCustomersData] = useState<ChartData | null>(null)
  const [collectorsData, setCollectorsData] = useState<ChartData | null>(null)
  const [totalCustomers, setTotalCustomers] = useState<number>(0)
  const [totalCollectors, setTotalCollectors] = useState<number>(0)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [payments, setPayments] = useState<Payment[]>([])
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [balance, setBalance] = useState<number>(0)
  const [collected, setCollected] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('You have been logged out!');
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  const formatFirestoreDatefilter = (timestamp: Timestamp | Date | undefined): string => {
    if (!timestamp) return "Unknown";
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Karachi",
    }).format(date);
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

        // Fetch Payments Data
        const paymentsQuery = query(collection(firestore, "payments"), orderBy("paymentDate", "desc"));
        const unsubscribe = onSnapshot(paymentsQuery, async (snapshot) => {
          const paymentsData: Payment[] = await Promise.all(
            snapshot.docs.map(async (paymentDoc) => {
              const payment = paymentDoc.data();

              let collectorName = "Unknown";
              if (payment.userId) {
                const collectorDocRef = doc(firestore, "collectors", payment.userId);
                const collectorDocSnap = await getDoc(collectorDocRef);

                if (collectorDocSnap.exists()) {
                  collectorName = collectorDocSnap.data().name || "Unknown";
                }
              }
              
              let customerName = "Unknown";
              let BusinessName = "Unknown";
              if (payment.userId) {
                const collectorDocRef = doc(firestore, "customers", payment.customerId);
                const collectorDocSnap = await getDoc(collectorDocRef);

                if (collectorDocSnap.exists()) {
                  customerName = collectorDocSnap.data().name || "Unknown";
                  BusinessName = collectorDocSnap.data().username || "Unknown";
                }
              }

              return {
                id: paymentDoc.id,
                amount: payment.amount,
                remainingAmount: payment.remainingamount,
                totalAmount: payment.totalamount,
                customerName: customerName,
                BusinessName: BusinessName,
                collectorName,
                paymentDatefilter: formatFirestoreDatefilter(payment.paymentDate),
                paymentDate: formatFirestoreDatefilter(payment.paymentDate)
              };
            })
          );

          setPayments(paymentsData);
          
          // Calculate totals
          const total = paymentsData.reduce((sum, payment) => sum + payment.totalAmount, 0);
          const bal = paymentsData.reduce((sum, payment) => sum + payment.remainingAmount, 0);
          const coll = paymentsData.reduce((sum, payment) => sum + payment.amount, 0);
          
          setTotalAmount(total);
          setBalance(bal);
          setCollected(coll);
        });

        return () => unsubscribe();
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
              <button onClick={handleLogout} className="p-2 rounded-full hover:bg-gray-100">
                <FiLogOut className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
          <p className="text-gray-600">Monitor your customers and collectors at a glance</p>
        </header>

        {/* Totals Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
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

          {/* Payment Stats Cards */}
        
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
         

          {/* Payment Stats Cards */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <FiDollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Total Amount</h2>
            </div>
            {isLoading ? (
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="flex items-baseline">
                <p className="text-3xl font-bold text-green-600">PKR {totalAmount.toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <FiDollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Collected</h2>
            </div>
            {isLoading ? (
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="flex items-baseline">
                <p className="text-3xl font-bold text-purple-600">PKR {collected.toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                <FiDollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Balance</h2>
            </div>
            {isLoading ? (
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="flex items-baseline">
                <p className="text-3xl font-bold text-yellow-600">PKR {balance.toLocaleString()}</p>
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