from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import math
import os
import numpy as np
from datetime import datetime
from werkzeug.utils import secure_filename
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
import textstat
from langdetect import detect, LangDetectException

# Download NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

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

class AdvancedAIDetector:
    """Advanced AI Detector with enhanced linguistic analysis"""
    
    def __init__(self):
        # Initialize stopwords
        try:
            self.stop_words = set(stopwords.words('english'))
        except:
            nltk.download('stopwords', quiet=True)
            self.stop_words = set(stopwords.words('english'))
        
        # Enhanced AI patterns
        self.ai_phrases = [
            "as an ai", "artificial intelligence", "i'm an ai", "i'm a language model",
            "based on the information provided", "according to my knowledge",
            "it is important to note", "in conclusion", "overall", "furthermore",
            "moreover", "additionally", "however", "therefore", "consequently",
            "thus", "hence", "in summary", "to summarize", "the study found",
            "research indicates", "studies have shown", "it can be concluded",
            "the findings suggest", "this analysis demonstrates", "it should be noted",
            "it is worth noting", "it is interesting to note"
        ]
        
        # Enhanced human patterns
        self.human_phrases = [
            "i think", "i believe", "in my opinion", "personally",
            "actually", "basically", "kind of", "sort of", "you know",
            "i mean", "well", "anyway", "honestly", "frankly",
            "to be honest", "if you ask me", "the thing is", "you see",
            "guess what", "by the way", "as a matter of fact", "like",
            "um", "uh", "hmm", "oh", "wow", "really", "seriously"
        ]
        
        # Contractions (more common in human writing)
        self.contractions = [
            "i'm", "you're", "he's", "she's", "it's", "we're", "they're",
            "can't", "won't", "don't", "doesn't", "isn't", "aren't",
            "wasn't", "weren't", "haven't", "hasn't", "hadn't",
            "wouldn't", "couldn't", "shouldn't"
        ]
        
        print("✓ AI Detector initialized with enhanced linguistic analysis")
    
    def extract_text_from_pdf(self, file_path):
        """Extract text from PDF file"""
        text = ""
        
        if not PDF_SUPPORT and not PDFPLUMBER_SUPPORT:
            raise ImportError("No PDF libraries installed. Install with: pip install pypdf pdfplumber")
        
        # Try pdfplumber first
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
                print(f"pdfplumber failed: {str(e)[:100]}")
        
        # Try PyPDF2 as fallback
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
                print(f"PyPDF2 failed: {str(e)[:100]}")
        
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
            # Try docx2txt if available
            try:
                import docx2txt
                return docx2txt.process(file_path)
            except ImportError:
                # Simple text extraction
                try:
                    with open(file_path, 'rb') as f:
                        content = f.read()
                        # Try different encodings
                        for encoding in ['utf-8', 'latin-1', 'cp1252']:
                            try:
                                return content.decode(encoding, errors='ignore')
                            except:
                                continue
                        return ""
                except:
                    return ""
        else:
            raise ValueError(f"Unsupported file type: {ext}")
    
    def extract_features(self, text):
        """Extract comprehensive text features"""
        if not text or len(text.strip()) < 10:
            return None
        
        text_lower = text.lower()
        
        # Tokenization with error handling
        try:
            words = word_tokenize(text)
            sentences = sent_tokenize(text)
        except:
            # Fallback to simple tokenization
            words = [w for w in re.findall(r'\b[a-zA-Z]+\b', text)]
            sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
        
        # Filter words
        words_clean = [w.lower() for w in words if w.isalpha()]
        word_count = len(words_clean)
        sentence_count = len(sentences)
        
        if word_count == 0 or sentence_count == 0:
            return None
        
        # 1. Lexical Features
        unique_words = set(words_clean)
        lexical_diversity = len(unique_words) / word_count if word_count > 0 else 0
        
        # 2. Readability Scores
        try:
            flesch_score = textstat.flesch_reading_ease(text)
        except:
            flesch_score = 60  # Default if calculation fails
        
        # 3. Sentence Structure
        words_per_sentence = []
        for s in sentences:
            try:
                words_in_sent = len(word_tokenize(s))
            except:
                words_in_sent = len([w for w in re.findall(r'\b[a-zA-Z]+\b', s)])
            words_per_sentence.append(words_in_sent)
        
        if words_per_sentence:
            avg_sentence_length = np.mean(words_per_sentence)
            if avg_sentence_length > 0:
                sentence_variation = np.std(words_per_sentence) / avg_sentence_length
            else:
                sentence_variation = 0
        else:
            avg_sentence_length = 0
            sentence_variation = 0
        
        # 4. Word Length
        word_lengths = [len(w) for w in words_clean]
        avg_word_length = np.mean(word_lengths) if word_lengths else 0
        
        # 5. Punctuation Features
        punctuation_count = sum(1 for char in text if char in '.,!?;:')
        punctuation_density = punctuation_count / word_count if word_count > 0 else 0
        
        # 6. Stopword Ratio
        stopword_count = sum(1 for w in words_clean if w in self.stop_words)
        stopword_ratio = stopword_count / word_count if word_count > 0 else 0
        
        # 7. Pattern Matching
        ai_pattern_score = sum(text_lower.count(phrase) for phrase in self.ai_phrases[:10])
        human_pattern_score = sum(text_lower.count(phrase) for phrase in self.human_phrases[:10])
        contraction_score = sum(text_lower.count(cont) for cont in self.contractions[:10])
        
        # 8. Burstiness (simplified)
        if len(words_per_sentence) > 1:
            burstiness = (np.var(words_per_sentence) - np.mean(words_per_sentence)) / (
                         np.var(words_per_sentence) + np.mean(words_per_sentence) + 0.001)
        else:
            burstiness = 0
        
        # 9. Repetition detection (simplified)
        if len(words_clean) > 10:
            # Check for repeated bigrams
            bigrams = [f"{words_clean[i]} {words_clean[i+1]}" for i in range(len(words_clean)-1)]
            unique_bigrams = set(bigrams)
            repetition_score = 1 - (len(unique_bigrams) / len(bigrams)) if bigrams else 0
        else:
            repetition_score = 0
        
        return {
            'lexical_diversity': float(lexical_diversity),
            'flesch_score': float(flesch_score),
            'avg_sentence_length': float(avg_sentence_length),
            'sentence_variation': float(sentence_variation),
            'avg_word_length': float(avg_word_length),
            'punctuation_density': float(punctuation_density),
            'stopword_ratio': float(stopword_ratio),
            'ai_pattern_score': float(ai_pattern_score),
            'human_pattern_score': float(human_pattern_score),
            'contraction_score': float(contraction_score),
            'burstiness': float(burstiness),
            'repetition_score': float(repetition_score),
            'word_count': int(word_count),
            'sentence_count': int(sentence_count),
            'character_count': len(text)
        }
    
    def calculate_ai_probability(self, features):
        """Calculate AI probability using weighted features"""
        if not features:
            return 50.0
        
        score = 0.0
        max_score = 0.0
        
        # Feature weights (based on importance)
        weights = {
            'lexical_diversity': 15,
            'flesch_score': 10,
            'avg_sentence_length': 10,
            'sentence_variation': 12,
            'stopword_ratio': 8,
            'ai_pattern_score': 15,
            'human_pattern_score': -15,  # Negative weight for human patterns
            'contraction_score': -10,    # Negative weight for contractions
            'burstiness': 10,
            'repetition_score': 8
        }
        
        # Calculate score for each feature
        # 1. Lexical diversity (AI tends to have lower diversity)
        div = features['lexical_diversity']
        if div < 0.5:
            score += weights['lexical_diversity'] * 0.8
        elif div < 0.6:
            score += weights['lexical_diversity'] * 0.5
        elif div < 0.7:
            score += weights['lexical_diversity'] * 0.2
        
        # 2. Readability (AI tends to be more readable)
        if features['flesch_score'] > 70:
            score += weights['flesch_score'] * 0.6
        elif features['flesch_score'] > 60:
            score += weights['flesch_score'] * 0.3
        
        # 3. Sentence length (AI tends to use longer sentences)
        if features['avg_sentence_length'] > 25:
            score += weights['avg_sentence_length'] * 0.7
        elif features['avg_sentence_length'] > 20:
            score += weights['avg_sentence_length'] * 0.4
        elif features['avg_sentence_length'] > 15:
            score += weights['avg_sentence_length'] * 0.2
        
        # 4. Sentence variation (AI tends to be more uniform)
        if features['sentence_variation'] < 0.3:
            score += weights['sentence_variation'] * 0.6
        elif features['sentence_variation'] < 0.4:
            score += weights['sentence_variation'] * 0.3
        
        # 5. Stopword ratio (AI uses fewer stopwords)
        if features['stopword_ratio'] < 0.3:
            score += weights['stopword_ratio'] * 0.5
        elif features['stopword_ratio'] < 0.4:
            score += weights['stopword_ratio'] * 0.2
        
        # 6. AI patterns
        score += weights['ai_pattern_score'] * min(0.8, features['ai_pattern_score'] / 5)
        
        # 7. Human patterns (negative)
        score += weights['human_pattern_score'] * min(0.8, features['human_pattern_score'] / 5)
        
        # 8. Contractions (negative)
        score += weights['contraction_score'] * min(0.6, features['contraction_score'] / 5)
        
        # 9. Burstiness (AI has negative burstiness)
        if features['burstiness'] < -0.1:
            score += weights['burstiness'] * 0.6
        elif features['burstiness'] < 0:
            score += weights['burstiness'] * 0.3
        
        # 10. Repetition (AI can be repetitive)
        if features['repetition_score'] > 0.1:
            score += weights['repetition_score'] * 0.5
        elif features['repetition_score'] > 0.05:
            score += weights['repetition_score'] * 0.2
        
        # Calculate maximum possible score
        max_score = sum(abs(w) for w in weights.values())
        
        # Convert to percentage (0-100)
        if max_score > 0:
            normalized = (score + max_score) / (2 * max_score) * 100
            return max(0, min(100, normalized))
        
        return 50.0
    
    def analyze_text_with_segments(self, text):
        """Analyze text and return detailed results"""
        text = text.strip()
        
        if len(text) < 50:
            return self._error_result("Text too short (minimum 50 characters)")
        
        # Check language (simplified)
        try:
            if detect(text) != 'en':
                return self._error_result("Currently only English text is supported")
        except:
            pass  # Continue anyway
        
        # Extract features
        features = self.extract_features(text)
        if not features:
            return self._error_result("Could not extract features from text")
        
        # Calculate probabilities
        ai_prob = self.calculate_ai_probability(features)
        human_prob = 100 - ai_prob
        
        # Determine verdict
        is_ai = ai_prob > 60  # Threshold for AI detection
        confidence = min(100, abs(ai_prob - 50) * 2)  # Confidence based on distance from 50%
        
        # Generate analysis insights
        analysis = self._generate_analysis(features, text.lower())
        
        # Split into sentences for highlighting
        try:
            sentences = sent_tokenize(text)
        except:
            # Fallback to simple sentence splitting
            sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
        
        sentence_analysis = []
        for sentence in sentences:
            if len(sentence.split()) < 3:
                continue
                
            sent_features = self.extract_features(sentence)
            if not sent_features:
                continue
                
            sent_ai_prob = self.calculate_ai_probability(sent_features)
            
            # Determine sentence type
            if sent_ai_prob > 70:
                segment_type = "ai"
                description = "Likely AI-generated"
            elif sent_ai_prob > 45:
                segment_type = "mixed"
                description = "Possibly AI-assisted"
            else:
                segment_type = "human"
                description = "Likely human-written"
            
            sentence_analysis.append({
                'text': sentence,
                'ai_probability': round(sent_ai_prob, 1),
                'type': segment_type,
                'description': description,
                'features': {
                    'words': len(sentence.split()),
                    'ai_patterns': sum(sentence.lower().count(p) for p in self.ai_phrases[:5])
                }
            })
        
        # Calculate reading time (200 WPM average)
        reading_time = features['word_count'] / 200
        
        return {
            "success": True,
            "ai_probability": round(ai_prob, 1),
            "human_probability": round(human_prob, 1),
            "is_ai_generated": is_ai,
            "confidence": round(confidence, 1),
            "text_metrics": {
                "words": features['word_count'],
                "sentences": features['sentence_count'],
                "characters": features['character_count'],
                "paragraphs": len([p for p in text.split('\n\n') if p.strip()]),
                "reading_time": round(reading_time, 1),
                "flesch_reading_ease": round(features.get('flesch_score', 60), 1)
            },
            "analysis": analysis,
            "features": {
                "lexical_diversity": round(features['lexical_diversity'], 3),
                "avg_sentence_length": round(features['avg_sentence_length'], 1),
                "sentence_variation": round(features['sentence_variation'], 3),
                "stopword_ratio": round(features['stopword_ratio'], 3),
                "burstiness": round(features.get('burstiness', 0), 3),
                "repetition_score": round(features.get('repetition_score', 0), 3)
            },
            "pattern_analysis": {
                "ai_patterns_detected": int(features['ai_pattern_score']),
                "human_patterns_detected": int(features['human_pattern_score']),
                "contractions_detected": int(features['contraction_score'])
            },
            "sentence_analysis": sentence_analysis,
            "extracted_text": text
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
    
    def _generate_analysis(self, features, text_lower):
        """Generate human-readable analysis"""
        analysis = []
        
        # Lexical diversity
        div = features['lexical_diversity']
        if div < 0.5:
            analysis.append(f"Very low lexical diversity ({div:.2f}) - strong indicator of AI content")
        elif div < 0.6:
            analysis.append(f"Low lexical diversity ({div:.2f}) - common in AI-generated text")
        elif div > 0.75:
            analysis.append(f"High lexical diversity ({div:.2f}) - suggests human authorship")
        
        # Sentence structure
        variation = features['sentence_variation']
        if variation < 0.25:
            analysis.append(f"Uniform sentence structure ({variation:.2f}) - typical of AI models")
        elif variation > 0.5:
            analysis.append(f"Varied sentence structure ({variation:.2f}) - characteristic of human writing")
        
        # Readability
        if features['flesch_score'] > 70:
            analysis.append(f"High readability score ({features['flesch_score']:.0f}) - AI tends to produce clearer text")
        elif features['flesch_score'] < 50:
            analysis.append(f"Lower readability ({features['flesch_score']:.0f}) - more common in human writing")
        
        # Patterns
        if features['ai_pattern_score'] > 1:
            analysis.append(f"Contains {int(features['ai_pattern_score'])} AI characteristic phrases")
        
        if features['human_pattern_score'] > 1:
            analysis.append(f"Contains {int(features['human_pattern_score'])} conversational human phrases")
        
        if features['contraction_score'] > 2:
            analysis.append(f"Uses {int(features['contraction_score'])} contractions - common in human writing")
        
        # Burstiness
        if features.get('burstiness', 0) < -0.1:
            analysis.append(f"Low burstiness ({features['burstiness']:.2f}) - AI text tends to be more consistent")
        
        return analysis

# Initialize detector
detector = AdvancedAIDetector()
analysis_history = []

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def home():
    return jsonify({
        "name": "AI Detector Pro",
        "version": "2.0.0",
        "status": "running",
        "pdf_support": PDF_SUPPORT or PDFPLUMBER_SUPPORT,
        "supported_files": list(ALLOWED_EXTENSIONS),
        "max_file_size": f"{MAX_FILE_SIZE // (1024*1024)}MB",
        "features": "Enhanced linguistic analysis"
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload and analysis"""
    try:
        if 'file' not in request.files:
            return jsonify({"success": False, "error": "No file provided"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"success": False, "error": "No file selected"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                "success": False, 
                "error": f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            }), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Extract text from file
            text = detector.extract_text_from_file(filepath, filename)
            
            if not text or len(text.strip()) < 50:
                os.remove(filepath)
                return jsonify({
                    "success": False,
                    "error": "Could not extract sufficient text from file (minimum 50 characters)"
                }), 400
            
            # Analyze the text
            result = detector.analyze_text_with_segments(text)
            
            if result['success']:
                # Add file info
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
                        'is_ai_generated': result['is_ai_generated'],
                        'confidence': result['confidence']
                    }
                }
                analysis_history.append(history_entry)
            
            # Clean up
            try:
                os.remove(filepath)
            except:
                pass
            
            return jsonify(result)
            
        except ImportError as e:
            try:
                os.remove(filepath)
            except:
                pass
            return jsonify({
                "success": False,
                "error": str(e),
                "solution": "For PDF/DOC support: pip install pypdf pdfplumber docx2txt"
            }), 500
            
        except Exception as e:
            try:
                os.remove(filepath)
            except:
                pass
            return jsonify({
                "success": False,
                "error": f"Error processing file: {str(e)[:200]}"
            }), 500
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Upload error: {str(e)[:200]}"
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
        
        # Analyze the text
        result = detector.analyze_text_with_segments(text)
        
        if result['success']:
            # Add to history
            history_entry = {
                'id': len(analysis_history) + 1,
                'timestamp': datetime.now().isoformat(),
                'text_preview': text[:150] + '...' if len(text) > 150 else text,
                'result': {
                    'ai_probability': result['ai_probability'],
                    'is_ai_generated': result['is_ai_generated'],
                    'confidence': result['confidence']
                }
            }
            analysis_history.append(history_entry)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Analysis error: {str(e)[:200]}"
        }), 500

@app.route('/api/features', methods=['POST'])
def analyze_features():
    """Return detailed feature analysis"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({"success": False, "error": "No text provided"}), 400
        
        text = data['text'].strip()
        
        if len(text) < 20:
            return jsonify({"success": False, "error": "Text too short"}), 400
        
        features = detector.extract_features(text)
        
        if not features:
            return jsonify({"success": False, "error": "Could not extract features"}), 500
        
        ai_prob = detector.calculate_ai_probability(features)
        
        return jsonify({
            "success": True,
            "features": features,
            "ai_probability": round(ai_prob, 1)
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Feature analysis error: {str(e)[:200]}"
        }), 500

@app.route('/api/supported-formats', methods=['GET'])
def supported_formats():
    """Get supported file formats"""
    return jsonify({
        "success": True,
        "formats": list(ALLOWED_EXTENSIONS),
        "max_size_mb": MAX_FILE_SIZE // (1024 * 1024),
        "pdf_libraries_installed": PDF_SUPPORT or PDFPLUMBER_SUPPORT,
        "min_chars": 50,
        "recommended_chars": 200
    })

@app.route('/api/history', methods=['GET'])
def get_history():
    """Get analysis history"""
    limit = min(int(request.args.get('limit', 10)), 50)
    return jsonify({
        "success": True,
        "history": analysis_history[-limit:][::-1],
        "total": len(analysis_history)
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "pdf_support": PDF_SUPPORT or PDFPLUMBER_SUPPORT,
        "features_available": True,
        "version": "2.0.0",
        "analysis_count": len(analysis_history)
    })

@app.route('/api/benchmark', methods=['GET'])
def benchmark():
    """Run benchmark tests"""
    ai_sample = """
    Artificial intelligence represents a transformative technology that has revolutionized numerous industries. 
    By leveraging machine learning algorithms and neural networks, AI systems can process vast amounts of data 
    and identify patterns that would be difficult for humans to discern. The implementation of AI solutions 
    requires careful consideration of ethical implications and potential societal impacts. Furthermore, 
    continuous monitoring and evaluation are essential to ensure optimal performance and alignment with 
    organizational objectives. According to recent studies, AI adoption has significantly improved efficiency 
    metrics across various sectors, demonstrating the practical value of these technologies.
    """
    
    human_sample = """
    I was thinking about AI the other day, and honestly, it's kind of amazing but also pretty scary, you know? 
    Like, I use ChatGPT for help with writing sometimes, but I worry about where this is all going. Personally, 
    I think we need to be really careful with this technology. The thing is, it's developing so fast that 
    regulations can't keep up. If you ask me, we should slow down and think about the consequences. I mean, 
    just look at how it's affecting jobs already! And don't even get me started on the whole deepfake situation.
    """
    
    results = {}
    
    # Analyze AI sample
    ai_features = detector.extract_features(ai_sample)
    if ai_features:
        results['ai_sample'] = {
            "ai_probability": round(detector.calculate_ai_probability(ai_features), 1),
            "word_count": ai_features['word_count'],
            "lexical_diversity": round(ai_features['lexical_diversity'], 3)
        }
    
    # Analyze human sample
    human_features = detector.extract_features(human_sample)
    if human_features:
        results['human_sample'] = {
            "ai_probability": round(detector.calculate_ai_probability(human_features), 1),
            "word_count": human_features['word_count'],
            "lexical_diversity": round(human_features['lexical_diversity'], 3)
        }
    
    return jsonify({
        "success": True,
        "benchmark": results,
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("=" * 70)
    print("AI DETECTOR PRO - Enhanced Accuracy Edition")
    print("=" * 70)
    print(f"PDF Support: {'✓ ENABLED' if PDF_SUPPORT or PDFPLUMBER_SUPPORT else '✗ DISABLED'}")
    if not (PDF_SUPPORT or PDFPLUMBER_SUPPORT):
        print("  Install with: pip install pypdf pdfplumber")
    print(f"Upload folder: {os.path.abspath(UPLOAD_FOLDER)}")
    print(f"Max file size: {MAX_FILE_SIZE // (1024*1024)}MB")
    print("Supported files:", ", ".join(ALLOWED_EXTENSIONS))
    print("Features: Enhanced linguistic analysis with 12+ features")
    print("=" * 70)
    print("API Endpoints:")
    print("  POST /api/upload    - Upload file for analysis")
    print("  POST /api/detect    - Analyze text directly")
    print("  POST /api/features  - Get detailed feature analysis")
    print("  GET  /api/health    - Health check & status")
    print("  GET  /api/history   - Analysis history")
    print("  GET  /api/benchmark - Run benchmark tests")
    print("=" * 70)
    print("Starting server on http://localhost:5000")
    print("Press Ctrl+C to stop")
    print("=" * 70)
    
    app.run(debug=True, port=5000, host='0.0.0.0')