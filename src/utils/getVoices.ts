import axios from 'axios';

async function listVoices(apiKey: string) {
  try {
    const response = await axios({
      method: 'GET',
      url: 'https://api.elevenlabs.io/v1/voices',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': apiKey
      }
    });

    console.log('Available voices:');
    response.data.voices.forEach(voice => {
      console.log(`- ${voice.name}: ${voice.voice_id}`);
    });

    return response.data.voices;
  } catch (error) {
    console.error('Error fetching voices:', error.message);
    throw error;
  }
}

// Usage:
// listVoices(process.env.ELEVENLABS_API_KEY); 