// AI Detector Pro - Enhanced Complete Script
// Version: 3.0.0 - ML Enhanced Edition

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

// ============================================
// FIXED: SINGLE GLOBAL HISTORY REFERENCE
// ============================================
let recentAnalyses = [];
window.recentAnalyses = recentAnalyses; // Make it global

// Enhanced sample texts for better testing
const ENHANCED_SAMPLES = {
    ai: `The implementation of artificial intelligence in contemporary technological frameworks has fundamentally altered the paradigm of computational problem-solving. Machine learning algorithms, particularly those based on deep neural network architectures, demonstrate unprecedented capabilities in pattern recognition and data analysis. According to recent studies, the integration of transformer models has significantly enhanced natural language processing tasks. Furthermore, statistical methodologies employed in these systems enable sophisticated inference mechanisms that approximate human cognitive processes. However, it is important to recognize that these computational models operate within predefined parameter spaces and lack genuine comprehension of semantic content. The ethical implications surrounding AI deployment necessitate rigorous evaluation protocols and regulatory oversight to ensure alignment with human values and societal norms. Future research directions should focus on developing interpretable AI systems that maintain transparency while optimizing performance metrics across diverse application domains. In conclusion, while artificial intelligence offers remarkable potential for innovation, its responsible development requires careful consideration of both technical capabilities and societal impacts.`,

    human: `I was just thinking about AI the other day, and honestly, it's getting kinda wild, you know? Like, I use ChatGPT for help with emails and stuff, but sometimes it feels a bit... I dunno, creepy? How does it know exactly what to say all the time? And don't even get me started on those deepfake videos - that stuff is straight-up terrifying if you think about it! Personally, I think we need to pump the brakes a bit and really think about where this is all heading. I mean, I'm no expert or anything, but it seems like things are moving way too fast for most people to keep up. If you ask me, we should have more real conversations about this stuff before it's too late. What do you think? Maybe I'm overreacting, but it just feels like we're not asking the right questions, you know? Anyway, that's my two cents on the whole situation.`,

    mixed: `Artificial intelligence represents a significant advancement in computational technology, offering powerful tools for data analysis and content generation. Many professionals utilize AI assistants to enhance their productivity and streamline workflows. Personally, I've found that tools like Grammarly and ChatGPT can be incredibly helpful for refining written communication and generating initial drafts. The implementation of machine learning algorithms has indeed revolutionized various industries. However, it's crucial to maintain human oversight and critical evaluation of AI-generated content. From my perspective, the most effective approach often involves a collaborative process where AI handles repetitive tasks while humans provide creative direction and ethical judgment. This balanced methodology leverages the strengths of both artificial and human intelligence to achieve optimal outcomes in professional contexts. In my opinion, we shouldn't view AI as a replacement for human creativity but rather as a tool that can augment our capabilities when used responsibly.`
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    addEnhancedStyles();
});

function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Update word count
    textInput.dispatchEvent(new Event('input'));
    
    // Check backend status
    checkBackendStatus();
    
    // Load recent analyses from localStorage
    loadSavedHistory();
    
    // Ensure all items have proper IDs
    ensureHistoryIds();
    
    // Clear any old/invalid history entries
    cleanupOldHistory();
    
    // Set up drag and drop
    setupDragAndDrop();
    
    // Initialize UI enhancements
    initializeUIEnhancements();
    
    // Initialize Go to Top button
    initializeGoToTopButton();
    
    // Initialize currentAnalysisId
    window.currentAnalysisId = null;
    
    console.log('AI Detector Pro Enhanced Edition initialized');
}

// Add enhanced CSS styles
function addEnhancedStyles() {
    const enhancedStyles = `
        <style>
            /* Enhanced Verdict Styles */
            .verdict-ai.strong {
                border-left: 5px solid #dc2626;
                background: linear-gradient(to right, rgba(220, 38, 38, 0.05), transparent);
                padding: 20px;
                border-radius: 8px;
                margin: 10px 0;
            }
            
            .verdict-ai.moderate {
                border-left: 5px solid #f97316;
                background: linear-gradient(to right, rgba(249, 115, 22, 0.05), transparent);
                padding: 20px;
                border-radius: 8px;
                margin: 10px 0;
            }
            
            .verdict-ai.weak {
                border-left: 5px solid #f59e0b;
                background: linear-gradient(to right, rgba(245, 158, 11, 0.05), transparent);
                padding: 20px;
                border-radius: 8px;
                margin: 10px 0;
            }
            
            .verdict-human.strong {
                border-left: 5px solid #059669;
                background: linear-gradient(to right, rgba(5, 150, 105, 0.05), transparent);
                padding: 20px;
                border-radius: 8px;
                margin: 10px 0;
            }
            
            .verdict-human.moderate {
                border-left: 5px solid #0d9488;
                background: linear-gradient(to right, rgba(13, 148, 136, 0.05), transparent);
                padding: 20px;
                border-radius: 8px;
                margin: 10px 0;
            }
            
            .verdict-human.weak {
                border-left: 5px solid #0891b2;
                background: linear-gradient(to right, rgba(8, 145, 178, 0.05), transparent);
                padding: 20px;
                border-radius: 8px;
                margin: 10px 0;
            }
            
            .confidence-badge {
                display: inline-block;
                padding: 6px 16px;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 600;
                margin: 10px 0;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .high-confidence {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
            }
            
            .medium-confidence {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                color: white;
            }
            
            .low-confidence {
                background: linear-gradient(135deg, #6b7280, #4b5563);
                color: white;
            }
            
            .ai-indicator, .human-indicator {
                padding: 4px 10px;
                border-radius: 4px;
                font-size: 0.85rem;
                display: inline-block;
                margin: 2px 0;
            }
            
            .ai-indicator.strong {
                background: rgba(220, 38, 38, 0.2);
                color: #dc2626;
                border: 1px solid rgba(220, 38, 38, 0.3);
            }
            
            .ai-indicator.moderate {
                background: rgba(249, 115, 22, 0.2);
                color: #f97316;
                border: 1px solid rgba(249, 115, 22, 0.3);
            }
            
            .ai-indicator.weak {
                background: rgba(245, 158, 11, 0.2);
                color: #f59e0b;
                border: 1px solid rgba(245, 158, 11, 0.3);
            }
            
            .human-indicator.strong {
                background: rgba(5, 150, 105, 0.2);
                color: #059669;
                border: 1px solid rgba(5, 150, 105, 0.3);
            }
            
            .human-indicator.moderate {
                background: rgba(13, 148, 136, 0.2);
                color: #0d9488;
                border: 1px solid rgba(13, 148, 136, 0.3);
            }
            
            .human-indicator.weak {
                background: rgba(8, 145, 178, 0.2);
                color: #0891b2;
                border: 1px solid rgba(8, 145, 178, 0.3);
            }
            
            /* Feature Importance Styles */
            .feature-importance-section {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: var(--border-radius);
                padding: 20px;
                margin: 20px 0;
                box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            
            .feature-importance-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(238px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }
            
            .feature-importance-item {
                padding: 15px;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
                transition: all 0.3s ease;
                background: white;
            }
            
            .feature-importance-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                border-color: #d1d5db;
            }
            
            .feature-importance-item.suggestion-ai {
                border-left: 4px solid #ef4444;
            }
            
            .feature-importance-item.suggestion-human {
                border-left: 4px solid #10b981;
            }
            
            .feature-importance-item.suggestion-neutral {
                border-left: 4px solid #6b7280;
            }
            
            .feature-name {
                font-weight: 600;
                color: #1f2937;
                font-size: 0.9rem;
                text-transform: capitalize;
                margin-bottom: 5px;
            }
            
            .feature-value {
                font-size: 1.3rem;
                font-weight: 700;
                margin: 5px 0;
                color: #374151;
            }
            
            .importance-bar {
                height: 6px;
                background: #e5e7eb;
                border-radius: 3px;
                overflow: hidden;
                margin: 10px 0;
            }
            
            .importance-fill {
                height: 100%;
                background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                transition: width 1s ease;
            }
            
            .feature-suggestion {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.8rem;
                color: #6b7280;
                margin-top: 8px;
                padding-top: 8px;
                border-top: 1px solid #f3f4f6;
            }
            
            .feature-suggestion i {
                font-size: 1rem;
            }
            
            /* Model Info Styles */
            .model-info {
                background: linear-gradient(135deg, #f8fafc, #e2e8f0);
                border-radius: 8px;
                padding: 12px 18px;
                margin-bottom: 20px;
                border: 1px solid #cbd5e1;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .model-info-content {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 0.9rem;
                color: #475569;
            }
            
            .model-info-content i {
                color: #6366f1;
                font-size: 1.2rem;
            }
            
            .threshold-info {
                background: #e0e7ff;
                padding: 4px 12px;
                border-radius: 20px;
                font-weight: 600;
                color: #4f46e5;
                font-size: 0.85rem;
            }
            
            /* Explanation Styles */
            .result-explanation {
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            
            .explanation-content {
                display: flex;
                gap: 15px;
                align-items: flex-start;
            }
            
            .explanation-content i {
                color: #0284c7;
                font-size: 1.4rem;
                margin-top: 2px;
                flex-shrink: 0;
            }
            
            .explanation-text {
                flex: 1;
                color: #0c4a6e;
                line-height: 1.6;
                font-size: 0.95rem;
            }
            
            .explanation-text strong {
                color: #0369a1;
                font-weight: 600;
            }
            
            /* Enhanced Highlighting Styles */
            .enhanced-highlight-container {
                line-height: 1.8;
                font-size: 1.05rem;
            }
            
            .sentence-wrapper {
                margin-bottom: 15px;
                padding-bottom: 15px;
                border-bottom: 1px solid #f1f5f9;
                position: relative;
            }
            
            .sentence-wrapper:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }
            
            .sentence-indicator {
                margin-top: 8px;
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 0.8rem;
                color: #64748b;
            }
            
            .indicator-label {
                min-width: 60px;
                font-weight: 600;
            }
            
            .indicator-bar {
                flex: 1;
                height: 6px;
                background: #e2e8f0;
                border-radius: 3px;
                overflow: hidden;
                position: relative;
            }
            
            .indicator-fill {
                height: 100%;
                background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                transition: width 1s ease;
            }
            
            .highlight-segment.enhanced {
                padding: 2px 6px;
                border-radius: 4px;
                margin-right: 2px;
                position: relative;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline;
            }
            
            .highlight-segment.enhanced.ai {
                background: rgba(239, 68, 68, 0.15);
                border-bottom: 2px solid rgba(239, 68, 68, 0.4);
            }
            
            .highlight-segment.enhanced.ai:hover {
                background: rgba(239, 68, 68, 0.25);
                transform: translateY(-1px);
            }
            
            .highlight-segment.enhanced.mixed {
                background: rgba(245, 158, 11, 0.15);
                border-bottom: 2px solid rgba(245, 158, 11, 0.4);
            }
            
            .highlight-segment.enhanced.mixed:hover {
                background: rgba(245, 158, 11, 0.25);
                transform: translateY(-1px);
            }
            
            .highlight-segment.enhanced.human {
                background: rgba(16, 185, 129, 0.15);
                border-bottom: 2px solid rgba(16, 185, 129, 0.4);
            }
            
            .highlight-segment.enhanced.human:hover {
                background: rgba(16, 185, 129, 0.25);
                transform: translateY(-1px);
            }
            
            /* Enhanced Tooltip */
            .enhanced-tooltip {
                position: absolute;
                bottom: calc(100% + 10px);
                left: 50%;
                transform: translateX(-50%);
                background: white;
                color: #1f2937;
                padding: 12px;
                border-radius: 8px;
                font-size: 0.85rem;
                white-space: nowrap;
                opacity: 0;
                visibility: hidden;
                transition: all 0.2s ease;
                z-index: 1000;
                pointer-events: none;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                border: 1px solid #e5e7eb;
                min-width: 220px;
                max-width: 300px;
            }
            
            .enhanced-tooltip:after {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                border: 6px solid transparent;
                border-top-color: white;
            }
            
            .highlight-segment.enhanced:hover .enhanced-tooltip {
                opacity: 1;
                visibility: visible;
                bottom: calc(100% + 15px);
            }
            
            .tooltip-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 10px;
                padding-bottom: 8px;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .tooltip-header.ai-header {
                color: #ef4444;
            }
            
            .tooltip-header.human-header {
                color: #10b981;
            }
            
            .tooltip-header.mixed-header {
                color: #f59e0b;
            }
            
            .tooltip-header i {
                font-size: 1rem;
            }
            
            .tooltip-header strong {
                font-weight: 600;
            }
            
            .tooltip-content {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .tooltip-metric {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 4px 0;
            }
            
            .tooltip-metric:last-child {
                border-bottom: none;
            }
            
            .tooltip-metric span:first-child {
                color: #6b7280;
                font-size: 0.8rem;
            }
            
            .tooltip-metric strong {
                font-weight: 600;
                color: #1f2937;
            }
            
            .pattern-count {
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: 600;
            }
            
            .ai-pattern {
                background: rgba(239, 68, 68, 0.1);
                color: #ef4444;
                border: 1px solid rgba(239, 68, 68, 0.2);
            }
            
            .human-pattern {
                background: rgba(16, 185, 129, 0.1);
                color: #10b981;
                border: 1px solid rgba(16, 185, 129, 0.2);
            }
            
            /* Enhanced Stats */
            .stat-item.avg-stat {
                background: linear-gradient(135deg, #f8fafc, #e2e8f0);
                border: 2px solid #cbd5e1;
            }
            
            .stat-item.avg-stat i {
                color: #6366f1;
            }
            
            /* Loading Animation */
            .loading-content {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% {
                    opacity: 1;
                    transform: scale(1);
                }
                50% {
                    opacity: 0.8;
                    transform: scale(1.02);
                }
            }
            
            /* Enhanced Input */
            textarea:focus {
                box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
                border-color: #4361ee;
            }
            
            /* Progress Animation */
            @keyframes progress {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            
            .progress-animation {
                position: relative;
                overflow: hidden;
            }
            
            .progress-animation::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, 
                    transparent 0%, 
                    rgba(255,255,255,0.4) 50%, 
                    transparent 100%);
                animation: progress 1.5s infinite;
            }
            
            /* Clear History Button */
            .clear-history-btn {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.85rem;
                transition: all 0.3s ease;
            }
            
            .clear-history-btn:hover {
                background: linear-gradient(135deg, #dc2626, #b91c1c);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
            }
            
            /* Delete History Item Button */
            .delete-history-item {
                position: absolute;
                top: -10px;
                right: -10px;
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.2);
                color: #ef4444;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                opacity: 0;
                transition: all 0.3s ease;
                font-size: 0.8rem;
            }
            
            .history-item:hover .delete-history-item {
                opacity: 1;
            }
            
            .delete-history-item:hover {
                background: rgba(239, 68, 68, 0.2);
                transform: scale(1.1);
            }
            
            /* History Actions */
            .history-actions {
                display: flex;
                gap: 10px;
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #e5e7eb;
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', enhancedStyles);
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



    document.querySelectorAll('a[href="#how-it-works"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            openHowItWorksModal();
        });
    });
    
    // Close modal on background click
    const howItWorksModal = document.getElementById('howItWorksModal');
    if (howItWorksModal) {
        howItWorksModal.addEventListener('click', function(e) {
            if (e.target === howItWorksModal || e.target.classList.contains('close-modal')) {
                closeHowItWorksModal();
            }
        });
    }
    

    // API link
    document.querySelectorAll('a[href="#api"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            openApiModal();
        });
    });
    
    // Close API modal on background click
    const apiModal = document.getElementById('apiModal');
    if (apiModal) {
        apiModal.addEventListener('click', function(e) {
            if (e.target === apiModal || e.target.classList.contains('close-modal')) {
                closeApiModal();
            }
        });
    }

    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Add sample button listener
    updateSampleButton();
    
    // Add click handler for enhanced highlighting
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('highlight-segment')) {
            showSegmentDetails(e.target);
        }
    });
}

// Initialize UI enhancements
function initializeUIEnhancements() {
    // Add export button
    addExportButton();
    
    // Add help button
    addHelpButton();
    
    // Add model status indicator
    addModelStatusIndicator();
    
    // Enhance textarea
    enhanceTextarea();
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
    analyzeBtn.style.cursor = words.length < 20 ? 'not-allowed' : 'pointer';
    
    // Color code based on length
    if (words.length < 50) {
        wordCount.style.color = '#ef233c';
        wordCount.innerHTML = `<span style="color: #ef233c">${words.length} words (minimum 50 recommended)</span>`;
    } else if (words.length < 100) {
        wordCount.style.color = '#f8961e';
        wordCount.innerHTML = `<span style="color: #f8961e">${words.length} words (good)</span>`;
    } else if (words.length < 200) {
        wordCount.style.color = '#4cc9f0';
        wordCount.innerHTML = `<span style="color: #4cc9f0">${words.length} words (very good)</span>`;
    } else {
        wordCount.style.color = '#10b981';
        wordCount.innerHTML = `<span style="color: #10b981">${words.length} words (excellent)</span>`;
    }
}

// Enhance textarea
function enhanceTextarea() {
    // Add placeholder animation
    textInput.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    textInput.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
    
    // Add auto-resize
    textInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}

// Add export button
function addExportButton() {
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn-action export-btn';
    exportBtn.innerHTML = '<i class="fas fa-download"></i> Export Results';
    exportBtn.onclick = exportResults;
    exportBtn.style.marginLeft = 'auto';
    exportBtn.style.display = 'none';
    
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

// Add model status indicator
function addModelStatusIndicator() {
    const statusDiv = document.createElement('div');
    statusDiv.id = 'modelStatus';
    statusDiv.className = 'model-status';
    statusDiv.innerHTML = `
        <span class="status-dot"></span>
        <span class="status-text">Checking model...</span>
    `;
    
    const header = document.querySelector('.header');
    if (header) {
        header.appendChild(statusDiv);
    }
}

// Show help modal
function showHelp() {
    const helpModal = document.createElement('div');
    helpModal.className = 'modal help-modal';
    helpModal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3><i class="fas fa-question-circle"></i> AI Detector Pro - Enhanced Help</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="help-section">
                    <h4><i class="fas fa-bullseye"></i> How to Get Perfect Accuracy</h4>
                    <ul>
                        <li><strong>Text Length:</strong> Use 100+ words for best results</li>
                        <li><strong>Clear Text:</strong> Avoid mixed languages or code</li>
                        <li><strong>Complete Sentences:</strong> Provide full paragraphs</li>
                        <li><strong>Avoid Formatting:</strong> Plain text works best</li>
                    </ul>
                </div>
                <div class="help-section">
                    <h4><i class="fas fa-chart-line"></i> Understanding Results</h4>
                    <ul>
                        <li><strong>AI Probability:</strong> Percentage chance text is AI-generated</li>
                        <li><strong>Confidence:</strong> How sure the model is about its prediction</li>
                        <li><strong>Highlighting:</strong> Color-coded sentences show AI vs human patterns</li>
                        <li><strong>Feature Analysis:</strong> Shows which factors influenced the decision</li>
                    </ul>
                </div>
                <div class="help-section">
                    <h4><i class="fas fa-keyboard"></i> Keyboard Shortcuts</h4>
                    <ul>
                        <li><strong>Ctrl+Enter:</strong> Analyze text</li>
                        <li><strong>Ctrl+K:</strong> Clear all text</li>
                        <li><strong>Ctrl+P:</strong> Paste from clipboard</li>
                        <li><strong>Escape:</strong> Close modals</li>
                    </ul>
                </div>
                <div class="help-section">
                    <h4><i class="fas fa-lightbulb"></i> Tips for Best Results</h4>
                    <ul>
                        <li>For essays/articles: Use 200+ words</li>
                        <li>For short texts: Results may be less accurate</li>
                        <li>Check sentence highlighting for patterns</li>
                        <li>Review feature importance for insights</li>
                    </ul>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-primary" onclick="this.closest('.modal').remove()">Got it!</button>
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

// Analyze text function
async function analyzeText() {
    // Prevent multiple simultaneous analyses
    if (analyzeBtn.disabled || analyzeBtn.innerHTML.includes('fa-spinner')) {
        console.log('Analysis already in progress, ignoring duplicate call');
        return;
    }
    
    // Disable button and show loading state
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    
    const text = textInput.value.trim();
    const words = text.split(/\s+/).filter(word => word.length > 0);
    
    // Validation
    if (words.length < 20) {
        showError('Please enter at least 20 words for analysis.', 'For best accuracy, use 100+ words.');
        
        // Re-enable button
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Text';
        return;
    }
    
    if (words.length < 50) {
        const proceed = confirm(`⚠️ For best accuracy, we recommend at least 50 words.\n\nYou have ${words.length} words.\n\nContinue anyway?`);
        if (!proceed) {
            // Re-enable button
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Text';
            return;
        }
    }
    
    showLoading(true, 'Analyzing with enhanced ML model...');
    updateModelStatus('loading', 'Analyzing text...');
    
    // Create a unique analysis ID to track this specific request
    const analysisId = Date.now() + Math.random();
    window.currentAnalysisId = analysisId;
    
    try {
        console.log(`Starting analysis #${analysisId} with ${words.length} words`);
        
        const response = await fetch(`${API_BASE_URL}/detect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });
        
        // Check if this analysis is still the current one (user hasn't started another)
        if (window.currentAnalysisId !== analysisId) {
            console.log('Analysis cancelled - new analysis started');
            return;
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        
        // Final check for analysis ID
        if (window.currentAnalysisId !== analysisId) {
            console.log('Analysis result ignored - newer analysis exists');
            return;
        }
        
        if (data.success) {
            console.log(`Analysis #${analysisId} completed successfully`);
            currentAnalysisData = data;
            
            // Use enhanced display for ML model results
            if (data.model_version && data.model_version.includes('enhanced')) {
                displayEnhancedResults(data);
            } else {
                displayResults(data);  // Fallback to original display
            }
            
            resultsSection.classList.add('show');
            
            // Save to history
            saveToRecentAnalyses(data, text);
            
            // Show export button
            const exportBtn = document.querySelector('.export-btn');
            if (exportBtn) exportBtn.style.display = 'flex';
            
            // Show success with details
            const aiProb = data.ai_probability;
            let message = `Analysis complete! `;
            
            if (aiProb > 80) {
                message += `Strong AI detection (${aiProb}% AI)`;
            } else if (aiProb > 60) {
                message += `Likely AI (${aiProb}% AI)`;
            } else if (aiProb > 40) {
                message += `Mixed content (${aiProb}% AI)`;
            } else if (aiProb > 20) {
                message += `Likely human (${100 - aiProb}% human)`;
            } else {
                message += `Strong human detection (${100 - aiProb}% human)`;
            }
            
            showSuccess(message);
            updateModelStatus('active', `Using ${data.model_version || 'Enhanced ML Model'}`);
            
        } else {
            throw new Error(data.error || 'Analysis failed');
        }
    } catch (error) {
        console.error('Analysis error:', error);
        
        // Only show error if this is still the current analysis
        if (window.currentAnalysisId === analysisId) {
            showError(`Analysis failed: ${error.message}`, 'Please check your backend server is running.');
            updateModelStatus('error', 'Analysis failed');
        }
    } finally {
        // Only clean up if this is still the current analysis
        if (window.currentAnalysisId === analysisId) {
            showLoading(false);
            
            // Re-enable button
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Text';
            
            // Clear analysis ID
            window.currentAnalysisId = null;
        }
    }
}

function calculateTextSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    
    // Simple similarity calculation based on common words
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
}

// Display enhanced results
function displayEnhancedResults(data) {
    // Update probabilities with enhanced animation
    updateProbabilities(data.ai_probability, data.human_probability);
    
    // Update verdict with more details
    updateEnhancedVerdict(data);
    
    // Update confidence
    updateConfidence(data.confidence);
    
    // Update result status
    updateResultStatus(data.is_ai_generated, data.confidence);
    
    // Update metrics
    updateMetrics(data);
    
    // Update analysis list
    updateAnalysisList(data);
    
    // Generate enhanced highlighted text
    if (data.sentence_analysis && data.sentence_analysis.length > 0) {
        generateEnhancedHighlightedText(data.sentence_analysis);
    }
    
    // Display feature importance
    if (data.feature_importance) {
        displayFeatureImportance(data.feature_importance);
    }
    
    // Display model info
    displayModelInfo(data);
    
    // Add explanation
    addResultExplanation(data);
}

// ============================================
// FIXED HISTORY FUNCTIONS
// ============================================

// Load saved history from localStorage - COMPLETELY FIXED
function loadSavedHistory() {
    console.log('loadSavedHistory called');
    try {
        const savedHistory = localStorage.getItem('aiDetectorHistory');
        console.log('Saved history from localStorage:', savedHistory);
        
        if (!savedHistory || savedHistory === '[]' || savedHistory === 'null') {
            console.log('No history found or empty history in localStorage');
            recentAnalyses = [];
            window.recentAnalyses = recentAnalyses; // Update global reference
            return false;
        }
        
        const parsedHistory = JSON.parse(savedHistory);
        console.log('Parsed history:', parsedHistory);
        
        if (!Array.isArray(parsedHistory)) {
            console.error('Invalid history format in localStorage');
            recentAnalyses = [];
            window.recentAnalyses = recentAnalyses;
            localStorage.removeItem('aiDetectorHistory'); // Clear corrupted data
            return false;
        }
        
        // Remove duplicates based on content hash
        const uniqueHistory = [];
        const seenHashes = new Set();
        
        for (let i = 0; i < parsedHistory.length; i++) {
            const item = parsedHistory[i];
            if (!item || typeof item !== 'object') continue;
            
            // Generate content hash if not exists
            const textForHash = item.full_text || item.text_preview || '';
            const contentHash = item.content_hash || createContentHash(textForHash.substring(0, 500));
            
            // Skip duplicates
            if (seenHashes.has(contentHash)) {
                continue;
            }
            seenHashes.add(contentHash);
            
            // Ensure required fields
            if (!item.id) {
                item.id = Date.now() + i;
            }
            
            if (!item.timestamp) {
                item.timestamp = new Date().toISOString();
            }
            
            // Add content hash if not present
            if (!item.content_hash) {
                item.content_hash = contentHash;
            }
            
            uniqueHistory.push(item);
        }
        
        // Limit to 20 items
        recentAnalyses = uniqueHistory.slice(0, 20);
        window.recentAnalyses = recentAnalyses; // Update global reference
        
        console.log(`Loaded ${recentAnalyses.length} unique history items from localStorage`);
        return true;
        
    } catch (error) {
        console.error('Error loading history from localStorage:', error);
        recentAnalyses = [];
        window.recentAnalyses = recentAnalyses;
        
        // Clear corrupted data
        try {
            localStorage.removeItem('aiDetectorHistory');
        } catch {}
        
        return false;
    }
}

// Save history to localStorage - FIXED
function saveHistory() {
    try {
        console.log('Saving history to localStorage:', recentAnalyses);
        
        // Create a copy to avoid circular references
        const historyToSave = recentAnalyses.map(item => {
            return {
                id: item.id,
                timestamp: item.timestamp,
                result: item.result,
                text_preview: item.text_preview,
                full_text: item.full_text, // Ensure full_text is saved
                wordCount: item.wordCount,
                model_version: item.model_version,
                content_hash: item.content_hash
            };
        });
        
        const historyString = JSON.stringify(historyToSave);
        localStorage.setItem('aiDetectorHistory', historyString);
        console.log(`Successfully saved ${recentAnalyses.length} history items to localStorage`);
        return true;
    } catch (error) {
        console.error('Error saving history to localStorage:', error);
        return false;
    }
}


// Load history for display - FIXED
async function loadHistory() {
    console.log('loadHistory called');
    try {
        // showLoading(true, 'Loading history...');
        
        // Always reload fresh data from localStorage
        loadSavedHistory();
        
        // Display the current history
        displayHistory(recentAnalyses);
        
    } catch (error) {
        console.error('History load error:', error);
        displayHistory(recentAnalyses);
    } finally {
        showLoading(false);
    }
}

// Display history in modal - FIXED
function displayHistory(history) {
    console.log('displayHistory called with:', history);
    if (!historyList) return;
    
    // Clear the list
    historyList.innerHTML = '';
    
    if (!history || history.length === 0) {
        historyList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #6b7280;">
                <i class="fas fa-history fa-3x" style="margin-bottom: 15px; opacity: 0.5;"></i>
                <p>No analysis history yet.</p>
                <p style="font-size: 0.9rem;">Analyze some text to see it here!</p>
            </div>
        `;
        return;
    }
    
    // Create clear all button
    const clearAllButton = document.createElement('div');
    clearAllButton.className = 'history-actions';
    clearAllButton.innerHTML = `
        <button onclick="clearAllHistory()" class="clear-history-btn" style="margin-left: auto;">
            <i class="fas fa-trash-alt"></i> Clear All History (${history.length} items)
        </button>
    `;
    historyList.appendChild(clearAllButton);
    
    // Display history items
    const limitedHistory = history.slice(0, 20);
    
    limitedHistory.forEach((item, index) => {
        const isAI = item.result?.is_ai_generated || item.isAI || false;
        const aiProb = item.result?.ai_probability || item.aiProbability || 0;
        const confidence = item.result?.confidence || 0;
        const timestamp = item.timestamp || new Date().toISOString();
        const textPreview = item.text_preview || item.textPreview || 'No preview available';
        const fullText = item.full_text || item.text_preview || ''; // Get full text if available
        const wordCount = item.wordCount || item.result?.text_metrics?.words || 0;
        const id = item.id || Date.now() + index;
        
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${isAI ? 'ai' : 'human'}`;
        historyItem.style.cssText = `
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
            border-left: 4px solid ${isAI ? '#ef4444' : '#10b981'};
            background: white;
            transition: all 0.2s;
            border: 1px solid #e5e7eb;
            position: relative;
        `;
        historyItem.dataset.id = id;
        historyItem.dataset.fullText = fullText; // Store full text in data attribute
        
        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-history-item';
        deleteButton.innerHTML = '<i class="fas fa-times"></i>';
        deleteButton.title = 'Delete this history item';
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            deleteHistoryItem(id);
        };
        
        historyItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <div>
                    <strong style="color: ${isAI ? '#ef4444' : '#10b981'};">
                        ${isAI ? '🤖 AI' : '👤 Human'} - ${aiProb}% AI
                    </strong>
                    <div style="font-size: 0.8rem; color: #6b7280; margin-top: 2px;">
                        ${formatDate(timestamp)}
                    </div>
                </div>
                <div style="font-size: 0.8rem; background: ${confidence >= 80 ? '#10b98120' : confidence >= 60 ? '#f59e0b20' : '#ef444420'}; 
                     color: ${confidence >= 80 ? '#059669' : confidence >= 60 ? '#d97706' : '#dc2626'}; 
                     padding: 2px 8px; border-radius: 4px;">
                    ${confidence}% conf
                </div>
            </div>
            <div class="history-preview" style="font-size: 0.9rem; color: #6b7280; line-height: 1.4; margin-right: 25px;">
                ${textPreview}
            </div>
            ${wordCount ? `
                <div class="history-meta" style="margin-top: 8px; font-size: 0.8rem; color: #9ca3af;">
                    <i class="fas fa-font"></i> ${wordCount} words
                </div>
            ` : ''}
        `;
        
        historyItem.appendChild(deleteButton);
        
        // Click to load - FIXED to use full text
        historyItem.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-history-item')) {
                const fullText = historyItem.dataset.fullText;
                if (fullText && fullText.trim()) {
                    if (fullText.startsWith('File: ')) {
                        showError('Cannot load file analysis', 'File uploads store only previews. Please re-upload the file.');
                        return;
                    }
                    
                    textInput.value = fullText;
                    updateWordCount();
                    closeHistoryModal();
                    showSuccess('History item loaded.', 'Full text restored. Click "Analyze Text" to re-analyze or edit first.');
                } else {
                    // Fallback to preview text if full text not available
                    let text = textPreview;
                    if (textPreview.startsWith('File: ')) {
                        showError('Cannot load file analysis', 'File uploads store only previews. Please re-upload the file.');
                        return;
                    }
                    
                    text = text.replace(/\.\.\.$/, '');
                    textInput.value = text;
                    updateWordCount();
                    closeHistoryModal();
                    showSuccess('History item loaded (preview only).', 'Click "Analyze Text" to re-analyze or edit first.');
                }
            }
        });
        
        historyList.appendChild(historyItem);
    });
    
    // Add stats
    const statsDiv = document.createElement('div');
    statsDiv.className = 'history-stats';
    statsDiv.style.cssText = `
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
        font-size: 0.9rem;
        color: #6b7280;
        text-align: center;
    `;
    
    const aiCount = history.filter(item => item.result?.is_ai_generated || item.isAI).length;
    const humanCount = history.length - aiCount;
    
    statsDiv.innerHTML = `
        <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 10px;">
            <span><i class="fas fa-robot" style="color: #ef4444;"></i> ${aiCount} AI</span>
            <span><i class="fas fa-user" style="color: #10b981;"></i> ${humanCount} Human</span>
            <span><i class="fas fa-list" style="color: #6b7280;"></i> ${history.length} Total</span>
        </div>
        <div style="font-size: 0.8rem;">
            History is automatically saved to your browser's localStorage
        </div>
    `;
    
    historyList.appendChild(statsDiv);
}

// Delete a single history item - FIXED
function deleteHistoryItem(id) {
    if (!confirm('Are you sure you want to delete this history item?')) {
        return;
    }
    
    // Find the index of the item to delete
    const itemIndex = recentAnalyses.findIndex(item => {
        const itemId = item.id || item._id;
        return itemId && itemId.toString() === id.toString();
    });
    
    if (itemIndex === -1) {
        showError('Item not found.', 'The history item may have already been deleted.');
        return;
    }
    
    // Remove the item from the array
    recentAnalyses.splice(itemIndex, 1);
    window.recentAnalyses = recentAnalyses; // Update global reference
    
    // Save to localStorage
    saveHistory();
    
    // Update display
    displayHistory(recentAnalyses);
    
    showSuccess('History item deleted.', 'Item removed from history.');
}

// Clear all history - COMPLETELY FIXED
function clearAllHistory() {
    console.log('clearAllHistory called, current history:', recentAnalyses);
    
    if (!recentAnalyses || recentAnalyses.length === 0) {
        showError('No history to clear.', 'Your history is already empty.');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete all ${recentAnalyses.length} history items?\n\nThis action cannot be undone.`)) {
        return;
    }
    
    const count = recentAnalyses.length;
    
    // Clear the array - assign new empty array to break all references
    recentAnalyses = [];
    window.recentAnalyses = recentAnalyses; // Update global reference
    
    // Clear localStorage
    try {
        localStorage.removeItem('aiDetectorHistory');
        localStorage.setItem('aiDetectorHistory', JSON.stringify([]));
        console.log('Successfully cleared localStorage');
    } catch (error) {
        console.error('Error clearing localStorage:', error);
        try {
            localStorage.clear();
        } catch (e) {
            console.error('Could not clear localStorage:', e);
        }
    }
    
    // Update display
    if (historyModal && historyModal.classList.contains('show')) {
        displayHistory(recentAnalyses);
    }
    
    // Show success message
    showSuccess(`Cleared ${count} history items.`, 'All analysis history has been removed.');
    
    console.log('After clear - recentAnalyses:', recentAnalyses);
}

// Save to recent analyses - FIXED
function saveToRecentAnalyses(data, text) {
    console.log('saveToRecentAnalyses called');
    
    // Create a unique content hash to prevent duplicates
    const textHash = createContentHash(text.substring(0, 500));
    const timestamp = new Date().toISOString();
    
    const newId = Date.now() + Math.floor(Math.random() * 1000);
    const analysis = {
        id: newId,
        timestamp: timestamp,
        result: {
            ai_probability: data.ai_probability,
            is_ai_generated: data.is_ai_generated,
            confidence: data.confidence,
            text_metrics: data.text_metrics
        },
        // Save both preview AND full text
        text_preview: text.substring(0, 150) + (text.length > 150 ? '...' : ''),
        full_text: text, // ADD THIS: Save the full text
        wordCount: data.text_metrics?.words || 0,
        model_version: data.model_version || '1.0.0',
        content_hash: textHash
    };
    
    // Remove any existing items with similar content
    recentAnalyses = recentAnalyses.filter(item => {
        const itemTextHash = item.content_hash || createContentHash((item.text_preview || '').substring(0, 500));
        return itemTextHash !== textHash;
    });
    
    // Add new analysis to beginning
    recentAnalyses.unshift(analysis);
    window.recentAnalyses = recentAnalyses; // Update global reference
    
    // Keep only 20 most recent
    if (recentAnalyses.length > 20) {
        recentAnalyses = recentAnalyses.slice(0, 20);
        window.recentAnalyses = recentAnalyses;
    }
    
    // Save to localStorage
    saveHistory();
    console.log(`Saved new analysis to history. Total: ${recentAnalyses.length} items`);
}
// Content hash function
function createContentHash(text) {
    if (!text) return '0';
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
}

// Open history modal - FIXED
function openHistoryModal() {
    console.log('openHistoryModal called');
    // Always load fresh data from localStorage
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
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) {
            return 'Just now';
        } else if (diffMins < 60) {
            return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
        } else {
            return date.toLocaleDateString();
        }
    } catch {
        return 'Unknown date';
    }
}

// Ensure all history items have proper IDs
function ensureHistoryIds() {
    let needsSave = false;
    recentAnalyses.forEach((item, index) => {
        if (!item.id) {
            if (item.timestamp) {
                item.id = new Date(item.timestamp).getTime();
            } else {
                item.id = Date.now() + index;
            }
            needsSave = true;
        }
    });
    
    if (needsSave) {
        saveHistory();
    }
}

// This function to clean up old history
function cleanupOldHistory() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const initialLength = recentAnalyses.length;
    recentAnalyses = recentAnalyses.filter(item => {
        try {
            if (!item.timestamp) return false;
            const itemDate = new Date(item.timestamp);
            return itemDate > oneMonthAgo;
        } catch {
            return false;
        }
    });
    
    if (recentAnalyses.length !== initialLength) {
        saveHistory();
        console.log(`Cleaned up ${initialLength - recentAnalyses.length} old history items`);
    }
}

// Update probabilities with enhanced animation
function updateProbabilities(aiProb, humanProb) {
    // Human probability
    const humanElement = document.getElementById('humanProbability');
    const humanValue = humanElement?.querySelector('.probability-value');
    const humanBar = humanElement?.querySelector('.probability-fill.human-fill');
    
    // AI probability
    const aiElement = document.getElementById('aiProbability');
    const aiValue = aiElement?.querySelector('.probability-value');
    const aiBar = aiElement?.querySelector('.probability-fill.ai-fill');
    
    // Animate values with progress bar effect
    if (humanValue && aiValue) {
        humanElement?.classList.add('progress-animation');
        aiElement?.classList.add('progress-animation');
        
        animateValue(humanValue, 50, humanProb, 1500);
        animateValue(aiValue, 50, aiProb, 1500);
        
        // Animate bars with delay
        setTimeout(() => {
            if (humanBar) {
                humanBar.style.width = `${humanProb}%`;
                humanBar.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
            }
            if (aiBar) {
                aiBar.style.width = `${aiProb}%`;
                aiBar.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
            }
            
            // Remove animation class after completion
            setTimeout(() => {
                humanElement?.classList.remove('progress-animation');
                aiElement?.classList.remove('progress-animation');
            }, 1500);
        }, 200);
    }
}

// Animate numeric value
function animateValue(element, start, end, duration) {
    let startTime = null;
    const elementToAnimate = element;
    
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const value = Math.floor(start + progress * (end - start));
        
        if (elementToAnimate) {
            elementToAnimate.textContent = `${value}%`;
            // Color code based on value
            if (elementToAnimate.parentElement?.parentElement?.classList.contains('human')) {
                elementToAnimate.style.color = value >= 70 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444';
            } else {
                elementToAnimate.style.color = value >= 70 ? '#ef4444' : value >= 50 ? '#f59e0b' : '#10b981';
            }
        }
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    }
    
    window.requestAnimationFrame(step);
}

// Update enhanced verdict
function updateEnhancedVerdict(data) {
    const verdictText = document.getElementById('verdictText');
    if (!verdictText) return;
    
    const aiProb = data.ai_probability;
    const confidence = data.confidence;
    const isAI = data.is_ai_generated;
    const wordCount = data.text_metrics?.words || 0;
    
    let verdictHTML = '';
    let strengthClass = '';
    let confidenceClass = '';
    
    if (isAI) {
        if (aiProb >= 85) {
            strengthClass = 'strong';
            confidenceClass = 'high-confidence';
            verdictHTML = `
                <div class="verdict-ai strong">
                    <i class="fas fa-robot fa-2x"></i>
                    <h3>STRONG AI DETECTION</h3>
                    <div class="confidence-badge high-confidence">
                        <i class="fas fa-shield-alt"></i>
                        ${confidence}% Confidence
                    </div>
                    <p><strong>${aiProb}% AI Probability</strong> - This text shows multiple strong AI patterns.</p>
                    <div class="verdict-details">
                        <div class="detail-item">
                            <i class="fas fa-brain"></i>
                            <strong>Key Indicators:</strong>
                            <span class="ai-indicator strong">Formal structure</span>
                            <span class="ai-indicator strong">AI characteristic phrases</span>
                            <span class="ai-indicator strong">Uniform sentence length</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-chart-line"></i>
                            <strong>Text Analysis:</strong>
                            <span>${wordCount} words analyzed (excellent for detection)</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-lightbulb"></i>
                            <strong>Recommendation:</strong>
                            <span style="color: #dc2626; font-weight: 600">High likelihood of AI generation</span>
                        </div>
                    </div>
                </div>
            `;
        } else if (aiProb >= 70) {
            strengthClass = 'moderate';
            confidenceClass = 'medium-confidence';
            verdictHTML = `
                <div class="verdict-ai moderate">
                    <i class="fas fa-robot"></i>
                    <h3>LIKELY AI-GENERATED</h3>
                    <div class="confidence-badge medium-confidence">
                        <i class="fas fa-shield-alt"></i>
                        ${confidence}% Confidence
                    </div>
                    <p><strong>${aiProb}% AI Probability</strong> - This text appears to be AI-generated.</p>
                    <div class="verdict-details">
                        <div class="detail-item">
                            <i class="fas fa-brain"></i>
                            <strong>Key Indicators:</strong>
                            <span class="ai-indicator moderate">AI patterns detected</span>
                            <span class="ai-indicator moderate">Formal language</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-chart-line"></i>
                            <strong>Text Analysis:</strong>
                            <span>${wordCount} words analyzed</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-lightbulb"></i>
                            <strong>Note:</strong>
                            <span style="color: #f97316; font-weight: 600">Some human-like elements present</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            strengthClass = 'weak';
            confidenceClass = 'low-confidence';
            verdictHTML = `
                <div class="verdict-ai weak">
                    <i class="fas fa-robot"></i>
                    <h3>POSSIBLE AI INFLUENCE</h3>
                    <div class="confidence-badge low-confidence">
                        <i class="fas fa-shield-alt"></i>
                        ${confidence}% Confidence
                    </div>
                    <p><strong>${aiProb}% AI Probability</strong> - This text shows some AI patterns.</p>
                    <div class="verdict-details">
                        <div class="detail-item">
                            <i class="fas fa-brain"></i>
                            <strong>Key Indicators:</strong>
                            <span class="ai-indicator weak">Limited AI signals</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-chart-line"></i>
                            <strong>Text Analysis:</strong>
                            <span>${wordCount} words analyzed (more text would improve accuracy)</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-lightbulb"></i>
                            <strong>Consideration:</strong>
                            <span style="color: #f59e0b; font-weight: 600">Could be AI-assisted or human with formal style</span>
                        </div>
                    </div>
                </div>
            `;
        }
    } else {
        const humanProb = 100 - aiProb;
        if (aiProb <= 15) {
            strengthClass = 'strong';
            confidenceClass = 'high-confidence';
            verdictHTML = `
                <div class="verdict-human strong">
                    <i class="fas fa-user fa-2x"></i>
                    <h3>STRONG HUMAN DETECTION</h3>
                    <div class="confidence-badge high-confidence">
                        <i class="fas fa-shield-alt"></i>
                        ${confidence}% Confidence
                    </div>
                    <p><strong>${humanProb}% Human Probability</strong> - This text shows strong human writing patterns.</p>
                    <div class="verdict-details">
                        <div class="detail-item">
                            <i class="fas fa-comments"></i>
                            <strong>Key Indicators:</strong>
                            <span class="human-indicator strong">Conversational elements</span>
                            <span class="human-indicator strong">Personal expressions</span>
                            <span class="human-indicator strong">Varied sentence structure</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-chart-line"></i>
                            <strong>Text Analysis:</strong>
                            <span>${wordCount} words analyzed (excellent for detection)</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-lightbulb"></i>
                            <strong>Note:</strong>
                            <span style="color: #059669; font-weight: 600">Appears to be genuine human writing</span>
                        </div>
                    </div>
                </div>
            `;
        } else if (aiProb <= 30) {
            strengthClass = 'moderate';
            confidenceClass = 'medium-confidence';
            verdictHTML = `
                <div class="verdict-human moderate">
                    <i class="fas fa-user"></i>
                    <h3>LIKELY HUMAN-WRITTEN</h3>
                    <div class="confidence-badge medium-confidence">
                        <i class="fas fa-shield-alt"></i>
                        ${confidence}% Confidence
                    </div>
                    <p><strong>${humanProb}% Human Probability</strong> - This text appears to be human-written.</p>
                    <div class="verdict-details">
                        <div class="detail-item">
                            <i class="fas fa-comments"></i>
                            <strong>Key Indicators:</strong>
                            <span class="human-indicator moderate">Human writing patterns</span>
                            <span class="human-indicator moderate">Natural variation</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-chart-line"></i>
                            <strong>Text Analysis:</strong>
                            <span>${wordCount} words analyzed</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-lightbulb"></i>
                            <strong>Note:</strong>
                            <span style="color: #0d9488; font-weight: 600">Some formal/structured elements present</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            strengthClass = 'weak';
            confidenceClass = 'low-confidence';
            verdictHTML = `
                <div class="verdict-human weak">
                    <i class="fas fa-user"></i>
                    <h3>MIXED CHARACTERISTICS</h3>
                    <div class="confidence-badge low-confidence">
                        <i class="fas fa-shield-alt"></i>
                        ${confidence}% Confidence
                    </div>
                    <p><strong>${humanProb}% Human Probability</strong> - This text has characteristics of both human and AI writing.</p>
                    <div class="verdict-details">
                        <div class="detail-item">
                            <i class="fas fa-comments"></i>
                            <strong>Key Indicators:</strong>
                            <span class="human-indicator weak">Some human patterns</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-chart-line"></i>
                            <strong>Text Analysis:</strong>
                            <span>${wordCount} words analyzed</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-lightbulb"></i>
                            <strong>Consideration:</strong>
                            <span style="color: #0891b2; font-weight: 600">Could be human writing with AI influence</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    verdictText.innerHTML = verdictHTML;
}

// Update confidence meter
function updateConfidence(confidence) {
    const confidenceValue = document.getElementById('confidenceValue');
    const confidenceFill = document.getElementById('confidenceFill');
    
    if (confidenceValue) {
        confidenceValue.textContent = `${confidence}%`;
        // Color code based on confidence
        if (confidence >= 80) {
            confidenceValue.style.color = '#059669';
        } else if (confidence >= 60) {
            confidenceValue.style.color = '#f59e0b';
        } else {
            confidenceValue.style.color = '#ef4444';
        }
    }
    
    if (confidenceFill) {
        confidenceFill.style.width = `${confidence}%`;
        confidenceFill.style.transition = 'width 1.5s ease';
        
        // Color gradient based on confidence
        if (confidence >= 80) {
            confidenceFill.style.background = 'linear-gradient(90deg, #10b981, #059669)';
        } else if (confidence >= 60) {
            confidenceFill.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
        } else {
            confidenceFill.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        }
    }
}

// Update result status
function updateResultStatus(isAI, confidence) {
    const resultStatus = document.getElementById('resultStatus');
    if (resultStatus) {
        let statusText = '';
        let statusColor = '';
        
        if (isAI) {
            if (confidence >= 80) {
                statusText = `🤖 STRONG AI DETECTION (${confidence}% confidence)`;
                statusColor = '#dc2626';
            } else if (confidence >= 60) {
                statusText = `🤖 LIKELY AI (${confidence}% confidence)`;
                statusColor = '#f97316';
            } else {
                statusText = `🤖 POSSIBLE AI (${confidence}% confidence)`;
                statusColor = '#f59e0b';
            }
        } else {
            if (confidence >= 80) {
                statusText = `👤 STRONG HUMAN DETECTION (${confidence}% confidence)`;
                statusColor = '#059669';
            } else if (confidence >= 60) {
                statusText = `👤 LIKELY HUMAN (${confidence}% confidence)`;
                statusColor = '#0d9488';
            } else {
                statusText = `👤 MIXED CHARACTERISTICS (${confidence}% confidence)`;
                statusColor = '#0891b2';
            }
        }
        
        resultStatus.textContent = statusText;
        resultStatus.style.color = statusColor;
        resultStatus.style.fontWeight = '600';
    }
}

// Update metrics
function updateMetrics(data) {
    // Update words
    const wordsElement = document.getElementById('metricWords');
    if (wordsElement) {
        const words = data.text_metrics?.words || 0;
        wordsElement.textContent = words.toLocaleString();
        
        // Color code based on word count
        if (words >= 200) {
            wordsElement.style.color = '#10b981';
        } else if (words >= 100) {
            wordsElement.style.color = '#4cc9f0';
        } else if (words >= 50) {
            wordsElement.style.color = '#f8961e';
        } else {
            wordsElement.style.color = '#ef233c';
        }
    }
    
    // Update sentences
    const sentencesElement = document.getElementById('metricSentences');
    if (sentencesElement) {
        sentencesElement.textContent = data.text_metrics?.sentences?.toLocaleString() || '0';
    }
    
    // Update reading time
    const readingTimeElement = document.getElementById('metricReadingTime');
    if (readingTimeElement) {
        const time = data.text_metrics?.reading_time || 0;
        readingTimeElement.textContent = time < 1 ? '<1' : Math.round(time);
    }
    
    // Update lexical diversity
    const diversityElement = document.getElementById('metricDiversity');
    if (diversityElement) {
        const diversity = data.features?.lexical_diversity || 0;
        diversityElement.textContent = diversity.toFixed(2);
        
        // Color code based on diversity (AI tends to have lower diversity)
        if (diversity > 0.7) {
            diversityElement.style.color = '#10b981';
            diversityElement.title = 'High diversity (human-like)';
        } else if (diversity > 0.55) {
            diversityElement.style.color = '#f59e0b';
            diversityElement.title = 'Moderate diversity';
        } else {
            diversityElement.style.color = '#ef4444';
            diversityElement.title = 'Low diversity (AI-like)';
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
            const icon = getAnalysisIcon(item);
            const color = getAnalysisColor(item);
            
            li.innerHTML = `
                <i class="fas fa-${icon}" style="color: ${color};"></i>
                <span>${item}</span>
            `;
            li.style.color = color;
            li.style.padding = '8px 0';
            li.style.borderBottom = '1px solid #f3f4f6';
            
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
    const textLower = text.toLowerCase();
    
    if (textLower.includes('ai') || textLower.includes('ai-generated')) return 'robot';
    if (textLower.includes('human') || textLower.includes('human-written')) return 'user';
    if (textLower.includes('diversity')) return 'chart-line';
    if (textLower.includes('sentence')) return 'paragraph';
    if (textLower.includes('readability')) return 'book-reader';
    if (textLower.includes('pattern')) return 'fingerprint';
    if (textLower.includes('variation')) return 'wave-square';
    if (textLower.includes('repetition')) return 'redo';
    if (textLower.includes('burstiness')) return 'bolt';
    return 'info-circle';
}

// Get color for analysis item
function getAnalysisColor(text) {
    if (!text) return '#6c757d';
    const textLower = text.toLowerCase();
    
    if (textLower.includes('ai') || textLower.includes('ai-generated') || 
        textLower.includes('low diversity') || textLower.includes('uniform')) {
        return '#ef4444';
    }
    if (textLower.includes('human') || textLower.includes('human-written') || 
        textLower.includes('high diversity') || textLower.includes('varied')) {
        return '#10b981';
    }
    if (textLower.includes('mixed') || textLower.includes('moderate') || 
        textLower.includes('uncertain')) {
        return '#f59e0b';
    }
    return '#6b7280';
}

// Generate enhanced highlighted text
function generateEnhancedHighlightedText(sentenceAnalysis) {
    const highlightedText = document.getElementById('highlightedText');
    if (!highlightedText) return;
    
    highlightedText.innerHTML = '';
    
    if (!sentenceAnalysis || sentenceAnalysis.length === 0) {
        highlightedText.innerHTML = '<p class="placeholder">No text available for highlighting.</p>';
        updateEnhancedHighlightStats(0, 0, 100, 50);
        return;
    }
    
    const container = document.createElement('div');
    container.className = 'enhanced-highlight-container';
    
    let aiCount = 0, mixedCount = 0, humanCount = 0;
    let totalAIProbability = 0;
    
    // Limit to first 30 sentences for performance
    const sentencesToShow = sentenceAnalysis.slice(0, 30);
    
    sentencesToShow.forEach((sentence, index) => {
        if (!sentence || !sentence.text) return;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'sentence-wrapper';
        
        const span = document.createElement('span');
        span.className = `highlight-segment enhanced ${sentence.type || 'mixed'}`;
        span.textContent = sentence.text;
        span.dataset.index = index;
        span.dataset.aiProb = sentence.ai_probability;
        span.dataset.description = sentence.description || '';
        
        // Enhanced tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'enhanced-tooltip';
        
        const headerClass = sentence.type === 'ai' ? 'ai-header' : 
                           sentence.type === 'human' ? 'human-header' : 'mixed-header';
        
        const headerIcon = sentence.type === 'ai' ? 'fas fa-robot' :
                          sentence.type === 'human' ? 'fas fa-user' : 'fas fa-blend';
        
        const aiPatterns = sentence.patterns?.ai_patterns || 0;
        const humanPatterns = sentence.patterns?.human_patterns || 0;
        const wordCount = sentence.patterns?.word_count || sentence.text.split(' ').length;
        
        tooltip.innerHTML = `
            <div class="tooltip-header ${headerClass}">
                <i class="${headerIcon}"></i>
                <strong>${sentence.description || 'Unknown'}</strong>
            </div>
            <div class="tooltip-content">
                <div class="tooltip-metric">
                    <span>AI Probability:</span>
                    <strong>${sentence.ai_probability}%</strong>
                </div>
                <div class="tooltip-metric">
                    <span>Words:</span>
                    <strong>${wordCount}</strong>
                </div>
                <div class="tooltip-metric">
                    <span>AI Patterns:</span>
                    <span class="pattern-count ai-pattern">${aiPatterns}</span>
                </div>
                <div class="tooltip-metric">
                    <span>Human Patterns:</span>
                    <span class="pattern-count human-pattern">${humanPatterns}</span>
                </div>
            </div>
        `;
        
        span.appendChild(tooltip);
        wrapper.appendChild(span);
        
        // Add sentence probability indicator
        const indicator = document.createElement('div');
        indicator.className = 'sentence-indicator';
        indicator.innerHTML = `
            <span class="indicator-label">${sentence.ai_probability}% AI</span>
            <div class="indicator-bar">
                <div class="indicator-fill" style="width: ${sentence.ai_probability}%"></div>
            </div>
        `;
        wrapper.appendChild(indicator);
        
        container.appendChild(wrapper);
        
        // Count types
        if (sentence.type === 'ai') aiCount++;
        else if (sentence.type === 'mixed') mixedCount++;
        else if (sentence.type === 'human') humanCount++;
        else mixedCount++;
        
        totalAIProbability += sentence.ai_probability;
    });
    
    highlightedText.appendChild(container);
    
    // Update statistics
    const total = sentencesToShow.length;
    const avgAIProbability = totalAIProbability / total;
    
    updateEnhancedHighlightStats(
        Math.round((aiCount / total) * 100),
        Math.round((mixedCount / total) * 100),
        Math.round((humanCount / total) * 100),
        avgAIProbability
    );
}

// Update enhanced highlight statistics
function updateEnhancedHighlightStats(aiPercent, mixedPercent, humanPercent, avgAIProbability) {
    const aiPercentage = document.getElementById('aiPercentage');
    const mixedPercentage = document.getElementById('mixedPercentage');
    const humanPercentage = document.getElementById('humanPercentage');
    
    if (aiPercentage) {
        aiPercentage.textContent = `${aiPercent}%`;
        aiPercentage.style.color = '#ef4444';
        aiPercentage.style.fontWeight = '600';
    }
    
    if (mixedPercentage) {
        mixedPercentage.textContent = `${mixedPercent}%`;
        mixedPercentage.style.color = '#f59e0b';
        mixedPercentage.style.fontWeight = '600';
    }
    
    if (humanPercentage) {
        humanPercentage.textContent = `${humanPercent}%`;
        humanPercentage.style.color = '#10b981';
        humanPercentage.style.fontWeight = '600';
    }
    
    // Add/update average AI probability
    let avgElement = document.getElementById('avgAIProbability');
    if (!avgElement) {
        const highlightStats = document.querySelector('.highlight-stats');
        if (highlightStats) {
            avgElement = document.createElement('div');
            avgElement.id = 'avgAIProbability';
            avgElement.className = 'stat-item avg-stat';
            highlightStats.appendChild(avgElement);
        }
    }
    
    if (avgElement) {
        avgElement.innerHTML = `
            <i class="fas fa-calculator"></i>
            <span style="color: #6366f1; font-weight: 700; font-size: 1.2rem;">${Math.round(avgAIProbability)}%</span>
            <span style="color: #6b7280;">Avg AI %</span>
        `;
    }
}

// Display feature importance
function displayFeatureImportance(featureImportance) {
    let featureDisplay = document.getElementById('featureImportance');
    
    if (!featureDisplay) {
        featureDisplay = document.createElement('div');
        featureDisplay.id = 'featureImportance';
        featureDisplay.className = 'feature-importance-section';
        
        const resultsContent = document.querySelector('.results-content');
        if (resultsContent) {
            // Insert after analysis details
            const analysisDetails = document.querySelector('.analysis-details');
            if (analysisDetails) {
                resultsContent.insertBefore(featureDisplay, analysisDetails.nextSibling);
            } else {
                resultsContent.appendChild(featureDisplay);
            }
        }
    }
    
    if (!featureImportance || featureImportance.length === 0) {
        featureDisplay.innerHTML = `
            <h4><i class="fas fa-weight-hanging"></i> Feature Importance</h4>
            <p style="color: #6b7280; text-align: center; padding: 20px;">No feature importance data available.</p>
        `;
        return;
    }
    
    let html = `
        <h4><i class="fas fa-weight-hanging"></i> Key Detection Factors</h4>
        <p style="color: #6b7280; margin-bottom: 15px; font-size: 0.9rem;">
            These features most influenced the AI detection decision:
        </p>
        <div class="feature-importance-grid">
    `;
    
    // Show top 8 features
    const topFeatures = featureImportance.slice(0, 8);
    
    topFeatures.forEach(feature => {
        const importanceWidth = Math.min(100, feature.importance * 2000); // Scale for visibility
        const suggestionClass = `suggestion-${feature.suggestion}`;
        const featureName = feature.feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Format value based on feature type
        let formattedValue = feature.value.toFixed(3);
        if (feature.feature.includes('score') || feature.feature.includes('probability')) {
            formattedValue = feature.value.toFixed(1);
        } else if (feature.feature.includes('ratio') || feature.feature.includes('diversity')) {
            formattedValue = feature.value.toFixed(3);
        } else if (feature.feature.includes('count')) {
            formattedValue = Math.round(feature.value);
        }
        
        html += `
            <div class="feature-importance-item ${suggestionClass}">
                <div class="feature-name">${featureName}</div>
                <div class="feature-value">${formattedValue}</div>
                <div class="importance-bar">
                    <div class="importance-fill" style="width: ${importanceWidth}%"></div>
                </div>
                <div class="feature-suggestion">
                    <i class="fas fa-${feature.suggestion === 'ai' ? 'robot' : 
                                     feature.suggestion === 'human' ? 'user' : 'balance-scale'}"></i>
                    ${feature.suggestion.toUpperCase()} Indicator
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    featureDisplay.innerHTML = html;
}

// Display model info
function displayModelInfo(data) {
    let modelInfo = document.getElementById('modelInfo');
    
    if (!modelInfo) {
        modelInfo = document.createElement('div');
        modelInfo.id = 'modelInfo';
        modelInfo.className = 'model-info';
        
        const resultsContent = document.querySelector('.results-content');
        if (resultsContent) {
            resultsContent.insertBefore(modelInfo, resultsContent.firstChild);
        }
    }
    
    const modelVersion = data.model_version || 'Enhanced ML Model';
    const threshold = data.threshold_used || 60;
    
    modelInfo.innerHTML = `
        <div class="model-info-content">
            <i class="fas fa-microchip"></i>
            <div>
                <strong>Model:</strong> ${modelVersion}
                <div style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">
                    ${data.text_metrics?.words || 0} words analyzed
                </div>
            </div>
            <div class="threshold-info">
                <i class="fas fa-bullseye"></i>
                Threshold: ${threshold}%
            </div>
        </div>
    `;
}

// Add result explanation
function addResultExplanation(data) {
    let explanationDiv = document.getElementById('resultExplanation');
    
    if (!explanationDiv) {
        explanationDiv = document.createElement('div');
        explanationDiv.id = 'resultExplanation';
        explanationDiv.className = 'result-explanation';
        
        const verdictText = document.getElementById('verdictText');
        if (verdictText && verdictText.parentNode) {
            verdictText.parentNode.insertBefore(explanationDiv, verdictText.nextSibling);
        }
    }
    
    const aiProb = data.ai_probability;
    const wordCount = data.text_metrics?.words || 0;
    
    let explanationText = '';
    
    if (aiProb >= 90) {
        explanationText = `
            <strong>Why this is very likely AI:</strong>
            The text shows multiple strong AI indicators including consistent sentence structure,
            formal academic phrasing, characteristic AI patterns like "according to" and "furthermore",
            and low lexical diversity. With ${wordCount} words analyzed, the model has high confidence.
        `;
    } else if (aiProb >= 80) {
        explanationText = `
            <strong>Why this is likely AI:</strong>
            Several AI patterns were detected including formal structure, AI characteristic phrases,
            and uniform sentence length. The text shows typical patterns of AI-generated content.
        `;
    } else if (aiProb >= 70) {
        explanationText = `
            <strong>Why this leans toward AI:</strong>
            AI patterns are present but some human-like elements exist. The text shows formal
            structure common in AI writing, though there may be some variation.
        `;
    } else if (aiProb >= 60) {
        explanationText = `
            <strong>Mixed signals with AI bias:</strong>
            This text shows characteristics of both AI and human writing. It could be
            AI-assisted, human-written with formal style, or a combination. More text would help.
        `;
    } else if (aiProb >= 50) {
        explanationText = `
            <strong>Balanced characteristics:</strong>
            The analysis shows nearly equal AI and human characteristics. This could be
            carefully crafted human writing or AI content with human editing.
        `;
    } else if (aiProb >= 40) {
        explanationText = `
            <strong>Mixed signals with human bias:</strong>
            More human than AI characteristics detected. The text shows natural variation
            but may have some formal/AI-influenced elements.
        `;
    } else if (aiProb >= 30) {
        explanationText = `
            <strong>Why this leans toward human:</strong>
            Several human writing patterns were detected including conversational elements,
            personal expressions, and varied sentence structure.
        `;
    } else if (aiProb >= 20) {
        explanationText = `
            <strong>Why this is likely human:</strong>
            Strong human indicators present including natural language variation,
            personal voice, and conversational patterns. Some formal elements may exist.
        `;
    } else {
        explanationText = `
            <strong>Why this is very likely human:</strong>
            The text shows strong human writing patterns with high lexical diversity,
            natural sentence variation, personal expressions, and conversational elements.
            With ${wordCount} words analyzed, the model has high confidence in human authorship.
        `;
    }
    
    explanationDiv.innerHTML = `
        <div class="explanation-content">
            <i class="fas fa-info-circle"></i>
            <div class="explanation-text">
                ${explanationText}
                ${wordCount < 100 ? `<br><br><strong>Note:</strong> Analysis would be more accurate with 100+ words.` : ''}
            </div>
        </div>
    `;
}

// Show segment details
function showSegmentDetails(segment) {
    const aiProb = segment.dataset.aiProb;
    const description = segment.dataset.description;
    
    // Create a popup with detailed analysis
    const popup = document.createElement('div');
    popup.className = 'segment-popup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 400px;
        max-height: 80vh;
        overflow-y: auto;
        border: 2px solid #4361ee;
    `;
    
    popup.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0; color: #4361ee;">Sentence Analysis</h3>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;">
                &times;
            </button>
        </div>
        <p><strong>Text:</strong> ${segment.textContent}</p>
        <p><strong>AI Probability:</strong> <span style="color: ${aiProb > 70 ? '#ef4444' : aiProb > 50 ? '#f59e0b' : '#10b981'}; 
            font-weight: bold;">${aiProb}%</span></p>
        <p><strong>Classification:</strong> ${description}</p>
        <p><strong>Word Count:</strong> ${segment.textContent.split(' ').length}</p>
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 0.9rem; color: #6b7280;">
                <i class="fas fa-lightbulb"></i> 
                ${aiProb > 70 ? 'This sentence shows strong AI patterns.' : 
                  aiProb > 50 ? 'This sentence has mixed characteristics.' : 
                  'This sentence shows human writing patterns.'}
            </p>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Close on background click
    const closePopup = (e) => {
        if (!popup.contains(e.target) && e.target !== segment) {
            popup.remove();
            document.removeEventListener('click', closePopup);
        }
    };
    
    setTimeout(() => {
        document.addEventListener('click', closePopup);
    }, 100);
}

// Update model status
function updateModelStatus(status, message) {
    const modelStatus = document.getElementById('modelStatus');
    if (!modelStatus) return;
    
    const statusDot = modelStatus.querySelector('.status-dot');
    const statusText = modelStatus.querySelector('.status-text');
    
    if (status === 'active') {
        statusDot.style.cssText = `
            width: 10px;
            height: 10px;
            background: #10b981;
            border-radius: 50%;
            display: inline-block;
            margin-right: 8px;
            animation: pulse 2s infinite;
        `;
        statusText.textContent = message || 'Enhanced ML Model Active';
        statusText.style.color = '#10b981';
    } else if (status === 'loading') {
        statusDot.style.cssText = `
            width: 10px;
            height: 10px;
            background: #f59e0b;
            border-radius: 50%;
            display: inline-block;
            margin-right: 8px;
        `;
        statusText.textContent = message || 'Loading model...';
        statusText.style.color = '#f59e0b';
    } else {
        statusDot.style.cssText = `
            width: 10px;
            height: 10px;
            background: #ef4444;
            border-radius: 50%;
            display: inline-block;
            margin-right: 8px;
        `;
        statusText.textContent = message || 'Model not available';
        statusText.style.color = '#ef4444';
    }
}

// File upload handler
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file type
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!['txt', 'pdf', 'doc', 'docx'].includes(fileExt)) {
        showError('Please upload a TXT, PDF, DOC, or DOCX file.', 'Supported formats: .txt, .pdf, .doc, .docx');
        event.target.value = '';
        return;
    }
    
    // Check file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
        showError('File size too large. Maximum size is 10MB.', 'Please upload a smaller file.');
        event.target.value = '';
        return;
    }
    
    showLoading(true, `Processing ${file.name}...`);
    updateModelStatus('loading', 'Analyzing document...');
    
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
            
            // Use enhanced display for ML model results
            if (data.model_version && data.model_version.includes('enhanced')) {
                displayEnhancedResults(data);
            } else {
                displayResults(data);  // Fallback to original display
            }
            
            resultsSection.classList.add('show');
            
            // Update textarea with extracted text
            if (data.extracted_text) {
                textInput.value = data.extracted_text;
                updateWordCount();
                
                // Save to history with full extracted text
                saveToRecentAnalyses(data, data.extracted_text);
            } else {
                // If no extracted text, save file info
                saveToRecentAnalyses(data, `File: ${file.name}`);
            }
            
            // Show export button
            const exportBtn = document.querySelector('.export-btn');
            if (exportBtn) exportBtn.style.display = 'flex';
            
            showSuccess(`File analyzed successfully! Found ${data.text_metrics?.words || 0} words.`);
            updateModelStatus('active', 'Analysis complete');
        } else {
            throw new Error(data.error || 'Failed to analyze file');
        }
    } catch (error) {
        console.error('File upload error:', error);
        showError(`File analysis failed: ${error.message}`, 'Please try a different file or check file permissions.');
        updateModelStatus('error', 'Analysis failed');
    } finally {
        showLoading(false);
        event.target.value = '';
    }
}


// Clear text function
function clearText() {
    // if (textInput.value.trim() && !confirm('Clear all text and results?')) {
    //     return;
    // }
    
    textInput.value = '';
    updateWordCount();
    resultsSection.classList.remove('show');
    clearHighlights();
    currentAnalysisData = null;
    
    // Reset displays
    resetDisplays();
    
    // Hide export button
    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) exportBtn.style.display = 'none';
    
    showSuccess('Text cleared successfully.');
}

// Reset all displays to default
function resetDisplays() {
    // Reset probabilities
    const humanElement = document.getElementById('humanProbability');
    const humanValue = humanElement?.querySelector('.probability-value');
    const humanBar = humanElement?.querySelector('.probability-fill.human-fill');
    const aiElement = document.getElementById('aiProbability');
    const aiValue = aiElement?.querySelector('.probability-value');
    const aiBar = aiElement?.querySelector('.probability-fill.ai-fill');
    
    if (humanValue) {
        humanValue.textContent = '50%';
        humanValue.style.color = '';
    }
    if (humanBar) {
        humanBar.style.width = '50%';
        humanBar.style.transition = 'none';
    }
    if (aiValue) {
        aiValue.textContent = '50%';
        aiValue.style.color = '';
    }
    if (aiBar) {
        aiBar.style.width = '50%';
        aiBar.style.transition = 'none';
    }
    
    // Reset confidence
    const confidenceValue = document.getElementById('confidenceValue');
    const confidenceFill = document.getElementById('confidenceFill');
    if (confidenceValue) {
        confidenceValue.textContent = '0%';
        confidenceValue.style.color = '';
    }
    if (confidenceFill) {
        confidenceFill.style.width = '0%';
        confidenceFill.style.transition = 'none';
        confidenceFill.style.background = '';
    }
    
    // Reset result status
    const resultStatus = document.getElementById('resultStatus');
    if (resultStatus) {
        resultStatus.textContent = 'Waiting for analysis...';
        resultStatus.style.color = '';
        resultStatus.style.fontWeight = '';
    }
    
    // Reset metrics
    const metricElements = ['metricWords', 'metricSentences', 'metricReadingTime', 'metricDiversity'];
    metricElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = '0';
            el.style.color = '';
            el.title = '';
        }
    });
    
    // Clear analysis list
    const analysisList = document.getElementById('analysisList');
    if (analysisList) {
        analysisList.innerHTML = '<li>No analysis performed yet</li>';
    }
    
    // Remove feature importance
    const featureImportance = document.getElementById('featureImportance');
    if (featureImportance) featureImportance.remove();
    
    // Remove model info
    const modelInfo = document.getElementById('modelInfo');
    if (modelInfo) modelInfo.remove();
    
    // Remove explanation
    const explanation = document.getElementById('resultExplanation');
    if (explanation) explanation.remove();
    
    // Remove average AI stat
    const avgStat = document.getElementById('avgAIProbability');
    if (avgStat) avgStat.remove();
    
    // Reset model status
    updateModelStatus('active', 'Ready for analysis');
}

// Paste text function
async function pasteText() {
    try {
        const text = await navigator.clipboard.readText();
        if (!text.trim()) {
            showError('Clipboard is empty or contains no text.', 'Copy some text first, then paste.');
            return;
        }
        
        textInput.value = text;
        updateWordCount();
        showSuccess('Text pasted from clipboard.');
        
        // Auto-suggest analysis for longer texts
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        if (words.length >= 100) {
            setTimeout(() => {
                if (confirm(`Pasted text has ${words.length} words (excellent for analysis).\n\nWould you like to analyze it now?`)) {
                    analyzeText();
                }
            }, 500);
        } else if (words.length >= 50) {
            setTimeout(() => {
                if (confirm(`Pasted text has ${words.length} words.\n\nWould you like to analyze it now?`)) {
                    analyzeText();
                }
            }, 500);
        }
    } catch (err) {
        console.error('Clipboard error:', err);
        showError('Could not access clipboard.', 'Please paste manually (Ctrl+V) or check browser permissions.');
    }
}

// Load sample text
function loadSample() {
    // Create sample menu
    const sampleMenu = document.createElement('div');
    sampleMenu.className = 'sample-menu';
    sampleMenu.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        background: white;
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        z-index: 1000;
        margin-top: 5px;
        overflow: hidden;
        animation: slideDown 0.2s ease;
        min-width: 250px;
    `;
    
    sampleMenu.innerHTML = `
        <button onclick="loadSampleType('ai')" style="width: 100%; text-align: left; padding: 12px 20px; border: none; background: none; cursor: pointer; display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-robot" style="color: #ef4444;"></i>
            <div>
                <div style="font-weight: 600;">AI-Generated Sample</div>
                <div style="font-size: 0.8rem; color: #6b7280;">Formal, structured text</div>
            </div>
        </button>
        <button onclick="loadSampleType('human')" style="width: 100%; text-align: left; padding: 12px 20px; border: none; background: none; cursor: pointer; display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-user" style="color: #10b981;"></i>
            <div>
                <div style="font-weight: 600;">Human-Written Sample</div>
                <div style="font-size: 0.8rem; color: #6b7280;">Conversational, informal text</div>
            </div>
        </button>
        <button onclick="loadSampleType('mixed')" style="width: 100%; text-align: left; padding: 12px 20px; border: none; background: none; cursor: pointer; display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-blend" style="color: #f59e0b;"></i>
            <div>
                <div style="font-weight: 600;">Mixed Content Sample</div>
                <div style="font-size: 0.8rem; color: #6b7280;">Combination of AI and human styles</div>
            </div>
        </button>
    `;
    
    // Find the sample button
    const sampleBtn = document.querySelector('button[onclick*="loadSample"], button:has(i.fa-vial)');
    if (sampleBtn) {
        sampleBtn.parentElement.style.position = 'relative';
        sampleBtn.parentElement.appendChild(sampleMenu);
        
        // Close menu on outside click
        setTimeout(() => {
            const closeMenu = (e) => {
                if (!sampleMenu.contains(e.target) && e.target !== sampleBtn) {
                    sampleMenu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            };
            document.addEventListener('click', closeMenu);
        }, 10);
    }
}

// Load specific sample type
function loadSampleType(type) {
    const text = ENHANCED_SAMPLES[type];
    if (!text) return;
    
    textInput.value = text;
    updateWordCount();
    
    // Remove sample menu
    const menu = document.querySelector('.sample-menu');
    if (menu) menu.remove();
    
    let message = '';
    switch(type) {
        case 'ai':
            message = 'AI-generated sample loaded. Expected: 85-95% AI probability.';
            break;
        case 'human':
            message = 'Human-written sample loaded. Expected: 5-15% AI probability.';
            break;
        case 'mixed':
            message = 'Mixed content sample loaded. Expected: 40-60% AI probability.';
            break;
    }
    
    showSuccess(message);
}

// Update sample button with menu
function updateSampleButton() {
    const sampleBtn = document.querySelector('button[onclick*="loadSample"], button:has(i.fa-vial)');
    if (!sampleBtn) return;
    
    // Remove old onclick if it exists
    sampleBtn.setAttribute('onclick', '');
    
    // Add click handler with menu
    sampleBtn.addEventListener('click', loadSample);
}

// Clear highlights
function clearHighlights() {
    const highlightedText = document.getElementById('highlightedText');
    if (highlightedText) {
        highlightedText.innerHTML = '<p class="placeholder">Analyze text to see highlighted results...</p>';
    }
    
    // Remove average AI stat
    const avgStat = document.getElementById('avgAIProbability');
    if (avgStat) avgStat.remove();
    
    // Reset stat items
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(item => {
        item.classList.remove('ai-stat', 'mixed-stat', 'human-stat');
    });
}

// Copy highlighted text
function copyHighlightedText() {
    const highlightedText = document.getElementById('highlightedText');
    if (!highlightedText) return;
    
    const text = highlightedText.innerText;
    
    if (!text || text.includes('Analyze text') || text.includes('No text available')) {
        showError('No highlighted text to copy.', 'Please analyze text first to see highlighted results.');
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
                btn.style.background = '#10b981';
                btn.style.color = 'white';
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    btn.style.background = '';
                    btn.style.color = '';
                }, 2000);
            }
            
            showSuccess('Text copied to clipboard!', 'You can now paste it elsewhere.');
        })
        .catch(err => {
            console.error('Copy failed:', err);
            showError('Failed to copy text.', 'Please try again or check browser permissions.');
        });
}

// Export results
function exportResults() {
    if (!currentAnalysisData) {
        showError('No analysis results to export.', 'Please analyze text first.');
        return;
    }
    
    const dataStr = JSON.stringify(currentAnalysisData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create download link
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `ai-detector-analysis-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess('Results exported successfully!', `Saved as ${link.download}`);
}

// Make sure the new functions are available globally
window.refreshHistoryDisplay = refreshHistoryDisplay;

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
            dropArea.style.border = '2px dashed #4361ee';
            dropArea.style.background = 'rgba(67, 97, 238, 0.05)';
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.remove('highlight');
            dropArea.style.border = '';
            dropArea.style.background = '';
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
                showError('Unsupported file type.', 'Please drop a TXT, PDF, DOC, or DOCX file.');
                return;
            }
            
            // Create a new FileList
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            
            // Trigger change event
            fileInput.dispatchEvent(new Event('change'));
            
            showSuccess(`File dropped: ${file.name}`, 'Processing...');
        }
    }
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Don't trigger shortcuts if user is typing in textarea
    if (e.target.tagName === 'TEXTAREA') {
        // Allow Ctrl+Enter to analyze even in textarea
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            analyzeText();
        }
        return;
    }
    
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
    
    // Ctrl/Cmd + P to paste
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        pasteText();
    }
    
    // Escape to close modal
    if (e.key === 'Escape' && historyModal && historyModal.classList.contains('show')) {
        closeHistoryModal();
    }
    
    // H for history
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        openHistoryModal();
    }

    // Escape to close how it works modal
    if (e.key === 'Escape' && howItWorksModal && howItWorksModal.classList.contains('show')) {
        closeHowItWorksModal();
    }

    // Escape to close API modal
    const apiModal = document.getElementById('apiModal');
    if (e.key === 'Escape' && apiModal && apiModal.classList.contains('show')) {
        closeApiModal();
    }
}

// Loading overlay
function showLoading(show, message = 'Analyzing...') {
    if (!loadingOverlay) return;
    
    if (show) {
        const loadingText = loadingOverlay.querySelector('p');
        const loadingSub = loadingOverlay.querySelector('.loading-sub');
        
        if (loadingText) loadingText.textContent = message;
        if (loadingSub) loadingSub.textContent = 'Using enhanced ML model for maximum accuracy';
        
        loadingOverlay.classList.add('show');
        updateModelStatus('loading', 'Analyzing...');
    } else {
        loadingOverlay.classList.remove('show');
    }
}

// Show error notification
function showError(message, details = '') {
    // Remove existing notifications
    removeNotifications('error');
    
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle fa-lg"></i>
        <div>
            <div style="font-weight: 600;">${message}</div>
            ${details ? `<div style="font-size: 0.9rem; opacity: 0.9; margin-top: 4px;">${details}</div>` : ''}
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; opacity: 0.7; margin-left: auto;">
            &times;
        </button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: var(--border-radius);
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 10000;
        transform: translateX(150%);
        transition: transform 0.3s ease;
        max-width: 400px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        background: #fff5f5;
        border: 1px solid #fecaca;
        color: #dc2626;
    `;
    
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => notification.style.transform = 'translateX(0)', 10);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Show success notification
function showSuccess(message, details = '') {
    // Remove existing notifications
    removeNotifications('success');
    
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <i class="fas fa-check-circle fa-lg"></i>
        <div>
            <div style="font-weight: 600;">${message}</div>
            ${details ? `<div style="font-size: 0.9rem; opacity: 0.9; margin-top: 4px;">${details}</div>` : ''}
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; opacity: 0.7; margin-left: auto;">
            &times;
        </button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: var(--border-radius);
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 10000;
        transform: translateX(150%);
        transition: transform 0.3s ease;
        max-width: 400px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        color: #16a34a;
    `;
    
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => notification.style.transform = 'translateX(0)', 10);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Remove existing notifications
function removeNotifications(type) {
    const notifications = document.querySelectorAll(`.notification.${type}`);
    notifications.forEach(notification => {
        notification.style.transform = 'translateX(150%)';
        setTimeout(() => notification.remove(), 300);
    });
}

// Check backend status
async function checkBackendStatus() {
    try {
        updateModelStatus('loading', 'Checking backend...');
        
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            const data = await response.json();
            console.log('✓ Backend is running:', data);
            
            // Check if enhanced model is available
            const featuresResponse = await fetch(`${API_BASE_URL}/features`);
            if (featuresResponse.ok) {
                updateModelStatus('active', 'Enhanced ML Model Ready');
                showSuccess('Backend connected successfully!', 'Enhanced AI detection model is active.');
            } else {
                updateModelStatus('active', 'Basic Model Ready');
                // showSuccess('Backend connected!', 'Using basic detection model.');
            }
        } else {
            console.warn('⚠ Backend returned error');
            updateModelStatus('error', 'Backend Error');
            showError('Backend API returned an error.', 'Some features may not work. Make sure the backend server is running.');
        }
    } catch (error) {
        console.error('✗ Cannot connect to backend:', error);
        updateModelStatus('error', 'No Connection');
        showError('Cannot connect to analysis server.', 'Make sure the backend is running on http://localhost:5000');
    }
}

// Display results (original function for fallback)
function displayResults(data) {
    // This is the original display function kept for compatibility
    // It will be used if the enhanced model is not available
    
    updateProbabilities(data.ai_probability, data.human_probability);
    
    // Simple verdict for fallback
    const verdictText = document.getElementById('verdictText');
    if (verdictText) {
        const isAI = data.is_ai_generated;
        const aiProb = data.ai_probability;
        
        if (isAI) {
            verdictText.innerHTML = `
                <div style="color: #ef233c;">
                    <i class="fas fa-robot"></i>
                    <h3>AI-GENERATED CONTENT DETECTED</h3>
                    <p>${aiProb}% AI probability</p>
                </div>
            `;
        } else {
            verdictText.innerHTML = `
                <div style="color: #4cc9f0;">
                    <i class="fas fa-user"></i>
                    <h3>HUMAN-WRITTEN CONTENT</h3>
                    <p>${100 - aiProb}% human probability</p>
                </div>
            `;
        }
    }
    
    updateConfidence(data.confidence);
    updateResultStatus(data.is_ai_generated, data.confidence);
    updateMetrics(data);
    updateAnalysisList(data);
    
    // Simple highlighting for fallback
    if (data.sentence_analysis && data.sentence_analysis.length > 0) {
        const highlightedText = document.getElementById('highlightedText');
        if (highlightedText) {
            let html = '';
            data.sentence_analysis.forEach(sentence => {
                const type = sentence.type || 'mixed';
                html += `<span class="highlight-segment ${type}">${sentence.text} </span>`;
            });
            highlightedText.innerHTML = html;
        }
    }
    
    updateModelStatus('active', 'Basic Model Active');
}



// How It Works Modal Functions
function openHowItWorksModal() {
    const modal = document.getElementById('howItWorksModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
}

function closeHowItWorksModal() {
    const modal = document.getElementById('howItWorksModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
    }
}



// API Modal Functions
function openApiModal() {
    const modal = document.getElementById('apiModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Highlight syntax (if you have highlight.js or similar)
        highlightCodeBlocks();
    }
}

function closeApiModal() {
    const modal = document.getElementById('apiModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Copy code function
function copyCode(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const text = element.innerText || element.textContent;
    navigator.clipboard.writeText(text)
        .then(() => {
            const btn = event?.target?.closest('.copy-btn');
            if (btn) {
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                btn.disabled = true;
                btn.style.background = '#10b981';
                
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.disabled = false;
                    btn.style.background = '';
                }, 2000);
            }
            showSuccess('Code copied to clipboard!');
        })
        .catch(err => {
            console.error('Copy failed:', err);
            showError('Failed to copy code.');
        });
}

// Copy base URL
function copyBaseUrl() {
    const baseUrl = 'http://localhost:5000/api';
    navigator.clipboard.writeText(baseUrl)
        .then(() => {
            showSuccess('Base URL copied to clipboard!', baseUrl);
        })
        .catch(err => {
            console.error('Copy failed:', err);
            showError('Failed to copy base URL.');
        });
}

// Select plan function
function selectPlan(plan) {
    const plans = {
        free: 'Free Tier',
        pro: 'Pro Plan',
        enterprise: 'Enterprise Plan'
    };
    
    showSuccess(`Selected ${plans[plan]}`, plan === 'enterprise' ? 'Redirecting to contact form...' : 'Redirecting to signup...');
    
    // Simulate API call or redirect
    setTimeout(() => {
        if (plan === 'enterprise') {
            window.open('mailto:sales@aidetector.com?subject=Enterprise%20API%20Plan%20Inquiry', '_blank');
        } else {
            window.open(`#signup?plan=${plan}`, '_blank');
        }
        closeApiModal();
    }, 1000);
}

// Get API key function
function getApiKey() {
    showLoading(true, 'Generating API key...');
    
    // Simulate API call
    setTimeout(() => {
        showLoading(false);
        const apiKey = 'detector_' + Math.random().toString(36).substr(2, 16) + '_' + Date.now().toString(36);
        
        // Create a modal to show the API key
        const apiKeyModal = document.createElement('div');
        apiKeyModal.className = 'modal';
        apiKeyModal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3><i class="fas fa-key"></i> Your API Key</h3>
                    <button class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; padding: 20px;">
                        <p style="margin-bottom: 15px;">Your API key has been generated successfully.</p>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; font-family: 'Roboto Mono', monospace; word-break: break-all;">
                            ${apiKey}
                        </div>
                        <p style="color: #dc2626; font-size: 0.9rem; margin-bottom: 20px;">
                            <i class="fas fa-exclamation-triangle"></i>
                            Save this key securely. It won't be shown again.
                        </p>
                        <div class="api-key-actions">
                            <button class="btn-primary" onclick="copyApiKey('${apiKey}')">
                                <i class="fas fa-copy"></i> Copy Key
                            </button>
                            <button class="btn-secondary" onclick="closeApiModal(); this.closest('.modal').remove();">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(apiKeyModal);
        setTimeout(() => apiKeyModal.classList.add('show'), 10);
    }, 1500);
}

// Copy API key
function copyApiKey(key) {
    navigator.clipboard.writeText(key)
        .then(() => {
            showSuccess('API key copied to clipboard!', 'Store it in a secure location.');
        })
        .catch(err => {
            console.error('Copy failed:', err);
            showError('Failed to copy API key.');
        });
}

// Simple code highlighting
function highlightCodeBlocks() {
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        // Simple syntax highlighting for common keywords
        let code = block.textContent;
        
        // Highlight keywords
        code = code.replace(/\b(curl|POST|GET|HEADERS|Content-Type|X-API-Key|fetch|method|headers|body|then|catch|import|def|class|function|return|if|else|for|while)\b/g, 
            '<span class="hljs-keyword">$1</span>');
        
        // Highlight strings
        code = code.replace(/(['"])(.*?)\1/g, 
            '<span class="hljs-string">$1$2$1</span>');
        
        // Highlight numbers
        code = code.replace(/\b(\d+)\b/g, 
            '<span class="hljs-number">$1</span>');
        
        // Highlight comments
        code = code.replace(/(#.*$)/gm, 
            '<span class="hljs-comment">$1</span>');
        
        block.innerHTML = code;
    });
}

// Initialize Go to Top button
function initializeGoToTopButton() {
    const goToTopBtn = document.getElementById('goToTopBtn');
    if (!goToTopBtn) {
        console.error('Go to Top button not found!');
        return;
    }
    
    console.log('Initializing Go to Top button...');
    
    // Show/hide button based on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            goToTopBtn.classList.add('show');
        } else {
            goToTopBtn.classList.remove('show');
        }
    });
    
    // Click event to scroll to top
    goToTopBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        console.log('Scrolling to top...');
    });
    
    // Initialize button visibility
    if (window.scrollY > 100) {
        goToTopBtn.classList.add('show');
    }
    
    console.log('Go to Top button initialized');
}

const apiKeyStyles = `
<style>
.api-key-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 20px;
}
</style>
`;
document.head.insertAdjacentHTML('beforeend', apiKeyStyles);



// Make functions globally available
window.openHowItWorksModal = openHowItWorksModal;
window.closeHowItWorksModal = closeHowItWorksModal;

// Make functions globally available
window.openApiModal = openApiModal;
window.closeApiModal = closeApiModal;
window.copyCode = copyCode;
window.copyBaseUrl = copyBaseUrl;
window.selectPlan = selectPlan;
window.getApiKey = getApiKey;
window.copyApiKey = copyApiKey;

window.clearText = clearText;
window.pasteText = pasteText;
window.loadSample = loadSample;
window.loadSampleType = loadSampleType;
window.copyHighlightedText = copyHighlightedText;
window.clearHighlights = clearHighlights;
window.openHistoryModal = openHistoryModal;
window.closeHistoryModal = closeHistoryModal;
window.analyzeText = analyzeText;
window.exportResults = exportResults;
window.showHelp = showHelp;
window.clearAllHistory = clearAllHistory;
window.deleteHistoryItem = deleteHistoryItem;

console.log('AI Detector Pro Enhanced - Complete script loaded successfully');