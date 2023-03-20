import { useState } from 'react';
import './App.css'

const UPLOAD_IMAGES_ENDPOINT = 'https://upload-seefood-ai.micromesh.dev/upload';
const IMAGES_BASE_ENDPOINT = 'https://images-seefood-ai.micromesh.dev';
const PREDICT_ENDPOINT = 'https://ai-seefood-ai.micromesh.dev';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [messages, setMessages] = useState([]);

  const predict = async (imageUrl) => {
    const response = await fetch(`${PREDICT_ENDPOINT}/${encodeURI(imageUrl)}`);
    const responseText = await response.text();
    return responseText;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', selectedFile);

    const response = await fetch(UPLOAD_IMAGES_ENDPOINT, { method: 'POST', body: formData });
    const responseText = await response.text();

    console.log(responseText);
    const imageUrl = `${IMAGES_BASE_ENDPOINT}/${selectedFile.name}`;
    const uploadMessage = `Uploaded ${selectedFile.name} to ${imageUrl}`;
    setMessages(oldMessages => [...oldMessages, uploadMessage])
    // now predicting
    const result = await predict(imageUrl);
    const predictMessage = `AI Predicted that ${selectedFile.name} is ${result}`;
    window.alert(result === 'hotdog' ? `${result}🌭` : `${result} ❌🌭`)
    setMessages(oldMessages => [...oldMessages, predictMessage])
  }

  return (
    <div className="App">
      <img src='hamburger.png'></img>
      <h1>SeeFood AI</h1>
      <div className="card">
        <p>Upload an image to classify it</p>
        <form onSubmit={handleSubmit}>
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
          <button>Submit</button>
        </form>
        <div name="progress-div">
          <pre>
            {messages.join('\n')}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default App
