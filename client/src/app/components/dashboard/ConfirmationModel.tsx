// components/dashboard/ConfirmationModal.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center justify-center mb-4 text-orange-500">
              <AlertCircle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">{title}</h2>
            <p className="text-gray-700 mb-6 text-center">{message}</p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={isLoading}
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-5 py-2 rounded-lg font-semibold text-white transition-all ${
                  isLoading
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 shadow-md"
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
