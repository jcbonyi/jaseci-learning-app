"""
Simple OpenAI proxy script (optional). This Python script can be run separately
and exposed at http://localhost:8000/openai to accept POST requests with JSON
payload {"model":"gpt-4","prompt":"...","max_tokens":512} and will
forward to OpenAI using the OPENAI_API_KEY environment variable.

Run with: `python openai_proxy.py` (requires `flask` and `openai` packages)
"""
from flask import Flask, request, jsonify
import os
import openai

app = Flask(__name__)
openai.api_key = os.environ.get('OPENAI_API_KEY')

@app.route('/openai', methods=['POST'])
def openai_proxy():
    data = request.get_json()
    model = data.get('model', 'gpt-4')
    prompt = data.get('prompt', '')
    max_tokens = data.get('max_tokens', 512)
    if not openai.api_key:
        return jsonify({'error': 'OPENAI_API_KEY not set'}), 400
    resp = openai.ChatCompletion.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens
    )
    return jsonify(resp)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000)
