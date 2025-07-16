package controller

import (
    "bytes"
    "encoding/json"
    "fmt"
    "mime/multipart"
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/andi-frame/TeamName_KulkasKu/backend/service"
    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
)

// Mock service implementation
type mockAIPredictionService struct {
    shouldReturnError bool
    mockResult        *service.AIResult
}

func (m *mockAIPredictionService) PredictItem(imageData []byte) (*service.AIResult, error) {
    if m.shouldReturnError {
        return nil, fmt.Errorf("mock error from AI service")
    }
    
    if m.mockResult != nil {
        return m.mockResult, nil
    }
    
    // Default mock response
    return &service.AIResult{
        ItemName:   "Apel dari Mock",
        Condition:  "Sangat Segar (dari Mock)",
        ExpiryDays: 10,
    }, nil
}

// Helper function to create multipart form data
func createMultipartFormData(fieldName, fileName string, fileContent []byte) (*bytes.Buffer, string, error) {
    body := &bytes.Buffer{}
    writer := multipart.NewWriter(body)
    
    part, err := writer.CreateFormFile(fieldName, fileName)
    if err != nil {
        return nil, "", err
    }
    
    _, err = part.Write(fileContent)
    if err != nil {
        return nil, "", err
    }
    
    err = writer.Close()
    if err != nil {
        return nil, "", err
    }
    
    return body, writer.FormDataContentType(), nil
}

func TestPredictItemHandler_Success(t *testing.T) {
    // 1. Arrange (Persiapan)
    gin.SetMode(gin.TestMode)

    // Buat mock service
    mockService := &mockAIPredictionService{
        shouldReturnError: false,
        mockResult: &service.AIResult{
            ItemName:   "Tomat Cherry Test",
            Condition:  "Fresh dari Test",
            ExpiryDays: 7,
        },
    }

    // Buat controller dengan mock service
    predictionController := NewPredictionController(mockService)

    // Setup router
    router := gin.Default()
    router.POST("/predict/image", predictionController.PredictItemHandler)

    // Buat mock image data
    mockImageData := []byte("fake image data for testing")
    
    // Buat multipart form data
    body, contentType, err := createMultipartFormData("file", "test.jpg", mockImageData)
    assert.NoError(t, err)

    // Buat HTTP request
    req, err := http.NewRequest("POST", "/predict/image", body)
    assert.NoError(t, err)
    req.Header.Set("Content-Type", contentType)

    // 2. Act (Eksekusi)
    w := httptest.NewRecorder()
    router.ServeHTTP(w, req)

    // 3. Assert (Pengecekan Hasil)
    assert.Equal(t, http.StatusOK, w.Code)

    // Parse response JSON
    var response map[string]interface{}
    err = json.Unmarshal(w.Body.Bytes(), &response)
    assert.NoError(t, err)

    // Check response structure
    assert.True(t, response["success"].(bool))
    assert.NotNil(t, response["data"])

    // Check response data
    data := response["data"].(map[string]interface{})
    assert.Equal(t, "Tomat Cherry Test", data["item_name"])
    assert.Equal(t, "Fresh dari Test", data["condition"])
    assert.Equal(t, float64(7), data["expiry_days"]) // JSON numbers are float64
    assert.NotEmpty(t, data["expiry_date"])
}

func TestPredictItemHandler_NoFile(t *testing.T) {
    // 1. Arrange
    gin.SetMode(gin.TestMode)

    mockService := &mockAIPredictionService{}
    predictionController := NewPredictionController(mockService)

    router := gin.Default()
    router.POST("/predict/image", predictionController.PredictItemHandler)

    // Buat request tanpa file
    req, err := http.NewRequest("POST", "/predict/image", nil)
    assert.NoError(t, err)

    // 2. Act
    w := httptest.NewRecorder()
    router.ServeHTTP(w, req)

    // 3. Assert
    assert.Equal(t, http.StatusBadRequest, w.Code)

    var response map[string]interface{}
    err = json.Unmarshal(w.Body.Bytes(), &response)
    assert.NoError(t, err)

    assert.False(t, response["success"].(bool))
    assert.Contains(t, response["error"].(string), "File gambar tidak ditemukan")
}

func TestPredictItemHandler_InvalidFileType(t *testing.T) {
    // 1. Arrange
    gin.SetMode(gin.TestMode)

    mockService := &mockAIPredictionService{}
    predictionController := NewPredictionController(mockService)

    router := gin.Default()
    router.POST("/predict/image", predictionController.PredictItemHandler)

    // Buat file dengan ekstensi yang tidak valid
    mockFileData := []byte("fake text file content")
    body, contentType, err := createMultipartFormData("file", "test.txt", mockFileData)
    assert.NoError(t, err)

    req, err := http.NewRequest("POST", "/predict/image", body)
    assert.NoError(t, err)
    req.Header.Set("Content-Type", contentType)

    // 2. Act
    w := httptest.NewRecorder()
    router.ServeHTTP(w, req)

    // 3. Assert
    assert.Equal(t, http.StatusBadRequest, w.Code)

    var response map[string]interface{}
    err = json.Unmarshal(w.Body.Bytes(), &response)
    assert.NoError(t, err)

    assert.False(t, response["success"].(bool))
    assert.Contains(t, response["error"].(string), "Format file tidak didukung")
}

func TestPredictItemHandler_ServiceError(t *testing.T) {
    // 1. Arrange
    gin.SetMode(gin.TestMode)

    // Mock service yang akan return error
    mockService := &mockAIPredictionService{
        shouldReturnError: true,
    }

    predictionController := NewPredictionController(mockService)

    router := gin.Default()
    router.POST("/predict/image", predictionController.PredictItemHandler)

    // Buat valid image request
    mockImageData := []byte("fake image data")
    body, contentType, err := createMultipartFormData("file", "test.jpg", mockImageData)
    assert.NoError(t, err)

    req, err := http.NewRequest("POST", "/predict/image", body)
    assert.NoError(t, err)
    req.Header.Set("Content-Type", contentType)

    // 2. Act
    w := httptest.NewRecorder()
    router.ServeHTTP(w, req)

    // 3. Assert
    assert.Equal(t, http.StatusInternalServerError, w.Code)

    var response map[string]interface{}
    err = json.Unmarshal(w.Body.Bytes(), &response)
    assert.NoError(t, err)

    assert.False(t, response["success"].(bool))
    assert.Contains(t, response["error"].(string), "Gagal melakukan prediksi")
}

func TestPredictItemHandler_LargeFile(t *testing.T) {
    // 1. Arrange
    gin.SetMode(gin.TestMode)

    mockService := &mockAIPredictionService{}
    predictionController := NewPredictionController(mockService)

    router := gin.Default()
    router.POST("/predict/image", predictionController.PredictItemHandler)

    // Buat file yang besar (> 10MB)
    largeFileData := make([]byte, 11*1024*1024) // 11MB
    for i := range largeFileData {
        largeFileData[i] = byte(i % 256)
    }

    body, contentType, err := createMultipartFormData("file", "large_test.jpg", largeFileData)
    assert.NoError(t, err)

    req, err := http.NewRequest("POST", "/predict/image", body)
    assert.NoError(t, err)
    req.Header.Set("Content-Type", contentType)

    // 2. Act
    w := httptest.NewRecorder()
    router.ServeHTTP(w, req)

    // 3. Assert
    assert.Equal(t, http.StatusBadRequest, w.Code)

    var response map[string]interface{}
    err = json.Unmarshal(w.Body.Bytes(), &response)
    assert.NoError(t, err)

    assert.False(t, response["success"].(bool))
    assert.Contains(t, response["error"].(string), "Ukuran file terlalu besar")
}

// Benchmark test untuk performance
func BenchmarkPredictItemHandler(b *testing.B) {
    gin.SetMode(gin.TestMode)

    mockService := &mockAIPredictionService{}
    predictionController := NewPredictionController(mockService)

    router := gin.Default()
    router.POST("/predict/image", predictionController.PredictItemHandler)

    // Prepare request
    mockImageData := []byte("fake image data for benchmark")
    body, contentType, err := createMultipartFormData("file", "benchmark.jpg", mockImageData)
    if err != nil {
        b.Fatal(err)
    }

    req, err := http.NewRequest("POST", "/predict/image", body)
    if err != nil {
        b.Fatal(err)
    }
    req.Header.Set("Content-Type", contentType)

    // Run benchmark
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        w := httptest.NewRecorder()
        router.ServeHTTP(w, req)
    }
}