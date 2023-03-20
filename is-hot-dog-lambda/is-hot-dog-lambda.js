const fetch = require('node-fetch');
const FormData = require('form-data');
const cors = require('micro-cors')();

const PREDICT_ENDPOINT = process.env.PREDICT_ENDPOINT;
if (!PREDICT_ENDPOINT) {
	console.error('error, should set PREDICT_ENDPOINT environment variable');
	process.exit(1);
}

module.exports = cors(async (req, res) => {
	const imageUrl = decodeURI(req.url).slice(1);
	if (imageUrl === '') {
		return 'go to /<image url> to predict'
	}
	const imageResponse = await fetch(imageUrl);
	const imageData = await imageResponse.blob();

	const imageArrayBuffer = await imageData.arrayBuffer();
	const imageDataBuffer = Buffer.from(imageArrayBuffer);

	const formData = new FormData();
	formData.append('image', imageDataBuffer, {
		filename: 'maybe-hot-dog.jpg',
		contentType: 'image/jpeg'
	});

	const response = await fetch(PREDICT_ENDPOINT, { method: 'POST', body: formData });
	const predictData = await response.json();

	const { predictions } = predictData;
	const firstPrediction = predictions[0];

	// if ai more than 50% sure that its hotdog then its hotdog
	const isHotDog = firstPrediction.label == 'hotdog' && firstPrediction.probability > 0.5
	return isHotDog ? 'hotdog' : 'not hotdog';
});