'use client';

import React, { useState, useEffect } from 'react';

interface Collection {
  name: string;
  points_count: number;
  vectors_count: number;
  vector_size: number;
  distance: string;
}

interface CollectionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCollection: (collectionName: string) => void;
  currentCollection?: string;
}

export default function CollectionSelector({
  isOpen,
  onClose,
  onSelectCollection,
  currentCollection
}: CollectionSelectorProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen]);

  const fetchCollections = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the full API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/vector-store/collections`);
      
      console.log('Fetching collections from:', `${apiUrl}/api/v1/vector-store/collections`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Collections API response:', data);
      
      if (data.success) {
        setCollections(data.collections);
        console.log('Collections loaded:', data.collections);
      } else {
        setError('Failed to fetch collections');
      }
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('Backend server is not running. Please start the backend server.');
      } else {
        setError(`Network error while fetching collections: ${err.message}`);
      }
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCollection = (collectionName: string) => {
    onSelectCollection(collectionName);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#1a1a1a] border border-[#3b82f6] rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-[#3b82f6] rounded-full mr-2"></div>
            <h2 className="text-lg font-semibold text-white">Select Knowledge Base Collection</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3b82f6]"></div>
            <span className="ml-3 text-gray-300">Loading collections...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-400 mb-2">⚠️ Error</div>
            <div className="text-gray-300 mb-4">{error}</div>
            <button
              onClick={fetchCollections}
              className="px-4 py-2 bg-[#3b82f6] hover:bg-blue-600 text-white rounded transition-colors"
            >
              Retry
            </button>
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">📁 No Collections</div>
            <div className="text-gray-300">No knowledge base collections found.</div>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {collections.map((collection) => (
              <div
                key={collection.name}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  currentCollection === collection.name
                    ? 'border-[#3b82f6] bg-[#3b82f6]/10'
                    : 'border-gray-600 hover:border-[#3b82f6] hover:bg-[#3b82f6]/5'
                }`}
                onClick={() => handleSelectCollection(collection.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-[#8b5cf6] rounded-full mr-2"></div>
                      <span className="font-medium text-white">{collection.name}</span>
                      {currentCollection === collection.name && (
                        <span className="ml-2 text-xs bg-[#3b82f6] text-white px-2 py-1 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      {collection.points_count} documents • {collection.vector_size}D vectors
                    </div>
                  </div>
                  <div className="text-[#3b82f6]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            Select a collection to attach to this knowledge base node
          </div>
        </div>
      </div>
    </div>
  );
}
