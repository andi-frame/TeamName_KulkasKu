package utils

import (
	"strings"
)

func CleanGeminiResponse(rawResponse string) string {
	cleaned := strings.ReplaceAll(rawResponse, "```json", "")
	cleaned = strings.ReplaceAll(cleaned, "```", "")

	cleaned = strings.TrimSpace(cleaned)

	firstBrace := strings.Index(cleaned, "{")
	lastBrace := strings.LastIndex(cleaned, "}")

	if firstBrace != -1 && lastBrace != -1 && lastBrace > firstBrace {
		cleaned = cleaned[firstBrace : lastBrace+1]
	}

	cleaned = strings.ReplaceAll(cleaned, "\n", "")
	cleaned = strings.ReplaceAll(cleaned, "\r", "")

	return cleaned
}
