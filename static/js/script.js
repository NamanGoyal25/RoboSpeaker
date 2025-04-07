document.addEventListener('DOMContentLoaded', function() {
    const textToSpeak = document.getElementById('textToSpeak');
    const voiceSelect = document.getElementById('voiceSelect');
    const translateSelect = document.getElementById('translateSelect');
    const speakBtn = document.getElementById('speakBtn');
    const stopBtn = document.getElementById('stopBtn');
    const robotHead = document.getElementById('robotHead');
    const historyItems = document.getElementById('historyItems');
    const translatedText = document.getElementById('translatedText');
    const translatedContent = document.getElementById('translatedContent');

    let voices = [];
    let speaking = false;
    let currentText = '';

    // Populate voice selection dropdown
    function populateVoiceList() {
        voices = speechSynthesis.getVoices();
        voiceSelect.innerHTML = '<option value="">Select voice language</option>';

        voices.forEach((voice, i) => {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.setAttribute('data-lang', voice.lang);
            option.setAttribute('data-name', voice.name);
            option.value = i;
            voiceSelect.appendChild(option);
        });
    }

    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    // Initialize voices
    populateVoiceList();

    // Translate text if a language is selected
    async function translateText(text, targetLang) {
        if (!targetLang) {
            translatedText.style.display = 'none';
            return text;
        }

        try {
            const response = await fetch('/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, target_lang: targetLang })
            });
            const data = await response.json();
            if (data.error) {
                alert(data.error);
                return text;
            }
            translatedText.style.display = 'block';
            translatedContent.textContent = data.translated_text;
            return data.translated_text;
        } catch (error) {
            alert('Translation failed: ' + error);
            return text;
        }
    }

    // Speak function
    async function speak() {
        let text = textToSpeak.value.trim();
        if (text === '') return;

        const targetLang = translateSelect.value;
        currentText = await translateText(text, targetLang);

        const utterance = new SpeechSynthesisUtterance(currentText);

        // Set selected voice
        if (voiceSelect.value !== '') {
            utterance.voice = voices[voiceSelect.value];
        }

        // Start animation
        robotHead.classList.add('speaking');
        speaking = true;

        // Add to history
        addToHistory(text, currentText);

        // Speech end event
        utterance.onend = function() {
            robotHead.classList.remove('speaking');
            speaking = false;
        };

        // Speak
        speechSynthesis.speak(utterance);
    }

    // Stop speaking
    function stopSpeaking() {
        if (speaking) {
            speechSynthesis.cancel();
            robotHead.classList.remove('speaking');
            speaking = false;
        }
    }

    // Add to history
    function addToHistory(originalText, spokenText) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';

        const textSpan = document.createElement('span');
        textSpan.textContent = originalText.length > 30 ? originalText.substring(0, 30) + '...' : originalText;

        const playAgainBtn = document.createElement('button');
        playAgainBtn.className = 'play-again';
        playAgainBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
        `;

        playAgainBtn.addEventListener('click', function() {
            textToSpeak.value = originalText;
            translateSelect.value = '';
            translatedText.style.display = 'none';
            speak();
        });

        historyItem.appendChild(textSpan);
        historyItem.appendChild(playAgainBtn);

        historyItems.prepend(historyItem);

        // Keep only the last 5 history items
        while (historyItems.children.length > 5) {
            historyItems.removeChild(historyItems.lastChild);
        }
    }

    // Event listeners
    speakBtn.addEventListener('click', speak);
    stopBtn.addEventListener('click', stopSpeaking);

    // Keyboard shortcut (Ctrl+Enter to speak)
    textToSpeak.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            speak();
        }
    });

    // Reset translated text when changing the input
    textToSpeak.addEventListener('input', function() {
        translatedText.style.display = 'none';
    });
});