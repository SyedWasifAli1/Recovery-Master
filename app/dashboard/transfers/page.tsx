"use client";

import React, { useState, useEffect } from "react";
import { firestore } from "../../lib/firebase-config";
import { collection, query, orderBy, doc, getDoc, onSnapshot } from "firebase/firestore";
import withAuth from "@/app/lib/withauth";
import { Timestamp } from "firebase/firestore"; // Import Timestamp for type

interface Transfer {
  amount: number;
  recipient_name: string;
  transfer_date: string;
  collectorId: string;
  collector_name?: string;
}

// ✅ Firestore timestamp ko format karne ka function
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

const TransfersListPage = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const transfersQuery = query(collection(firestore, "transfers"), orderBy("transfer_date", "desc"));

    // ✅ Realtime updates using `onSnapshot`
    const unsubscribe = onSnapshot(transfersQuery, async (snapshot) => {
      let transfersData: Transfer[] = snapshot.docs.map((doc) => ({
        amount: doc.data().amount ?? 0,
        recipient_name: doc.data().recipient_name ?? "Unknown",
        transfer_date: formatFirestoreDate(doc.data().transfer_date),
        collectorId: doc.data().collectorId ?? "Unknown",
      }));

      // ✅ Unique collectorIds collect karo taake baar baar query na ho
      const uniqueCollectorIds = [...new Set(transfersData.map((t) => t.collectorId))];

      // ✅ Collectors ke names ek hi baar fetch karo
      const collectorsMap: Record<string, string> = {}; // Use const here since it's not reassigned
      await Promise.all(
        uniqueCollectorIds.map(async (id) => {
          if (id !== "Unknown") {
            const collectorRef = doc(firestore, "collectors", id);
            const collectorSnap = await getDoc(collectorRef);
            if (collectorSnap.exists()) {
              collectorsMap[id] = collectorSnap.data().name ?? "Unknown";
            }
          }
        })
      );

      // ✅ Transfers data mein collectors ke names inject karo
      transfersData = transfersData.map((transfer) => ({
        ...transfer,
        collector_name: collectorsMap[transfer.collectorId] ?? "Unknown",
      }));

      setTransfers(transfersData);
      setLoading(false);
    });

    return () => unsubscribe(); // ✅ Unsubscribe on unmount
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">All Transfers (Live Updates)</h1>
      {transfers.length === 0 ? (
        <p>No transfers found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-700 text-sm">
            <thead>
              <tr className="bg-gray-200 text-left font-semibold">
                <th className="border border-gray-700 px-4 py-2">Amount</th>
                <th className="border border-gray-700 px-4 py-2">Recipient</th>
                <th className="border border-gray-700 px-4 py-2">Collector Name</th>
                <th className="border border-gray-700 px-4 py-2">Transfer Date</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer, index) => (
                <tr key={index} className="border-b border-gray-400">
                  <td className="border border-gray-700 px-4 py-2">{transfer.amount}</td>
                  <td className="border border-gray-700 px-4 py-2">{transfer.recipient_name}</td>
                  <td className="border border-gray-700 px-4 py-2">{transfer.collector_name}</td>
                  <td className="border border-gray-700 px-4 py-2">{transfer.transfer_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default withAuth(TransfersListPage);
