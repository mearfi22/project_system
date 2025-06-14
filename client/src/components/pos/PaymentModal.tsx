import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { useCart } from "../../contexts/CartContext";

interface PaymentDetails {
  method: string;
  customerName: string;
  customerEmail: string;
  discount: number;
  tax: number;
  notes: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (details: PaymentDetails) => void;
  total: number;
  canApplyDiscount?: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  total,
  canApplyDiscount,
}) => {
  const { tax } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      method: paymentMethod,
      customerName,
      customerEmail,
      discount,
      tax,
      notes,
    });
  };

  const finalTotal = total - discount + tax;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="min-h-screen px-4 text-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <Dialog.Title
            as="h3"
            className="text-lg font-medium leading-6 text-gray-900 mb-4"
          >
            Complete Payment
          </Dialog.Title>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="qr">QR Code</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name (Optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter customer name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Email (Optional)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter customer email"
              />
            </div>

            {canApplyDiscount && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2">₱</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full p-2 pl-8 border rounded"
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Add any notes here..."
              />
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>₱{total.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Discount:</span>
                  <span>-₱{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between mb-2">
                <span>Tax:</span>
                <span>₱{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₱{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Complete Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default PaymentModal;
