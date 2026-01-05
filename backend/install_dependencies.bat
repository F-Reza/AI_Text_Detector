@echo off
echo Installing AI Detector Dependencies...
echo.

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

echo.
echo Downloading NLTK data...
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

echo.
echo Installation complete!
echo Run: python app.py
pause