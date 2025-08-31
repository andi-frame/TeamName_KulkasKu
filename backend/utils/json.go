package utils

import (
	"strings"
)

// CleanGeminiResponse removes markdown fences and trims whitespace.
// It now correctly handles both JSON objects and arrays.
func CleanGeminiResponse(rawResponse string) string {
	// Remove markdown fences
	cleaned := strings.ReplaceAll(rawResponse, "```json", "")
	cleaned = strings.ReplaceAll(cleaned, "```", "")

	// Trim leading/trailing whitespace
	cleaned = strings.TrimSpace(cleaned)

	// Find the start of the JSON array or object
	firstBracket := strings.Index(cleaned, "[")
	firstBrace := strings.Index(cleaned, "{")

	// Determine the actual start index
	var start int
	if firstBracket != -1 && (firstBracket < firstBrace || firstBrace == -1) {
		start = firstBracket
	} else {
		start = firstBrace
	}

	// If no JSON structure is found, return the raw cleaned string
	if start == -1 {
		return cleaned
	}

	// Determine the corresponding end character and find its last occurrence
	var end int
	if cleaned[start] == '[' {
		end = strings.LastIndex(cleaned, "]")
	} else {
		end = strings.LastIndex(cleaned, "}")
	}

	// If a valid end is found, slice the string to get the full JSON structure
	if end != -1 && end > start {
		return cleaned[start : end+1]
	}

	return cleaned
}