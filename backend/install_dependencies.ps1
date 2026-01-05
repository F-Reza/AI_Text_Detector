Write-Host "Installing AI Detector Dependencies..." -ForegroundColor Green
Write-Host ""

pip install flask==3.0.0
pip install flask-cors==4.0.0
pip install pypdf==4.2.0
pip install pdfplumber==0.11.0
pip install scikit-learn==1.4.0
pip install numpy==1.24.3
pip install pandas==2.0.3
pip install nltk==3.8.1
pip install textstat==0.7.3
pip install joblib==1.3.2
pip install scipy==1.11.4

Write-Host ""
Write-Host "Downloading NLTK data..." -ForegroundColor Yellow
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host "Run: python app.py" -ForegroundColor Cyan
Read-Host "Press Enter to continue"