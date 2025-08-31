package utils

import (
	"strings"

	"github.com/andi-frame/TeamName_KulkasKu/backend/constants"
)

func IsValidImageType(filename string) bool {
	ext := strings.ToLower(filename[strings.LastIndex(filename, ".")+1:])
	validTypes := []string{"jpg", "jpeg", "png"}

	for _, validType := range validTypes {
		if ext == validType {
			return true
		}
	}
	return false
}

func IsValidImageSize(size int64) bool {
	return size <= constants.MaxImageSize
}
