from flask import Flask, render_template, request, jsonify
from googletrans import Translator, LANGUAGES

app = Flask(__name__)
translator = Translator()


# Route for the homepage
@app.route('/')
def index():
    # Pass the list of languages to the frontend
    languages = {code: name.capitalize() for code, name in LANGUAGES.items()}
    return render_template('index.html', languages=languages)


# Route to handle translation
@app.route('/translate', methods=['POST'])
def translate_text():
    data = request.get_json()
    text = data.get('text')
    target_lang = data.get('target_lang')

    if not text or not target_lang:
        return jsonify({'error': 'Text and target language are required'}), 400

    try:
        translated = translator.translate(text, dest=target_lang)
        return jsonify({'translated_text': translated.text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Route to handle speech recognition results
@app.route('/process_speech', methods=['POST'])
def process_speech():
    data = request.get_json()
    speech_text = data.get('speech_text')

    if not speech_text:
        return jsonify({'error': 'No speech text provided'}), 400

    # You could add additional processing here if needed
    return jsonify({'success': True, 'text': speech_text})


if __name__ == '__main__':
    app.run(debug=True)