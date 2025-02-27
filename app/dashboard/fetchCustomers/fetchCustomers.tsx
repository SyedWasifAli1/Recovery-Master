import React, { useState, useEffect } from "react";
import { firestore } from "../../lib/firebase-config";
import { collection, getDocs } from "firebase/firestore";
import withAuth from "@/app/lib/withauth";

// Define Customer Type
interface Customer {
  customerId: string;
  name: string;
  username: string;
  contactNumber: string;
  completeAddress: string;
  nearby: string;
  selectedPackage: string;
  createDate: string;
}

const CustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const snapshot = await getDocs(collection(firestore, "customers"));
        const customersData: Customer[] = snapshot.docs.map((doc) => ({
          customerId: doc.id, // doc.id سے Firestore ID ملے گی
          name: doc.data().name as string,
          username: doc.data().username as string,
          contactNumber: doc.data().contactNumber as string,
          completeAddress: doc.data().completeAddress as string,
          nearby: doc.data().nearby as string,
          selectedPackage: doc.data().selectedPackage as string,
          createDate: (doc.data().createDate as string) || new Date().toISOString(),
        }));
        setCustomers(customersData);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) return <p>Loading customers...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Customer List</h2>
      <ul>
        {customers.map((customer) => (
          <li key={customer.customerId}>
            <p><strong>Name:</strong> {customer.name}</p>
            <p><strong>Username:</strong> {customer.username}</p>
            <p><strong>Contact:</strong> {customer.contactNumber}</p>
            <p><strong>Address:</strong> {customer.completeAddress}</p>
            <p><strong>Nearby:</strong> {customer.nearby}</p>
            <p><strong>Package:</strong> {customer.selectedPackage}</p>
            <p><strong>Created on:</strong> {new Date(customer.createDate).toLocaleDateString()}</p>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default withAuth(CustomerList);






// import { firestore } from "../../lib/firebase-config"; // Adjust the path

// import { collection, getDocs } from "firebase/firestore";

// // Define the Customer type
// interface Customer {
//   customerId: string;
//   name: string;
//   username: string;
//   contactNumber: string;
//   completeAddress: string;
//   nearby: string;
//   selectedPackage: string;
//   createDate: string;
// }

// // Fetch all customers from Firestore
// export const fetchCustomers = async (): Promise<Customer[]> => {
//   try {
//     const snapshot = await getDocs(collection(firestore, "customers"));
//     const customersData: Customer[] = snapshot.docs.map((doc) => ({
//       customerId: doc.data().customerId,
//       name: doc.data().name,
//       username: doc.data().username,
//       contactNumber: doc.data().contactNumber,
//       completeAddress: doc.data().completeAddress,
//       nearby: doc.data().nearby,
//       selectedPackage: doc.data().selectedPackage,
//       createDate: doc.data().createDate,
//     }));
//     return customersData;
//   } catch (error) {
//     console.error("Error fetching customers:", error);
//     throw new Error("Failed to fetch customers");
//   }
// };
