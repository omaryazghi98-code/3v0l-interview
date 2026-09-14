import net from 'node:net';
import {WebSocket} from 'ws';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

const AUDIO_HOST = process.env.AUDIO_HOST || '0.0.0.0';
const AUDIO_PORT = Number(process.env.AUDIO_PORT || 38472);
const STT_PROVIDER = (process.env.STT_PROVIDER || 'deepgram').toLowerCase();
const DEEPGRAM_KEY = process.env.DEEPGRAM_API_KEY || '';
const AZURE_KEY = process.env.AZURE_SPEECH_KEY || '';
const AZURE_REGION = process.env.AZURE_SPEECH_REGION || 'eastus';
const AZURE_LANGUAGE = process.env.AZURE_SPEECH_LANGUAGE || 'en-US';
const SAMPLE_RATE = Number(process.env.AUDIO_SAMPLE_RATE || 48000);

let active = null;
let onTranscript = async () => {};
let enabled = { deepgram: true, azure: true };

export function setTranscriptHandler(fn) { onTranscript = fn; }

export function setSttProviderEnabled(provider, value) {
  const name = String(provider || '').toLowerCase();
  if (!(name in enabled)) return false;
  enabled[name] = Boolean(value);
  if (!enabled[name] && active?.provider === name) {
    try { active.stt.close(); } catch {}
    try { active.socket.destroy(); } catch {}
    active = null;
  }
  return true;
}

export function sttProviderControls() { return {...enabled}; }

function send(payload) {
  return Promise.resolve(onTranscript(payload)).catch(err => console.error('transcript handler:', err));
}

function createDeepgram() {
  if (!DEEPGRAM_KEY) throw new Error('DEEPGRAM_API_KEY is not configured');
  const url = `wss://api.deepgram.com/v1/listen?model=nova-3&language=multi&encoding=linear16&sample_rate=${SAMPLE_RATE}&channels=1&interim_results=true&smart_format=true&punctuate=true&endpointing=300`;
  const ws = new WebSocket(url, {headers:{Authorization:`Token ${DEEPGRAM_KEY}`}});
  ws.on('open', () => console.log('Deepgram STT connected'));
  ws.on('message', data => {
    try {
      const m = JSON.parse(data.toString());
      const text = m?.channel?.alternatives?.[0]?.transcript?.trim();
      if (!text) return;
      send({transcript:text, speaker:'interviewer', final:Boolean(m?.is_final), provider:'deepgram'});
    } catch {}
  });
  ws.on('error', e => console.error('Deepgram:', e.message));
  ws.on('close', () => console.log('Deepgram STT closed'));
  return {
    write: chunk => ws.readyState === WebSocket.OPEN && ws.send(chunk),
    close: () => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({type:'CloseStream'})); ws.close(); }
  };
}

function createAzure() {
  if (!AZURE_KEY) throw new Error('AZURE_SPEECH_KEY is not configured');
  const push = sdk.AudioInputStream.createPushStream(sdk.AudioStreamFormat.getWaveFormatPCM(SAMPLE_RATE, 16, 1));
  const audio = sdk.AudioConfig.fromStreamInput(push);
  const speech = sdk.SpeechConfig.fromSubscription(AZURE_KEY, AZURE_REGION);
  speech.speechRecognitionLanguage = AZURE_LANGUAGE;
  speech.outputFormat = sdk.OutputFormat.Detailed;
  const recognizer = new sdk.SpeechRecognizer(speech, audio);
  recognizer.recognizing = (_s, e) => {
    const text = e?.result?.text?.trim();
    if (text) send({transcript:text, speaker:'interviewer', final:false, provider:'azure'});
  };
  recognizer.recognized = (_s, e) => {
    const text = e?.result?.text?.trim();
    if (text) send({transcript:text, speaker:'interviewer', final:true, provider:'azure'});
  };
  recognizer.canceled = (_s, e) => console.error('Azure canceled:', e?.errorDetails || e?.reason);
  recognizer.startContinuousRecognitionAsync();
  console.log(`Azure Speech connected (${AZURE_LANGUAGE}, ${AZURE_REGION})`);
  return {
    write: chunk => push.write(chunk),
    close: () => { push.close(); recognizer.stopContinuousRecognitionAsync(() => recognizer.close(), () => recognizer.close()); }
  };
}

function chooseProvider() {
  if (STT_PROVIDER === 'azure') {
    if (!enabled.azure) throw new Error('Azure Speech is disabled in API controls');
    return createAzure();
  }
  if (STT_PROVIDER === 'deepgram') {
    if (!enabled.deepgram) throw new Error('Deepgram is disabled in API controls');
    return createDeepgram();
  }
  throw new Error(`Unsupported STT_PROVIDER: ${STT_PROVIDER}`);
}

function startSession(socket) {
  if (active?.socket) active.socket.destroy();
  let stt;
  try { stt = chooseProvider(); } catch (err) {
    socket.write(`ERR ${err.message}\n`); socket.destroy(); return;
  }
  active = {socket,stt,provider:STT_PROVIDER,startedAt:new Date().toISOString()};
  socket.write('OK 3V0L-AUDIO/1\n');
  socket.on('data', chunk => { if (chunk.length) stt.write(chunk); });
  socket.on('close', () => { try { stt.close(); } catch {} if (active?.socket === socket) active = null; });
  socket.on('error', () => { try { stt.close(); } catch {} });
}

export function startSttServer() {
  const server = net.createServer(startSession);
  server.listen(AUDIO_PORT, AUDIO_HOST, () => console.log(`3V0L audio/STT TCP listening on ${AUDIO_HOST}:${AUDIO_PORT} (${STT_PROVIDER})`));
  return server;
}

export function sttStatus() {
  return {provider:STT_PROVIDER,connected:Boolean(active),audioPort:AUDIO_PORT,sampleRate:SAMPLE_RATE,activeSince:active?.startedAt||null,enabled:{...enabled}};
}
