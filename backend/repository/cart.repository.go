package repository

import (
	"github.com/andi-frame/TeamName_KulkasKu/backend/database"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/google/uuid"
)

func CreateCart(cart *schema.Cart) error {
	return database.DB.Create(cart).Error
}

func GetAllCartsByUser(userID uuid.UUID) ([]schema.Cart, error) {
	var carts []schema.Cart
	err := database.DB.Where("user_id = ?", userID).Find(&carts).Error
	return carts, err
}

func GetCartDetail(cartID uuid.UUID) (schema.Cart, error) {
	var cart schema.Cart
	err := database.DB.Preload("User").Where("id = ?", cartID).First(&cart).Error
	return cart, err
}

func UpdateCart(cart *schema.Cart) error {
	return database.DB.Save(cart).Error
}

func GetCartItems(cartID uuid.UUID) ([]schema.CartItem, error) {
	var cartItems []schema.CartItem
	err := database.DB.Where("cart_id = ?", cartID).Find(&cartItems).Error
	return cartItems, err
}

func DeleteCart(cartID uuid.UUID) error {
	
	tx := database.DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	result := tx.Where("cart_id = ?", cartID).Delete(&schema.CartItem{})
	if result.Error != nil {
		tx.Rollback()
		return result.Error
	}

	if err := tx.Delete(&schema.Cart{}, cartID).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}
