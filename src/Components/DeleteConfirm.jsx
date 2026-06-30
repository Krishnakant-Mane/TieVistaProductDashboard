import React from 'react';
import { IconAlertTriangle, IconX } from '@tabler/icons-react';

const DeleteConfirm = ({ isOpen, onClose, onConfirm, productName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-[#E0DDD6] bg-[#FAFAF8]">
          <div className="flex items-center gap-2 text-red-600">
            <IconAlertTriangle size={24} />
            <h2 className="text-lg font-semibold text-gray-800">Confirm Deletion</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition p-1 rounded-md hover:bg-gray-100"
          >
            <IconX size={20} />
          </button>
        </div>
        
        <div className="p-6 text-gray-700">
          <p className="mb-4 text-[15px]">
            Are you sure you want to delete <span className="font-semibold text-gray-900">"{productName || 'this product'}"</span>?
          </p>
          <p className="text-sm text-gray-500 bg-red-50 p-3 rounded-lg border border-red-100">
            This action cannot be undone. It will permanently remove the product and all associated data, including monthly records and fee classes.
          </p>
        </div>
        
        <div className="flex justify-end gap-3 p-5 border-t border-[#E0DDD6] bg-[#FAFAF8]">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C9981A] transition"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
          >
            Delete Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirm;
