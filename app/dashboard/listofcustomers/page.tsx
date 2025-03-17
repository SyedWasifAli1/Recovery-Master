"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, Timestamp, query, where, getDoc,doc, updateDoc} from "firebase/firestore";
import { firestore } from "../../lib/firebase-config";
import withAuth from "@/app/lib/withauth";
import crypto from "crypto";
import Loader from "@/components/loader";
import { FiDownload } from "react-icons/fi";
import * as XLSX from "xlsx";
import EditCustomerModal from "@/components/editcustomers";
import jsPDF from 'jspdf';
  import html2canvas from 'html2canvas';


interface Customer {
  customerId: string;
  name: string;
  username: string;
  contactNumber: string;
  completeAddress: string;
  createDate: string;
  createDatefilter: string;
  status: string;
  diffInMonths: number;
  selectedPackage: string;
  area: string; // Add area
  category: string; // Add category
  city: string; // Add city
  discount: number; // Add discount
  device: number; // Add discount
  finalPrice: number; // Add finalPrice
  // lastpay: string; // Add lastpay (as string or Timestamp, depending on your use case)
  selectedCollector: string; // Add selectedCollector
  collectorName: string; // Add selectedCollector
  packageName: string; // Add selectedCollector
  packagePrice: number; // Add selectedCollector
  
}
interface Payment {
  id: string;
  amount: number;
  customerName: string;
  collectorName: string;
  paymentDate: string;
}

function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null >(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [errorPayments, setErrorPayments] = useState<string | null>(null);
  const [packagePrice, setPackagePrice] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [totalPaymentsAmount, setTotalPaymentsAmount] = useState<number>(0);
  const [diffInMonths, setDiffInMonths] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true); 
  const [searchCollector, setSearchCollector] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomerForEdit, setSelectedCustomerForEdit] = useState<Customer | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [customerDetails, setCustomerDetails] = useState<Customer | null>(null);


  const handleEdit = (customer: Customer) => {
    setSelectedCustomerForEdit(customer);
    setIsEditModalOpen(true);
  };

  const handleSave = async (updatedCustomer: Customer) => {
    try {
      const customerRef = doc(firestore, "customers", updatedCustomer.customerId);
  
      // Extract only the fields you want to update
      const updateData = {
        name: updatedCustomer.name,
        username: updatedCustomer.username,
        contactNumber: updatedCustomer.contactNumber,
        completeAddress: updatedCustomer.completeAddress,
        area: updatedCustomer.area,
        category: updatedCustomer.category,
        city: updatedCustomer.city,
        device: updatedCustomer.device,
        discount: updatedCustomer.discount,
        finalPrice: updatedCustomer.finalPrice,
      };
  
      await updateDoc(customerRef, updateData);
  
      // Update the local state
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.customerId === updatedCustomer.customerId ? updatedCustomer : customer
        )
      );
  
      setIsEditModalOpen(false);
      alert("Customer updated successfully.");
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  };
  const formatFirestoreDate = (timestamp: Timestamp | string | undefined): string => {
    if (!timestamp) return "Unknown";

    let date: Date;

    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (typeof timestamp === "string") {
      date = new Date(timestamp);
    } else {
      return "Unknown";
    }

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
  const formatFirestoreDatefilter = (timestamp: Timestamp | string | undefined): string => {
    if (!timestamp) return "Unknown";

    let date: Date;

    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (typeof timestamp === "string") {
      date = new Date(timestamp);
    } else {
      return "Unknown";
    }

    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      
      timeZone: "Asia/Karachi",
    }).format(date);
  };
  const generateNumericHash = (id: string | null): string => {
    if (!id) return "N/A"; // Handle null or undefined
    const hash = crypto.createHash("sha256").update(id).digest("hex");
    return (parseInt(hash.substring(0, 10), 16) % 1000000).toString(); // Convert to string
  };
  // const generateNumericHash = (id:string) => {
  //   const hash = crypto.createHash("sha256").update(id).digest("hex");
  //   return parseInt(hash.substring(0,10), 16) % 1000000; // ✅ Same modulo logic as Dart
  // };
  
  const filteredCustomers = customers.filter((customer) => {
    // const isCollectorMatch =
    //   searchCollector === "" || payment.collectorName.toLowerCase().includes(searchCollector.toLowerCase());
    const isCollectorMatch =
    searchCollector === "" || 
    customer.collectorName.toLowerCase().includes(searchCollector.toLowerCase()) ||
    customer.name.toLowerCase().includes(searchCollector.toLowerCase());


    const isDateInRange =
      (fromDate === "" || customer.createDatefilter >= fromDate) && (toDate === "" || customer.createDatefilter <= toDate);
      const isStatusMatch =
    selectedStatus === "" || customer.status === selectedStatus;
    return isCollectorMatch && isDateInRange && isStatusMatch;
  });


  
  const handleDownloadPDF = async () => {
    const modalContent = document.getElementById('payment-modal-content');
  
    if (!modalContent) {
      alert('Modal content not found!');
      return;
    }
  
    try {
      // Capture the modal content as an image, ignoring the buttons
      const canvas = await html2canvas(modalContent, {
        ignoreElements: (element) => element.classList.contains('ignore-in-pdf'),
      });
  
      const imgData = canvas.toDataURL('image/png');
  
      // Create a new PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
  
      // Calculate image dimensions
      const pageWidth = pdf.internal.pageSize.getWidth(); // A4 page width (210mm)
      const pageHeight = pdf.internal.pageSize.getHeight(); // A4 page height (297mm)
      const margin = 5; // Margin on all sides
      const maxWidth = pageWidth - 2 * margin; // Max width for the image (210mm - 20mm margins)
      const imgWidth = maxWidth; // Use the maximum width
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Calculate height based on aspect ratio
  
      // Add the image to the PDF at the top (starting from the margin)
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
  
      // If the image height is too large for a single page, split it across multiple pages
      let remainingHeight = imgHeight;
      let yPosition = margin; // Start from the top margin
  
      while (remainingHeight > 0) {
        if (yPosition + remainingHeight > pageHeight - margin) {
          // Add a new page
          pdf.addPage();
          yPosition = margin; // Reset yPosition for the new page
        }
  
        // Add the remaining part of the image
        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, remainingHeight, undefined, 'FAST');
        remainingHeight -= (pageHeight - margin - yPosition); // Subtract the height added to the current page
        yPosition = margin; // Reset yPosition for the next iteration
      }
  
      // Download the PDF
      const customerid = generateNumericHash(selectedCustomerId);
      pdf.save(`customer_payments_${customerid}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const exportToExcel = () => {
    if (filteredCustomers.length === 0) {
      alert("No data available to export!");
      return;
    }
  
    // Prepare the data for the Excel file
    const data = filteredCustomers.map((customer) => ({
      "Customer ID": generateNumericHash(customer.customerId) ,
      "Name": customer.name,
      "Username": customer.username,
      "Contact Number": customer.contactNumber,
      "Complete Address": customer.completeAddress,
      "Create Date": customer.createDate,
      // "Create Date (Filter)": customer.createDatefilter,
      "Status": customer.status,
      "Months Difference": customer.diffInMonths,
      // "Selected Package": customer.selectedPackage,
      "Area": customer.area,
      "Category": customer.category,
      "City": customer.city,
      "Discount (%)": customer.discount,
      "Device": customer.device,
      "Final Price": `Rs. ${customer.finalPrice.toFixed(2)}`,
      // "Selected Collector": customer.selectedCollector,
      "Collector Name": customer.collectorName,
    }));
  
    // Create a worksheet from the data
    const worksheet = XLSX.utils.json_to_sheet(data);
  
    // Auto-fit columns for better visibility
    const columnWidths = Object.keys(data[0]).map((key) => ({ wch: key.length + 5 }));
    worksheet["!cols"] = columnWidths;
  
    // Create a workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
  
    // Write the workbook to a file and trigger the download
    XLSX.writeFile(workbook, "Customers.xlsx");
  };
  


  const fetchCustomers = async (): Promise<void> => {
    setLoading(true);
    try {
      const customerSnapshot = await getDocs(collection(firestore, "customers"));
      const customersData: Customer[] = await Promise.all(
        customerSnapshot.docs.map(async (customerDoc) => {
          const data = customerDoc.data() as Omit<Customer, "customerId"> & {
            createDate?: Timestamp | string;
            // createDatefilter?: Timestamp | string;
            lastpay?: Timestamp | string;
            selectedCollector?: string; // Assuming collectorId is stored in the customer document
          };
  
          // Format the createDate
          const createDate = formatFirestoreDate(data.createDate);
          const createDatefilter = formatFirestoreDatefilter(data.createDate);
  
          // Calculate the status based on lastPay
          let status = "Unknown"; // Default status
          let diffInMonths = 0;
          if (data.lastpay) {
            // Check if lastPay exists
            const lastPayDate =
              data.lastpay instanceof Timestamp
                ? data.lastpay.toDate()
                : new Date(data.lastpay);
            const currentDate = new Date();
  
            // Calculate the difference in months
            diffInMonths =
              (currentDate.getFullYear() - lastPayDate.getFullYear()) * 12 +
              (currentDate.getMonth() - lastPayDate.getMonth());
            console.log("monthsDifference:", diffInMonths);
            if (diffInMonths > 1) {
              status = "Defaulter";
            } else if (diffInMonths === 1) {
              status = "Unactive";
            } else {
              status = "Active";
            }
          } else {
            console.warn(`Customer ${customerDoc.id} has no lastPay field.`); // Log a warning if lastPay is missing
          }
  
          // Fetch collector's name if collectorId exists
          let collectorName = "Unknown";
      
          if (data.selectedCollector) {
            const collectorDocRef = doc(firestore, "collectors", data.selectedCollector); // Create a reference to the collector document
            const collectorDoc = await getDoc(collectorDocRef); // Fetch the collector document
            if (collectorDoc.exists()) {
              const collectorData = collectorDoc.data() as { name: string }; // Explicitly type the data
              collectorName = collectorData.name; // Get the collector's name
            } else {
              console.warn(`Collector with ID ${data.selectedCollector} not found.`);
            }
          }
  
          return {
            customerId: customerDoc.id,
            ...data,
            createDate,
            createDatefilter,
            status, // Add the status field
            diffInMonths,
            collectorName, // Add the collector's name
          };
        })
      );
  
      setCustomers(customersData);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);


  const handleViewPayments = async (customerId: string, selectedPackage: string, diffInMonths: number) => {
    setSelectedCustomerId(customerId);
    setIsModalOpen(true);
    setLoadingPayments(true);
    setErrorPayments(null);
  
    try {
      // Fetch customer details
      const customerDoc = await getDoc(doc(firestore, "customers", customerId));
      if (customerDoc.exists()) {
        const customerData = customerDoc.data() as Customer;
  
        // Fetch package details
        const packageDoc = await getDoc(doc(firestore, "packages", customerData.selectedPackage));
        const packageData = packageDoc.data();
        const packageName = packageData?.name || "N/A"; // Get package name
        const packagePrice = packageData?.price || 0; // Get package price
  
        // Update customer details with package name and price
        const updatedCustomerData = {
          ...customerData,
          packageName,
          packagePrice,
        };
  
        setCustomerDetails(updatedCustomerData); // Store updated customer details
      } else {
        console.warn("Customer not found.");
      }
  
      // Fetch payments
      const paymentsQuery = query(
        collection(firestore, "payments"),
        where("customerId", "==", parseInt(generateNumericHash(customerId)))
      );
      const snapshot = await getDocs(paymentsQuery);
  
      // Fetch collectors
      const collectorsSnapshot = await getDocs(collection(firestore, "collectors"));
      const collectorsData: { [key: string]: string } = {};
      collectorsSnapshot.forEach((doc) => {
        collectorsData[doc.id] = doc.data().name; // Store collector name by userId
      });
  
      // Map payments data and fetch collector names
      const paymentsData: Payment[] = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const payment = doc.data();
          const collectorName = collectorsData[payment.userId] || "Unknown"; // Get collector name from collectorsData
  
          return {
            id: doc.id,
            amount: payment.amount as number,
            customerName: payment.customerName as string,
            collectorName, // Set collector name
            paymentDate: new Date(payment.paymentDate.seconds * 1000).toISOString().split("T")[0],
          };
        })
      );
  
      // Calculate total amount of payments
      const totalPaymentsAmount = paymentsData.reduce((sum, payment) => sum + payment.amount, 0);
  
      // Calculate total amount (packagePrice * diffInMonths)
      const totalAmount = packagePrice * diffInMonths;
  
      // Set state
      setPayments(paymentsData);
      setPackagePrice(packagePrice); // Store package price
      setTotalAmount(totalAmount); // Store total amount
      setTotalPaymentsAmount(totalPaymentsAmount); // Store total payments amount
      setDiffInMonths(diffInMonths); // Store diffInMonths
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorPayments(error.message);
      } else {
        setErrorPayments("An unknown error occurred.");
      }
    } finally {
      setLoadingPayments(false);
    }
  };

  // const handleViewPayments = async (customerId: string, selectedPackage: string, diffInMonths: number) => {
  //   setSelectedCustomerId(customerId);
  //   setIsModalOpen(true);
  //   setLoadingPayments(true);
  //   setErrorPayments(null);
  
  //   try {
  //     // Fetch package price
  //     const packageDoc = await getDoc(doc(firestore, "packages", selectedPackage));
  //     const packagePrice = packageDoc.data()?.price || 0; // Default to 0 if price is missing
  
  //     // Fetch payments
  //     const paymentsQuery = query(collection(firestore, "payments"), where("customerId", "==", parseInt(generateNumericHash(customerId))));
  //     const snapshot = await getDocs(paymentsQuery);
  
  //     // Fetch collectors
  //     const collectorsSnapshot = await getDocs(collection(firestore, "collectors"));
  //     const collectorsData: { [key: string]: string } = {};
  //     collectorsSnapshot.forEach((doc) => {
  //       collectorsData[doc.id] = doc.data().name; // Store collector name by userId
  //     });
  
  //     // Map payments data and fetch collector names
  //     const paymentsData: Payment[] = await Promise.all(
  //       snapshot.docs.map(async (doc) => {
  //         const payment = doc.data();
  //         const collectorName = collectorsData[payment.userId] || "Unknown"; // Get collector name from collectorsData
  
  //         return {
  //           id: doc.id,
  //           amount: payment.amount as number,
  //           customerName: payment.customerName as string,
  //           collectorName, // Set collector name
  //           paymentDate: new Date(payment.paymentDate.seconds * 1000).toISOString().split("T")[0],
  //         };
  //       })
  //     );
  
  //     // Calculate total amount of payments
  //     const totalPaymentsAmount = paymentsData.reduce((sum, payment) => sum + payment.amount, 0);
  
  //     // Calculate total amount (packagePrice * diffInMonths)
  //     const totalAmount = packagePrice * diffInMonths;
  
  //     // Set state
  //     setPayments(paymentsData);
  //     setPackagePrice(packagePrice); // Store package price
  //     setTotalAmount(totalAmount); // Store total amount
  //     setTotalPaymentsAmount(totalPaymentsAmount); // Store total payments amount
  //     setDiffInMonths(diffInMonths); // Store diffInMonths
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       setErrorPayments(error.message);
  //     } else {
  //       setErrorPayments("An unknown error occurred.");
  //     }
  //   } finally {
  //     setLoadingPayments(false);
  //   }
  // };
  const handleCheckboxChange = (id: string) => {
    setSelectedCustomers((prev) => {
      const updatedSet = new Set(prev);
      if (updatedSet.has(id)) {
        updatedSet.delete(id);
      } else {
        updatedSet.add(id);
      }
      return updatedSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedCustomers(selectAll ? new Set() : new Set(customers.map((customer) => customer.customerId)));
    setSelectAll((prev) => !prev);
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        Array.from(selectedCustomers).map((id) => deleteDoc(doc(firestore, "customers", id)))
      );

      setCustomers((prev) => prev.filter((customer) => !selectedCustomers.has(customer.customerId)));
      setSelectedCustomers(new Set());
      alert("Selected customers deleted successfully.");
    } catch (error) {
      console.error("Error deleting selected customers:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(firestore, "customers", id));
      setCustomers((prev) => prev.filter((customer) => customer.customerId !== id));
      alert("Customer deleted successfully.");
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  return (
    <div className="h-[80vh] text-black p-8">
      <h2 className="text-2xl font-bold mb-4">Customers</h2>
      <EditCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customer={selectedCustomerForEdit}
        onSave={handleSave}
      />
      <div className="grid grid-cols-5 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Search Collector/Customer</label>
          <input
            type="text"
            placeholder="Enter Collector/Customer Name"
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
          <label className="text-sm font-medium mb-1">Status</label>
          <select
    value={selectedStatus}
    onChange={(e) => setSelectedStatus(e.target.value)}
    className="p-2 border border-gray-300 rounded"
  >
    <option value="">All</option>
    <option value="Active">Active</option>
    <option value="Unactive">Unactive</option>
    <option value="Defaulter">Defaulter</option>
  </select>
        </div>

       <div className="flex items-end"> {/* Added for the Download button */}
         <button
         onClick={exportToExcel}
         className="bg-blue-500 text-white px-4 py-2 rounded w-full flex items-center justify-center"
       >
         <FiDownload className="w-5 h-5 mr-2" /> 
         Download {/* Optional text */}
       </button>
        
      </div>
      </div>
      {loading ? ( // Show loader while fetching
      <Loader />
    ) : customers.length === 0 ? ( // Show message if no customers
      <p className="text-center text-gray-500">No customers found.</p>
    ) : (

        <div>
          <div className="mb-4 flex items-center">
            <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="mr-2" />
            <button onClick={handleDeleteSelected} className="bg-red-500 text-white px-4 py-2 rounded">
              Delete Selected
            </button>
          </div>
          <div className="overflow-x-auto max-h-[400px]">
  <div className="inline-block min-w-full">
  <table className="table-auto w-full border-collapse border border-gray-700 text-sm">
  <thead>
    <tr className="bg-red-500 text-white text-left">
      <th className="border border-gray-700 px-4 py-2">
        <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
      </th>
      <th className="border border-gray-700 px-4 py-2">Customer Id</th>
      <th className="border border-gray-700 px-4 py-2">Customer Name</th>
      <th className="border border-gray-700 px-4 py-2">Username</th>
      <th className="border border-gray-700 px-4 py-2">Contact</th>
      <th className="border border-gray-700 px-4 py-2">Address</th>
      <th className="border border-gray-700 px-4 py-2">Area</th>
      <th className="border border-gray-700 px-4 py-2">Category</th>
      <th className="border border-gray-700 px-4 py-2">City</th>
      <th className="border border-gray-700 px-4 py-2">Number Of Device</th>
      <th className="border border-gray-700 px-4 py-2">Created Date</th>
      <th className="border border-gray-700 px-4 py-2">Discount</th>
      <th className="border border-gray-700 px-4 py-2">Final Price</th>
      <th className="border border-gray-700 px-4 py-2">Collector Name</th>
      <th className="border border-gray-700 px-4 py-2">Status</th>
      <th className="border border-gray-700 px-4 py-2">Actions</th>
    </tr>
  </thead>
  <tbody>
    {filteredCustomers.map((customer) => (
      <tr key={customer.customerId} className="hover:bg-gray-100">
        <td className="border border-gray-700 px-4 py-2">
          <input
            type="checkbox"
            checked={selectedCustomers.has(customer.customerId)}
            onChange={() => handleCheckboxChange(customer.customerId)}
          />
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {generateNumericHash(customer.customerId)}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.name}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.username}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.contactNumber}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.completeAddress}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.area}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.category}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.city}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.device}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.createDate}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.discount}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.finalPrice}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          {customer.collectorName}
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          <span
            className={`px-2 py-1 rounded-sm text-white ${
              customer.status === "Active"
                ? "bg-green-500"
                : customer.status === "Unactive"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          >
            {customer.status}
          </span>
        </td>
        <td className="border border-gray-700 px-4 py-2 max-w-[100%] overflow-hidden overflow-ellipsis whitespace-nowrap">
          <button
            onClick={() => handleDelete(customer.customerId)}
            className="bg-red-500 text-white px-4 py-2 rounded mr-2"
          >
            Delete
          </button>
          <button
          onClick={() => handleEdit(customer)}
          className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
        >
          Edit
        </button>
          <button
            onClick={() => handleViewPayments(customer.customerId, customer.selectedPackage, customer.diffInMonths)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            View Payments
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
  </div>
</div>

          {/* Modal for Payments */}
          {isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div id="payment-modal-content" className="bg-white p-6 rounded-lg w-1/2 max-h-[80vh] overflow-y-auto relative pdf-export">
      {/* Close Button (Top Right) */}
      <button
        onClick={() => setIsModalOpen(false)}
        className="absolute top-2 right-2 text-black px-3 py-1 ignore-in-pdf"
      >
        ×
      </button>

      {/* Download PDF Button */}
      <button
        onClick={handleDownloadPDF}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4 ignore-in-pdf"
      >
        Download PDF
      </button>

      {/* Customer Details */}
      {customerDetails && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Customer Payments Report</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {customerDetails.name}</p>
              <p><strong>Phone:</strong> {customerDetails.contactNumber}</p>
              <p><strong>Address:</strong> {customerDetails.completeAddress}</p>
            </div>
            <div>
              <p>
              <strong>Status:</strong> {diffInMonths === 0 ? 'Active' : diffInMonths === 1 ? 'Unactive' : 'Defaulter'}
              </p>
              <p>
              <strong>Package Name:</strong> {customerDetails.packageName} {customerDetails.discount} % off
              </p>
            <p>
  <strong>Package:</strong>  (PKR {customerDetails.packagePrice} x {customerDetails.device} = PKR {customerDetails.packagePrice * customerDetails.device} - {customerDetails.discount}% = PKR {customerDetails.finalPrice})
</p>
              {/* <p><strong>Collector:</strong> {customerDetails.collectorName}</p> */}
              {/* <p><strong>Join Date:</strong> {customerDetails.createDate}</p> */}
            </div>
          </div>
        </div>
      )}

      {/* Rest of the modal content */}
      {/* <h2 className="text-xl font-bold mb-4 ignore-in-pdf">
        Payments for Customer ID: {selectedCustomerId ? generateNumericHash(selectedCustomerId) : "N/A"}
      </h2> */}

      {/* Status Alert */}
      {diffInMonths === 0 && (
        <div className="bg-green-500 text-white px-4 py-2 rounded mb-4 ignore-in-pdf">
          Status: Active
        </div>
      )}
      {diffInMonths === 1 && (
        <div className="bg-yellow-500 text-white px-4 py-2 rounded mb-4 ignore-in-pdf">
          Status: Unactive <hr />
          {packagePrice} x {diffInMonths} = {totalAmount}
        </div>
      )}
      {diffInMonths > 1 && (
        <div className="bg-red-500 text-white px-4 py-2 rounded mb-4 ignore-in-pdf">
          Status: Defaulter <hr />
          {packagePrice} x {diffInMonths} = {packagePrice * diffInMonths}
        </div>
      )}

      {/* Total Amount */}
      {totalPaymentsAmount > 0 && (
        <div className="text-lg font-semibold mb-4">
          Total Amount: PKR {totalPaymentsAmount.toLocaleString()}
        </div>
      )}

      {/* Payments Table */}
      {loadingPayments ? (
        <p>Loading payments...</p>
      ) : errorPayments ? (
        <p>Error: {errorPayments}</p>
      ) : (
        <div className="overflow-x-auto">
          {payments.length > 0 ? (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2">Amount</th>
                  <th className="border border-gray-300 px-4 py-2">Customer Name</th>
                  <th className="border border-gray-300 px-4 py-2">Collector Name</th>
                  <th className="border border-gray-300 px-4 py-2">Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-2">{payment.amount}</td>
                    <td className="border border-gray-300 px-4 py-2">{payment.customerName}</td>
                    <td className="border border-gray-300 px-4 py-2">{payment.collectorName}</td>
                    <td className="border border-gray-300 px-4 py-2">{payment.paymentDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500">No payments found.</p>
          )}
        </div>
      )}
    </div>
  </div>
)}





        </div>
      )}
    </div>
  );
}

export default withAuth(Customers);

