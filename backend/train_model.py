# Simple AI Detector Model Training
# This creates a basic ML model for demonstration purposes

import numpy as np
import pandas as pd
import joblib
import json
import os

def create_training_data():
    """Create synthetic training data for demonstration"""
    # AI text samples (characteristic of ChatGPT/GPT-4)
    ai_samples = [
        "The implementation of machine learning algorithms has revolutionized data analysis techniques.",
        "Artificial intelligence systems leverage neural networks to process complex information.",
        "In conclusion, the findings demonstrate significant improvements in computational efficiency.",
        "Furthermore, research indicates that AI applications enhance productivity across various sectors.",
        "It is important to note that ethical considerations must accompany technological advancements.",
        "The analysis reveals correlations between data points that were previously undetected.",
        "Based on the information provided, several conclusions can be drawn from the evidence.",
        "Statistical analysis confirms the hypothesis regarding the relationship between variables.",
        "The methodology employed in this study follows established research protocols.",
        "Results demonstrate that the proposed approach achieves superior performance metrics.",
        "Machine learning models require substantial computational resources for training.",
        "Natural language processing enables computers to understand human language.",
        "Deep learning architectures have achieved state-of-the-art results in image recognition.",
        "The integration of AI technologies necessitates robust security measures.",
        "Algorithmic transparency remains a critical challenge in AI development."
    ]
    
    # Human text samples
    human_samples = [
        "I was thinking about how AI is changing everything, you know? It's kind of crazy.",
        "Honestly, I'm not sure what to think about all this technology stuff anymore.",
        "Well, if you ask me, we should be more careful with how we use these tools.",
        "I mean, it's amazing what they can do, but it's also pretty scary sometimes.",
        "Personally, I've found that writing by hand helps me think more clearly.",
        "You know what's weird? How fast everything is changing these days.",
        "Actually, I think we need to have more conversations about this stuff.",
        "To be honest, I'm kind of overwhelmed by all the new technology.",
        "The thing is, nobody really knows where this is all heading.",
        "Anyway, that's just my two cents on the whole situation.",
        "Wait, are you seriously telling me that AI can do all that now?",
        "Hmm, I don't know about this. Something feels off to me.",
        "Wow, that's actually pretty cool if you think about it!",
        "Seriously though, we should probably talk about this more.",
        "Ugh, I'm so tired of hearing about AI all the time."
    ]
    
    return ai_samples, human_samples

def extract_simple_features(text):
    """Extract simple features from text without external libraries"""
    text_lower = text.lower()
    words = text_lower.split()
    
    if not words:
        return None
    
    # Basic features
    word_count = len(words)
    
    # Sentence count (approximate)
    sentence_count = max(1, text.count('.') + text.count('!') + text.count('?'))
    
    # Word length
    avg_word_length = sum(len(w) for w in words) / word_count
    
    # Lexical diversity (simplified)
    unique_words = set(words)
    lexical_diversity = len(unique_words) / word_count
    
    # Pattern detection
    ai_patterns = ['furthermore', 'moreover', 'in conclusion', 'the analysis', 'statistical',
                   'according to', 'based on', 'it is important', 'research indicates']
    human_patterns = ['i think', 'you know', 'honestly', 'personally', 'i mean',
                     'to be honest', 'if you ask me', 'the thing is', 'kind of']
    
    ai_pattern_count = sum(text_lower.count(p) for p in ai_patterns)
    human_pattern_count = sum(text_lower.count(p) for p in human_patterns)
    
    # Sentence length variation (simplified)
    sentences = [s.strip() for s in text.replace('!', '.').replace('?', '.').split('.') if s.strip()]
    if sentences:
        words_per_sentence = [len(s.split()) for s in sentences]
        avg_sentence_length = sum(words_per_sentence) / len(words_per_sentence)
        if avg_sentence_length > 0:
            sentence_variation = np.std(words_per_sentence) / avg_sentence_length
        else:
            sentence_variation = 0
    else:
        avg_sentence_length = word_count
        sentence_variation = 0
    
    return {
        'word_count': word_count,
        'sentence_count': sentence_count,
        'avg_word_length': avg_word_length,
        'lexical_diversity': lexical_diversity,
        'ai_pattern_count': ai_pattern_count,
        'human_pattern_count': human_pattern_count,
        'avg_sentence_length': avg_sentence_length,
        'sentence_variation': sentence_variation
    }

def create_feature_dataframe(ai_samples, human_samples):
    """Create DataFrame with extracted features"""
    features = []
    labels = []
    
    # Process AI samples
    for text in ai_samples:
        feat = extract_simple_features(text)
        if feat:
            features.append(feat)
            labels.append(1)  # AI = 1
    
    # Process human samples
    for text in human_samples:
        feat = extract_simple_features(text)
        if feat:
            features.append(feat)
            labels.append(0)  # Human = 0
    
    return pd.DataFrame(features), labels

def train_simple_model():
    """Train a simple model without sklearn"""
    print("Creating simple AI detection model...")
    
    # Create training data
    ai_samples, human_samples = create_training_data()
    
    # Extract features
    df, labels = create_feature_dataframe(ai_samples, human_samples)
    
    if df.empty:
        print("Error: Could not extract features from samples")
        return None
    
    print(f"Created dataset with {len(df)} samples")
    print(f"Features: {', '.join(df.columns)}")
    
    # Simple rule-based model weights (you can tune these)
    model_weights = {
        'lexical_diversity': -0.3,  # Lower diversity = more AI
        'ai_pattern_count': 0.2,    # More AI patterns = more AI
        'human_pattern_count': -0.2, # More human patterns = less AI
        'avg_sentence_length': 0.15, # Longer sentences = more AI
        'sentence_variation': -0.25, # Less variation = more AI
        'avg_word_length': 0.1       # Longer words = more AI
    }
    
    # Create simple model function
    def predict_ai_probability(features):
        """Calculate AI probability using weighted features"""
        score = 0.5  # Start at neutral
        
        for feature, weight in model_weights.items():
            if feature in features:
                # Normalize feature value
                if feature == 'lexical_diversity':
                    # Diversity between 0.3-0.8 typically
                    norm_value = (features[feature] - 0.3) / 0.5
                elif feature in ['ai_pattern_count', 'human_pattern_count']:
                    # Pattern counts 0-3 typically
                    norm_value = min(features[feature] / 3, 1)
                elif feature == 'avg_sentence_length':
                    # Sentence length 5-30 typically
                    norm_value = (features[feature] - 5) / 25
                elif feature == 'sentence_variation':
                    # Variation 0-1 typically
                    norm_value = features[feature]
                elif feature == 'avg_word_length':
                    # Word length 3-7 typically
                    norm_value = (features[feature] - 3) / 4
                else:
                    norm_value = 0
                
                # Add weighted contribution
                score += weight * norm_value
        
        # Ensure score is between 0 and 1
        return max(0, min(1, score))
    
    # Test the model
    print("\nTesting model on training data:")
    correct = 0
    total = len(df)
    
    for idx, (_, row) in enumerate(df.iterrows()):
        prob = predict_ai_probability(row.to_dict())
        predicted = 1 if prob > 0.5 else 0
        actual = labels[idx]
        
        if predicted == actual:
            correct += 1
        
        if idx < 5:  # Show first 5 predictions
            sample_type = "AI" if actual == 1 else "Human"
            pred_type = "AI" if predicted == 1 else "Human"
            print(f"  Sample {idx+1} ({sample_type}): {prob:.2f} -> {pred_type}")
    
    accuracy = correct / total
    print(f"\nModel accuracy on training data: {accuracy:.1%}")
    
    # Save model configuration
    model_config = {
        'weights': model_weights,
        'features_used': list(model_weights.keys()),
        'accuracy': accuracy,
        'training_samples': total
    }
    
    # Save to JSON file
    with open('simple_model_config.json', 'w') as f:
        json.dump(model_config, f, indent=2)
    
    print("\nModel configuration saved to 'simple_model_config.json'")
    print("\nFeature weights:")
    for feature, weight in model_weights.items():
        print(f"  {feature}: {weight:+.3f}")
    
    return model_config

def create_enhanced_detector():
    """Create an enhanced detector using the trained model"""
    try:
        # Load model configuration
        with open('simple_model_config.json', 'r') as f:
            config = json.load(f)
        
        print("\nEnhanced detector created with ML features")
        print(f"Training accuracy: {config['accuracy']:.1%}")
        
        return config
    except FileNotFoundError:
        print("Model configuration not found. Training new model...")
        return train_simple_model()

if __name__ == "__main__":
    # Check if model already exists
    if os.path.exists('simple_model_config.json'):
        print("Model configuration found. Loading...")
        with open('simple_model_config.json', 'r') as f:
            config = json.load(f)
        print(f"Model loaded with {config['training_samples']} training samples")
        print(f"Accuracy: {config['accuracy']:.1%}")
        
        response = input("\nDo you want to retrain the model? (y/n): ")
        if response.lower() == 'y':
            train_simple_model()
    else:
        train_simple_model()