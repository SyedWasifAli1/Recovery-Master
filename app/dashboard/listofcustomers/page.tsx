"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, Timestamp, query, where, getDoc,doc} from "firebase/firestore";
import { firestore } from "../../lib/firebase-config";
import withAuth from "@/app/lib/withauth";
import crypto from "crypto";
import Loader from "@/components/loader";
interface Customer {
  customerId: string;
  name: string;
  username: string;
  contactNumber: string;
  completeAddress: string;
  createDate: string;
  status: string;
  diffInMonths: number;
  selectedPackage: string;
  area: string; // Add area
  category: string; // Add category
  city: string; // Add city
  discount: number; // Add discount
  device: number; // Add discount
  finalPrice: number; // Add finalPrice
  // lastpay: string; // Add lastpay (as string or Timestamp, depending on your use case)
  selectedCollector: string; // Add selectedCollector
  collectorName: string; // Add selectedCollector
}
interface Payment {
  id: string;
  amount: number;
  customerName: string;
  collectorName: string;
  paymentDate: string;
}

function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null >(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [errorPayments, setErrorPayments] = useState<string | null>(null);
  const [packagePrice, setPackagePrice] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [totalPaymentsAmount, setTotalPaymentsAmount] = useState<number>(0);
  const [diffInMonths, setDiffInMonths] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true); 
  const [searchCollector, setSearchCollector] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const formatFirestoreDate = (timestamp: Timestamp | string | undefined): string => {
    if (!timestamp) return "Unknown";

    let date: Date;

    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (typeof timestamp === "string") {
      date = new Date(timestamp);
    } else {
      return "Unknown";
    }

    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Karachi",
    }).format(date);
  };

  const generateNumericHash = (id:string) => {
    const hash = crypto.createHash("sha256").update(id).digest("hex");
    return parseInt(hash.substring(0,10), 16) % 1000000; // ✅ Same modulo logic as Dart
  };
  
  const filteredCustomers = customers.filter((customer) => {
    // const isCollectorMatch =
    //   searchCollector === "" || payment.collectorName.toLowerCase().includes(searchCollector.toLowerCase());
    const isCollectorMatch =
    searchCollector === "" || 
    customer.collectorName.toLowerCase().includes(searchCollector.toLowerCase()) ||
    customer.name.toLowerCase().includes(searchCollector.toLowerCase());


    const isDateInRange =
      (fromDate === "" || customer.createDate >= fromDate) && (toDate === "" || customer.createDate <= toDate);

    return isCollectorMatch && isDateInRange;
  });
  const fetchCustomers = async (): Promise<void> => {
    setLoading(true);
    try {
      const customerSnapshot = await getDocs(collection(firestore, "customers"));
      const customersData: Customer[] = await Promise.all(
        customerSnapshot.docs.map(async (customerDoc) => {
          const data = customerDoc.data() as Omit<Customer, "customerId"> & {
            createDate?: Timestamp | string;
            lastpay?: Timestamp | string;
            selectedCollector?: string; // Assuming collectorId is stored in the customer document
          };
  
          // Format the createDate
          const createDate = formatFirestoreDate(data.createDate);
  
          // Calculate the status based on lastPay
          let status = "Unknown"; // Default status
          let diffInMonths = 0;
          if (data.lastpay) {
            // Check if lastPay exists
            const lastPayDate =
              data.lastpay instanceof Timestamp
                ? data.lastpay.toDate()
                : new Date(data.lastpay);
            const currentDate = new Date();
  
            // Calculate the difference in months
            diffInMonths =
              (currentDate.getFullYear() - lastPayDate.getFullYear()) * 12 +
              (currentDate.getMonth() - lastPayDate.getMonth());
            console.log("monthsDifference:", diffInMonths);
            if (diffInMonths > 1) {
              status = "Defaulter";
            } else if (diffInMonths === 1) {
              status = "Unactive";
            } else {
              status = "Active";
            }
          } else {
            console.warn(`Customer ${customerDoc.id} has no lastPay field.`); // Log a warning if lastPay is missing
          }
  
          // Fetch collector's name if collectorId exists
          let collectorName = "Unknown";
      
          if (data.selectedCollector) {
            const collectorDocRef = doc(firestore, "collectors", data.selectedCollector); // Create a reference to the collector document
            const collectorDoc = await getDoc(collectorDocRef); // Fetch the collector document
            if (collectorDoc.exists()) {
              const collectorData = collectorDoc.data() as { name: string }; // Explicitly type the data
              collectorName = collectorData.name; // Get the collector's name
            } else {
              console.warn(`Collector with ID ${data.selectedCollector} not found.`);
            }
          }
  
          return {
            customerId: customerDoc.id,
            ...data,
            createDate,
            status, // Add the status field
            diffInMonths,
            collectorName, // Add the collector's name
          };
        })
      );
  
      setCustomers(customersData);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleViewPayments = async (customerId: string, selectedPackage: string, diffInMonths: number) => {
    setSelectedCustomerId(customerId);
    setIsModalOpen(true);
    setLoadingPayments(true);
    setErrorPayments(null);
  
    try {
      // Fetch package price
      const packageDoc = await getDoc(doc(firestore, "packages", selectedPackage));
      const packagePrice = packageDoc.data()?.price || 0; // Default to 0 if price is missing
  
      // Fetch payments
      const paymentsQuery = query(collection(firestore, "payments"), where("customerId", "==", generateNumericHash(customerId)));
      const snapshot = await getDocs(paymentsQuery);
  
      // Fetch collectors
      const collectorsSnapshot = await getDocs(collection(firestore, "collectors"));
      const collectorsData: { [key: string]: string } = {};
      collectorsSnapshot.forEach((doc) => {
        collectorsData[doc.id] = doc.data().name; // Store collector name by userId
      });
  
      // Map payments data and fetch collector names
      const paymentsData: Payment[] = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const payment = doc.data();
          const collectorName = collectorsData[payment.userId] || "Unknown"; // Get collector name from collectorsData
  
          return {
            id: doc.id,
            amount: payment.amount as number,
            customerName: payment.customerName as string,
            collectorName, // Set collector name
            paymentDate: new Date(payment.paymentDate.seconds * 1000).toISOString().split("T")[0],
          };
        })
      );
  
      // Calculate total amount of payments
      const totalPaymentsAmount = paymentsData.reduce((sum, payment) => sum + payment.amount, 0);
  
      // Calculate total amount (packagePrice * diffInMonths)
      const totalAmount = packagePrice * diffInMonths;
  
      // Set state
      setPayments(paymentsData);
      setPackagePrice(packagePrice); // Store package price
      setTotalAmount(totalAmount); // Store total amount
      setTotalPaymentsAmount(totalPaymentsAmount); // Store total payments amount
      setDiffInMonths(diffInMonths); // Store diffInMonths
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorPayments(error.message);
      } else {
        setErrorPayments("An unknown error occurred.");
      }
    } finally {
      setLoadingPayments(false);
    }
  };
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
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Search Collector/Customer</label>
          <input
            type="text"
            placeholder="Enter Collector/Customer Name"
            className="p-2 border rounded"
            value={searchCollector}
            onChange={(e) => setSearchCollector(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">From Date</label>
          <input
            type="date"
            className="p-2 border rounded"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">To Date</label>
          <input
            type="date"
            className="p-2 border rounded"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>
      {loading ? ( // Show loader while fetching
      <Loader />
    ) : customers.length === 0 ? ( // Show message if no customers
      <p className="text-center text-gray-500">No customers found.</p>
    ) : (

        <div>
          <div className="mb-4 flex items-center">
            <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="mr-2" />
            <button onClick={handleDeleteSelected} className="bg-red-500 text-white px-4 py-2 rounded">
              Delete Selected
            </button>
          </div>
          <div className="overflow-x-auto max-h-[400px]">
  <div className="inline-block min-w-full">
  <table className="table-auto w-full border-collapse border border-gray-700 text-sm">
  <thead>
    <tr className="bg-red-500 text-white text-left">
      <th className="border border-gray-700 px-4 py-2">
        <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
      </th>
      <th className="border border-gray-700 px-4 py-2">Customer Name</th>
      <th className="border border-gray-700 px-4 py-2">Username</th>
      <th className="border border-gray-700 px-4 py-2">Contact</th>
      <th className="border border-gray-700 px-4 py-2">Address</th>
      <th className="border border-gray-700 px-4 py-2">Area</th>
      <th className="border border-gray-700 px-4 py-2">Category</th>
      <th className="border border-gray-700 px-4 py-2">City</th>
      <th className="border border-gray-700 px-4 py-2">Number Of Device</th>
      <th className="border border-gray-700 px-4 py-2">Created Date</th>
      <th className="border border-gray-700 px-4 py-2">Discount</th>
      <th className="border border-gray-700 px-4 py-2">Final Price</th>
      <th className="border border-gray-700 px-4 py-2">Collector Name</th>
      <th className="border border-gray-700 px-4 py-2">Status</th>
      <th className="border border-gray-700 px-4 py-2">Actions</th>
    </tr>
  </thead>
  <tbody>
    {filteredCustomers.map((customer) => (
      <tr key={customer.customerId} className="hover:bg-gray-100">
        <td className="border border-gray-700 px-4 py-2">
          <input
            type="checkbox"
            checked={selectedCustomers.has(customer.customerId)}
            onChange={() => handleCheckboxChange(customer.customerId)}
          />
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.name}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.username}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.contactNumber}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.completeAddress}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.area}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.category}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.city}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.device}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.createDate}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.discount}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.finalPrice}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.collectorName}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          <span
            className={`px-2 py-1 rounded-sm text-white ${
              customer.status === "Active"
                ? "bg-green-500"
                : customer.status === "Unactive"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          >
            {customer.status}
          </span>
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          <button
            onClick={() => handleDelete(customer.customerId)}
            className="bg-red-500 text-white px-4 py-2 rounded mr-2"
          >
            Delete
          </button>
          <button
            onClick={() => handleViewPayments(customer.customerId, customer.selectedPackage, customer.diffInMonths)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            View Payments
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
  </div>
</div>

          {/* Modal for Payments */}
          {isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg w-1/2 max-h-[80vh] overflow-y-auto relative">
      {/* Close Button (Top Right) */}
      <button
        onClick={() => setIsModalOpen(false)}
        className="absolute top-2 right-2  text-black px-3 py-1"
      >
        ×
      </button>

      <h2 className="text-xl font-bold mb-4">
  Payments for Customer ID: {selectedCustomerId ? generateNumericHash(selectedCustomerId) : "N/A"}
</h2>
      {/* Status Alert */}
      {diffInMonths === 0 && (
        <div className="bg-green-500 text-white px-4 py-2 rounded mb-4">
          Status: Active
        </div>
      )}
      {diffInMonths === 1 && (
        <div className="bg-yellow-500 text-white px-4 py-2 rounded mb-4">
          Status: Unactive <hr />
          {packagePrice} x {diffInMonths} = {totalAmount}
        </div>
      )}
      {diffInMonths > 1 && (
        <div className="bg-red-500 text-white px-4 py-2 rounded mb-4">
          Status: Defaulter <hr />
          {packagePrice} x {diffInMonths} = {packagePrice * diffInMonths}
        </div>
      )}

      {/* Total Amount */}
      {totalPaymentsAmount > 0 && (
        <div className="text-lg font-semibold mb-4">
          Total Amount: PKR {totalPaymentsAmount.toLocaleString()}
        </div>
      )}

      {/* Payments Table */}
      {loadingPayments ? (
        <p>Loading payments...</p>
      ) : errorPayments ? (
        <p>Error: {errorPayments}</p>
      ) : (
        <div className="overflow-x-auto">
          {payments.length > 0 ? (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2">Amount</th>
                  <th className="border border-gray-300 px-4 py-2">Customer Name</th>
                  <th className="border border-gray-300 px-4 py-2">Collector Name</th>
                  <th className="border border-gray-300 px-4 py-2">Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-2">{payment.amount}</td>
                    <td className="border border-gray-300 px-4 py-2">{payment.customerName}</td>
                    <td className="border border-gray-300 px-4 py-2">{payment.collectorName}</td>
                    <td className="border border-gray-300 px-4 py-2">{payment.paymentDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500">No payments found.</p>
          )}
        </div>
      )}
    </div>
  </div>
)}
        </div>
      )}
    </div>
  );
}

export default withAuth(Customers);

