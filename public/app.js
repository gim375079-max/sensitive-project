document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const charCount = document.getElementById('currentCharCount');
    const loading = document.getElementById('loading');
    const resultCard = document.getElementById('resultCard');
    const errorBox = document.getElementById('errorBox');
    const errorMessage = document.getElementById('errorMessage');

    // UI Elements for result
    const sentimentBadge = document.getElementById('sentimentBadge');
    const confidenceBar = document.getElementById('confidenceBar');
    const confidenceValue = document.getElementById('confidenceValue');
    const reasonText = document.getElementById('reasonText');

    // Character counter
    inputText.addEventListener('input', () => {
        const length = inputText.value.length;
        charCount.textContent = length;
        if (length >= 1000) {
            charCount.style.color = 'var(--error)';
        } else {
            charCount.style.color = 'var(--muted)';
        }
    });

    // Analyze button click
    analyzeBtn.addEventListener('click', async () => {
        const text = inputText.value.trim();

        // 1. Client-side validation
        if (!text) {
            showError('분석할 내용을 입력해주세요.');
            return;
        }

        // 2. Prepare UI
        hideError();
        hideResult();
        showLoading(true);
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = '분석 중...';

        try {
            // 3. API Request
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '분석 중 오류가 발생했습니다.');
            }

            // 4. Show Result
            displayResult(data);

        } catch (error) {
            showError(error.message);
        } finally {
            showLoading(false);
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = '분석하기';
        }
    });

    function displayResult(data) {
        const { sentiment, confidence, reason } = data;

        // Update Badge
        sentimentBadge.className = 'badge'; // Reset classes
        sentimentBadge.classList.add(sentiment.toLowerCase());
        
        const sentimentMap = {
            'positive': '긍정',
            'negative': '부정',
            'neutral': '중립'
        };
        sentimentBadge.textContent = sentimentMap[sentiment.toLowerCase()] || sentiment.toUpperCase();

        // Update Confidence
        confidenceBar.style.width = `${confidence}%`;
        confidenceValue.textContent = `${confidence}%`;

        // Update Reason
        reasonText.textContent = reason;

        resultCard.classList.remove('hidden');
    }

    function showLoading(isLoading) {
        if (isLoading) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorBox.classList.remove('hidden');
    }

    function hideError() {
        errorBox.classList.add('hidden');
    }

    function hideResult() {
        resultCard.classList.add('hidden');
    }
});
