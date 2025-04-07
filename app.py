# import pyttsx3
# if __name__ == '__main__':
#     print("Welcome to RoboSpeaker")
#     print("Enter 1 to exit")
#     while True:
#         x = input("What you want me to speak:")
#         engine = pyttsx3.init()
#         if x == "1":
#             y = "Thank you for using Robo Speaker"
#             engine.say(y)
#             engine.runAndWait()
#             break
#         engine.say(x)
#         engine.runAndWait()

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

if __name__ == '__main__':
    app.run(debug=True)
