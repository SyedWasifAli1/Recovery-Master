"use client";

import React, { useState, useEffect } from "react";
import { firestore } from "../../lib/firebase-config";
import { collection, query, orderBy, doc, getDoc, onSnapshot } from "firebase/firestore";
import withAuth from "@/app/lib/withauth";
import { Timestamp } from "firebase/firestore";
import * as XLSX from "xlsx";
import Image from "next/image";
import { FiDownload, FiImage } from 'react-icons/fi';

interface Transfer {
  amount: number;
  recipient_name: string;
  transfer_date: string;
  transfer_date_filter: string;
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
const TransfersListPage = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCollector, setSearchCollector] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [paymentType, setPaymentType] = useState<"all" | "internal" | "external">("all"); // Add payment type filter
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // State for selected image
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  useEffect(() => {
    const transfersQuery = query(collection(firestore, "transfers"), orderBy("transfer_date", "desc"));

    const unsubscribe = onSnapshot(transfersQuery, async (snapshot) => {
      let transfersData: Transfer[] = snapshot.docs.map((doc) => ({
        amount: doc.data().amount ?? 0,
        recipient_name: doc.data().recipient_name ?? "Unknown",
        transfer_date: formatFirestoreDate(doc.data().transfer_date),
        transfer_date_filter: formatFirestoreDatefilter(doc.data().transfer_date),
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
      (fromDate === "" || transfer.transfer_date_filter >= fromDate) && (toDate === "" || transfer.transfer_date_filter <= toDate);
    const isPaymentTypeMatch =
      paymentType === "all" || transfer.payment_type === paymentType; // Filter by payment type
    return isCollectorMatch && isDateInRange && isPaymentTypeMatch;
  });

  const exportToExcel = () => {
    // Prepare the data for the Excel file
    const data = filteredTransfers.map((transfer) => ({
      "Transfer Date": transfer.transfer_date,
      "Collector Name": transfer.collector_name,
      "Payment Type": transfer.payment_type,
      "Transaction Narration": transfer.recipient_name,
      "Amount": transfer.amount,
    }));
  
    // Create a worksheet from the data
    const worksheet = XLSX.utils.json_to_sheet(data);
  
    // Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transfers");
  
    // Write the workbook to a file and trigger the download
    XLSX.writeFile(workbook, "Transfers.xlsx");
  };
  // Function to open modal with selected image
  const openModal = (imageBytes: Uint8Array) => {
    const imageUrl = `data:image/png;base64,${imageBytes}`;
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  // Function to close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">All Transfers (Live Updates)</h1>
      <div className="grid grid-cols-5 gap-4 mb-4"> {/* Changed to 5 columns to accommodate the button */}
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
  <div className="flex items-end"> {/* Added for the Download button */}
  <button
  onClick={exportToExcel}
  className="bg-blue-500 text-white px-4 py-2 rounded w-full flex items-center justify-center"
>
  <FiDownload className="w-5 h-5 mr-2" /> {/* Add margin for spacing */}
  Download {/* Optional text */}
</button>
  </div>
</div>
      {filteredTransfers.length === 0 ? (
        <p>No transfers found.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-300 rounded-lg max-h-[250px] overflow-y-auto">
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr className="bg-gray-500 text-white">
                <th className="p-3 border">Transfer Date</th>
                <th className="p-3 border">Collector Name</th>
                <th className="p-3 border">Payment Type</th>
                <th className="p-3 border">Transacation Narration</th>
                <th className="p-3 border">Amount</th>
                <th className="p-3 border">Image</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.map((transfer, index) => (
                <tr key={index} className="bg-gray-100 border">
                  <td className="p-3 border">{transfer.transfer_date}</td>
                  <td className="p-3 border">{transfer.collector_name}</td>
                  <td className="p-3 border">{transfer.payment_type}</td>
                  <td className="p-3 border">{transfer.recipient_name}</td>
                  <td className="p-3 border">{transfer.amount}</td>
                  <td className="p-3 border">
                    {transfer.image_bytes ? (
                      <div
                        onClick={() => openModal(transfer.image_bytes!)}
                        className="cursor-pointer"
                      >
                        <Image
                         src={`data:image/png;base64,${transfer.image_bytes}`}
                          alt={`Thumbnail of ${transfer.payment_type}`}
                          width={64}
                          height={64}
                          className="object-cover rounded"
                        />
                      </div>
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

      {/* Modal for displaying larger image */}
      {isModalOpen && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Image Preview</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <Image
              src={selectedImage}
              alt="Enlarged Receipt"
              width={800}
              height={800}
              className="object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(TransfersListPage);
