"use client";

import React, { useState, useEffect } from "react";
import { firestore } from "../../lib/firebase-config";
import { collection, query, orderBy, doc, getDoc, onSnapshot } from "firebase/firestore";
import withAuth from "@/app/lib/withauth";
import { Timestamp } from "firebase/firestore";
import * as XLSX from "xlsx";
import Image from "next/image";
import { FiImage } from 'react-icons/fi'; 
interface Transfer {
  amount: number;
  recipient_name: string;
  transfer_date: string;
  collectorId: string;
  collector_name?: string;
  image_bytes?: Uint8Array; // Change to Uint8Array for byte data
  payment_type?: string; // Add payment_type field
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

const TransfersListPage = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCollector, setSearchCollector] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [paymentType, setPaymentType] = useState<"all" | "internal" | "external">("all"); // Add payment type filter

  useEffect(() => {
    const transfersQuery = query(collection(firestore, "transfers"), orderBy("transfer_date", "desc"));

    const unsubscribe = onSnapshot(transfersQuery, async (snapshot) => {
      let transfersData: Transfer[] = snapshot.docs.map((doc) => ({
        amount: doc.data().amount ?? 0,
        recipient_name: doc.data().recipient_name ?? "Unknown",
        transfer_date: formatFirestoreDate(doc.data().transfer_date),
        collectorId: doc.data().collectorId ?? "Unknown",
        image_bytes: doc.data().image_bytes, // Fetch image_bytes
        payment_type: doc.data().payment_type, // Fetch payment_type
      }));

      const uniqueCollectorIds = [...new Set(transfersData.map((t) => t.collectorId))];
      const collectorsMap: Record<string, string> = {};
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

      transfersData = transfersData.map((transfer) => ({
        ...transfer,
        collector_name: collectorsMap[transfer.collectorId] ?? "Unknown",
      }));

      setTransfers(transfersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredTransfers = transfers.filter((transfer) => {
    const isCollectorMatch =
      searchCollector === "" || transfer.collector_name?.toLowerCase().includes(searchCollector.toLowerCase());
    const isDateInRange =
      (fromDate === "" || transfer.transfer_date >= fromDate) && (toDate === "" || transfer.transfer_date <= toDate);
    const isPaymentTypeMatch =
      paymentType === "all" || transfer.payment_type === paymentType; // Filter by payment type
    return isCollectorMatch && isDateInRange && isPaymentTypeMatch;
  });

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredTransfers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transfers");
    XLSX.writeFile(workbook, "Transfers.xlsx");
  };


  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">All Transfers (Live Updates)</h1>
      <div className="grid grid-cols-4 gap-4 mb-4">
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
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Payment Type</label>
          <select
            className="p-2 border rounded"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value as "all" | "internal" | "external")}
          >
            <option value="all">All</option>
            <option value="Internal">Internal</option>
            <option value="External">External</option>
          </select>
        </div>
      </div>
      <button onClick={exportToExcel} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
        Download
      </button>
      {filteredTransfers.length === 0 ? (
        <p>No transfers found.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-300 rounded-lg max-h-[250px] overflow-y-auto">
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr className="bg-gray-500 text-white">
                <th className="p-3 border">Amount</th>
                <th className="p-3 border">Recipient</th>
                <th className="p-3 border">Collector Name</th>
                <th className="p-3 border">Transfer Date</th>
                <th className="p-3 border">Payment Type</th>
                <th className="p-3 border">Image</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.map((transfer, index) => (
                <tr key={index} className="bg-gray-100 border">
                  <td className="p-3 border">{transfer.amount}</td>
                  <td className="p-3 border">{transfer.recipient_name}</td>
                  <td className="p-3 border">{transfer.collector_name}</td>
                  <td className="p-3 border">{transfer.transfer_date}</td>
                  <td className="p-3 border">{transfer.payment_type}</td>
                  <td className="p-3 border">
                    {transfer.image_bytes ? (
                      // <img
                      //   src={`data:image/png;base64,${transfer.image_bytes}`} // Convert bytes to image URL
                      //   alt="Transfer Receipt"
                      //   className="w-16 h-16 object-cover rounded"
                      // />
                      <Image
                      src={`data:image/png;base64,${transfer.image_bytes}`}
                      alt={`Thumbnail of ${transfer.payment_type}`}
                      width={64}
                      height={64}
                      className="object-cover rounded"
                    />
                    ) : (
                      <FiImage className="w-16 h-16 text-gray-400" /> 
                    )}
                  </td>
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