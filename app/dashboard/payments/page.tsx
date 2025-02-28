"use client";

import { useEffect, useState } from "react";
import { firestore } from "../../lib/firebase-config";
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import withAuth from "@/app/lib/withauth";

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
  const [searchDate, setSearchDate] = useState("");

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

  // ✅ Filter payments based on search criteria
  const filteredPayments = payments.filter((payment) => {
    return (
      (searchCollector === "" || payment.collectorName.toLowerCase().includes(searchCollector.toLowerCase())) &&
      (searchDate === "" || payment.paymentDate === searchDate)
    );
  });

  // ✅ Calculate total amount of filtered payments
  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">All Payments</h1>

      {/* ✅ Filter Inputs */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search Collector"
          className="p-2 border rounded w-1/2"
          value={searchCollector}
          onChange={(e) => setSearchCollector(e.target.value)}
        />
        <input
          type="date"
          className="p-2 border rounded w-1/2"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
        />
      </div>

      {/* ✅ Total Amount Display */}
      <div className="text-lg font-semibold mb-2">
        Total Amount: <span className="text-blue-600">PKR {totalAmount.toLocaleString()}</span>
      </div>

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

export default withAuth(Payments) ;
