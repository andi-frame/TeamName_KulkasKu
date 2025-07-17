cd backend_ai

instal venv
python -m venv venv
source venv/Scripts/activate

install lib
pip install -r requirements.txt

key api:
Google Gemini API Key:
Pergi ke Google AI Studio
Login dengan akun Google
Buat project baru
Generate API key
Copy API key ke file .env

Google Cloud Vision (Optional):
Pergi ke Google Cloud Console
Buat project baru atau pilih existing
Enable Vision API
Buat Service Account
Download JSON credentials
Set path ke file JSON di .env

run 
python main.py or uvicorn main:app --reload