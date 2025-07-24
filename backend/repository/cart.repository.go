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

func DeleteCart(cartID uuid.UUID) error {
	return database.DB.Delete(&schema.Cart{}, cartID).Error
}
