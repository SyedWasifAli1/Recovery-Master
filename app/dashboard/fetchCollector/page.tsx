"use client";

import React, { useState, useEffect } from "react";
import { firestore } from "../../lib/firebase-config"; // Adjust the path
import { collection, getDocs } from "firebase/firestore";
import withAuth from "@/app/lib/withauth";

interface Collector {
  collectorId: string;
  name: string;
  cnic: string;
  contactNumber: string;
  completeAddress: string;
  totalpayments: number;
  createDate: string; // Date as string (formatted)
}

const CollectorsListPage = () => {
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        const snapshot = await getDocs(collection(firestore, "collectors"));
        const collectorsData: Collector[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          const createDate = data.createDate
            ? new Date(data.createDate).toLocaleDateString("en-CA")
            : "Unknown"; // Format date for display
          return {
            collectorId: doc.id,
            name: data.name,
            cnic: data.cnic,
            contactNumber: data.contactNumber,
            totalpayments: data.totalPayments,
            completeAddress: data.completeAddress,
            createDate,
          };
        });
        setCollectors(collectorsData);
      } catch (error) {
        console.error("Error fetching collectors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectors();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Collectors List</h1>
      {collectors.length === 0 ? (
        <p>No collectors found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-700 text-sm">
            <thead>
              <tr className="bg-white text-left">
                <th className="border border-gray-700 px-4 py-2">Collector ID</th>
                <th className="border border-gray-700 px-4 py-2">Name</th>
                <th className="border border-gray-700 px-4 py-2">CNIC</th>
                <th className="border border-gray-700 px-4 py-2">Contact Number</th>
                <th className="border border-gray-700 px-4 py-2">Complete Address</th>
                <th className="border border-gray-700 px-4 py-2">In Wallet</th>

                <th className="border border-gray-700 px-4 py-2">Created Date</th>
              </tr>
            </thead>
            <tbody>
              {collectors.map((collector) => (
                <tr key={collector.collectorId} className="hover:bg-gray-100">
                  <td className="border border-gray-700 px-4 py-2">{collector.collectorId}</td>
                  <td className="border border-gray-700 px-4 py-2">{collector.name}</td>
                  <td className="border border-gray-700 px-4 py-2">{collector.cnic}</td>
                  <td className="border border-gray-700 px-4 py-2">{collector.contactNumber}</td>
                  <td className="border border-gray-700 px-4 py-2">{collector.completeAddress}</td>
                  <td className="border border-gray-700 px-4 py-2"> {collector.totalpayments ?? "0"}</td>
                  <td className="border border-gray-700 px-4 py-2">{collector.createDate }</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default withAuth(CollectorsListPage);