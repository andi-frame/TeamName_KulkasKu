package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/textproto"
	"time"
)

// Implementasi service prediksi AI
type aiPredictionServiceImpl struct {
	pythonServiceURL string
	httpClient       *http.Client
}

// Constructor untuk membuat service prediksi
func NewAIPredictionService(pythonURL string) AIPredictionService {
	return &aiPredictionServiceImpl{
		pythonServiceURL: pythonURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// Implementasi fungsi PredictItem
func (s *aiPredictionServiceImpl) PredictItem(imageData []byte) (*AIResult, error) {
	fmt.Println("Memulai proses pemanggilan layanan AI Python...")

	// 1. Siapkan request multipart/form-data dengan gambar
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	h := make(textproto.MIMEHeader)
	h.Set("Content-Disposition", `form-data; name="file"; filename="image.jpg"`)
	h.Set("Content-Type", "image/jpeg")
	part, err := writer.CreatePart(h)
	if err != nil {
		return nil, fmt.Errorf("gagal membuat form file: %w", err)
	}

	_, err = io.Copy(part, bytes.NewReader(imageData))
	if err != nil {
		return nil, fmt.Errorf("gagal menulis data gambar: %w", err)
	}

	err = writer.Close()
	if err != nil {
		return nil, fmt.Errorf("gagal menutup writer: %w", err)
	}

	// 2. Buat HTTP POST request ke layanan AI Python
	req, err := http.NewRequest("POST", s.pythonServiceURL+"/predict-item", body)
	if err != nil {
		return nil, fmt.Errorf("gagal membuat request: %w", err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	// 3. Kirim request dan dapatkan respons
	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("gagal menghubungi layanan AI: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("layanan AI mengembalikan status error: %s, body: %s", resp.Status, string(bodyBytes))
	}

	// 4. Baca dan parse hasil JSON dari Python
	var result AIResult
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("gagal mem-parsing respons AI: %w", err)
	}

	// 5. Kembalikan hasilnya
	fmt.Printf("Berhasil mendapatkan analisis dari layanan AI: %+v\n", result)
	return &result, nil
}
