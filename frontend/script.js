// AI Detector Pro - Complete Script
// Version: 2.0.0 - Enhanced Accuracy Edition

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const textInput = document.getElementById('textInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsSection = document.getElementById('resultsSection');
const wordCount = document.getElementById('wordCount');
const fileInput = document.getElementById('fileInput');
const historyModal = document.getElementById('historyModal');
const historyList = document.getElementById('historyList');
const loadingOverlay = document.getElementById('loadingOverlay');

// Global variables
let currentAnalysisData = null;
let recentAnalyses = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Update word count
    textInput.dispatchEvent(new Event('input'));
    
    // Check backend status
    checkBackendStatus();
    
    // Load recent analyses
    loadRecentAnalyses();
    
    // Set up drag and drop
    setupDragAndDrop();
    
    console.log('AI Detector Pro initialized');
}

// Setup all event listeners
function setupEventListeners() {
    // Text input event
    textInput.addEventListener('input', updateWordCount);
    
    // Analyze button
    analyzeBtn.addEventListener('click', analyzeText);
    
    // File input
    fileInput.addEventListener('change', handleFileUpload);
    
    // History button
    document.getElementById('historyBtn').addEventListener('click', openHistoryModal);
    
    // Modal close
    historyModal.addEventListener('click', function(e) {
        if (e.target === historyModal || e.target.classList.contains('close-modal')) {
            closeHistoryModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Add clear button listener
    const clearBtn = document.querySelector('button[onclick*="clearText"]');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearText);
    }
    
    // Add paste button listener
    const pasteBtn = document.querySelector('button[onclick*="pasteText"]');
    if (pasteBtn) {
        pasteBtn.addEventListener('click', pasteText);
    }
    
    // Update sample button
    updateSampleButton();
}

// Update word count display
function updateWordCount() {
    const text = textInput.value.trim();
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const chars = text.length;
    
    wordCount.textContent = `${words.length} words, ${chars} chars`;
    
    // Update analyze button state
    analyzeBtn.disabled = words.length < 20;
    analyzeBtn.style.opacity = words.length < 20 ? '0.5' : '1';
    
    // Color code based on length
    if (words.length < 50) {
        wordCount.style.color = '#ef233c';
    } else if (words.length < 100) {
        wordCount.style.color = '#f8961e';
    } else {
        wordCount.style.color = '#4cc9f0';
    }
}

// Analyze text function
async function analyzeText() {
    const text = textInput.value.trim();
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    // Validation
    if (words.length < 20) {
        showError('Please enter at least 20 words for analysis.');
        return;
    }
    
    if (words.length < 100) {
        const proceed = confirm(`For best accuracy, we recommend at least 100 words.\nYou have ${words.length} words.\n\nContinue anyway?`);
        if (!proceed) return;
    }
    
    showLoading(true, 'Analyzing text with advanced AI detection...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/detect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            currentAnalysisData = data;
            displayResults(data);
            resultsSection.classList.add('show');
            saveToRecentAnalyses(data, text);
            showSuccess('Analysis complete!');
        } else {
            throw new Error(data.error || 'Analysis failed');
        }
    } catch (error) {
        console.error('Analysis error:', error);
        showError(`Analysis failed: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// Display results function
function displayResults(data) {
    // Update probabilities with animation
    updateProbabilities(data.ai_probability, data.human_probability);
    
    // Update verdict
    updateVerdict(data.is_ai_generated, data.ai_probability, data.confidence);
    
    // Update confidence
    updateConfidence(data.confidence);
    
    // Update result status
    updateResultStatus(data.is_ai_generated, data.confidence);
    
    // Update metrics
    updateMetrics(data);
    
    // Update analysis list
    updateAnalysisList(data);
    
    // Generate highlighted text
    if (data.sentence_analysis && data.sentence_analysis.length > 0) {
        generateHighlightedText(data.sentence_analysis);
    }
    
    // Display feature scores if available - SAFELY
    if (data.features && typeof data.features === 'object') {
        displayFeatureScores(data.features);
    }
}

// Update probability displays with animation
function updateProbabilities(aiProb, humanProb) {
    // Human probability
    const humanElement = document.getElementById('humanProbability');
    const humanValue = humanElement.querySelector('.probability-value');
    const humanBar = humanElement.querySelector('.probability-fill.human-fill');
    
    // AI probability
    const aiElement = document.getElementById('aiProbability');
    const aiValue = aiElement.querySelector('.probability-value');
    const aiBar = aiElement.querySelector('.probability-fill.ai-fill');
    
    // Animate values
    animateValue(humanValue, 50, humanProb, 1000);
    animateValue(aiValue, 50, aiProb, 1000);
    
    // Animate bars
    setTimeout(() => {
        if (humanBar) humanBar.style.width = `${humanProb}%`;
        if (aiBar) aiBar.style.width = `${aiProb}%`;
    }, 100);
}

// Animate numeric value
function animateValue(element, start, end, duration) {
    let startTime = null;
    
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const value = Math.floor(start + progress * (end - start));
        
        if (element) element.textContent = `${value}%`;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    }
    
    window.requestAnimationFrame(step);
}

// Update verdict display
function updateVerdict(isAI, aiProb, confidence) {
    const verdictText = document.getElementById('verdictText');
    if (!verdictText) return;
    
    if (isAI) {
        verdictText.innerHTML = `
            <div class="verdict-ai">
                <i class="fas fa-robot"></i>
                <h3>${confidence > 80 ? 'HIGH CONFIDENCE: AI-GENERATED' : 'Likely AI-Generated'}</h3>
                <p>This text shows patterns consistent with AI-generated content.</p>
                <div class="verdict-details">
                    <span class="detail-item">
                        <i class="fas fa-chart-line"></i>
                        <strong>AI Probability:</strong> ${aiProb}%
                    </span>
                    <span class="detail-item">
                        <i class="fas fa-shield-alt"></i>
                        <strong>Confidence:</strong> ${confidence}%
                    </span>
                </div>
            </div>
        `;
        verdictText.style.color = '#ef233c';
    } else {
        verdictText.innerHTML = `
            <div class="verdict-human">
                <i class="fas fa-user"></i>
                <h3>${confidence > 80 ? 'HIGH CONFIDENCE: HUMAN-WRITTEN' : 'Likely Human-Written'}</h3>
                <p>This text appears to be written by a human.</p>
                <div class="verdict-details">
                    <span class="detail-item">
                        <i class="fas fa-chart-line"></i>
                        <strong>Human Probability:</strong> ${100 - aiProb}%
                    </span>
                    <span class="detail-item">
                        <i class="fas fa-shield-alt"></i>
                        <strong>Confidence:</strong> ${confidence}%
                    </span>
                </div>
            </div>
        `;
        verdictText.style.color = '#4cc9f0';
    }
}

// Update confidence meter
function updateConfidence(confidence) {
    const confidenceValue = document.getElementById('confidenceValue');
    const confidenceFill = document.getElementById('confidenceFill');
    
    if (confidenceValue) confidenceValue.textContent = `${confidence}%`;
    if (confidenceFill) confidenceFill.style.width = `${confidence}%`;
    
    // Color code confidence
    if (confidenceFill) {
        if (confidence >= 80) {
            confidenceFill.style.background = 'linear-gradient(90deg, #4cc9f0, #4361ee)';
            if (confidenceValue) confidenceValue.style.color = '#4361ee';
        } else if (confidence >= 60) {
            confidenceFill.style.background = 'linear-gradient(90deg, #f8961e, #f9c74f)';
            if (confidenceValue) confidenceValue.style.color = '#f8961e';
        } else {
            confidenceFill.style.background = 'linear-gradient(90deg, #ef476f, #ff9a76)';
            if (confidenceValue) confidenceValue.style.color = '#ef476f';
        }
    }
}

// Update result status
function updateResultStatus(isAI, confidence) {
    const resultStatus = document.getElementById('resultStatus');
    if (resultStatus) {
        resultStatus.textContent = isAI ? 
            `AI Content Detected (${confidence}% confidence)` : 
            `Human Content Detected (${confidence}% confidence)`;
        resultStatus.style.color = isAI ? '#ef233c' : '#4cc9f0';
    }
}

// Update metrics
function updateMetrics(data) {
    // Update words
    const wordsElement = document.getElementById('metricWords');
    if (wordsElement) {
        wordsElement.textContent = data.text_metrics?.words?.toLocaleString() || '0';
    }
    
    // Update sentences
    const sentencesElement = document.getElementById('metricSentences');
    if (sentencesElement) {
        sentencesElement.textContent = data.text_metrics?.sentences?.toLocaleString() || '0';
    }
    
    // Update reading time
    const readingTimeElement = document.getElementById('metricReadingTime');
    if (readingTimeElement) {
        readingTimeElement.textContent = data.text_metrics?.reading_time || '0';
    }
    
    // Update lexical diversity
    const diversityElement = document.getElementById('metricDiversity');
    if (diversityElement) {
        const diversity = data.features?.lexical_diversity || 0;
        diversityElement.textContent = diversity.toFixed(2);
        
        if (diversity > 0.7) {
            diversityElement.style.color = '#4cc9f0';
        } else if (diversity < 0.5) {
            diversityElement.style.color = '#ef233c';
        } else {
            diversityElement.style.color = '#f8961e';
        }
    }
}

// Update analysis list
function updateAnalysisList(data) {
    const analysisList = document.getElementById('analysisList');
    if (!analysisList) return;
    
    analysisList.innerHTML = '';
    
    if (data.analysis && data.analysis.length > 0) {
        data.analysis.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-${getAnalysisIcon(item)}"></i> ${item}`;
            li.style.color = getAnalysisColor(item);
            analysisList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.innerHTML = '<i class="fas fa-info-circle"></i> No specific patterns detected';
        li.style.color = '#6c757d';
        analysisList.appendChild(li);
    }
}

// Get icon for analysis item
function getAnalysisIcon(text) {
    if (!text) return 'info-circle';
    text = text.toLowerCase();
    
    if (text.includes('ai')) return 'robot';
    if (text.includes('human')) return 'user';
    if (text.includes('diversity')) return 'chart-line';
    if (text.includes('sentence')) return 'paragraph';
    if (text.includes('readability')) return 'book-reader';
    return 'info-circle';
}

// Get color for analysis item
function getAnalysisColor(text) {
    if (!text) return '#6c757d';
    
    if (text.includes('AI') || text.includes('ai-generated')) return '#ef233c';
    if (text.includes('human') || text.includes('Human-written')) return '#4cc9f0';
    if (text.includes('High') || text.includes('varied')) return '#4cc9f0';
    if (text.includes('Low') || text.includes('uniform')) return '#ef233c';
    return '#6c757d';
}

// Generate highlighted text
function generateHighlightedText(sentenceAnalysis) {
    const highlightedText = document.getElementById('highlightedText');
    if (!highlightedText) return;
    
    highlightedText.innerHTML = '';
    
    if (!sentenceAnalysis || sentenceAnalysis.length === 0) {
        highlightedText.innerHTML = '<p class="placeholder">No text available for highlighting.</p>';
        updateHighlightStats(0, 0, 100);
        return;
    }
    
    const container = document.createElement('div');
    let aiCount = 0, mixedCount = 0, humanCount = 0;
    
    sentenceAnalysis.forEach((sentence) => {
        if (!sentence || !sentence.text) return;
        
        const span = document.createElement('span');
        span.className = `highlight-segment ${sentence.type || 'mixed'}`;
        span.textContent = sentence.text + ' ';
        
        // Add tooltip
        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip';
        tooltip.textContent = `${sentence.description || 'Unknown'} (${sentence.ai_probability || 0}% AI)`;
        span.appendChild(tooltip);
        
        // Count types
        if (sentence.type === 'ai') aiCount++;
        else if (sentence.type === 'mixed') mixedCount++;
        else if (sentence.type === 'human') humanCount++;
        else mixedCount++; // Default to mixed
        
        container.appendChild(span);
    });
    
    highlightedText.appendChild(container);
    
    // Update statistics
    const total = sentenceAnalysis.length;
    updateHighlightStats(
        Math.round((aiCount / total) * 100),
        Math.round((mixedCount / total) * 100),
        Math.round((humanCount / total) * 100)
    );
}

// Update highlight statistics
function updateHighlightStats(aiPercent, mixedPercent, humanPercent) {
    const aiPercentage = document.getElementById('aiPercentage');
    const mixedPercentage = document.getElementById('mixedPercentage');
    const humanPercentage = document.getElementById('humanPercentage');
    
    if (aiPercentage) aiPercentage.textContent = `${aiPercent}%`;
    if (mixedPercentage) mixedPercentage.textContent = `${mixedPercent}%`;
    if (humanPercentage) humanPercentage.textContent = `${humanPercent}%`;
    
    // Update stat item classes
    const statItems = document.querySelectorAll('.stat-item');
    if (statItems.length >= 3) {
        statItems[0].className = 'stat-item ai-stat';
        statItems[1].className = 'stat-item mixed-stat';
        statItems[2].className = 'stat-item human-stat';
    }
}

// Display feature scores - FIXED VERSION
function displayFeatureScores(features) {
    let featureDisplay = document.getElementById('featureScores');
    
    if (!featureDisplay) {
        featureDisplay = document.createElement('div');
        featureDisplay.id = 'featureScores';
        featureDisplay.className = 'feature-scores';
        const analysisDetails = document.querySelector('.analysis-details');
        if (analysisDetails) {
            analysisDetails.appendChild(featureDisplay);
        } else {
            return; // No place to display
        }
    }
    
    // Define which features to show
    const featuresToShow = [
        { 
            key: 'lexical_diversity', 
            name: 'Lexical Diversity', 
            format: (v) => v?.toFixed(3) || 'N/A',
            hint: (v) => v < 0.5 ? 'Low (AI-like)' : v > 0.7 ? 'High (Human-like)' : 'Moderate'
        },
        { 
            key: 'sentence_variation', 
            name: 'Sentence Variation', 
            format: (v) => v?.toFixed(3) || 'N/A',
            hint: (v) => v < 0.25 ? 'Uniform (AI)' : v > 0.5 ? 'Varied (Human)' : 'Moderate'
        },
        { 
            key: 'avg_sentence_length', 
            name: 'Avg Sentence Length', 
            format: (v) => v?.toFixed(1) || 'N/A',
            hint: (v) => v > 25 ? 'Long (AI)' : v < 15 ? 'Short (Human)' : 'Average'
        },
        { 
            key: 'stopword_ratio', 
            name: 'Stopword Ratio', 
            format: (v) => v?.toFixed(3) || 'N/A',
            hint: (v) => v < 0.3 ? 'Low (AI)' : v > 0.4 ? 'High (Human)' : 'Moderate'
        }
    ];
    
    let html = '<h5><i class="fas fa-chart-bar"></i> Feature Analysis</h5><div class="feature-grid">';
    
    featuresToShow.forEach(feature => {
        const value = features[feature.key];
        const formattedValue = feature.format(value);
        const hint = feature.hint(value);
        
        html += `
            <div class="feature-item">
                <span class="feature-label">${feature.name}:</span>
                <span class="feature-value">${formattedValue}</span>
                <div class="feature-hint">${hint}</div>
            </div>
        `;
    });
    
    html += '</div>';
    featureDisplay.innerHTML = html;
}

// File upload handler
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file type
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!['txt', 'pdf', 'doc', 'docx'].includes(fileExt)) {
        showError('Please upload a TXT, PDF, DOC, or DOCX file.');
        event.target.value = '';
        return;
    }
    
    // Check file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        showError('File size too large. Maximum size is 10MB.');
        event.target.value = '';
        return;
    }
    
    showLoading(true, `Processing ${file.name}...`);
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            currentAnalysisData = data;
            displayResults(data);
            resultsSection.classList.add('show');
            
            // Update textarea with extracted text
            if (data.extracted_text) {
                textInput.value = data.extracted_text;
            }
            
            saveToRecentAnalyses(data, `File: ${file.name}`);
            showSuccess(`File analyzed successfully! Found ${data.text_metrics?.words || 0} words.`);
        } else {
            throw new Error(data.error || 'Failed to analyze file');
        }
    } catch (error) {
        console.error('File upload error:', error);
        showError(`File analysis failed: ${error.message}`);
    } finally {
        showLoading(false);
        event.target.value = '';
    }
}

// Clear text function
function clearText() {
    if (textInput.value.trim() && !confirm('Clear all text and results?')) {
        return;
    }
    
    textInput.value = '';
    updateWordCount();
    resultsSection.classList.remove('show');
    clearHighlights();
    currentAnalysisData = null;
    
    // Reset displays
    resetDisplays();
    
    showSuccess('Text cleared successfully.');
}

// Reset all displays to default
function resetDisplays() {
    // Reset probabilities
    const humanValue = document.getElementById('humanProbability')?.querySelector('.probability-value');
    const humanBar = document.getElementById('humanProbability')?.querySelector('.probability-fill.human-fill');
    const aiValue = document.getElementById('aiProbability')?.querySelector('.probability-value');
    const aiBar = document.getElementById('aiProbability')?.querySelector('.probability-fill.ai-fill');
    
    if (humanValue) humanValue.textContent = '50%';
    if (humanBar) humanBar.style.width = '50%';
    if (aiValue) aiValue.textContent = '50%';
    if (aiBar) aiBar.style.width = '50%';
    
    // Reset confidence
    const confidenceValue = document.getElementById('confidenceValue');
    const confidenceFill = document.getElementById('confidenceFill');
    if (confidenceValue) confidenceValue.textContent = '0%';
    if (confidenceFill) confidenceFill.style.width = '0%';
    
    // Reset result status
    const resultStatus = document.getElementById('resultStatus');
    if (resultStatus) {
        resultStatus.textContent = 'Waiting for analysis...';
        resultStatus.style.color = '';
    }
    
    // Reset metrics
    const metricElements = ['metricWords', 'metricSentences', 'metricReadingTime', 'metricDiversity'];
    metricElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = '0';
            if (id === 'metricDiversity') el.style.color = '';
        }
    });
    
    // Clear analysis list
    const analysisList = document.getElementById('analysisList');
    if (analysisList) {
        analysisList.innerHTML = '<li>No analysis performed yet</li>';
    }
    
    // Remove feature scores
    const featureScores = document.getElementById('featureScores');
    if (featureScores) featureScores.remove();
}

// Paste text function
async function pasteText() {
    try {
        const text = await navigator.clipboard.readText();
        if (!text.trim()) {
            showError('Clipboard is empty or contains no text.');
            return;
        }
        
        textInput.value = text;
        updateWordCount();
        showSuccess('Text pasted from clipboard.');
        
        // Auto-suggest analysis for longer texts
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        if (words.length >= 100) {
            setTimeout(() => {
                if (confirm('Pasted text has ' + words.length + ' words. Would you like to analyze it now?')) {
                    analyzeText();
                }
            }, 500);
        }
    } catch (err) {
        console.error('Clipboard error:', err);
        showError('Could not access clipboard. Please paste manually (Ctrl+V).');
    }
}

// Load sample text
function loadSample() {
    const sampleText = `Artificial intelligence has revolutionized numerous industries, transforming the way we approach complex problems and innovate solutions. While AI offers remarkable efficiency and capability, it's essential to maintain human oversight and ethical considerations in its deployment.

The integration of machine learning algorithms has enabled unprecedented advancements in data analysis, pattern recognition, and predictive modeling. These technologies continue to evolve, offering new possibilities while raising important questions about their societal impact.

Human creativity and critical thinking remain irreplaceable, even as AI systems become more sophisticated. The balance between technological advancement and human values represents one of the most significant challenges of our time.

In my opinion, we need to establish clear guidelines and regulations to ensure AI benefits everyone. Personally, I think the key is to maintain human control over critical decisions while leveraging AI for optimization and analysis. This approach, if implemented correctly, could lead to a harmonious relationship between human intelligence and artificial systems.

However, it's important to recognize that AI tools like ChatGPT and Gemini are becoming increasingly sophisticated. These systems can generate text that closely resembles human writing, making detection more challenging. Based on the information available, many organizations are developing methods to identify AI-generated content. According to recent studies, AI-generated text often exhibits certain patterns that can be detected through statistical analysis.

I believe that as AI technology progresses, we'll see more nuanced approaches to content creation. Some text may be entirely human-written, some may be AI-generated, and much will likely fall somewhere in between - human ideas expressed through AI assistance. This mixed approach is becoming increasingly common in professional writing.

Ultimately, the goal should be transparency. If AI tools are used in content creation, this should be disclosed to readers. This maintains trust and allows for informed consumption of information.`;
    
    textInput.value = sampleText;
    updateWordCount();
    showSuccess('Sample text loaded. Click "Analyze Text" to begin.');
}

// Update sample button with menu
function updateSampleButton() {
    const sampleBtn = document.querySelector('button[onclick*="loadSample"]');
    if (!sampleBtn) return;
    
    // Remove old onclick if it exists
    sampleBtn.setAttribute('onclick', '');
    
    // Add click handler with menu
    sampleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Remove existing menu
        const existingMenu = document.querySelector('.sample-menu');
        if (existingMenu) existingMenu.remove();
        
        // Create menu
        const menu = document.createElement('div');
        menu.className = 'sample-menu';
        menu.innerHTML = `
            <button onclick="loadSampleType('ai')">
                <i class="fas fa-robot"></i> AI-Generated Sample
            </button>
            <button onclick="loadSampleType('human')">
                <i class="fas fa-user"></i> Human-Written Sample
            </button>
            <button onclick="loadSampleType('mixed')">
                <i class="fas fa-blend"></i> Mixed Content Sample
            </button>
        `;
        
        // Position menu
        const rect = sampleBtn.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = (rect.bottom + 5) + 'px';
        menu.style.left = rect.left + 'px';
        menu.style.zIndex = '1000';
        menu.style.background = 'white';
        menu.style.border = '1px solid #e9ecef';
        menu.style.borderRadius = 'var(--border-radius)';
        menu.style.boxShadow = 'var(--box-shadow)';
        
        document.body.appendChild(menu);
        
        // Close menu on outside click
        setTimeout(() => {
            const closeMenu = (e) => {
                if (!menu.contains(e.target) && e.target !== sampleBtn) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            };
            document.addEventListener('click', closeMenu);
        }, 10);
    });
}

// Load specific sample type
function loadSampleType(type) {
    const samples = {
        ai: `The implementation of artificial intelligence in contemporary technological frameworks has fundamentally altered the paradigm of computational problem-solving. Machine learning algorithms, particularly those based on deep neural network architectures, demonstrate unprecedented capabilities in pattern recognition and data analysis. Statistical methodologies employed in these systems enable sophisticated inference mechanisms that approximate human cognitive processes. However, it is important to recognize that these computational models operate within predefined parameter spaces and lack genuine comprehension of semantic content. The ethical implications surrounding AI deployment necessitate rigorous evaluation protocols and regulatory oversight to ensure alignment with human values and societal norms. Future research directions should focus on developing interpretable AI systems that maintain transparency while optimizing performance metrics across diverse application domains.`,

        human: `I was just thinking about AI the other day, and honestly, it's getting kinda wild, you know? Like, I use ChatGPT for help with emails and stuff, but sometimes it feels a bit... I dunno, creepy? Like, how does it know exactly what to say? And don't even get me started on those deepfake videos - that stuff is straight-up terrifying! Personally, I think we need to pump the brakes a bit and really think about where this is all going. I mean, I'm no expert or anything, but it seems like things are moving way too fast. If you ask me, we should have more conversations about this stuff before it's too late. What do you think?`,

        mixed: `Artificial intelligence represents a significant advancement in computational technology, offering powerful tools for data analysis and content generation. Many professionals utilize AI assistants to enhance their productivity and streamline workflows. Personally, I've found that tools like Grammarly and ChatGPT can be incredibly helpful for refining written communication and generating initial drafts. However, it's crucial to maintain human oversight and critical evaluation of AI-generated content. The most effective approach often involves a collaborative process where AI handles repetitive tasks while humans provide creative direction and ethical judgment. This balanced methodology leverages the strengths of both artificial and human intelligence to achieve optimal outcomes in professional contexts.`
    };
    
    textInput.value = samples[type] || samples.mixed;
    updateWordCount();
    showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} sample loaded. Click "Analyze Text" to begin.`);
    
    // Remove sample menu
    const menu = document.querySelector('.sample-menu');
    if (menu) menu.remove();
}

// Clear highlights
function clearHighlights() {
    const highlightedText = document.getElementById('highlightedText');
    if (highlightedText) {
        highlightedText.innerHTML = '<p class="placeholder">Analyze text to see highlighted results...</p>';
    }
    
    updateHighlightStats(0, 0, 100);
    
    // Reset stat items
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(item => {
        item.classList.remove('ai-stat', 'mixed-stat', 'human-stat');
    });
    
    showSuccess('Highlights cleared.');
}

// Copy highlighted text
function copyHighlightedText() {
    const highlightedText = document.getElementById('highlightedText');
    if (!highlightedText) return;
    
    const text = highlightedText.innerText;
    
    if (!text || text.includes('Analyze text') || text.includes('No text available')) {
        showError('No highlighted text to copy. Please analyze text first.');
        return;
    }
    
    navigator.clipboard.writeText(text)
        .then(() => {
            // Show success feedback
            const btn = event.target.closest('button');
            if (btn) {
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                btn.disabled = true;
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 2000);
            }
            
            showSuccess('Text copied to clipboard!');
        })
        .catch(err => {
            console.error('Copy failed:', err);
            showError('Failed to copy text. Please try again.');
        });
}

// History functions
async function loadHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/history`);
        const data = await response.json();
        
        if (data.success) {
            displayHistory(data.history);
        } else {
            displayHistory(recentAnalyses);
        }
    } catch (error) {
        console.error('History load error:', error);
        displayHistory(recentAnalyses);
    }
}

function displayHistory(history) {
    if (!historyList) return;
    
    historyList.innerHTML = '';
    
    if (!history || history.length === 0) {
        historyList.innerHTML = '<p class="no-history">No analysis history yet.</p>';
        return;
    }
    
    // Limit to 20 items
    const limitedHistory = history.slice(0, 20);
    
    limitedHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        const isAI = item.result?.is_ai_generated || item.isAI || false;
        const aiProb = item.result?.ai_probability || item.aiProbability || 0;
        
        historyItem.className = `history-item ${isAI ? 'ai' : 'human'}`;
        historyItem.innerHTML = `
            <div class="history-header">
                <strong>${isAI ? '🤖 AI' : '👤 Human'} - ${aiProb}% AI</strong>
                <small>${formatDate(item.timestamp)}</small>
            </div>
            <div class="history-preview">${item.text_preview || item.textPreview || 'No preview available'}</div>
            ${item.wordCount ? `<div class="history-meta"><i class="fas fa-font"></i> ${item.wordCount} words</div>` : ''}
        `;
        
        // Add click to load
        historyItem.addEventListener('click', () => {
            if (item.text_preview || item.textPreview) {
                const text = item.text_preview || item.textPreview;
                if (text && !text.includes('No preview')) {
                    textInput.value = text.replace('...', '');
                    updateWordCount();
                    closeHistoryModal();
                    showSuccess('History item loaded. Click "Analyze Text" to re-analyze.');
                }
            }
        });
        
        historyList.appendChild(historyItem);
    });
}

function openHistoryModal() {
    loadHistory();
    if (historyModal) historyModal.classList.add('show');
}

function closeHistoryModal() {
    if (historyModal) historyModal.classList.remove('show');
}

// Format date
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleString();
    } catch {
        return 'Unknown date';
    }
}

// Save to recent analyses
function saveToRecentAnalyses(data, text) {
    const analysis = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        result: {
            ai_probability: data.ai_probability,
            is_ai_generated: data.is_ai_generated,
            confidence: data.confidence
        },
        text_preview: text.substring(0, 150) + (text.length > 150 ? '...' : ''),
        wordCount: data.text_metrics?.words || 0
    };
    
    recentAnalyses.unshift(analysis);
    
    // Keep only 20 most recent
    if (recentAnalyses.length > 20) {
        recentAnalyses = recentAnalyses.slice(0, 20);
    }
    
    // Save to localStorage
    try {
        localStorage.setItem('aiDetectorRecent', JSON.stringify(recentAnalyses));
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
}

// Load recent analyses from localStorage
function loadRecentAnalyses() {
    try {
        const saved = localStorage.getItem('aiDetectorRecent');
        if (saved) {
            recentAnalyses = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load from localStorage:', e);
        recentAnalyses = [];
    }
}

// Setup drag and drop
function setupDragAndDrop() {
    const dropArea = document.querySelector('.input-section');
    if (!dropArea) return;
    
    // Prevent default behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Highlight drop area
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.add('highlight');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.remove('highlight');
        }, false);
    });
    
    // Handle drop
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            const file = files[0];
            
            // Check file type
            const fileExt = file.name.split('.').pop().toLowerCase();
            if (!['txt', 'pdf', 'doc', 'docx'].includes(fileExt)) {
                showError('Please drop a TXT, PDF, DOC, or DOCX file.');
                return;
            }
            
            // Create a new FileList
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            
            // Trigger change event
            fileInput.dispatchEvent(new Event('change'));
            
            showSuccess(`File dropped: ${file.name}`);
        }
    }
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter to analyze
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        analyzeText();
    }
    
    // Ctrl/Cmd + K to clear
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearText();
    }
    
    // Escape to close modal
    if (e.key === 'Escape' && historyModal && historyModal.classList.contains('show')) {
        closeHistoryModal();
    }
}

// Loading overlay
function showLoading(show, message = 'Analyzing...') {
    if (!loadingOverlay) return;
    
    if (show) {
        const loadingText = loadingOverlay.querySelector('p');
        const loadingSub = loadingOverlay.querySelector('.loading-sub');
        
        if (loadingText) loadingText.textContent = message;
        if (loadingSub) loadingSub.textContent = 'Please wait while we analyze the text';
        
        loadingOverlay.classList.add('show');
    } else {
        loadingOverlay.classList.remove('show');
    }
}

// Show error notification
function showError(message) {
    // Remove existing notifications
    removeNotifications('error');
    
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Show success notification
function showSuccess(message) {
    // Remove existing notifications
    removeNotifications('success');
    
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Remove existing notifications
function removeNotifications(type) {
    const notifications = document.querySelectorAll(`.notification.${type}`);
    notifications.forEach(notification => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
}

// Check backend status
async function checkBackendStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            const data = await response.json();
            console.log('✓ Backend is running:', data);
            
            // Update status indicator
            const statusIndicator = document.createElement('div');
            statusIndicator.className = 'status-indicator';
            statusIndicator.innerHTML = '<i class="fas fa-circle" style="color: #4cc9f0"></i> Backend Connected';
            statusIndicator.style.position = 'fixed';
            statusIndicator.style.bottom = '10px';
            statusIndicator.style.right = '10px';
            statusIndicator.style.fontSize = '12px';
            statusIndicator.style.opacity = '0.7';
            statusIndicator.style.background = 'white';
            statusIndicator.style.padding = '5px 10px';
            statusIndicator.style.borderRadius = '4px';
            statusIndicator.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            document.body.appendChild(statusIndicator);
        } else {
            console.warn('⚠ Backend returned error');
            showError('Backend API returned an error. Some features may not work.');
        }
    } catch (error) {
        console.error('✗ Cannot connect to backend:', error);
        showError('Cannot connect to analysis server. Make sure the backend is running on http://localhost:5000');
    }
}

// Export results
function exportResults() {
    if (!currentAnalysisData) {
        showError('No analysis results to export.');
        return;
    }
    
    const dataStr = JSON.stringify(currentAnalysisData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `ai-analysis-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess('Results exported successfully!');
}

// Add export button to UI
function addExportButton() {
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn-action export-btn';
    exportBtn.innerHTML = '<i class="fas fa-download"></i> Export Results';
    exportBtn.onclick = exportResults;
    
    const resultsHeader = document.querySelector('.results-header');
    if (resultsHeader) {
        resultsHeader.appendChild(exportBtn);
    }
}

// Add help button
function addHelpButton() {
    const helpBtn = document.createElement('button');
    helpBtn.className = 'btn-action help-btn';
    helpBtn.innerHTML = '<i class="fas fa-question-circle"></i> Help';
    helpBtn.onclick = showHelp;
    
    const nav = document.querySelector('.nav');
    if (nav) {
        nav.insertBefore(helpBtn, nav.querySelector('#historyBtn'));
    }
}

// Show help modal
function showHelp() {
    const helpModal = document.createElement('div');
    helpModal.className = 'modal help-modal';
    helpModal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3><i class="fas fa-question-circle"></i> AI Detector Pro Help</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="help-section">
                    <h4>How to Use</h4>
                    <ul>
                        <li><strong>Text Analysis:</strong> Paste or type text (minimum 20 words)</li>
                        <li><strong>File Upload:</strong> Drag & drop or click to upload documents</li>
                        <li><strong>Best Results:</strong> Use 100+ words for highest accuracy</li>
                        <li><strong>Highlighting:</strong> Color-coded sentences show AI vs human content</li>
                    </ul>
                </div>
                <div class="help-section">
                    <h4>Keyboard Shortcuts</h4>
                    <ul>
                        <li><strong>Ctrl+Enter:</strong> Analyze text</li>
                        <li><strong>Ctrl+K:</strong> Clear all</li>
                        <li><strong>Escape:</strong> Close modals</li>
                    </ul>
                </div>
                <div class="help-section">
                    <h4>Tips for Accuracy</h4>
                    <ul>
                        <li>Longer texts give more accurate results</li>
                        <li>Avoid mixed content for clearer analysis</li>
                        <li>Check the confidence score for reliability</li>
                        <li>Use sentence highlighting to identify patterns</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(helpModal);
    helpModal.classList.add('show');
    
    // Close button
    const closeBtn = helpModal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => helpModal.remove());
    
    // Close on background click
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) helpModal.remove();
    });
}

// Initialize UI enhancements
setTimeout(() => {
    addExportButton();
    addHelpButton();
}, 1000);

// Make functions globally available
window.clearText = clearText;
window.pasteText = pasteText;
window.loadSample = loadSample;
window.loadSampleType = loadSampleType;
window.copyHighlightedText = copyHighlightedText;
window.clearHighlights = clearHighlights;
window.openHistoryModal = openHistoryModal;
window.closeHistoryModal = closeHistoryModal;
window.analyzeText = analyzeText;

console.log('AI Detector Pro - Script loaded successfully');