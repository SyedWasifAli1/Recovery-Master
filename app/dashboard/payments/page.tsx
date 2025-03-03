"use client";

import { useEffect, useState } from "react";
import { firestore } from "../../lib/firebase-config";
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import withAuth from "@/app/lib/withauth";
import * as XLSX from "xlsx";

// ✅ Interface for Payment
interface Payment {
  id: string;
  amount: number;
  customerName: string;
  collectorName: string;
  paymentDate: string;
}

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

          return {
            id: paymentDoc.id,
            amount: payment.amount,
            customerName: payment.customerName,
            collectorName,
            paymentDate: new Date(payment.paymentDate.seconds * 1000).toISOString().split("T")[0], // YYYY-MM-DD
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
    const isCollectorMatch =
      searchCollector === "" || payment.collectorName.toLowerCase().includes(searchCollector.toLowerCase());

    const isDateInRange =
      (fromDate === "" || payment.paymentDate >= fromDate) && (toDate === "" || payment.paymentDate <= toDate);

    return isCollectorMatch && isDateInRange;
  });

  // ✅ Calculate total amount of filtered payments
  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);

  // ✅ Convert to Excel Function
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredPayments);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");

    XLSX.writeFile(workbook, "Payments.xlsx");
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">All Payments</h1>

      {/* ✅ Filter Inputs */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Search Collector</label>
          <input
            type="text"
            placeholder="Enter Collector Name"
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

      {/* ✅ Total Amount Display */}
      <div className="text-lg font-semibold mb-2">
        Total Amount: <span className="text-blue-600">PKR {totalAmount.toLocaleString()}</span>
      </div>

      {/* ✅ Convert to Excel Button */}
      <button
        onClick={exportToExcel}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
      >
        Convert to Excel
      </button>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="overflow-x-auto border border-gray-300 rounded-lg">
          <div className="max-h-[330px] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-500 text-white">
                  <th className="p-3 border">Collector Name</th>
                  <th className="p-3 border">Customer Name</th>
                  <th className="p-3 border">Amount (PKR)</th>
                  <th className="p-3 border">Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="bg-gray-100 border">
                      <td className="p-3 border">{payment.collectorName}</td>
                      <td className="p-3 border">{payment.customerName}</td>
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
