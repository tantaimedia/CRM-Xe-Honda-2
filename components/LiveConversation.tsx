import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, LiveSession } from "@google/genai";
import { Modal } from './common/Modal';
import { Spinner } from './common/Spinner';

// --- Audio Utility Functions (as per Gemini API guidelines) ---
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}
// --- End Audio Utility Functions ---

interface TranscriptItem {
    id: number;
    speaker: 'user' | 'model';
    text: string;
    isFinal: boolean;
}

export const LiveConversation: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
    const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    
    // Refs for audio and API state to avoid re-renders and stale closures
    const aiRef = useRef<GoogleGenAI | null>(null);
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const nextStartTimeRef = useRef(0);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
    
    // Initialize AI client once
    useEffect(() => {
        if (!aiRef.current) {
            aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
        }
    }, []);

    // Scroll to bottom of transcript
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    const stopConversation = useCallback(async () => {
        console.log("Stopping conversation...");
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) {
                console.error("Error closing session:", e);
            }
        }

        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            await inputAudioContextRef.current.close();
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
             await outputAudioContextRef.current.close();
        }
        
        // Reset all states and refs
        setStatus('idle');
        setTranscript([]);
        setErrorMessage('');
        sessionPromiseRef.current = null;
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;
        scriptProcessorRef.current = null;
        mediaStreamRef.current = null;
        nextStartTimeRef.current = 0;
        sourcesRef.current.clear();
    }, []);


    const startConversation = async () => {
        setStatus('connecting');
        setTranscript([]);
        setErrorMessage('');
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            nextStartTimeRef.current = 0;
            sourcesRef.current.clear();

            const outputNode = outputAudioContextRef.current.createGain();
            outputNode.connect(outputAudioContextRef.current.destination);

            let turnIdCounter = 0;
            let currentInputTurn: TranscriptItem | null = null;
            let currentOutputTurn: TranscriptItem | null = null;

            if (!aiRef.current) throw new Error("AI client not initialized");
            
            sessionPromiseRef.current = aiRef.current.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        console.log('Session opened.');
                        setStatus('active');
                        const source = inputAudioContextRef.current.createMediaStreamSource(stream);
                        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            if (sessionPromiseRef.current) {
                                sessionPromiseRef.current.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };
                        
                        source.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            const { text, isFinal } = message.serverContent.inputTranscription;
                            if (!currentInputTurn || currentInputTurn.isFinal) {
                                turnIdCounter++;
                                currentInputTurn = { id: turnIdCounter, speaker: 'user', text, isFinal: isFinal ?? false };
                                setTranscript(prev => [...prev, currentInputTurn]);
                            } else {
                                setTranscript(prev => prev.map(t => t.id === currentInputTurn.id ? { ...t, text: currentInputTurn.text + text, isFinal: isFinal ?? false } : t));
                                currentInputTurn.text += text;
                                currentInputTurn.isFinal = isFinal ?? false;
                            }
                        }
                         if (message.serverContent?.outputTranscription) {
                            const { text, isFinal } = message.serverContent.outputTranscription;
                              if (!currentOutputTurn || currentOutputTurn.isFinal) {
                                turnIdCounter++;
                                currentOutputTurn = { id: turnIdCounter, speaker: 'model', text, isFinal: isFinal ?? false };
                                setTranscript(prev => [...prev, currentOutputTurn]);
                            } else {
                                 setTranscript(prev => prev.map(t => t.id === currentOutputTurn.id ? { ...t, text: currentOutputTurn.text + text, isFinal: isFinal ?? false } : t));
                                currentOutputTurn.text += text;
                                currentOutputTurn.isFinal = isFinal ?? false;
                            }
                        }

                        if (message.serverContent?.modelTurn?.parts[0]?.inlineData.data) {
                           const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
                           nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                           const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                           const source = outputAudioContextRef.current.createBufferSource();
                           source.buffer = audioBuffer;
                           source.connect(outputNode);
                           source.addEventListener('ended', () => sourcesRef.current.delete(source));
                           source.start(nextStartTimeRef.current);
                           nextStartTimeRef.current += audioBuffer.duration;
                           sourcesRef.current.add(source);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        setErrorMessage(`Lỗi kết nối: ${e.message}`);
                        setStatus('error');
                        stopConversation();
                    },
                    onclose: (e: CloseEvent) => {
                        console.log('Session closed.');
                        if (status !== 'idle') { // Avoid resetting state if closed manually
                           stopConversation();
                        }
                    },
                },
                 config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: 'You are a friendly and helpful sales assistant for a Honda motorcycle dealership named GIA HÒA 6. Be concise and professional. Respond in Vietnamese.',
                 },
            });

        } catch (err) {
            console.error("Failed to start conversation:", err);
            setErrorMessage(err instanceof Error ? err.message : 'Không thể bắt đầu cuộc trò chuyện. Vui lòng kiểm tra quyền truy cập micro.');
            setStatus('error');
        }
    };
    
    // Ensure conversation is stopped when modal is closed
    useEffect(() => {
        if (!isOpen) {
            stopConversation();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const renderTranscript = () => {
        return transcript.map((item) => (
             <div key={item.id} className={`flex ${item.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                    item.speaker === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                }`}>
                    <p>{item.text}</p>
                </div>
            </div>
        ));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Trò Chuyện Trực Tiếp với AI">
            <div className="flex flex-col h-[60vh]">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 rounded-md">
                    {transcript.length === 0 && status !== 'active' && (
                        <div className="text-center text-gray-500 dark:text-gray-400">
                           {status === 'idle' && "Nhấn 'Bắt đầu' để trò chuyện với trợ lý AI."}
                           {status === 'connecting' && "Đang kết nối..."}
                           {status === 'error' && `Lỗi: ${errorMessage}`}
                        </div>
                    )}
                    {renderTranscript()}
                    <div ref={transcriptEndRef} />
                </div>
                <div className="pt-4 flex flex-col items-center justify-center">
                    {status === 'active' && 
                        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <span>Đang lắng nghe...</span>
                        </div>
                    }
                     {errorMessage && <p className="text-sm text-red-500 mt-2">{errorMessage}</p>}
                    <div className="mt-4">
                        {status === 'idle' || status === 'error' ? (
                            <button onClick={startConversation} className="px-6 py-2 bg-honda-red text-white font-semibold rounded-lg shadow-md hover:bg-honda-red-dark">
                                Bắt đầu
                            </button>
                        ) : status === 'connecting' ? (
                            <button disabled className="px-6 py-2 bg-gray-400 text-white font-semibold rounded-lg cursor-not-allowed flex items-center">
                                <Spinner size="h-5 w-5 mr-2" /> Đang kết nối...
                            </button>
                        ) : (
                             <button onClick={stopConversation} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700">
                                Dừng lại
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
