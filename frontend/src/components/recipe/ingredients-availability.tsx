"use client";

import { toast } from "sonner";

import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, Plus, ShoppingCart } from 'lucide-react';
import { IngredientType, Ingredient } from '../../types/recipe.types';
import { Item } from '../../types/item.types';
import api from '../../utils/axios';
import { CartSelectionModal } from './cart-selection-modal';

interface IngredientsAvailabilityProps {
  ingredientTypes: IngredientType[];
  recipeName: string;
}

interface IngredientAvailability {
  ingredient: Ingredient;
  groupName: string;
  availableItem?: Item;
  availableQuantity: number;
  isAvailable: boolean;
  matchPercentage: number;
  extractedName: string;
}

interface MatchResult {
  item: Item;
  similarity: number;
  extractedName: string;
}

export function IngredientsAvailability({ 
  ingredientTypes, 
  recipeName 
}: IngredientsAvailabilityProps) {
  const [availabilityData, setAvailabilityData] = useState<IngredientAvailability[]>([]);
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingIngredient, setPendingIngredient] = useState<Ingredient | null>(null);

  // Extract clean ingredient name from description (remove amounts, units, etc)
  const extractIngredientName = useCallback((description: string): string => {
    let cleanName = description.toLowerCase().trim();
    
    // Remove amounts and units
    cleanName = cleanName.replace(/\d+(\.\d+)?\s*(gr|gram|kg|kilogram|ml|mililiter|l|liter|pcs|buah|biji|siung|potong|iris|cincang|halus|kasar|sdt|sdm|sendok|cup|gelas)/gi, '');
    
    // Remove common cooking terms
    cleanName = cleanName.replace(/\b(secukupnya|sesuai selera|untuk|yang|di|ke|dari|dengan|dan|atau|saja|aja\sepotong)\b/gi, '');
    
    // Remove cooking descriptions
    cleanName = cleanName.replace(/\b(segar|bersih|matang|mentah|kering|basah|potong|iris|cincang|halus|kasar|organik|fresh)\b/gi, '');
    
    // Clean up multiple spaces and trim
    cleanName = cleanName.replace(/\s+/g, ' ').trim();
    
    return cleanName;
  }, []);

  const calculateSimilarity = useCallback((ingredientDesc: string, itemName: string): number => {
    const cleanIngredient = extractIngredientName(ingredientDesc);
    const cleanItem = itemName.toLowerCase().trim();
    
    if (!cleanIngredient) return 0;
    
    if (cleanIngredient === cleanItem) return 1.0;
    
    if (cleanIngredient.includes(cleanItem) || cleanItem.includes(cleanIngredient)) {
      return 0.9;
    }
    
    const words1 = cleanIngredient.split(/\s+/).filter(word => word.length > 2);
    const words2 = cleanItem.split(/\s+/).filter(word => word.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    let matches = 0;
    words1.forEach(word1 => {
      words2.forEach(word2 => {
        if (word1 === word2) {
          matches += 1.0;
        } else if (word1.includes(word2) || word2.includes(word1)) {
          matches += 0.7;
        }
      });
    });
    
    return Math.min(matches / Math.max(words1.length, words2.length), 1.0);
  }, [extractIngredientName]);

  const findBestMatch = useCallback((ingredientDesc: string, items: Item[]): MatchResult | null => {
    const extractedName = extractIngredientName(ingredientDesc);
    let bestItem: Item | null = null;
    let bestSimilarity = 0;

    items.forEach(item => {
      const similarity = calculateSimilarity(ingredientDesc, item.Name);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestItem = item;
      }
    });

    if (bestItem && bestSimilarity > 0.5) {
      return {
        item: bestItem,
        similarity: bestSimilarity,
        extractedName
      };
    }
    return null;
  }, [calculateSimilarity, extractIngredientName]);

  useEffect(() => {
    const fetchUserItems = async () => {
      setIsLoading(true);
      try {
        const freshResponse = await api.get('/item/fresh');
        const expiredResponse = await api.get('/item/expired');
        
        const allItems = [
          ...(freshResponse.data.data || []),
          ...(expiredResponse.data.data || [])
        ];
        
        setUserItems(allItems);
      } catch (error) {
        console.error('Error fetching user items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserItems();
  }, []);

  useEffect(() => {
    if (userItems.length === 0) return;

    const allIngredients: { ingredient: Ingredient; groupName: string }[] = [];
    
    ingredientTypes.forEach(group => {
      group.ingredients.forEach(ingredient => {
        allIngredients.push({ ingredient, groupName: group.name });
      });
    });

    const availability = allIngredients.map(({ ingredient, groupName }) => {
      const matchedItem = findBestMatch(ingredient.description, userItems);
      
      return {
        ingredient,
        groupName,
        availableItem: matchedItem?.item || undefined,
        availableQuantity: matchedItem?.item?.Amount || 0,
        isAvailable: !!matchedItem && matchedItem.similarity > 0.6,
        matchPercentage: matchedItem ? Math.round(matchedItem.similarity * 100) : 0,
        extractedName: matchedItem?.extractedName || extractIngredientName(ingredient.description),
      };
    });

    setAvailabilityData(availability);
  }, [userItems, ingredientTypes, findBestMatch, extractIngredientName]);

  // Show cart selection modal
  const showCartModal = (ingredient: Ingredient) => {
    setPendingIngredient(ingredient);
    setIsModalOpen(true);
  };

  // Add ingredient to selected cart
  const addToSelectedCart = async (cartId: string) => {
    if (!pendingIngredient) return;

    try {
      await api.post('/cart/item/create', {
        CartID: cartId,
        Name: pendingIngredient.description,
        Type: 'Bahan Masakan',
        Amount: 1,
        AmountType: 'pcs',
        Desc: pendingIngredient.recommendation || pendingIngredient.description,
      });

      // Update local state
      setCartItems(prev => [...prev, pendingIngredient.description]);
      
      toast.success(`"${pendingIngredient.description}" berhasil ditambahkan ke keranjang belanja!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Gagal menambahkan ke keranjang belanja');
    }
  };

  // Create new cart and add ingredient
  const createNewCartAndAdd = async () => {
    if (!pendingIngredient) return;

    try {
      const cartName = `Belanja - ${recipeName}`;
      
      const cartResponse = await api.post('/cart/create', {
        Name: cartName,
        Desc: `Shopping list for recipe: ${recipeName}`,
      });

      const cartId = cartResponse.data.ID;

      await api.post('/cart/item/create', {
        CartID: cartId,
        Name: pendingIngredient.description,
        Type: 'Bahan Masakan',
        Amount: 1,
        AmountType: 'pcs',
        Desc: pendingIngredient.recommendation || pendingIngredient.description,
      });

      // Update local state
      setCartItems(prev => [...prev, pendingIngredient.description]);
      
      toast.success(`"${pendingIngredient.description}" berhasil ditambahkan ke keranjang belanja baru!`);
    } catch (error) {
      console.error('Error creating cart and adding item:', error);
      toast.error('Gagal membuat keranjang belanja baru');
    }
  };

  const unavailableItems = availabilityData.filter(item => !item.isAvailable);
  const availableItems = availabilityData.filter(item => item.isAvailable);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Mengecek ketersediaan bahan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Ingredients List */}
      {ingredientTypes.map((group, groupIndex) => (
        <div key={groupIndex}>
          <h4 className="font-semibold text-sm text-gray-700 mb-2">{group.name}</h4>
          <div className="space-y-2">
            {group.ingredients.map((ingredient, idx) => {
              const availability = availabilityData.find(
                item => item.ingredient.description === ingredient.description
              );
              
              const isInCart = cartItems.includes(ingredient.description);
              const isAvailable = availability?.isAvailable || false;
              const availableAmount = availability?.availableItem?.Amount || 0;
              const amountType = availability?.availableItem?.AmountType || '';

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                >
                  {/* Ingredient Name */}
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm text-gray-800 truncate">
                      {ingredient.description}
                    </p>
                  </div>

                  {/* Availability Counter */}
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isAvailable 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {isAvailable ? `${availableAmount} ${amountType}` : 'Tidak ada'}
                    </div>

                    {/* Add to Cart Button */}
                    {!isAvailable && (
                      <>
                        {isInCart ? (
                          <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <ShoppingCart size={14} />
                            Di cart
                          </div>
                        ) : (
                          <button
                            onClick={() => showCartModal(ingredient)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                            title="Tambah ke keranjang belanja"
                          >
                            <Plus size={12} />
                            Tambah
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Summary Footer */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-green-600" />
            <span>Tersedia: {availableItems.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <X size={16} className="text-red-600" />
            <span>Perlu beli: {unavailableItems.length}</span>
          </div>
        </div>
      </div>

      {/* Cart Selection Modal */}
      <CartSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCartSelected={addToSelectedCart}
        onCreateNew={createNewCartAndAdd}
        ingredientName={pendingIngredient?.description || ''}
        recipeName={recipeName}
      />
    </div>
  );
}
