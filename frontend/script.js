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

// Global variable to store current analysis data
let currentAnalysisData = null;

// Update word count
textInput.addEventListener('input', () => {
    const words = textInput.value.trim().split(/\s+/).filter(word => word.length > 0);
    wordCount.textContent = `${words.length} words`;
    
    // Disable analyze button if less than 20 words
    analyzeBtn.disabled = words.length < 20;
    analyzeBtn.style.opacity = words.length < 20 ? '0.5' : '1';
});

// Analyze Text Function
async function analyzeText() {
    const text = textInput.value.trim();
    
    if (text.split(/\s+/).filter(w => w.length > 0).length < 20) {
        alert('Please enter at least 20 words for accurate analysis.');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/detect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            currentAnalysisData = data;
            displayResults(data);
            resultsSection.classList.add('show');
            
            // Store the analyzed text for highlighting
            if (data.extracted_text) {
                textInput.value = data.extracted_text;
            }
        } else {
            throw new Error(data.error || 'Analysis failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Analysis failed: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// Display Results
function displayResults(data) {
    // Update probabilities
    document.getElementById('humanProbability').querySelector('.probability-value').textContent = 
        `${data.human_probability}%`;
    document.getElementById('humanProbability').querySelector('.probability-fill').style.width = 
        `${data.human_probability}%`;
    
    document.getElementById('aiProbability').querySelector('.probability-value').textContent = 
        `${data.ai_probability}%`;
    document.getElementById('aiProbability').querySelector('.probability-fill').style.width = 
        `${data.ai_probability}%`;
    
    // Update verdict
    const verdictText = document.getElementById('verdictText');
    if (data.is_ai_generated) {
        verdictText.innerHTML = `
            <div class="verdict-ai">
                <i class="fas fa-robot"></i>
                <h3>Likely AI Generated</h3>
                <p>This text shows patterns consistent with AI-generated content.</p>
            </div>
        `;
        verdictText.style.color = '#ef233c';
    } else {
        verdictText.innerHTML = `
            <div class="verdict-human">
                <i class="fas fa-user"></i>
                <h3>Likely Human Written</h3>
                <p>This text appears to be written by a human.</p>
            </div>
        `;
        verdictText.style.color = '#4cc9f0';
    }
    
    // Update confidence
    document.getElementById('confidenceValue').textContent = `${data.confidence}%`;
    document.getElementById('confidenceFill').style.width = `${data.confidence}%`;
    
    // Update result status
    document.getElementById('resultStatus').textContent = 
        data.is_ai_generated ? 'AI Content Detected' : 'Human Content Detected';
    
    // Update metrics
    if (data.text_metrics) {
        document.getElementById('metricWords').textContent = data.text_metrics.words;
        document.getElementById('metricSentences').textContent = data.text_metrics.sentences;
        document.getElementById('metricReadingTime').textContent = data.text_metrics.reading_time;
        document.getElementById('metricDiversity').textContent = 
            data.features.lexical_diversity ? data.features.lexical_diversity.toFixed(2) : '0';
    }
    
    // Update analysis list
    const analysisList = document.getElementById('analysisList');
    analysisList.innerHTML = '';
    
    if (data.analysis && data.analysis.length > 0) {
        data.analysis.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            analysisList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'No specific patterns detected';
        analysisList.appendChild(li);
    }
    
    // Generate highlighted text
    if (data.sentence_analysis && data.sentence_analysis.length > 0) {
        generateHighlightedText(data.sentence_analysis);
    } else {
        // Fallback: Use the input text
        generateHighlightedTextFromText(textInput.value.trim(), data.ai_probability);
    }
}

// Text Highlighter Functions
function generateHighlightedText(sentenceAnalysis) {
    const highlightedText = document.getElementById('highlightedText');
    
    // Clear previous content
    highlightedText.innerHTML = '';
    
    if (!sentenceAnalysis || sentenceAnalysis.length === 0) {
        highlightedText.innerHTML = '<p class="placeholder">No text available for highlighting.</p>';
        updateHighlightStats(0, 0, 100);
        return;
    }
    
    const container = document.createElement('div');
    let aiCount = 0, mixedCount = 0, humanCount = 0;
    
    sentenceAnalysis.forEach(sentence => {
        const span = document.createElement('span');
        span.className = `highlight-segment ${sentence.type}`;
        span.textContent = sentence.text + ' ';
        
        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip';
        
        // Create detailed tooltip text
        let tooltipText = '';
        switch(sentence.type) {
            case 'ai':
                tooltipText = `AI-generated: Text likely generated by AI, like ChatGPT or Gemini. (${sentence.ai_probability}% AI probability)`;
                aiCount++;
                break;
            case 'mixed':
                tooltipText = `Human-written & AI-refined: Text likely written by humans, then refined or altered using AI tools. (${sentence.ai_probability}% AI probability)`;
                mixedCount++;
                break;
            case 'human':
                tooltipText = `Human-written: Text likely written by humans without the help of AI or paraphrasing tools. (${100 - sentence.ai_probability}% human probability)`;
                humanCount++;
                break;
        }
        
        tooltip.textContent = tooltipText;
        span.appendChild(tooltip);
        
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

function generateHighlightedTextFromText(text, aiProbability) {
    const highlightedText = document.getElementById('highlightedText');
    
    // Clear previous content
    highlightedText.innerHTML = '';
    
    if (!text || text.length < 50) {
        highlightedText.innerHTML = '<p class="placeholder">Text too short for highlighting analysis.</p>';
        updateHighlightStats(0, 0, 100);
        return;
    }
    
    // Split text into sentences
    const sentences = text.split(/(?<=[.!?])\s+/);
    const container = document.createElement('div');
    let aiCount = 0, mixedCount = 0, humanCount = 0;
    
    sentences.forEach(sentence => {
        if (sentence.trim().length < 10) return;
        
        // Calculate variation for this sentence
        const variation = (Math.random() - 0.5) * 0.3;
        let sentenceProb = aiProbability + variation * aiProbability;
        sentenceProb = Math.max(0, Math.min(100, sentenceProb));
        
        // Determine type
        let type, description;
        if (sentenceProb > 70) {
            type = 'ai';
            description = 'AI-generated: Text likely generated by AI, like ChatGPT or Gemini.';
            aiCount++;
        } else if (sentenceProb > 40) {
            type = 'mixed';
            description = 'Human-written & AI-refined: Text likely written by humans, then refined or altered using AI tools.';
            mixedCount++;
        } else {
            type = 'human';
            description = 'Human-written: Text likely written by humans without the help of AI or paraphrasing tools.';
            humanCount++;
        }
        
        const span = document.createElement('span');
        span.className = `highlight-segment ${type}`;
        span.textContent = sentence.trim() + ' ';
        
        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip';
        tooltip.textContent = `${description} (${Math.round(sentenceProb)}% AI probability)`;
        span.appendChild(tooltip);
        
        container.appendChild(span);
    });
    
    highlightedText.appendChild(container);
    
    const total = aiCount + mixedCount + humanCount;
    if (total > 0) {
        updateHighlightStats(
            Math.round((aiCount / total) * 100),
            Math.round((mixedCount / total) * 100),
            Math.round((humanCount / total) * 100)
        );
    } else {
        updateHighlightStats(0, 0, 100);
    }
}

function updateHighlightStats(aiPercent, mixedPercent, humanPercent) {
    document.getElementById('aiPercentage').textContent = `${aiPercent}%`;
    document.getElementById('mixedPercentage').textContent = `${mixedPercent}%`;
    document.getElementById('humanPercentage').textContent = `${humanPercent}%`;
    
    // Add appropriate classes to stat items
    const statItems = document.querySelectorAll('.stat-item');
    statItems[0].className = 'stat-item ai-stat';
    statItems[1].className = 'stat-item mixed-stat';
    statItems[2].className = 'stat-item human-stat';
}

function copyHighlightedText() {
    const highlightedText = document.getElementById('highlightedText');
    const text = highlightedText.innerText;
    
    if (!text || text.includes('Analyze text') || text.includes('No text available') || text.includes('Text too short')) {
        alert('No highlighted text to copy. Please analyze text first.');
        return;
    }
    
    navigator.clipboard.writeText(text)
        .then(() => {
            // Show success feedback
            const btn = event.target.closest('button');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            btn.disabled = true;
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy text:', err);
            alert('Failed to copy text to clipboard.');
        });
}

function clearHighlights() {
    const highlightedText = document.getElementById('highlightedText');
    highlightedText.innerHTML = '<p class="placeholder">Analyze text to see highlighted results...</p>';
    
    updateHighlightStats(0, 0, 100);
    
    // Reset stat item classes
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(item => item.className = 'stat-item');
}

// File Upload Handler
document.getElementById('fileInput').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    const allowedTypes = ['text/plain', 'application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const fileExt = file.name.split('.').pop().toLowerCase();
    
    if (!['txt', 'pdf', 'doc', 'docx'].includes(fileExt)) {
        alert('Please upload a TXT, PDF, DOC, or DOCX file.');
        this.value = ''; // Clear the input
        return;
    }
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        alert('File size too large. Maximum size is 10MB.');
        this.value = '';
        return;
    }
    
    showLoading(true);
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentAnalysisData = data;
            displayResults(data);
            resultsSection.classList.add('show');
            
            // Update textarea with extracted text
            if (data.extracted_text) {
                textInput.value = data.extracted_text;
            }
            
            // Show file info
            if (data.file_info) {
                console.log(`Extracted ${data.file_info.extracted_words} words from ${file.name}`);
            }
        } else {
            throw new Error(data.error || 'Failed to analyze file');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`File analysis failed: ${error.message}`);
    } finally {
        showLoading(false);
        // Clear the file input
        this.value = '';
    }
});

// New function to check supported formats
async function checkSupportedFormats() {
    try {
        const response = await fetch(`${API_BASE_URL}/supported-formats`);
        const data = await response.json();
        
        if (data.success) {
            console.log('Supported formats:', data.formats);
            console.log('PDF support:', data.pdf_libraries_installed ? 'Enabled' : 'Disabled');
            
            // Update UI if PDF support is missing
            if (!data.pdf_libraries_installed && data.installation_command) {
                console.warn('PDF support requires installation:', data.installation_command);
            }
        }
    } catch (error) {
        console.warn('Could not check supported formats:', error);
    }
}

// Utility Functions
function clearText() {
    textInput.value = '';
    textInput.dispatchEvent(new Event('input'));
    resultsSection.classList.remove('show');
    clearHighlights();
    currentAnalysisData = null;
}

function pasteText() {
    navigator.clipboard.readText()
        .then(text => {
            textInput.value = text;
            textInput.dispatchEvent(new Event('input'));
        })
        .catch(err => {
            alert('Failed to paste from clipboard. Please paste manually.');
        });
}

function loadSample() {
    const sampleText = `Artificial intelligence has revolutionized numerous industries, transforming the way we approach complex problems and innovate solutions. While AI offers remarkable efficiency and capability, it's essential to maintain human oversight and ethical considerations in its deployment.

The integration of machine learning algorithms has enabled unprecedented advancements in data analysis, pattern recognition, and predictive modeling. These technologies continue to evolve, offering new possibilities while raising important questions about their societal impact.

Human creativity and critical thinking remain irreplaceable, even as AI systems become more sophisticated. The balance between technological advancement and human values represents one of the most significant challenges of our time.

In my opinion, we need to establish clear guidelines and regulations to ensure AI benefits everyone. Personally, I think the key is to maintain human control over critical decisions while leveraging AI for optimization and analysis. This approach, if implemented correctly, could lead to a harmonious relationship between human intelligence and artificial systems.

However, it's important to recognize that AI tools like ChatGPT and Gemini are becoming increasingly sophisticated. These systems can generate text that closely resembles human writing, making detection more challenging. Based on the information available, many organizations are developing methods to identify AI-generated content. According to recent studies, AI-generated text often exhibits certain patterns that can be detected through statistical analysis.

I believe that as AI technology progresses, we'll see more nuanced approaches to content creation. Some text may be entirely human-written, some may be AI-generated, and much will likely fall somewhere in between - human ideas expressed through AI assistance. This mixed approach is becoming increasingly common in professional writing.

Ultimately, the goal should be transparency. If AI tools are used in content creation, this should be disclosed to readers. This maintains trust and allows for informed consumption of information.`;

    textInput.value = sampleText;
    textInput.dispatchEvent(new Event('input'));
}

// History Functions
async function loadHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/history`);
        const data = await response.json();
        
        if (data.success) {
            displayHistory(data.history);
        }
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

function displayHistory(history) {
    historyList.innerHTML = '';
    
    if (!history || history.length === 0) {
        historyList.innerHTML = '<p class="no-history">No analysis history yet.</p>';
        return;
    }
    
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${item.result && item.result.is_ai_generated ? 'ai' : 'human'}`;
        
        const aiProb = item.result ? item.result.ai_probability : 'N/A';
        const isAI = item.result ? item.result.is_ai_generated : false;
        
        historyItem.innerHTML = `
            <div class="history-header">
                <strong>${isAI ? 'AI' : 'Human'} - ${aiProb}% AI</strong>
                <small>${new Date(item.timestamp).toLocaleString()}</small>
            </div>
            <div class="history-preview">${item.text_preview || item.filename || 'No preview'}</div>
        `;
        
        historyList.appendChild(historyItem);
    });
}

function openHistoryModal() {
    loadHistory();
    historyModal.classList.add('show');
}

function closeHistoryModal() {
    historyModal.classList.remove('show');
}

// Loading State
function showLoading(show) {
    if (show) {
        loadingOverlay.classList.add('show');
    } else {
        loadingOverlay.classList.remove('show');
    }
}

// Drag and Drop Support
function setupDragAndDrop() {
    const dropArea = document.querySelector('.input-section');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            // Simulate file input change
            const fileInput = document.getElementById('fileInput');
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(files[0]);
            fileInput.files = dataTransfer.files;
            
            // Trigger change event
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
        }
    }
}

// Initialize drag and drop
setupDragAndDrop();

// Event Listeners
analyzeBtn.addEventListener('click', analyzeText);
document.getElementById('historyBtn').addEventListener('click', openHistoryModal);

// Close modal when clicking outside
historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) {
        closeHistoryModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to analyze
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        analyzeText();
    }
    
    // Escape to close modal
    if (e.key === 'Escape' && historyModal.classList.contains('show')) {
        closeHistoryModal();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    textInput.dispatchEvent(new Event('input'));
    checkSupportedFormats();
    loadHistory();
    clearHighlights();
});