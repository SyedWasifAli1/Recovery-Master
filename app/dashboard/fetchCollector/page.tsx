"use client";

import React, { useState, useEffect } from "react";
import { firestore } from "../../lib/firebase-config";
import { collection, getDocs } from "firebase/firestore";
import withAuth from "@/app/lib/withauth";

interface Collector {
  collectorId: string;
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

const CollectorsListPage = () => {
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollector, setSelectedCollector] = useState<Collector | null>(null);

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        const snapshot = await getDocs(collection(firestore, "collectors"));
        const collectorsData: Collector[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            collectorId: data.collectorId,
            name: data.name || "N/A",
            email: data.email || "N/A",
            password: data.password || "N/A",
            contactNumber: data.contactNumber || "N/A",
            completeAddress: data.completeAddress || "N/A",
            totalPayments: data.totalPayments || 0,
            createDate: data.createDate?.seconds
              ? new Date(data.createDate.seconds * 1000).toLocaleString("en-CA")
              : "Unknown",
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
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
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
              {collectors.map((collector) => (
                <tr key={collector.collectorId} className="hover:bg-gray-100">
                  <td className="border border-gray-700 px-4 py-2">{collector.collectorId}</td>
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
            <p><strong>Total Payments:</strong> {selectedCollector.totalPayments}</p>
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
