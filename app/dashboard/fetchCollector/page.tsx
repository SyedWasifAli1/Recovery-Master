"use client";

import React, { useState, useEffect } from "react";
import { firestore } from "../../lib/firebase-config";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import withAuth from "@/app/lib/withauth";
import crypto from "crypto";
import Loader from "@/components/loader";
import * as XLSX from "xlsx";
import { FiDownload } from "react-icons/fi";

interface Collector {
  collectorId: number;
  name: string;
  email: string;
  password: string;
  contactNumber: string;
  completeAddress: string;
  totalPayments: number;
  createDate: string;
  role: string;
  uid: string;
}
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

const CollectorsListPage = () => {
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCollector, setSearchCollector] = useState("");
  const [selectedCollector, setSelectedCollector] = useState<Collector | null>(null);
const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        const snapshot = await getDocs(collection(firestore, "collectors"));
        const collectorsData: Collector[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            collectorId: generateNumericHash(doc.id),
            name: data.name || "N/A",
            email: data.email || "N/A",
            password: data.password || "N/A",
            contactNumber: data.contactNumber || "N/A",
            completeAddress: data.completeAddress || "N/A",
            totalPayments: data.totalPayments || 0,
            // createDate: data.createDate?.seconds
            //   ? new Date(data.createDate.seconds * 1000).toLocaleString("en-CA")
            //   : "Unknown",
            createDate: formatFirestoreDatefilter(data.createDate),
            role: data.role || "N/A",
            uid: data.uid || "N/A",
          };
        });
        setCollectors(collectorsData);
      } catch (error) {
        console.error("Error fetching collectors:", error);
      } finally {
        setLoading(false);
      }
    };
    // ✅ Function to Convert Firestore Document ID to a Numeric Hash
const generateNumericHash = (id:string) => {
  const hash = crypto.createHash("sha256").update(id).digest("hex");
  return parseInt(hash.substring(0,10), 16) % 1000000; // ✅ Same modulo logic as Dart
};


    fetchCollectors();
  }, []);
  const filteredCollectors = collectors.filter((collectors) => {
    const isCollectorMatch =
      searchCollector === "" || collectors.name?.toLowerCase().includes(searchCollector.toLowerCase());
    const isDateInRange =
      (fromDate === "" || collectors.createDate >= fromDate) && (toDate === "" || collectors.createDate <= toDate);
    // const isPaymentTypeMatch =
    //   paymentType === "all" || transfer.payment_type === paymentType; // Filter by payment type
    return isCollectorMatch && isDateInRange;
  });
  const exportToExcel = () => {
       // Prepare the data for the Excel file
       const data = filteredCollectors.map((Collector) => ({
         "Collector Id": Collector.uid,
         "Collector Name": Collector.name,
         "Contact Number": Collector.contactNumber,
         "Address": Collector.completeAddress,
         "In Wallet": Collector.totalPayments,
         "Email": Collector.email,
         "Password": Collector.password,
         "Created Date": Collector.createDate,
       }));
     
       // Create a worksheet from the data
       const worksheet = XLSX.utils.json_to_sheet(data);
     
       // Create a workbook and add the worksheet
       const workbook = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(workbook, worksheet, "Collectors");
     
       // Write the workbook to a file and trigger the download
       XLSX.writeFile(workbook, "Collectors.xlsx");
     };
  if (loading) {
    return <div><Loader></Loader></div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Collectors List</h1>
      
      <div className="grid grid-cols-4 gap-4 mb-4"> {/* Changed to 5 columns to accommodate the button */}
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
      {collectors.length === 0 ? (
        <p>No collectors found.</p>
      ) : (
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="table-auto w-full border-collapse border border-gray-700 text-sm">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="border border-gray-700 px-4 py-2">Collector ID</th>
                <th className="border border-gray-700 px-4 py-2">Name</th>
                <th className="border border-gray-700 px-4 py-2">ContactNumber</th>
                <th className="border border-gray-700 px-4 py-2">Email</th>
                <th className="border border-gray-700 px-4 py-2">Password</th>
                <th className="border border-gray-700 px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCollectors.map((collector) => (
                <tr key={collector.collectorId} className="hover:bg-gray-100">
                  <td className="border border-gray-700 px-4 py-2">{collector.uid}</td>
                  <td className="border border-gray-700 px-4 py-2">{collector.name}</td>
                  <td className="border border-gray-700 px-4 py-2">{collector.contactNumber}</td>
                  <td className="border border-gray-700 px-4 py-2">{collector.email}</td>
                  <td className="border border-gray-700 px-4 py-2">{collector.password}</td>
                  <td className="border border-gray-700 px-4 py-2">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                      onClick={() => setSelectedCollector(collector)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedCollector && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Collector Details</h2>
            <p><strong>Name:</strong> {selectedCollector.name}</p>
            <p><strong>Email:</strong> {selectedCollector.email}</p>
            <p><strong>Contact:</strong> {selectedCollector.contactNumber}</p>
            <p><strong>Address:</strong> {selectedCollector.completeAddress}</p>
            <p><strong>In Wallet:</strong> {selectedCollector.totalPayments}</p>
            <p><strong>Role:</strong> {selectedCollector.role}</p>
            <p><strong>Created Date:</strong> {selectedCollector.createDate}</p>
            <div className="mt-4 text-right">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={() => setSelectedCollector(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(CollectorsListPage);
