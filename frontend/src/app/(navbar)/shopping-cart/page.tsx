"use client";

import React, { useState, useEffect } from "react";
import { Plus, ShoppingCart, Trash2, X, Package, Info } from "lucide-react";
import api from "@/utils/axios";
import { Cart, CartItem } from "@/types/cart.types";

const Page = () => {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCartDetailModal, setShowCartDetailModal] = useState(false);
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);
  const [error, setError] = useState("");

  // Form states
  const [newCart, setNewCart] = useState<Omit<Cart, "ID" | "CreatedAt" | "UpdatedAt" | "UserID">>({
    Name: "",
    Desc: null,
  });

  // New item form state
  const [newItem, setNewItem] = useState({
    Name: "",
    Type: "",
    Amount: "",
    AmountType: "",
    Desc: "",
  });

  const [cartItems, setCartItems] = useState<Omit<CartItem, "ID" | "CreatedAt" | "UpdatedAt" | "CartID">[]>([]);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchCarts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`${API_BASE}/cart/all`);

      if (response.status == 200) {
        setCarts(response.data);
      } else {
        setError("Failed to fetch carts");
      }
    } catch (err) {
      setError("Error fetching carts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartDetail = async (cartId: string) => {
    try {
      const response = await api.get(`${API_BASE}/cart/${cartId}`);

      if (response.status === 200) {
        const data: Cart = response.data;
        setSelectedCart(data);

        // Fetch cart items
        const itemsResponse = await api.get(`${API_BASE}/cart/${cartId}/items`);
        console.log(itemsResponse);
        if (itemsResponse.status === 200) {
          setCartItems(itemsResponse.data);
        }
      } else {
        setError("Failed to fetch cart details");
      }
    } catch (err) {
      setError("Error fetching cart details");
      console.error(err);
    }
  };

  const createCart = async () => {
    try {
      const response = await api.post(`${API_BASE}/cart/create`, {
        ...newCart,
        Desc: newCart.Desc || null,
      });

      if (response.status === 201) {
        const createdCart: Cart = response.data;

        // Create items for the cart
        for (const item of cartItems) {
          await createCartItem(createdCart.ID, {
            ...item,
            Desc: item.Desc || null,
          });
        }

        await fetchCarts();
        resetCreateForm();
        setShowCreateModal(false);
      } else {
        setError("Failed to create cart");
      }
    } catch (err) {
      setError("Error creating cart");
      console.error(err);
    }
  };

  const createCartItem = async (cartId: string, item: Omit<CartItem, "ID" | "CreatedAt" | "UpdatedAt" | "CartID">) => {
    try {
      await api.post(`${API_BASE}/cart/item/create`, {
        ...item,
        CartID: cartId,
      });
    } catch (err) {
      console.error("Error creating cart item:", err);
    }
  };

  const deleteCart = async (cartId: string) => {
    try {
      const response = await api.delete(`${API_BASE}/cart/delete/${cartId}`);

      if (response.status === 200) {
        await fetchCarts();
      } else {
        setError("Failed to delete cart");
      }
    } catch (err) {
      setError("Error deleting cart");
      console.error(err);
    }
  };

  const addItemToNewCart = () => {
    if (newItem.Name && newItem.Type && newItem.Amount && newItem.AmountType) {
      const amount = parseFloat(newItem.Amount);
      if (isNaN(amount)) return;

      setCartItems([
        ...cartItems,
        {
          ...newItem,
          Amount: amount,
          Desc: newItem.Desc || null,
        },
      ]);

      // Reset form
      setNewItem({
        Name: "",
        Type: "",
        Amount: "",
        AmountType: "",
        Desc: "",
      });
    }
  };

  const removeItemFromNewCart = (itemInput: CartItem) => {
    setCartItems(cartItems.filter((item) => (item as CartItem) != itemInput));
  };

  const resetCreateForm = () => {
    setNewCart({
      Name: "",
      Desc: null,
    });
    setNewItem({
      Name: "",
      Type: "",
      Amount: "",
      AmountType: "",
      Desc: "",
    });
    setCartItems([]);
  };

  const openCartDetail = async (cart: Cart) => {
    await fetchCartDetail(cart.ID);
    setShowCartDetailModal(true);
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold text-gray-800">Cart Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-lg flex items-center transition-colors text-xs">
          <Plus size={14} />
          Create
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* Cart List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {carts.map((cart) => (
          <div
            key={cart.ID}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="text-blue-500" size={24} />
                  <h3 className="text-md font-semibold text-gray-800">{cart.Name}</h3>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Are you sure you want to delete this cart?")) {
                      deleteCart(cart.ID);
                    }
                  }}
                  className="text-red-500 hover:text-red-700 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>

              {cart.Desc && <p className="text-gray-600 mb-4 line-clamp-2 text-xs">{cart.Desc}</p>}

              <div className="text-xs text-gray-500 mb-4">
                <p>Created: {new Date(cart.CreatedAt).toLocaleDateString()}</p>
                <p>Updated: {new Date(cart.UpdatedAt).toLocaleDateString()}</p>
              </div>

              <button
                onClick={() => openCartDetail(cart)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                <Info size={16} />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {carts.length === 0 && !loading && (
        <div className="text-center py-12">
          <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No carts found</h3>
          <p className="text-gray-500">Create your first cart to get started!</p>
        </div>
      )}

      {/* Create Cart Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Create New Cart</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Cart Metadata */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Cart Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cart Name *</label>
                    <input
                      type="text"
                      value={newCart.Name}
                      onChange={(e) => setNewCart({ ...newCart, Name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter cart name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newCart.Desc || ""}
                      onChange={(e) => setNewCart({ ...newCart, Desc: e.target.value || null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter cart description"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Add Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Add Items</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                    <input
                      type="text"
                      value={newItem.Name}
                      onChange={(e) => setNewItem({ ...newItem, Name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter item name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <input
                      type="text"
                      value={newItem.Type}
                      onChange={(e) => setNewItem({ ...newItem, Type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter item type"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newItem.Amount}
                      onChange={(e) => setNewItem({ ...newItem, Amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount Type *</label>
                    <select
                      value={newItem.AmountType}
                      onChange={(e) => setNewItem({ ...newItem, AmountType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select type</option>
                      <option value="kg">Kilogram</option>
                      <option value="g">Gram</option>
                      <option value="l">Liter</option>
                      <option value="ml">Milliliter</option>
                      <option value="pcs">Pieces</option>
                      <option value="pack">Pack</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Description</label>
                    <input
                      type="text"
                      value={newItem.Desc}
                      onChange={(e) => setNewItem({ ...newItem, Desc: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter item description"
                    />
                  </div>
                </div>

                <button
                  onClick={addItemToNewCart}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <Plus size={16} />
                  Add Item
                </button>
              </div>

              {/* Items List */}
              {cartItems.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Added Items</h3>
                  <div className="space-y-2">
                    {cartItems.map((item, index) => (
                      <div
                        key={(item as CartItem).ID + (item as CartItem).Name + (item as CartItem).AmountType + index}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div>
                          <span className="font-medium">{item.Name}</span>
                          <span className="text-gray-600 ml-2">({item.Type})</span>
                          <span className="text-gray-600 ml-2">
                            {item.Amount} {item.AmountType}
                          </span>
                          {item.Desc && <span className="text-gray-500 ml-2">- {item.Desc}</span>}
                        </div>
                        <button
                          onClick={() => removeItemFromNewCart(item as CartItem)}
                          className="text-red-500 hover:text-red-700">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Create Button */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={createCart}
                  disabled={!newCart.Name}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors">
                  Create Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Detail Modal */}
      {showCartDetailModal && selectedCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Cart Details</h2>
                <button onClick={() => setShowCartDetailModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Cart Metadata */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Cart Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div>
                    <span className="font-medium">Name:</span> {selectedCart.Name}
                  </div>
                  {selectedCart.Desc && (
                    <div>
                      <span className="font-medium">Description:</span> {selectedCart.Desc}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Created:</span> {new Date(selectedCart.CreatedAt).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {new Date(selectedCart.UpdatedAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Cart Items */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Items in Cart</h3>
                {cartItems.length > 0 ? (
                  <div className="space-y-3">
                    {cartItems.map((item, index) => (
                      <div
                        key={(item as CartItem).ID + (item as CartItem).Name + (item as CartItem).AmountType + index}
                        className="border border-gray-200 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Package size={16} className="text-blue-500" />
                          <span className="font-medium">{item.Name}</span>
                          <span className="text-gray-600">({item.Type})</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>
                            Amount: {item.Amount} {item.AmountType}
                          </p>
                          {item.Desc && <p>Description: {item.Desc}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package size={48} className="mx-auto mb-2 text-gray-400" />
                    <p>No items in this cart</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
