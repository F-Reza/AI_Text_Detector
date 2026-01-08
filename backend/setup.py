# setup.py
import subprocess
import sys
import os

def install_requirements():
    print("Installing required packages...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    
    # Download NLTK data
    import nltk
    print("Downloading NLTK data...")
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('averaged_perceptron_tagger')
    
    print("\n✓ All dependencies installed successfully!")
    print("\nTo start the backend server:")
    print("  python app.py")
    print("\nThen open frontend/index.html in your browser")

if __name__ == "__main__":
    install_requirements()