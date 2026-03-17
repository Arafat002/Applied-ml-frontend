let editor;

document.addEventListener('DOMContentLoaded', () => {
    initializeEditor();
    attachEventListeners();
    loadExampleCode(); // Load an example by default
    initializeTheme(); // Initialize theme
});


function initializeEditor() {
    const textarea = document.getElementById('codeEditor');
    editor = CodeMirror.fromTextArea(textarea, {
        mode: 'python',
        theme: 'monokai',
        lineNumbers: true,
        indentUnit: 4,
        indentWithTabs: false,
        lineWrapping: true,
        matchBrackets: true,
        autoCloseBrackets: true,
    });
}



function initializeTheme() {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    // Add event listener to toggle button
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    const themeIcon = document.getElementById('themeIcon');
    if (theme === 'light') {
        themeIcon.textContent = '☀️';
        // Switch to light theme for CodeMirror
        if (editor) {
            editor.setOption('theme', 'default');
        }
    } else {
        themeIcon.textContent = '🌙';
        // Switch to dark theme for CodeMirror
        if (editor) {
            editor.setOption('theme', 'monokai');
        }
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);

    showToast(`Switched to ${newTheme} mode`, 'success');
}



function attachEventListeners() {
    document.getElementById('explainBtn').addEventListener('click', handleExplainCode);
    document.getElementById('clearBtn').addEventListener('click', handleClearCode);
    document.getElementById('exampleBtn').addEventListener('click', handleLoadExample);
    document.getElementById('copyBtn').addEventListener('click', handleCopyExplanation);
}



async function handleExplainCode() {
    const code = editor.getValue().trim();

    if (!code) {
        showToast('Please enter some Python code first.', 'error');
        return;
    }

    showLoading(true);

    try {
        const explanation = await callModelAPI(code);
        displayExplanation(explanation, code);
        showToast('Explanation generated successfully!', 'success');
    } catch (error) {
        console.error('Error generating explanation:', error);
        showToast('Failed to generate explanation. Please try again.', 'error');
        displayError(error.message);
    } finally {
        showLoading(false);
    }
}

// API Call to the Fine-Tuned Model

async function callModelAPI(code) {
    const SPACE_URL = 'https://arafat002-codet5-python-explainer.hf.space/run/predict';

    const response = await fetch(SPACE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            data: [code]
        })
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();

    return result.data[0];
}

function displayExplanation(explanation, code) {
    const container = document.getElementById('explanationContainer');

    const lineCount = code.split('\n').length;
    const charCount = code.length;

    container.innerHTML = `
        <div class="explanation-content">
            <div class="explanation-text">
                ${explanation}
            </div>
            <div class="explanation-metadata">
                <div class="metadata-item">
                    <span>Lines of code:</span>
                    <strong>${lineCount}</strong>
                </div>
                <div class="metadata-item">
                    <span>Characters:</span>
                    <strong>${charCount}</strong>
                </div>
                <div class="metadata-item">
                    <span>Model:</span>
                    <strong>A fine-tuned CodeT5-Base</strong>
                </div>
            </div>
        </div>
    `;
}

function displayError(message) {
    const container = document.getElementById('explanationContainer');
    container.innerHTML = `
        <div class="explanation-content">
            <div class="explanation-text" style="border-left-color: var(--error); background: rgba(249, 97, 103, 0.05);">
                <strong>Error:</strong> ${message}
            </div>
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════

function handleClearCode() {
    editor.setValue('');
    document.getElementById('explanationContainer').innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">📄</div>
            <h3>No explanation yet</h3>
            <p>Paste your code in the editor and click "Explain Code" to get a detailed explanation.</p>
        </div>
    `;
    showToast('Editor cleared', 'success');
}

function handleLoadExample() {
    loadExampleCode();
    showToast('Example code loaded', 'success');
}

function loadExampleCode() {
    const examples = [
        `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))`,

        `numbers = [1, 2, 3, 4, 5]
total = sum(numbers)
average = total / len(numbers)
print(average)`,

        `def is_even(number):
    if number % 2 == 0:
        return True
    else:
        return False`,

        `student = {
    "name": "Alice",
    "age": 20,
    "grade": "A"
}
print(student["name"])`,

        `for i in range(10):
    if i % 2 == 0:
        print(f"{i} is even")`
    ];

    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    editor.setValue(randomExample);
}

function handleCopyExplanation() {
    const explanationText = document.querySelector('.explanation-text');

    if (!explanationText) {
        showToast('No explanation to copy', 'error');
        return;
    }

    const text = explanationText.textContent;

    navigator.clipboard.writeText(text).then(() => {
        showToast('Explanation copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    const button = document.getElementById('explainBtn');

    if (show) {
        overlay.classList.add('active');
        button.disabled = true;
    } else {
        overlay.classList.remove('active');
        button.disabled = false;
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ═══════════════════════════════════════════════════════════════
// Keyboard Shortcuts
// ═══════════════════════════════════════════════════════════════

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleExplainCode();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        handleClearCode();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        toggleTheme();
    }
});