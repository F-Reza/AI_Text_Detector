# train_enhanced_model.py
import numpy as np
import pandas as pd
import joblib
import json
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score
import nltk
import re
import random

# Download NLTK data
nltk.download('stopwords', quiet=True)
from nltk.corpus import stopwords

class AdvancedTextGenerator:
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        
        # AI writing patterns
        self.ai_patterns = [
            "according to", "research indicates", "studies have shown",
            "it is important to", "in conclusion", "furthermore",
            "moreover", "additionally", "however", "therefore",
            "consequently", "thus", "hence", "in summary",
            "the findings suggest", "statistical analysis",
            "methodology employed", "data analysis", "results indicate",
            "literature review", "theoretical framework", "empirical evidence"
        ]
        
        # Human writing patterns
        self.human_patterns = [
            "i think", "i believe", "in my opinion", "personally",
            "actually", "basically", "kind of", "sort of", "you know",
            "i mean", "well", "anyway", "honestly", "to be honest",
            "if you ask me", "the thing is", "guess what", "by the way",
            "as a matter of fact", "like", "um", "uh", "hmm", "oh"
        ]
        
        # Topics for text generation
        self.topics = [
            "artificial intelligence", "machine learning", "climate change",
            "education system", "healthcare", "technology", "social media",
            "economic development", "scientific research", "cultural diversity"
        ]
    
    def generate_ai_text(self, length="medium"):
        """Generate AI-like text"""
        if length == "short":
            sentences = random.randint(2, 4)
        elif length == "medium":
            sentences = random.randint(4, 8)
        else:  # long
            sentences = random.randint(8, 15)
        
        template_types = [
            "academic", "technical", "formal", "analytical"
        ]
        
        text = ""
        for _ in range(sentences):
            template_type = random.choice(template_types)
            text += self._generate_ai_sentence(template_type) + " "
        
        return text.strip()
    
    def _generate_ai_sentence(self, template_type):
        """Generate a single AI-like sentence"""
        if template_type == "academic":
            templates = [
                "The {topic} field has seen significant advancements in recent years.",
                "According to {author}, {finding}.",
                "This paper examines the relationship between {concept1} and {concept2}.",
                "Statistical analysis reveals {result}.",
                "The methodology employed in this study involves {method}."
            ]
        elif template_type == "technical":
            templates = [
                "The {system} utilizes {technology} to achieve {outcome}.",
                "{Parameter} was set to {value} for optimal performance.",
                "The algorithm processes {data} using {technique}.",
                "Results demonstrate {percentage}% improvement in {metric}.",
                "Figure {number} illustrates the relationship between {var1} and {var2}."
            ]
        else:  # formal/analytical
            templates = [
                "It is important to note that {point}.",
                "Furthermore, {additional_point}.",
                "In conclusion, {summary}.",
                "The analysis suggests that {implication}.",
                "Therefore, it can be concluded that {conclusion}."
            ]
        
        template = random.choice(templates)
        
        # Fill placeholders
        placeholders = {
            "topic": random.choice(["artificial intelligence", "machine learning", "data science"]),
            "author": random.choice(["recent studies", "Smith et al.", "the literature"]),
            "finding": random.choice([
                "a significant correlation exists", "the results are promising",
                "further research is needed", "the hypothesis was supported"
            ]),
            "concept1": random.choice(["algorithm efficiency", "data quality", "model complexity"]),
            "concept2": random.choice(["performance metrics", "computational cost", "accuracy rates"]),
            "result": random.choice([
                "a strong positive correlation", "statistical significance",
                "marginal improvements", "no significant difference"
            ]),
            "method": random.choice([
                "regression analysis", "controlled experiments",
                "simulation studies", "case study analysis"
            ]),
            "system": random.choice(["neural network", "classification algorithm", "data pipeline"]),
            "technology": random.choice(["deep learning", "reinforcement learning", "natural language processing"]),
            "outcome": random.choice(["higher accuracy", "improved efficiency", "better generalization"]),
            "Parameter": random.choice(["Learning rate", "Batch size", "Epoch count"]),
            "value": random.choice(["0.001", "32", "100"]),
            "data": random.choice(["input features", "training samples", "validation sets"]),
            "technique": random.choice(["gradient descent", "backpropagation", "attention mechanisms"]),
            "percentage": random.choice(["15", "23", "47", "89"]),
            "metric": random.choice(["accuracy", "precision", "F1 score"]),
            "number": random.choice(["1", "2", "3", "4"]),
            "var1": random.choice(["input size", "training time", "model parameters"]),
            "var2": random.choice(["accuracy", "memory usage", "inference speed"]),
            "point": random.choice([
                "ethical considerations must be addressed",
                "the limitations of this approach should be acknowledged",
                "future work could explore alternative methods"
            ]),
            "additional_point": random.choice([
                "the results align with previous research",
                "several limitations should be considered",
                "practical applications are numerous"
            ]),
            "summary": random.choice([
                "the findings support the initial hypothesis",
                "further investigation is warranted",
                "the methodology proved effective"
            ]),
            "implication": random.choice([
                "this approach has practical applications",
                "the results challenge existing theories",
                "new research directions are suggested"
            ]),
            "conclusion": random.choice([
                "the proposed method is effective",
                "additional validation is required",
                "the study contributes to the field"
            ])
        }
        
        # Replace placeholders
        for key, value in placeholders.items():
            placeholder = "{" + key + "}"
            if placeholder in template:
                template = template.replace(placeholder, value)
        
        # Add AI patterns occasionally
        if random.random() > 0.7:
            ai_pattern = random.choice(self.ai_patterns)
            if random.random() > 0.5:
                template = ai_pattern.capitalize() + ", " + template.lower()
            else:
                template = template + " " + ai_pattern + "."
        
        return template
    
    def generate_human_text(self, length="medium"):
        """Generate human-like text"""
        if length == "short":
            sentences = random.randint(2, 4)
        elif length == "medium":
            sentences = random.randint(4, 8)
        else:  # long
            sentences = random.randint(8, 15)
        
        tone_types = [
            "conversational", "opinionated", "reflective", "casual"
        ]
        
        text = ""
        for _ in range(sentences):
            tone = random.choice(tone_types)
            text += self._generate_human_sentence(tone) + " "
        
        return text.strip()
    
    def _generate_human_sentence(self, tone):
        """Generate a single human-like sentence"""
        if tone == "conversational":
            templates = [
                "I was thinking about {topic} the other day.",
                "You know, {observation}.",
                "So anyway, {thought}.",
                "Well, {opinion}.",
                "Honestly, {feeling}."
            ]
        elif tone == "opinionated":
            templates = [
                "I really think that {opinion}.",
                "In my opinion, {viewpoint}.",
                "Personally, I believe {belief}.",
                "If you ask me, {statement}.",
                "The way I see it, {perspective}."
            ]
        elif tone == "reflective":
            templates = [
                "It's interesting how {observation}.",
                "I've been wondering about {topic}.",
                "Sometimes I think that {thought}.",
                "It makes me think about {idea}.",
                "I can't help but notice {observation}."
            ]
        else:  # casual
            templates = [
                "So like, {statement}.",
                "I mean, {point}.",
                "You know what I mean? {rhetorical}.",
                "Anyway, {conclusion}.",
                "Well, that's {summary}."
            ]
        
        template = random.choice(templates)
        
        # Fill placeholders
        placeholders = {
            "topic": random.choice(self.topics),
            "observation": random.choice([
                "things have changed so much", "it's getting harder to tell",
                "everyone seems to have an opinion", "the world is changing fast"
            ]),
            "thought": random.choice([
                "maybe we should reconsider", "I'm not sure what to think",
                "there might be another way", "it's more complicated than it seems"
            ]),
            "opinion": random.choice([
                "we need to be more careful", "technology is advancing too quickly",
                "people should talk more about this", "the solution seems obvious"
            ]),
            "feeling": random.choice([
                "I'm not entirely convinced", "it worries me a bit",
                "I'm excited about the possibilities", "it's all a bit overwhelming"
            ]),
            "viewpoint": random.choice([
                "the benefits outweigh the risks", "we're moving in the right direction",
                "there should be more regulation", "education is the key"
            ]),
            "belief": random.choice([
                "we can find a balance", "transparency is essential",
                "human judgment is still crucial", "collaboration is important"
            ]),
            "statement": random.choice([
                "we need to slow down and think", "the future looks promising",
                "we should learn from past mistakes", "innovation should be encouraged"
            ]),
            "perspective": random.choice([
                "the problem isn't technology itself", "we all need to adapt",
                "communication is the solution", "understanding comes first"
            ]),
            "idea": random.choice([
                "how we got here", "where we might be going",
                "what really matters", "how things connect"
            ]),
            "point": random.choice([
                "it's not that simple", "there's more to it",
                "we should consider all sides", "context matters"
            ]),
            "rhetorical": random.choice([
                "Right?", "Don't you think?", "You know?", "Isn't it?"
            ]),
            "conclusion": random.choice([
                "that's my take on it", "what do you think?",
                "I'd love to hear your thoughts", "food for thought"
            ]),
            "summary": random.choice([
                "pretty much it", "all I wanted to say",
                "my two cents", "just something to consider"
            ])
        }
        
        # Replace placeholders
        for key, value in placeholders.items():
            placeholder = "{" + key + "}"
            if placeholder in template:
                template = template.replace(placeholder, value)
        
        # Add human patterns occasionally
        if random.random() > 0.6:
            human_pattern = random.choice(self.human_patterns)
            if random.random() > 0.5:
                template = human_pattern.capitalize() + ", " + template.lower()
            else:
                template = template + " " + human_pattern + "."
        
        # Add contractions
        if random.random() > 0.5:
            contractions = ["don't", "can't", "won't", "isn't", "aren't", "wasn't", "weren't"]
            if random.random() > 0.7:
                template = template.replace(" do not ", " don't ")
                template = template.replace(" cannot ", " can't ")
                template = template.replace(" will not ", " won't ")
        
        # Add filler words occasionally
        if random.random() > 0.8:
            fillers = ["like", "you know", "I mean", "well", "so", "um", "uh"]
            filler = random.choice(fillers)
            words = template.split()
            if len(words) > 3:
                insert_pos = random.randint(1, len(words)-2)
                words.insert(insert_pos, filler)
                template = " ".join(words)
        
        return template

def extract_features(text, stop_words):
    """Extract features from text"""
    if not text or len(text.strip()) < 20:
        return None
    
    text_lower = text.lower()
    
    # Basic statistics
    char_count = len(text)
    words = [w for w in re.findall(r'\b[a-zA-Z]+\b', text)]
    word_count = len(words)
    
    if word_count < 5:
        return None
    
    # Sentences
    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
    sentence_count = len(sentences)
    
    # Word and sentence analysis
    avg_word_length = np.mean([len(w) for w in words]) if words else 0
    
    if sentences:
        words_per_sentence = [len(s.split()) for s in sentences]
        avg_sentence_length = np.mean(words_per_sentence)
        sentence_variation = np.std(words_per_sentence) / (avg_sentence_length + 0.001)
    else:
        avg_sentence_length = word_count
        sentence_variation = 0
    
    # Lexical diversity
    unique_words = set([w.lower() for w in words])
    lexical_diversity = len(unique_words) / word_count if word_count > 0 else 0
    
    # Stopword ratio
    stopword_count = sum(1 for w in words if w.lower() in stop_words)
    stopword_ratio = stopword_count / word_count if word_count > 0 else 0
    
    # Punctuation density
    punctuation_count = sum(1 for char in text if char in '.,!?;:')
    punctuation_density = punctuation_count / word_count if word_count > 0 else 0
    
    # Pattern matching (simplified)
    ai_patterns = [
        "according to", "research indicates", "studies have shown",
        "in conclusion", "furthermore", "moreover", "additionally",
        "however", "therefore", "consequently", "thus", "hence"
    ]
    
    human_patterns = [
        "i think", "i believe", "in my opinion", "personally",
        "actually", "basically", "kind of", "sort of", "you know",
        "i mean", "well", "anyway", "honestly", "to be honest"
    ]
    
    contractions = [
        "i'm", "you're", "he's", "she's", "it's", "we're", "they're",
        "can't", "won't", "don't", "doesn't", "isn't", "aren't"
    ]
    
    ai_pattern_score = sum(text_lower.count(p) for p in ai_patterns)
    human_pattern_score = sum(text_lower.count(p) for p in human_patterns)
    contraction_score = sum(text_lower.count(c) for c in contractions)
    
    # Character analysis
    upper_case_ratio = sum(1 for c in text if c.isupper()) / char_count if char_count > 0 else 0
    digit_ratio = sum(1 for c in text if c.isdigit()) / char_count if char_count > 0 else 0
    special_char_ratio = sum(1 for c in text if not c.isalnum() and not c.isspace()) / char_count if char_count > 0 else 0
    
    # Paragraph count
    paragraph_count = len([p for p in text.split('\n\n') if p.strip()])
    
    # Readability (simplified Flesch)
    try:
        import textstat
        flesch_score = textstat.flesch_reading_ease(text)
    except:
        # Simplified calculation
        syllables = sum([len(re.findall(r'[aeiouy]+', w.lower())) for w in words])
        flesch_score = 206.835 - 1.015 * (word_count / sentence_count) - 84.6 * (syllables / word_count)
    
    # Burstiness
    if sentences and len(sentences) > 1:
        words_per_sentence = [len(s.split()) for s in sentences]
        burstiness = (np.var(words_per_sentence) - np.mean(words_per_sentence)) / (
                     np.var(words_per_sentence) + np.mean(words_per_sentence) + 0.001)
    else:
        burstiness = 0
    
    # Repetition detection
    if word_count > 5:
        bigrams = []
        for i in range(word_count - 1):
            bigram = f"{words[i]} {words[i+1]}".lower()
            bigrams.append(bigram)
        unique_bigrams = set(bigrams)
        repetition_score = 1 - (len(unique_bigrams) / len(bigrams)) if bigrams else 0
    else:
        repetition_score = 0
    
    # Long word ratio
    long_words = sum(1 for w in words if len(w) > 6)
    long_word_ratio = long_words / word_count if word_count > 0 else 0
    
    # Passive voice detection (simplified)
    passive_indicators = ['was', 'were', 'been', 'being', 'by']
    passive_count = sum(1 for word in text_lower.split() if word in passive_indicators)
    passive_voice_ratio = passive_count / word_count if word_count > 0 else 0
    
    # Perplexity score (simplified)
    from collections import Counter
    word_freq = Counter(words)
    perplexity_score = len(word_freq) / word_count if word_count > 0 else 0
    
    # Assemble features
    features = [
        char_count, word_count, sentence_count, avg_word_length,
        avg_sentence_length, lexical_diversity, stopword_ratio,
        punctuation_density, ai_pattern_score, human_pattern_score,
        contraction_score, upper_case_ratio, digit_ratio,
        special_char_ratio, paragraph_count, flesch_score,
        burstiness, perplexity_score, repetition_score,
        sentence_variation, long_word_ratio, passive_voice_ratio
    ]
    
    return features

def train_model():
    """Train the enhanced AI detection model"""
    print("Training enhanced AI detection model...")
    
    generator = AdvancedTextGenerator()
    stop_words = set(stopwords.words('english'))
    
    # Generate training data
    X = []
    y = []
    
    print("Generating AI texts...")
    for i in range(1000):
        length = random.choice(["short", "medium", "long"])
        text = generator.generate_ai_text(length)
        features = extract_features(text, stop_words)
        if features:
            X.append(features)
            y.append(1)  # AI
        if i % 100 == 0:
            print(f"  Generated {i} AI samples")
    
    print("Generating human texts...")
    for i in range(1000):
        length = random.choice(["short", "medium", "long"])
        text = generator.generate_human_text(length)
        features = extract_features(text, stop_words)
        if features:
            X.append(features)
            y.append(0)  # Human
        if i % 100 == 0:
            print(f"  Generated {i} human samples")
    
    X = np.array(X)
    y = np.array(y)
    
    print(f"\nDataset created: {len(X)} samples")
    print(f"AI samples: {sum(y)}")
    print(f"Human samples: {len(y) - sum(y)}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest
    print("\nTraining Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
        class_weight='balanced'
    )
    
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)
    
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nModel Accuracy: {accuracy:.2%}")
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Human', 'AI']))
    
    # Feature importance
    feature_names = [
        'char_count', 'word_count', 'sentence_count', 'avg_word_length',
        'avg_sentence_length', 'lexical_diversity', 'stopword_ratio',
        'punctuation_density', 'ai_pattern_score', 'human_pattern_score',
        'contraction_score', 'upper_case_ratio', 'digit_ratio',
        'special_char_ratio', 'paragraph_count', 'flesch_score',
        'burstiness', 'perplexity_score', 'repetition_score',
        'sentence_variation', 'long_word_ratio', 'passive_voice_ratio'
    ]
    
    importances = model.feature_importances_
    feature_importance = sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)
    
    print("\nTop 10 Feature Importances:")
    for feature, importance in feature_importance[:10]:
        print(f"  {feature}: {importance:.4f}")
    
    # Save model
    joblib.dump(model, 'enhanced_ai_detector_model.pkl')
    joblib.dump(scaler, 'enhanced_scaler.pkl')
    
    # Save feature names
    with open('enhanced_feature_names.json', 'w') as f:
        json.dump(feature_names, f)
    
    # Save model info
    model_info = {
        'accuracy': float(accuracy),
        'training_samples': len(X_train),
        'test_samples': len(X_test),
        'feature_count': len(feature_names),
        'top_features': [f[0] for f in feature_importance[:5]]
    }
    
    with open('model_info.json', 'w') as f:
        json.dump(model_info, f, indent=2)
    
    print(f"\nModel saved:")
    print(f"  Model: enhanced_ai_detector_model.pkl")
    print(f"  Scaler: enhanced_scaler.pkl")
    print(f"  Features: enhanced_feature_names.json")
    print(f"  Info: model_info.json")
    
    return model, scaler, feature_names

def test_model():
    """Test the trained model"""
    try:
        model = joblib.load('enhanced_ai_detector_model.pkl')
        scaler = joblib.load('enhanced_scaler.pkl')
        
        print("Model loaded successfully!")
        
        # Test samples
        generator = AdvancedTextGenerator()
        stop_words = set(stopwords.words('english'))
        
        print("\nTesting with new samples:")
        
        # Test AI sample
        ai_text = generator.generate_ai_text("medium")
        print(f"\nAI Sample: {ai_text[:100]}...")
        features = extract_features(ai_text, stop_words)
        if features:
            features_scaled = scaler.transform([features])
            prob = model.predict_proba(features_scaled)[0][1] * 100
            print(f"  Predicted AI probability: {prob:.1f}%")
            print(f"  Verdict: {'AI' if prob > 60 else 'Human'}")
        
        # Test human sample
        human_text = generator.generate_human_text("medium")
        print(f"\nHuman Sample: {human_text[:100]}...")
        features = extract_features(human_text, stop_words)
        if features:
            features_scaled = scaler.transform([features])
            prob = model.predict_proba(features_scaled)[0][1] * 100
            print(f"  Predicted AI probability: {prob:.1f}%")
            print(f"  Verdict: {'AI' if prob > 60 else 'Human'}")
        
    except Exception as e:
        print(f"Error testing model: {e}")

if __name__ == "__main__":
    print("Enhanced AI Detector Model Training")
    print("=" * 50)
    
    train_model()
    test_model()
    
    print("\nTraining complete!")
    print("\nTo use this model in your app:")
    print("1. Update app.py to use EnhancedAIDetector")
    print("2. Load the trained model files")
    print("3. Restart your Flask server")