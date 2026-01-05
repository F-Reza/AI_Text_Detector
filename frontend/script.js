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
            displayResults(data);
            resultsSection.classList.add('show');
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
}

// File Upload Handler - UPDATED
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
            displayResults(data);
            resultsSection.classList.add('show');
            
            // Show file info
            if (data.file_info) {
                console.log(`Extracted ${data.file_info.extracted_words} words from ${file.name}`);
                // Optional: Display file info to user
                alert(`File analyzed successfully!\nExtracted ${data.file_info.extracted_words} words from ${file.name}`);
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

In my opinion, we need to establish clear guidelines and regulations to ensure AI benefits everyone. Personally, I think the key is to maintain human control over critical decisions while leveraging AI for optimization and analysis.`;

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

// Event Listeners
analyzeBtn.addEventListener('click', analyzeText);
document.getElementById('historyBtn').addEventListener('click', openHistoryModal);

// Close modal when clicking outside
historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) {
        closeHistoryModal();
    }
});

// Initialize
textInput.dispatchEvent(new Event('input'));
checkSupportedFormats();
loadHistory();