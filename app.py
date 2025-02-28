import re
import nltk
from flask import Flask, render_template, request, jsonify
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer, WordNetLemmatizer
import os
import joblib
from opencensus.ext.azure.log_exporter import AzureLogHandler
import logging

nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('punkt_tab')

# Définir le répertoire NLTK
nltk_data_dir = os.path.join(os.getcwd(), "nltk_data")
os.makedirs(nltk_data_dir, exist_ok=True)
nltk.data.path.append(nltk_data_dir)

# Fonction pour télécharger les ressources NLTK de manière sécurisée
def download_nltk_data():
    resources = ['punkt', 'stopwords', 'wordnet', 'omw-1.4']
    for resource in resources:
        try:
            nltk.data.find(f'tokenizers/{resource}')
        except LookupError:
            nltk.download(resource, download_dir=nltk_data_dir)

# Télécharger les données au démarrage
download_nltk_data()

app = Flask(__name__)

# Configurer le logger pour Application Insights
instrumentation_key = os.getenv('AZURE_INSTRUMENTATION_KEY')
if not instrumentation_key:
    raise ValueError("Invalid instrumentation key.")
logger = logging.getLogger(__name__)
logger.addHandler(AzureLogHandler(connection_string=f'InstrumentationKey={instrumentation_key}'))
logger.setLevel(logging.INFO)

# Dictionnaire pour stocker les prédictions associées à chaque tweet
prediction_cache = {}

# Charger le modèle Pipeline (TF-IDF + Logistic Regression) avec joblib
pipeline_model = joblib.load('model_pipeline.joblib')

# Initialiser les outils de nettoyage de texte
stop_words = set(stopwords.words('english'))
stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()

def clean_text(text):
    text = re.sub(r'http\S+|www\S+|https\S+', 'URL', text, flags=re.MULTILINE)
    text = re.sub(r'\@\w+', 'mention', text)
    text = re.sub(r'\#\w+', 'hashtag', text)
    text = re.sub(r'[^A-Za-z\s]', '', text)
    text = text.lower()
    tokens = nltk.word_tokenize(text)
    tokens = [word for word in tokens if word not in stop_words and word.isalpha()]
    tokens = [stemmer.stem(word) for word in tokens]
    tokens = [lemmatizer.lemmatize(word) for word in tokens]
    return ' '.join(tokens)

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    tweet_text = data.get('tweet_to_predict', '')

    cleaned_text = clean_text(tweet_text)
    app.logger.info(f"Cleaned text: {cleaned_text}")

    # Prédiction avec le pipeline joblib
    prediction = pipeline_model.predict([cleaned_text])
    app.logger.info(f"Pipeline prediction: {prediction}")

    result = "Positif" if prediction[0] == 1 else "Négatif"
    prediction_cache[tweet_text] = result

    return jsonify({'prediction': result})

@app.route('/feedbackpositif', methods=['POST'])
def feedbackpositif():
    return "true"

@app.route('/feedbacknegatif', methods=['POST'])
def feedbacknegatif():
    data = request.get_json()
    tweet_text = data.get('tweet_to_predict')

    if tweet_text in prediction_cache:
        app.logger.error(f'{tweet_text}: {prediction_cache[tweet_text]}')
        app.logger.warning(f'Negative feedback received for tweet: {tweet_text}')
    else:
        app.logger.error(f'Tweet non trouvé dans le cache: {tweet_text}')
        app.logger.warning(f'Tweet not found in cache: {tweet_text}')

    return "true"

if __name__ == '__main__':
    app.run()