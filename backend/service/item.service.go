// service/item.go
package service

import (
	"errors"
	"time"

	"github.com/andi-frame/TeamName_KulkasKu/backend/repository"
	"github.com/andi-frame/TeamName_KulkasKu/backend/schema"

	"github.com/google/uuid"
)

type ItemInput struct {
	ID         uuid.UUID
	UserID     uuid.UUID
	Name       string
	Type       string
	Amount     float64
	AmountType string
	Desc       string
	StartDate  string // yyyy-mm-dd
	ExpDate    string // yyyy-mm-dd
}

func CreateNewItem(input ItemInput) error {
	startDate, err := time.Parse("2006-01-02", input.StartDate)
	if err != nil {
		return errors.New("invalid start date format")
	}

	expDate, err := time.Parse("2006-01-02", input.ExpDate)
	if err != nil {
		return errors.New("invalid expiration date format")
	}

	var desc *string = nil
	if input.Desc != "" {
		desc = &input.Desc
	}

	item := schema.Item{
		UserID:     input.UserID,
		Name:       input.Name,
		Type:       input.Type,
		Amount:     input.Amount,
		AmountType: input.AmountType,
		Desc:       desc,
		StartDate:  startDate,
		ExpDate:    expDate,
	}

	return repository.CreateNewItem(item, input.UserID.String())
}

func UpdateItem(inputItem schema.Item) error {
	return repository.UpdateItem(inputItem)
}

func DeleteItem(itemID string) error {
	return repository.DeleteItem(itemID)
}
