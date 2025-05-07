"use client";

import React, { useState, useEffect } from "react";
import { firestore } from "../../lib/firebase-config";
import {
  collection,
  getDocs,
  Timestamp,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import withAuth from "@/app/lib/withauth";
import crypto from "crypto";
import Loader from "@/components/loader";
import * as XLSX from "xlsx";
import { FiDownload, FiEdit, FiTrash } from "react-icons/fi";

interface Collector {
  collectorId: number;
  authId: string;
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

const formatFirestoreDatefilter = (
  timestamp: Timestamp | Date | undefined
): string => {
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
  const [selectedCollector, setSelectedCollector] = useState<Collector | null>(
    null
  );
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [editingCollector, setEditingCollector] = useState<Collector | null>(
    null
  );

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        const snapshot = await getDocs(collection(firestore, "collectors"));
        const collectorsData: Collector[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            collectorId: generateNumericHash(doc.id),
            authId: doc.id,
            name: data.name || "N/A",
            email: data.email || "N/A",
            password: data.password || "N/A",
            contactNumber: data.contactNumber || "N/A",
            completeAddress: data.completeAddress || "N/A",
            totalPayments: data.totalPayments || 0,
            createDate: formatFirestoreDatefilter(data.createDate),
            role: data.role || "collector",
            uid: doc.id,
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

  const generateNumericHash = (id: string) => {
    const hash = crypto.createHash("sha256").update(id).digest("hex");
    return parseInt(hash.substring(0, 10), 16) % 1000000;
  };

  // const handleDelete = async (collectorId: number,authId :string) => {
  //   try {
  //     const collectorToDelete = collectors.find(
  //       (c) => c.collectorId === collectorId
  //     );
  //     if (collectorToDelete) {
  //       await deleteDoc(doc(firestore, "collectors", collectorToDelete.uid));
  //       setCollectors(
  //         collectors.filter((c) => c.collectorId !== collectorId)
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error deleting collector:", error);
  //   }
  // };
  const handleDelete = async (collectorId: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this collector?");
    if (!confirmDelete) return;
  
    try {
      const collectorToDelete = collectors.find(
        (c) => c.collectorId === collectorId
      );
  
      if (collectorToDelete) {
        // 1. Firestore se delete karo
        await deleteDoc(doc(firestore, "collectors", collectorToDelete.uid));
  
        // 2. Custom API se user delete karo
        const res = await fetch(`https://recovery-master-six.vercel.app/api/users/${collectorToDelete.uid}`, {
          method: "DELETE",
        });
  
        if (!res.ok) {
          throw new Error("Failed to delete user from backend API");
        }
  
        // 3. UI se remove karo
        setCollectors(
          collectors.filter((c) => c.collectorId !== collectorId)
        );
      }
    } catch (error) {
      console.error("Error deleting collector:", error);
    }
  };
  
  
  const handleEdit = (collector: Collector) => {
    setEditingCollector(collector);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollector) return;

    try {
      const collectorRef = doc(firestore, "collectors", editingCollector.uid);
      await updateDoc(collectorRef, {
        name: editingCollector.name,
        email: editingCollector.email,
        contactNumber: editingCollector.contactNumber,
        completeAddress: editingCollector.completeAddress,
        totalPayments: editingCollector.totalPayments,
        role: editingCollector.role,
      });

      setCollectors(
        collectors.map((c) =>
          c.collectorId === editingCollector.collectorId
            ? editingCollector
            : c
        )
      );
      setEditingCollector(null);
    } catch (error) {
      console.error("Error updating collector:", error);
    }
  };

  const filteredCollectors = collectors.filter((collector) => {
    const isCollectorMatch =
      searchCollector === "" ||
      collector.name
        ?.toLowerCase()
        .includes(searchCollector.toLowerCase());
    const isDateInRange =
      (fromDate === "" || collector.createDate >= fromDate) &&
      (toDate === "" || collector.createDate <= toDate);
    return isCollectorMatch && isDateInRange;
  });

  const exportToExcel = () => {
    const data = filteredCollectors.map((collector) => ({
      "Collector Id": collector.uid,
      "Collector Name": collector.name,
      "Contact Number": collector.contactNumber,
      Address: collector.completeAddress,
      "In Wallet": collector.totalPayments,
      Email: collector.email,
      Password: collector.password,
      "Created Date": collector.createDate,
      Role: collector.role,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Collectors");
    XLSX.writeFile(workbook, "Collectors.xlsx");
  };

  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Collectors List</h1>
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
        <div className="flex items-end">
          <button
            onClick={exportToExcel}
            className="hover:bg-[#8A56E8] bg-black text-white px-4 py-2 rounded w-full flex items-center justify-center"
          >
            <FiDownload className="w-5 h-5 mr-2" />
            Download
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="table-auto w-full border-collapse border border-gray-700 text-sm">
          <thead>
            <tr className="bg-[#8A56E8] text-white text-left">
              <th className="border border-gray-700 px-4 py-2">Collector ID</th>
              <th className="border border-gray-700 px-4 py-2">Name</th>
              <th className="border border-gray-700 px-4 py-2">Contact Number</th>
              <th className="border border-gray-700 px-4 py-2">Email</th>
              <th className="border border-gray-700 px-4 py-2">Password</th>
              <th className="border border-gray-700 px-4 py-2">Role</th>
              <th className="border border-gray-700 px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCollectors.map((collector) => (
              <tr key={collector.collectorId} className="hover:bg-gray-100">
                <td className="border border-gray-700 px-4 py-2">{collector.collectorId}</td>
                <td className="border border-gray-700 px-4 py-2">{collector.name}</td>
                <td className="border border-gray-700 px-4 py-2">{collector.contactNumber}</td>
                <td className="border border-gray-700 px-4 py-2">{collector.email}</td>
                <td className="border border-gray-700 px-4 py-2">{collector.password}</td>
                <td className="border border-gray-700 px-4 py-2">{collector.role}</td>
                <td className="border border-gray-700 px-4 py-2 flex gap-2">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={() => setSelectedCollector(collector)}
                  >
                    Details
                  </button>
                  <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-700"
                    onClick={() => handleEdit(collector)}
                  >
                    <FiEdit />
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                    onClick={() => handleDelete(collector.collectorId)}
                  >
                    <FiTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

      {editingCollector && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Collector</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  className="p-2 border rounded w-full"
                  value={editingCollector.name}
                  onChange={(e) =>
                    setEditingCollector({ ...editingCollector, name: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Contact Number</label>
                <input
                  type="text"
                  className="p-2 border rounded w-full"
                  value={editingCollector.contactNumber}
                  onChange={(e) =>
                    setEditingCollector({ ...editingCollector, contactNumber: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  className="p-2 border rounded w-full"
                  value={editingCollector.completeAddress}
                  onChange={(e) =>
                    setEditingCollector({ ...editingCollector, completeAddress: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  className="p-2 border rounded w-full"
                  value={editingCollector.role}
                  onChange={(e) => {
                    const confirmChange = confirm("Are you sure you want to change the role?");
                    if (confirmChange) {
                      setEditingCollector({ ...editingCollector, role: e.target.value });
                    }
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Active">Active</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
                  onClick={() => setEditingCollector(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(CollectorsListPage);
