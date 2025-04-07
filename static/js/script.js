//document.addEventListener('DOMContentLoaded', function() {
//    const textToSpeak = document.getElementById('textToSpeak');
//    const voiceSelect = document.getElementById('voiceSelect');
//    const translateSelect = document.getElementById('translateSelect');
//    const speakBtn = document.getElementById('speakBtn');
//    const stopBtn = document.getElementById('stopBtn');
//    const robotHead = document.getElementById('robotHead');
//    const historyItems = document.getElementById('historyItems');
//    const translatedText = document.getElementById('translatedText');
//    const translatedContent = document.getElementById('translatedContent');
//
//    let voices = [];
//    let speaking = false;
//    let currentText = '';
//
//    // Populate voice selection dropdown
//    function populateVoiceList() {
//        voices = speechSynthesis.getVoices();
//        voiceSelect.innerHTML = '<option value="">Select voice language</option>';
//
//        voices.forEach((voice, i) => {
//            const option = document.createElement('option');
//            option.textContent = `${voice.name} (${voice.lang})`;
//            option.setAttribute('data-lang', voice.lang);
//            option.setAttribute('data-name', voice.name);
//            option.value = i;
//            voiceSelect.appendChild(option);
//        });
//    }
//
//    if (speechSynthesis.onvoiceschanged !== undefined) {
//        speechSynthesis.onvoiceschanged = populateVoiceList;
//    }
//
//    // Initialize voices
//    populateVoiceList();
//
//    // Translate text if a language is selected
//    async function translateText(text, targetLang) {
//        if (!targetLang) {
//            translatedText.style.display = 'none';
//            return text;
//        }
//
//        try {
//            const response = await fetch('/translate', {
//                method: 'POST',
//                headers: { 'Content-Type': 'application/json' },
//                body: JSON.stringify({ text, target_lang: targetLang })
//            });
//            const data = await response.json();
//            if (data.error) {
//                alert(data.error);
//                return text;
//            }
//            translatedText.style.display = 'block';
//            translatedContent.textContent = data.translated_text;
//            return data.translated_text;
//        } catch (error) {
//            alert('Translation failed: ' + error);
//            return text;
//        }
//    }
//
//    // Speak function
//    async function speak() {
//        let text = textToSpeak.value.trim();
//        if (text === '') return;
//
//        const targetLang = translateSelect.value;
//        currentText = await translateText(text, targetLang);
//
//        const utterance = new SpeechSynthesisUtterance(currentText);
//
//        // Set selected voice
//        if (voiceSelect.value !== '') {
//            utterance.voice = voices[voiceSelect.value];
//        }
//
//        // Start animation
//        robotHead.classList.add('speaking');
//        speaking = true;
//
//        // Add to history
//        addToHistory(text, currentText);
//
//        // Speech end event
//        utterance.onend = function() {
//            robotHead.classList.remove('speaking');
//            speaking = false;
//        };
//
//        // Speak
//        speechSynthesis.speak(utterance);
//    }
//
//    // Stop speaking
//    function stopSpeaking() {
//        if (speaking) {
//            speechSynthesis.cancel();
//            robotHead.classList.remove('speaking');
//            speaking = false;
//        }
//    }
//
//    // Add to history
//    function addToHistory(originalText, spokenText) {
//        const historyItem = document.createElement('div');
//        historyItem.className = 'history-item';
//
//        const textSpan = document.createElement('span');
//        textSpan.textContent = originalText.length > 30 ? originalText.substring(0, 30) + '...' : originalText;
//
//        const playAgainBtn = document.createElement('button');
//        playAgainBtn.className = 'play-again';
//        playAgainBtn.innerHTML = `
//            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                <polygon points="5 3 19 12 5 21 5 3"></polygon>
//            </svg>
//        `;
//
//        playAgainBtn.addEventListener('click', function() {
//            textToSpeak.value = originalText;
//            translateSelect.value = '';
//            translatedText.style.display = 'none';
//            speak();
//        });
//
//        historyItem.appendChild(textSpan);
//        historyItem.appendChild(playAgainBtn);
//
//        historyItems.prepend(historyItem);
//
//        // Keep only the last 5 history items
//        while (historyItems.children.length > 5) {
//            historyItems.removeChild(historyItems.lastChild);
//        }
//    }
//
//    // Event listeners
//    speakBtn.addEventListener('click', speak);
//    stopBtn.addEventListener('click', stopSpeaking);
//
//    // Keyboard shortcut (Ctrl+Enter to speak)
//    textToSpeak.addEventListener('keydown', function(e) {
//        if (e.ctrlKey && e.key === 'Enter') {
//            speak();
//        }
//    });
//
//    // Reset translated text when changing the input
//    textToSpeak.addEventListener('input', function() {
//        translatedText.style.display = 'none';
//    });
//});

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const textToSpeak = document.getElementById('textToSpeak');
  const voiceSelect = document.getElementById('voiceSelect');
  const translateSelect = document.getElementById('translateSelect');
  const speakBtn = document.getElementById('speakBtn');
  const stopBtn = document.getElementById('stopBtn');
  const robotHead = document.getElementById('robotHead');
  const historyItems = document.getElementById('historyItems');
  const translatedText = document.getElementById('translatedText');
  const translatedContent = document.getElementById('translatedContent');
  const pitchSlider = document.getElementById('pitchSlider');
  const rateSlider = document.getElementById('rateSlider');
  const pitchValue = document.getElementById('pitchValue');
  const rateValue = document.getElementById('rateValue');
  const waveformCanvas = document.getElementById('waveformCanvas');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Speech synthesis setup
  const synth = window.speechSynthesis;
  let voices = [];
  let currentUtterance = null;
  let history = [];
  let analyser, audioContext;
  let animationId = null;

  // Initialize
  function init() {
    loadVoices();
    setupEventListeners();
    updateSliderValues();
    loadHistory();
    setupTabs();
    setupWaveform();
  }

  // Load available voices
  function loadVoices() {
    voices = synth.getVoices();
    voiceSelect.innerHTML = '';

    voices.forEach((voice, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(option);
    });

    // If voices not loaded yet, wait for the voiceschanged event
    if (voices.length === 0) {
      synth.addEventListener('voiceschanged', loadVoices);
    }
  }

  // Setup event listeners
  function setupEventListeners() {
    speakBtn.addEventListener('click', speak);
    stopBtn.addEventListener('click', stopSpeaking);
    pitchSlider.addEventListener('input', updateSliderValues);
    rateSlider.addEventListener('input', updateSliderValues);
    translateSelect.addEventListener('change', translateText);
  }

  // Update pitch and rate values
  function updateSliderValues() {
    pitchValue.textContent = pitchSlider.value;
    rateValue.textContent = rateSlider.value;
  }

  // Speak text function
  function speak() {
    if (synth.speaking) {
      stopSpeaking();
    }

    const text = textToSpeak.value.trim();
    if (!text) return;

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices[voiceSelect.value];

    utterance.voice = selectedVoice;
    utterance.pitch = parseFloat(pitchSlider.value);
    utterance.rate = parseFloat(rateSlider.value);

    // Set event handlers
    utterance.onstart = () => {
      robotHead.classList.add('speaking');
      drawWaveform();
    };

    utterance.onend = () => {
      robotHead.classList.remove('speaking');
      cancelAnimationFrame(animationId);
      addToHistory(text, selectedVoice.name, translatedText.textContent);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      robotHead.classList.remove('speaking');
      cancelAnimationFrame(animationId);
    };

    currentUtterance = utterance;
    synth.speak(utterance);
  }

  // Stop speaking
  function stopSpeaking() {
    synth.cancel();
    robotHead.classList.remove('speaking');
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  }

  // Translate text function
  async function translateText() {
    const text = textToSpeak.value.trim();
    if (!text || translateSelect.value === 'none') {
      translatedContent.classList.add('hidden');
      return;
    }

    try {
      translatedContent.classList.remove('hidden');
      translatedText.textContent = "Translating...";

      // In a real app, you would call a translation API here
      // This is a placeholder for demonstration
      const targetLang = translateSelect.value;
      const response = await mockTranslateAPI(text, targetLang);

      translatedText.textContent = response;
    } catch (error) {
      console.error('Translation error:', error);
      translatedText.textContent = "Translation failed. Please try again.";
    }
  }

  // Mock translation API (replace with real API in production)
  function mockTranslateAPI(text, targetLang) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`[Translated to ${targetLang}]: ${text}`);
      }, 500);
    });
  }

  // Add to history
  function addToHistory(text, voice, translation) {
    const historyItem = {
      id: Date.now(),
      text,
      voice,
      translation,
      timestamp: new Date().toLocaleString()
    };

    history.unshift(historyItem);
    if (history.length > 10) history.pop(); // Keep only 10 items

    saveHistory();
    renderHistory();
  }

  // Save history to localStorage
  function saveHistory() {
    localStorage.setItem('ttsHistory', JSON.stringify(history));
  }

  // Load history from localStorage
  function loadHistory() {
    const savedHistory = localStorage.getItem('ttsHistory');
    if (savedHistory) {
      history = JSON.parse(savedHistory);
      renderHistory();
    }
  }

  // Render history items
  function renderHistory() {
    historyItems.innerHTML = '';

    if (history.length === 0) {
      historyItems.innerHTML = '<p class="text-center text-gray-500">No history yet</p>';
      return;
    }

    history.forEach(item => {
      const historyElement = document.createElement('div');
      historyElement.className = 'history-item p-3 mb-2 bg-gray-100 rounded';
      historyElement.innerHTML = `
        <p class="text-sm"><strong>Text:</strong> ${item.text}</p>
        <p class="text-xs text-gray-600"><strong>Voice:</strong> ${item.voice}</p>
        ${item.translation ? `<p class="text-xs text-gray-600"><strong>Translation:</strong> ${item.translation}</p>` : ''}
        <p class="text-xs text-gray-500">${item.timestamp}</p>
        <div class="flex mt-2">
          <button class="replay-btn text-xs px-2 py-1 bg-blue-500 text-white rounded mr-2" data-id="${item.id}">Replay</button>
          <button class="delete-btn text-xs px-2 py-1 bg-red-500 text-white rounded" data-id="${item.id}">Delete</button>
        </div>
      `;

      historyItems.appendChild(historyElement);
    });

    // Add event listeners to history buttons
    document.querySelectorAll('.replay-btn').forEach(btn => {
      btn.addEventListener('click', replayFromHistory);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', deleteFromHistory);
    });
  }

  // Replay from history
  function replayFromHistory(event) {
    const itemId = parseInt(event.target.getAttribute('data-id'));
    const item = history.find(h => h.id === itemId);

    if (item) {
      textToSpeak.value = item.text;
      const voiceIndex = voices.findIndex(v => v.name === item.voice);
      if (voiceIndex >= 0) {
        voiceSelect.value = voiceIndex;
      }
      speak();
    }
  }

  // Delete from history
  function deleteFromHistory(event) {
    const itemId = parseInt(event.target.getAttribute('data-id'));
    history = history.filter(h => h.id !== itemId);
    saveHistory();
    renderHistory();
  }

  // Setup tabs
  function setupTabs() {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');

        // Update active tab button
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Show selected tab content
        tabContents.forEach(content => {
          content.classList.add('hidden');
          if (content.id === tabId) {
            content.classList.remove('hidden');
          }
        });
      });
    });
  }

  // Setup waveform visualization
  function setupWaveform() {
    const ctx = waveformCanvas.getContext('2d');
    waveformCanvas.width = waveformCanvas.offsetWidth;
    waveformCanvas.height = waveformCanvas.offsetHeight;

    // Draw initial empty waveform
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, waveformCanvas.width, waveformCanvas.height);
  }

  // Draw waveform animation
  function drawWaveform() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
    }

    const ctx = waveformCanvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationId = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, waveformCanvas.width, waveformCanvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath();

      const sliceWidth = waveformCanvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * waveformCanvas.height / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(waveformCanvas.width, waveformCanvas.height / 2);
      ctx.stroke();
    };

    draw();
  }

  // Handle window resize for waveform canvas
  window.addEventListener('resize', () => {
    if (waveformCanvas) {
      waveformCanvas.width = waveformCanvas.offsetWidth;
      waveformCanvas.height = waveformCanvas.offsetHeight;

      const ctx = waveformCanvas.getContext('2d');
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, waveformCanvas.width, waveformCanvas.height);
    }
  });

  // Initialize the application
  init();
});