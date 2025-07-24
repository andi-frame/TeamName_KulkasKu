package service

import (
	"github.com/andi-frame/TeamName_KulkasKu/backend/repository"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"
	"github.com/google/uuid"
)

type CartService struct{}

func (s *CartService) CreateCart(cart *schema.Cart) error {
	return repository.CreateCart(cart)
}

func (s *CartService) GetAllCartsByUser(userID uuid.UUID) ([]schema.Cart, error) {
	return repository.GetAllCartsByUser(userID)
}

func (s *CartService) GetCartDetail(cartID uuid.UUID) (schema.Cart, error) {
	return repository.GetCartDetail(cartID)
}

func (s *CartService) UpdateCart(cart *schema.Cart) error {
	return repository.UpdateCart(cart)
}

func (s *CartService) DeleteCart(cartID uuid.UUID) error {
	return repository.DeleteCart(cartID)
}
