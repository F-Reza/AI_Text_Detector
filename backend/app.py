from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import math
import json
import os
from datetime import datetime
import base64
from werkzeug.utils import secure_filename

# Try to import PDF libraries
try:
    import PyPDF2
    PDF_SUPPORT = True
except ImportError:
    try:
        import pypdf as PyPDF2
        PDF_SUPPORT = True
    except ImportError:
        PDF_SUPPORT = False

try:
    import pdfplumber
    PDFPLUMBER_SUPPORT = True
except ImportError:
    PDFPLUMBER_SUPPORT = False

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'doc', 'docx'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

class AIDetector:
    """AI Detector with PDF support"""
    
    def __init__(self):
        # Common AI writing patterns
        self.ai_indicators = [
            "as an ai", "artificial intelligence", "i'm sorry", "i cannot",
            "based on the information", "according to", "it is important to",
            "in conclusion", "overall", "the study found", "research shows",
            "it should be noted", "additionally", "furthermore", "moreover",
            "however", "therefore", "consequently", "thus", "hence",
            "on the other hand", "in contrast", "similarly", "likewise"
        ]
        
        # Common human writing patterns
        self.human_indicators = [
            "i think", "i believe", "in my opinion", "personally",
            "actually", "basically", "kind of", "sort of", "you know",
            "i mean", "well", "anyway", "honestly", "frankly",
            "to be honest", "if you ask me", "the thing is", "you see"
        ]
    
    def extract_text_from_pdf(self, file_path):
        """Extract text from PDF file using multiple methods"""
        text = ""
        
        if not PDF_SUPPORT and not PDFPLUMBER_SUPPORT:
            raise ImportError("No PDF libraries installed. Run: pip install pypdf pdfplumber")
        
        # Method 1: Try pdfplumber first (better for complex PDFs)
        if PDFPLUMBER_SUPPORT:
            try:
                with pdfplumber.open(file_path) as pdf:
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
                if text.strip():
                    return text.strip()
            except Exception as e:
                print(f"pdfplumber failed: {e}")
        
        # Method 2: Try PyPDF2/pypdf
        if PDF_SUPPORT:
            try:
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page_num in range(len(pdf_reader.pages)):
                        page = pdf_reader.pages[page_num]
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
            except Exception as e:
                print(f"PyPDF2 failed: {e}")
        
        # Method 3: Try simple text extraction
        if not text.strip():
            try:
                # Try to read as binary and decode
                with open(file_path, 'rb') as file:
                    raw_data = file.read()
                    # Try common encodings
                    for encoding in ['utf-8', 'latin-1', 'cp1252']:
                        try:
                            text = raw_data.decode(encoding)
                            if len(text) > 100:  # Reasonable amount of text
                                break
                        except:
                            continue
            except:
                pass
        
        return text.strip() if text.strip() else ""
    
    def extract_text_from_file(self, file_path, filename):
        """Extract text from various file types"""
        _, ext = os.path.splitext(filename.lower())
        
        if ext == '.pdf':
            return self.extract_text_from_pdf(file_path)
        elif ext == '.txt':
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        elif ext in ['.doc', '.docx']:
            # For DOC/DOCX, try to extract text from binary
            try:
                with open(file_path, 'rb') as f:
                    content = f.read()
                    # Try UTF-8 decode first
                    try:
                        return content.decode('utf-8', errors='ignore')
                    except:
                        # Try other encodings
                        for encoding in ['latin-1', 'cp1252', 'iso-8859-1']:
                            try:
                                return content.decode(encoding, errors='ignore')
                            except:
                                continue
                        return ""
            except:
                return ""
        else:
            raise ValueError(f"Unsupported file type: {ext}")
    
    def analyze_text(self, text):
        """Analyze text for AI probability"""
        text = text.strip()
        
        if len(text) < 50:  # Minimum characters
            return self._error_result("Text too short (minimum 50 characters)")
        
        # Extract features
        features = self._extract_features(text)
        
        # Calculate scores
        ai_score = self._calculate_ai_score(features, text.lower())
        human_score = self._calculate_human_score(features, text.lower())
        
        # Calculate probabilities
        total = ai_score + human_score
        if total == 0:
            ai_prob = 50
            human_prob = 50
        else:
            ai_prob = (ai_score / total) * 100
            human_prob = (human_score / total) * 100
        
        # Determine result
        is_ai = ai_prob > human_prob
        confidence = min(100, abs(ai_prob - human_prob) * 1.2)
        
        # Generate analysis
        analysis = self._generate_analysis(features, text.lower())
        
        return {
            "success": True,
            "ai_probability": round(ai_prob, 1),
            "human_probability": round(human_prob, 1),
            "is_ai_generated": is_ai,
            "confidence": round(confidence, 1),
            "text_metrics": {
                "words": features['word_count'],
                "sentences": features['sentence_count'],
                "characters": len(text),
                "paragraphs": len([p for p in text.split('\n\n') if p.strip()]),
                "reading_time": round(features['word_count'] / 200, 1),
                "file_type": "text"
            },
            "analysis": analysis,
            "features": {
                "lexical_diversity": round(features['lexical_diversity'], 3),
                "avg_sentence_length": round(features['avg_sentence_length'], 1),
                "sentence_variation": round(features['sentence_variation'], 3)
            }
        }
    
    def _error_result(self, message):
        return {
            "success": False,
            "error": message,
            "ai_probability": 0,
            "human_probability": 0,
            "is_ai_generated": False,
            "confidence": 0
        }
    
    def _extract_features(self, text):
        """Extract text features"""
        # Split into words
        words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
        
        # Split into sentences
        sentences = []
        current = ""
        for char in text:
            current += char
            if char in '.!?':
                sentences.append(current.strip())
                current = ""
        if current.strip():
            sentences.append(current.strip())
        
        sentences = [s for s in sentences if s and len(s) > 5]
        
        # Calculate metrics
        word_count = len(words)
        sentence_count = len(sentences)
        
        # Lexical diversity
        if word_count > 0:
            unique_words = set(words)
            lexical_diversity = len(unique_words) / word_count
        else:
            lexical_diversity = 0
        
        # Sentence statistics
        if sentence_count > 0:
            words_per_sentence = [len(re.findall(r'\b[a-zA-Z]+\b', s.lower())) for s in sentences]
            avg_sentence_length = sum(words_per_sentence) / sentence_count
            
            if avg_sentence_length > 0:
                variance = sum((x - avg_sentence_length) ** 2 for x in words_per_sentence) / max(1, sentence_count)
                sentence_variation = math.sqrt(variance) / avg_sentence_length if avg_sentence_length > 0 else 0
            else:
                sentence_variation = 0
        else:
            avg_sentence_length = 0
            sentence_variation = 0
        
        return {
            'word_count': word_count,
            'sentence_count': sentence_count,
            'lexical_diversity': lexical_diversity,
            'avg_sentence_length': avg_sentence_length,
            'sentence_variation': sentence_variation
        }
    
    def _calculate_ai_score(self, features, text_lower):
        score = 0
        
        # Lexical diversity (AI tends to have lower diversity)
        diversity = features['lexical_diversity']
        if diversity < 0.5:
            score += 0.4
        elif diversity < 0.6:
            score += 0.2
        elif diversity < 0.7:
            score += 0.1
        
        # Sentence variation (AI tends to be more consistent)
        variation = features['sentence_variation']
        if variation < 0.2:
            score += 0.3
        elif variation < 0.3:
            score += 0.2
        elif variation < 0.4:
            score += 0.1
        
        # AI phrases
        for phrase in self.ai_indicators:
            if phrase in text_lower:
                score += 0.2
                break
        
        # Check for perfect grammar patterns
        if features['sentence_count'] > 0:
            # Count sentences that start with capital letter and end with punctuation
            proper_sentences = sum(1 for s in text_lower.split('. ') if s and s[0].isupper())
            if proper_sentences / features['sentence_count'] > 0.8:
                score += 0.1
        
        return max(0, min(1, score))
    
    def _calculate_human_score(self, features, text_lower):
        score = 0
        
        # Lexical diversity (humans tend to have higher diversity)
        diversity = features['lexical_diversity']
        if diversity > 0.8:
            score += 0.4
        elif diversity > 0.7:
            score += 0.3
        elif diversity > 0.6:
            score += 0.2
        
        # Sentence variation (humans vary sentence length more)
        variation = features['sentence_variation']
        if variation > 0.6:
            score += 0.3
        elif variation > 0.5:
            score += 0.2
        elif variation > 0.4:
            score += 0.1
        
        # Human phrases
        for phrase in self.human_indicators:
            if phrase in text_lower:
                score += 0.3
                break
        
        # Informal elements
        informal_count = text_lower.count("'") + text_lower.count("...") + text_lower.count("--")
        if informal_count > 2:
            score += min(0.3, informal_count * 0.05)
        
        # Contractions (more common in human writing)
        contractions = ["i'm", "you're", "he's", "she's", "it's", "we're", "they're",
                       "can't", "won't", "don't", "doesn't", "isn't", "aren't"]
        contraction_count = sum(text_lower.count(cont) for cont in contractions)
        if contraction_count > 0:
            score += min(0.2, contraction_count * 0.05)
        
        return max(0, min(1, score))
    
    def _generate_analysis(self, features, text_lower):
        analysis = []
        
        # Diversity analysis
        diversity = features['lexical_diversity']
        if diversity < 0.5:
            analysis.append(f"Very low lexical diversity ({diversity:.2f}) - strong indicator of AI content")
        elif diversity < 0.6:
            analysis.append(f"Low lexical diversity ({diversity:.2f}) - common in AI-generated text")
        elif diversity > 0.75:
            analysis.append(f"High lexical diversity ({diversity:.2f}) - suggests human authorship")
        else:
            analysis.append(f"Moderate lexical diversity ({diversity:.2f})")
        
        # Sentence variation analysis
        variation = features['sentence_variation']
        if variation < 0.3:
            analysis.append(f"Low sentence variation ({variation:.2f}) - AI often uses consistent sentence lengths")
        elif variation > 0.5:
            analysis.append(f"High sentence variation ({variation:.2f}) - indicates human writing style")
        
        # Check for specific patterns
        ai_phrase_found = any(phrase in text_lower for phrase in self.ai_indicators[:5])
        human_phrase_found = any(phrase in text_lower for phrase in self.human_indicators[:5])
        
        if ai_phrase_found:
            analysis.append("Contains phrases commonly used by AI language models")
        if human_phrase_found:
            analysis.append("Contains conversational markers typical of human writing")
        
        # Word count analysis
        word_count = features['word_count']
        if word_count < 100:
            analysis.append("Short text - analysis confidence may be lower")
        elif word_count > 500:
            analysis.append("Long text analyzed - higher confidence in results")
        
        return analysis

# Initialize detector
detector = AIDetector()
analysis_history = []

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def home():
    return jsonify({
        "name": "AI Detector API with PDF Support",
        "version": "1.2.0",
        "status": "running",
        "pdf_support": PDF_SUPPORT or PDFPLUMBER_SUPPORT,
        "supported_files": list(ALLOWED_EXTENSIONS),
        "max_file_size": f"{MAX_FILE_SIZE // (1024*1024)}MB"
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload and analysis"""
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({"success": False, "error": "No file provided"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"success": False, "error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                "success": False, 
                "error": f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            }), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Extract text from file
            text = detector.extract_text_from_file(filepath, filename)
            
            if not text or len(text.strip()) < 50:
                return jsonify({
                    "success": False,
                    "error": "Could not extract sufficient text from file (minimum 50 characters required)"
                }), 400
            
            # Analyze the text
            result = detector.analyze_text(text)
            
            if result['success']:
                # Add file info to result
                result['file_info'] = {
                    'filename': filename,
                    'file_type': filename.rsplit('.', 1)[1].lower(),
                    'extracted_characters': len(text),
                    'extracted_words': len(text.split())
                }
                
                # Add to history
                history_entry = {
                    'id': len(analysis_history) + 1,
                    'timestamp': datetime.now().isoformat(),
                    'filename': filename,
                    'text_preview': text[:150] + '...' if len(text) > 150 else text,
                    'result': {
                        'ai_probability': result['ai_probability'],
                        'is_ai_generated': result['is_ai_generated']
                    }
                }
                analysis_history.append(history_entry)
            
            # Clean up file
            try:
                os.remove(filepath)
            except:
                pass
            
            return jsonify(result)
            
        except ImportError as e:
            return jsonify({
                "success": False,
                "error": str(e),
                "solution": "Run: pip install pypdf pdfplumber"
            }), 500
            
        except Exception as e:
            # Clean up file on error
            try:
                os.remove(filepath)
            except:
                pass
            
            return jsonify({
                "success": False,
                "error": f"Error processing file: {str(e)}"
            }), 500
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Upload error: {str(e)}"
        }), 500

@app.route('/api/detect', methods=['POST'])
def detect_text():
    """Handle direct text analysis"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                "success": False,
                "error": "No text provided"
            }), 400
        
        text = data['text'].strip()
        
        if len(text) < 50:
            return jsonify({
                "success": False,
                "error": "Text too short (minimum 50 characters)"
            }), 400
        
        result = detector.analyze_text(text)
        
        if result['success']:
            history_entry = {
                'id': len(analysis_history) + 1,
                'timestamp': datetime.now().isoformat(),
                'text_preview': text[:150] + '...' if len(text) > 150 else text,
                'result': {
                    'ai_probability': result['ai_probability'],
                    'is_ai_generated': result['is_ai_generated']
                }
            }
            analysis_history.append(history_entry)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Analysis error: {str(e)}"
        }), 500

@app.route('/api/supported-formats', methods=['GET'])
def supported_formats():
    """Get supported file formats"""
    return jsonify({
        "success": True,
        "formats": list(ALLOWED_EXTENSIONS),
        "max_size_mb": MAX_FILE_SIZE // (1024 * 1024),
        "pdf_libraries_installed": PDF_SUPPORT or PDFPLUMBER_SUPPORT,
        "installation_command": "pip install pypdf pdfplumber" if not (PDF_SUPPORT or PDFPLUMBER_SUPPORT) else None
    })

@app.route('/api/history', methods=['GET'])
def get_history():
    """Get analysis history"""
    limit = min(int(request.args.get('limit', 10)), 50)
    return jsonify({
        "success": True,
        "history": analysis_history[-limit:][::-1],  # Most recent first
        "total": len(analysis_history)
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "pdf_support": PDF_SUPPORT or PDFPLUMBER_SUPPORT,
        "uploads_folder_exists": os.path.exists(UPLOAD_FOLDER),
        "version": "1.2.0"
    })

if __name__ == '__main__':
    print("=" * 60)
    print("AI Detector with PDF Support")
    print("=" * 60)
    print(f"PDF Support: {'ENABLED' if PDF_SUPPORT or PDFPLUMBER_SUPPORT else 'DISABLED'}")
    if not (PDF_SUPPORT or PDFPLUMBER_SUPPORT):
        print("To enable PDF support, run: pip install pypdf pdfplumber")
    print(f"Upload folder: {os.path.abspath(UPLOAD_FOLDER)}")
    print(f"Max file size: {MAX_FILE_SIZE // (1024*1024)}MB")
    print("Supported files:", ", ".join(ALLOWED_EXTENSIONS))
    print("=" * 60)
    print("API Endpoints:")
    print("  POST /api/upload    - Upload file for analysis")
    print("  POST /api/detect    - Analyze text directly")
    print("  GET  /api/health    - Health check")
    print("  GET  /api/history   - Analysis history")
    print("=" * 60)
    print("Starting server on http://localhost:5000")
    print("Press Ctrl+C to stop")
    
    app.run(debug=True, port=5000, host='0.0.0.0')