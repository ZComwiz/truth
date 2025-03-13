import axios from 'axios';
import dotenv from 'dotenv';
import readline from 'readline';
import fs from 'fs/promises';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function playVoiceSample(apiKey: string, voiceId: string, sampleText: string) {
  try {
    const response = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      data: {
        text: sampleText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      },
      responseType: 'arraybuffer'
    });

    // Save sample to temp file and play it
    const tempFile = `temp_${voiceId}.mp3`;
    await fs.writeFile(tempFile, response.data);
    
    // You can add logic here to play the audio file using a library like 'play-sound'
    console.log(`Sample saved as ${tempFile}`);
  } catch (error) {
    console.error(`Error playing sample: ${error.message}`);
  }
}

async function selectVoice() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('Missing API key in .env file');
    process.exit(1);
  }

  try {
    const voices = await axios({
      method: 'GET',
      url: 'https://api.elevenlabs.io/v1/voices',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': apiKey
      }
    });

    console.log('\nAvailable voices:');
    voices.data.voices.forEach((voice, index) => {
      console.log(`${index + 1}. ${voice.name} (${voice.voice_id})`);
    });

    const answer = await new Promise<string>(resolve => {
      rl.question('\nEnter the number of the voice you want to test, or "q" to quit: ', resolve);
    });

    if ((answer as string).toLowerCase() === 'q') {
      rl.close();
      return;
    }

    const selectedIndex = parseInt(answer as string) - 1;
    const selectedVoice = voices.data.voices[selectedIndex];

    if (selectedVoice) {
      console.log(`\nTesting voice: ${selectedVoice.name}`);
      await playVoiceSample(
        apiKey, 
        selectedVoice.voice_id,
        "This is a sample of how this voice will sound in your audiobook."
      );

      const useVoice = await new Promise<string>(resolve => {
        rl.question('\nUse this voice? (y/n): ', resolve);
      });

      if ((useVoice as string).toLowerCase() === 'y') {
        // Update .env file with selected voice ID
        const envContent = await fs.readFile('.env', 'utf-8');
        const updatedContent = envContent.replace(
          /ELEVENLABS_VOICE_ID=.*/,
          `ELEVENLABS_VOICE_ID=${selectedVoice.voice_id}`
        );
        await fs.writeFile('.env', updatedContent);
        console.log(`\nVoice ID saved to .env file: ${selectedVoice.voice_id}`);
      } else {
        // Recursively call selectVoice to try another voice
        await selectVoice();
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
  }
}

selectVoice().catch(console.error); 