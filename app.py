from google.cloud import speech_v1p1beta1
from google.cloud.speech_v1p1beta1 import enums
from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/')
def hello_world():
    return render_template("index.html")

@app.route('/translate', methods=['POST'])
def translate():
    data = request.get_data()
    return sample_recognize(data)


def sample_recognize(content):
    """
    Performs synchronous speech recognition on an audio file

    Args:
      storage_uri URI for audio file in Cloud Storage, e.g. gs://[BUCKET]/[FILE]
    """

    client = speech_v1p1beta1.SpeechClient()

    # storage_uri = 'gs://cloud-samples-data/speech/brooklyn_bridge.mp3'

    # The language of the supplied audio
    language_code = "sv-SE"

    # Sample rate in Hertz of the audio data sent
    sample_rate_hertz = 44100

    # Encoding of audio data sent. This sample sets this explicitly.
    # This field is optional for FLAC and WAV audio formats.
    encoding = enums.RecognitionConfig.AudioEncoding.MP3
    config = {
        "language_code": language_code,
        "sample_rate_hertz": sample_rate_hertz,
        "encoding": encoding,
    }
    audio = {"content": content}

    response = client.recognize(config, audio)
    if not response.results:
        return "Sorry, but no results detected"
    for result in response.results:
        # First alternative is the most probable result
        alternative = result.alternatives[0]
        return alternative.transcript

if __name__ == '__main__':
    app.run(port = 8080)
