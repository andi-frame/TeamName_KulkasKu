"use client";

import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Plus } from 'lucide-react';
import api from '../../utils/axios';

interface Cart {
  ID: string;
  Name: string;
  Desc?: string;
  CreatedAt: string;
  UpdatedAt: string;
  items?: CartItem[];
}

interface CartItem {
  ID: string;
  Name: string;
  Amount: number;
  AmountType: string;
}

interface CartSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCartSelected: (cartId: string) => Promise<void>;
  onCreateNew: () => Promise<void>;
  ingredientName: string;
  recipeName: string;
}

export function CartSelectionModal({
  isOpen,
  onClose,
  onCartSelected,
  onCreateNew,
  ingredientName,
  recipeName
}: CartSelectionModalProps) {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCartId, setSelectedCartId] = useState<string>('');

  // Generate expected cart name for this recipe
  const expectedCartName = `Belanja - ${recipeName}`;

  // Fetch user carts and filter for this recipe
  useEffect(() => {
    if (!isOpen) return;

    const fetchCarts = async () => {
      setIsLoading(true);
      console.log('Fetching carts for recipe:', recipeName);
      try {
        const response = await api.get('/cart/all');
        console.log('Cart response:', response.data);
        
        const cartsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        
        // Filter carts that match this recipe
        const recipeCarts = cartsData.filter((cart: Cart) => 
          cart.Name === expectedCartName || 
          cart.Name.includes(recipeName) ||
          (cart.Desc && cart.Desc.includes(recipeName))
        );
        
        console.log('Filtered carts for recipe:', recipeCarts);
        setCarts(recipeCarts);
        
        // Auto-select if there's exactly one matching cart
        if (recipeCarts.length === 1) {
          setSelectedCartId(recipeCarts[0].ID);
        }
      } catch (error) {
        console.error('Error fetching carts:', error);
        setCarts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarts();
  }, [isOpen, recipeName, expectedCartName]);

  const handleSelectCart = async () => {
    if (selectedCartId) {
      await onCartSelected(selectedCartId);
      onClose();
    }
  };

  const handleCreateNew = async () => {
    await onCreateNew();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Keranjang Belanja - {recipeName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Tambahkan &quot;{ingredientName}&quot; ke keranjang belanja khusus untuk resep {recipeName}.
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Memuat keranjang...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Existing Carts for this recipe */}
              {carts.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Keranjang untuk &quot;{recipeName}&quot; ({carts.length})
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {carts.map((cart) => (
                      <div
                        key={cart.ID}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedCartId === cart.ID
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedCartId(cart.ID)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedCartId === cart.ID
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                          }`}>
                            {selectedCartId === cart.ID && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                          <ShoppingCart size={18} className="text-gray-500" />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">
                              {cart.Name}
                            </p>
                            {cart.Desc && (
                              <p className="text-xs text-gray-500">
                                {cart.Desc}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Dibuat: {new Date(cart.CreatedAt).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <ShoppingCart size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500 mb-2">
                    Belum ada keranjang untuk resep &quot;{recipeName}&quot;
                  </p>
                  <p className="text-xs text-gray-400">
                    Keranjang baru akan dibuat khusus untuk resep ini
                  </p>
                </div>
              )}

              {/* Create New Cart Option */}
              <div className="border-t border-gray-200 pt-3 mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {carts.length > 0 ? 'Atau Buat Keranjang Baru' : 'Buat Keranjang Belanja'}
                </h4>
                <button
                  onClick={handleCreateNew}
                  className="w-full flex items-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <Plus size={18} className="text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Buat keranjang &quot;Belanja - {recipeName}&quot;
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Batal
          </button>
          {selectedCartId && (
            <button
              onClick={handleSelectCart}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tambahkan ke Keranjang
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
