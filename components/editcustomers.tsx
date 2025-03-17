import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/app/lib/firebase-config";

interface Package {
  id: string;
  name: string;
  price: number;
  size: string;
}

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
  area: string;
  category: string;
  city: string;
  discount: number;
  device: number;
  finalPrice: number;
  selectedCollector: string;
  collectorName: string;
  packageName: string;
  packagePrice: number;
}

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSave: (updatedCustomer: Customer) => Promise<void>;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({ isOpen, onClose, customer, onSave }) => {
  const [formData, setFormData] = useState<Customer | null>(customer);
  const [packages, setPackages] = useState<Package[]>([]); // State for packages

  useEffect(() => {
    setFormData(customer);
  }, [customer]);

  // Fetch packages when the component mounts
  useEffect(() => {
    const fetchPackages = async () => {
      const snapshot = await getDocs(collection(firestore, "packages"));
      const packagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        price: doc.data().price,
        size: doc.data().size,
      }));
      setPackages(packagesData);
    };

    fetchPackages();
  }, []);

  // Calculate final price when selectedPackage, device, or discount changes
  useEffect(() => {
    if (formData?.selectedPackage) {
      const selectedPkg = packages.find((pkg) => pkg.id === formData.selectedPackage);
      if (selectedPkg) {
        const selectedPkg_device = selectedPkg.price * formData.device;
        const finalPrice = selectedPkg_device - (selectedPkg.price * formData.discount) / 100;
        setFormData((prev) => ({
          ...prev!,
          finalPrice,
        }));
      }
    }
  }, [formData?.selectedPackage, formData?.device, formData?.discount, packages]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev!,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
    }
  };

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-1/2">
        <h2 className="text-xl font-bold mb-4">Edit Customer</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="p-2 border rounded"
              />
            </div>

            {/* Username */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="p-2 border rounded"
              />
            </div>

            {/* Contact Number */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Contact Number</label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="p-2 border rounded"
              />
            </div>

            {/* Complete Address */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Complete Address</label>
              <input
                type="text"
                name="completeAddress"
                value={formData.completeAddress}
                onChange={handleChange}
                className="p-2 border rounded"
              />
            </div>

            {/* Area */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Area</label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="p-2 border rounded"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="p-2 border rounded"
              />
            </div>

            {/* City */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="p-2 border rounded"
              />
            </div>

            {/* Number of Devices */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Number of Devices</label>
              <input
                type="number"
                name="device"
                value={formData.device}
                onChange={handleChange}
                min={1}
                className="p-2 border rounded"
              />
            </div>

            {/* Discount */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                className="p-2 border rounded"
              />
            </div>

            {/* Final Price */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Final Price</label>
              <input
                type="number"
                name="finalPrice"
                value={formData.finalPrice}
                disabled
                className="p-2 border rounded bg-gray-100"
              />
            </div>

            {/* Selected Package */}
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Select Package</label>
              <select
                name="selectedPackage"
                value={formData.selectedPackage}
                onChange={handleChange}
                className="p-2 border rounded"
              >
                <option value="">Select Package</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} {pkg.size} - Rs.{pkg.price}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomerModal;