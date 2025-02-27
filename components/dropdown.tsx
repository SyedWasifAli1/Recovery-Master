import { useState, FC } from "react";

interface OrderStatusDropdownProps {
  currentStatus: string;
  onStatusChange?: (status: string) => void;
}

const OrderStatusDropdown: FC<OrderStatusDropdownProps> = ({ currentStatus, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);

  const statuses: string[] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

  const handleStatusChange = (status: string): void => {
    setSelectedStatus(status);
    setIsOpen(false);
    if (onStatusChange) onStatusChange(status); // Callback for parent component
  };

  // Define color classes for each status
  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
    Processing: "bg-blue-100 text-blue-700 border-blue-300",
    Shipped: "bg-purple-100 text-purple-700 border-purple-300",
    Delivered: "bg-green-100 text-green-700 border-green-300",
    Cancelled: "bg-red-100 text-red-700 border-red-300",
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className={`inline-flex w-full justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm hover:bg-opacity-90 focus:outline-none ${
            statusColors[selectedStatus] || "bg-white text-gray-700 border-gray-300"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedStatus}
          <svg
            className="-mr-1 ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute z-10 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
        >
          <div className="py-1" role="none">
            {statuses.map((status) => (
              <button
                key={status}
                className={`block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 ${
                  selectedStatus === status ? "font-bold text-blue-500" : ""
                }`}
                onClick={() => handleStatusChange(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusDropdown;
