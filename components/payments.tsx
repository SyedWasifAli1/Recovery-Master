import React, { useEffect, useState } from "react";
import { firestore } from "../app/lib/firebase-config";
import { collection, query, where, getDocs } from "firebase/firestore";

interface Payment {
  id: string;
  amount: number;
  customerName: string;
  collectorName: string;
  paymentDate: string;
}

interface PaymentsModalProps {
  customerId: string;
  onClose: () => void;
}

const PaymentsModal: React.FC<PaymentsModalProps> = ({ customerId, onClose }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const paymentsQuery = query(collection(firestore, "payments"), where("customerId", "==", customerId));
        const snapshot = await getDocs(paymentsQuery);
        const paymentsData: Payment[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          amount: doc.data().amount as number,
          customerName: doc.data().customerName as string,
          collectorName: doc.data().collectorName as string,
          paymentDate: new Date(doc.data().paymentDate.seconds * 1000).toISOString().split("T")[0],
        }));
        setPayments(paymentsData);
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

    fetchPayments();
  }, [customerId]);

  if (loading) return <p>Loading payments...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Payments for Customer ID: {customerId}</h2>
        <button onClick={onClose}>Close</button>
        <ul>
          {payments.map((payment) => (
            <li key={payment.id}>
              <p><strong>Amount:</strong> {payment.amount}</p>
              <p><strong>Customer Name:</strong> {payment.customerName}</p>
              <p><strong>Collector Name:</strong> {payment.collectorName}</p>
              <p><strong>Payment Date:</strong> {payment.paymentDate}</p>
              <hr />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PaymentsModal;