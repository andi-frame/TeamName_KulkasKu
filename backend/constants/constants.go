package constants

const (
	GeminiAPIBaseURL = "https://generativelanguage.googleapis.com/v1beta"
	GeminiModel      = "gemini-1.5-flash"

	ContentTypeHeader = "Content-Type"
	ApplicationJSON   = "application/json"

	MaxImageSizeMB = 10
	MaxImageSize   = MaxImageSizeMB * 1024 * 1024
)
