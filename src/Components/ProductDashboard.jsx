import React, { useState } from 'react';
import UploadModal from './UploadModal';

const ProductDashboard = () => {
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);

    const handlePdf = () => {
        setUploadModalOpen(true);
    };

    const handleUploadSuccess = (data) => {
        console.log("Upload Success:", data);
        alert(`Successfully processed! Batch ID: ${data.batchId}`);
        // Here we could trigger a refresh of the dashboard data
    };

    return (
        <div className="p-4">
            <button 
                onClick={handlePdf} 
                className='bg-blue-600 text-white px-4 py-2 border border-transparent rounded-xl hover:bg-blue-700 shadow-sm font-medium transition-colors'
            >
                Upload PDF
            </button>

            <UploadModal 
                isOpen={isUploadModalOpen} 
                onClose={() => setUploadModalOpen(false)} 
                onSuccess={handleUploadSuccess} 
            />
        </div>
    )
}

export default ProductDashboard;