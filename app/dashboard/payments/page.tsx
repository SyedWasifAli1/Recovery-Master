"use client";

import { useEffect, useState } from "react";
import { firestore } from "../../lib/firebase-config";
import { collection, query, orderBy, onSnapshot, doc, getDoc, Timestamp } from "firebase/firestore";
import withAuth from "@/app/lib/withauth";
import * as XLSX from "xlsx";

// ✅ Interface for Payment
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
const formatFirestoreDate = (timestamp: Timestamp | Date | undefined): string => {
  if (!timestamp) return "Unknown";
  const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
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

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCollector, setSearchCollector] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    // ✅ Query payments in descending order
    const paymentsQuery = query(collection(firestore, "payments"), orderBy("paymentDate", "desc"));

    // ✅ Real-time listener
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
            remainingAmount:payment.remainingamount,
            totalAmount:payment.totalamount,
            customerName: customerName,
            BusinessName: BusinessName,

            collectorName,
            paymentDatefilter:formatFirestoreDatefilter(payment.paymentDate),
            // paymentDatefilter: new Date(payment.paymentDate.seconds * 1000).toISOString().split("T")[0],
             // YYYY-MM-DD
             paymentDate:formatFirestoreDate(payment.paymentDate)
          };
        })
      );

      setPayments(paymentsData);
      setLoading(false);
    });

    return () => unsubscribe(); // ✅ Cleanup on unmount
  }, []);

  // ✅ Filter payments based on search criteria (Collector + Date Range)
  const filteredPayments = payments.filter((payment) => {
    // const isCollectorMatch =
    //   searchCollector === "" || payment.collectorName.toLowerCase().includes(searchCollector.toLowerCase());
    const isCollectorMatch =
    searchCollector === "" || 
    payment.collectorName.toLowerCase().includes(searchCollector.toLowerCase()) ||
    payment.customerName.toLowerCase().includes(searchCollector.toLowerCase());


    const isDateInRange =
      (fromDate === "" || payment.paymentDatefilter >= fromDate) && (toDate === "" || payment.paymentDatefilter <= toDate);

    return isCollectorMatch && isDateInRange;
  });

  // ✅ Calculate total amount of filtered payments
  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.totalAmount, 0);
  const balance = filteredPayments.reduce((sum, payment) => sum + payment.remainingAmount, 0);
  const collected = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);

  const exportToExcel = () => {
    if (filteredPayments.length === 0) {
      alert("No data available to export!");
      return;
    }
     // Prepare the data for the Excel file
     const data = filteredPayments.map((payment) => ({
       "Collector Name": payment.collectorName,
       "Customer Name": payment.customerName,
       "Total Amount": payment.totalAmount,
       "Balance": payment.remainingAmount,
       "Collected": payment.amount,
       "Payment Date": payment.paymentDate,
     }));
   
     // Create a worksheet from the data
     const worksheet = XLSX.utils.json_to_sheet(data);
   
     // Create a workbook and add the worksheet
     const workbook = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
   
     // Write the workbook to a file and trigger the download
     XLSX.writeFile(workbook, "Payments.xlsx");
   };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">All Payments</h1>

      {/* ✅ Filter Inputs */}
      <div className="grid grid-cols-4 gap-4 mb-4">
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
        <div className="flex flex-end">
        <button
        onClick={exportToExcel}
        className="mt-6 px-4 py-2 bg-green-500 text-white w-full flex items-center justify-center rounded hover:bg-green-600 transition"
        // className="bg-blue-500 text-white px-4 py-2 rounded w-full flex items-center justify-center"
      >
        Download
      </button>
        </div>
      </div>

      {/* ✅ Total Amount Display */}
      <div className="flex flex-wrap items-center gap-4 text-lg font-semibold mb-2">
  <div>
    Total Amount: <span className="text-blue-600">PKR {totalAmount.toLocaleString()}</span>
  </div>
  <div>
    Collected: <span className="text-blue-600">PKR {collected.toLocaleString()}</span>
  </div>
  <div>
    Balance: <span className="text-blue-600">PKR {balance.toLocaleString()}</span>
  </div>
</div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="overflow-x-auto border border-gray-300 rounded-lg">
          <div className="max-h-[250px] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-500 text-white">
                  <th className="p-3 border">Collector Name</th>
                  <th className="p-3 border">Customer Name</th>
                  <th className="p-3 border">Business Name</th>
                  <th className="p-3 border">Total Amount</th>
                  <th className="p-3 border">Balance </th>
                  <th className="p-3 border">Collected </th>
                  <th className="p-3 border">Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="bg-gray-100 border">
                      <td className="p-3 border">{payment.collectorName}</td>
                      <td className="p-3 border">{payment.customerName}</td>
                      <td className="p-3 border">{payment.BusinessName}</td>
                      <td className="p-3 border">{payment.totalAmount}</td>
                      <td className="p-3 border">{payment.remainingAmount}</td>
                      <td className="p-3 border">{payment.amount.toLocaleString()}</td>
                      <td className="p-3 border">{payment.paymentDate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center p-4">
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(Payments);
