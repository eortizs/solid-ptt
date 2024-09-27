// app/AudioRecorder.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic } from 'lucide-react';

const AudioRecorder: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const mqttClient = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
    
    const setupMqtt = async () => {
      try {
        const mqtt = (await import('mqtt/dist/mqtt')).default;
        mqttClient.current = mqtt.connect('wss://broker.emqx.io:8084/mqtt');
        mqttClient.current.on('connect', () => {
          console.log('Conectado al broker EMQX MQTT');
        });
      } catch (error) {
        console.error('Error al configurar MQTT:', error);
      }
    };

    setupMqtt();

    return () => {
      if (mqttClient.current) {
        mqttClient.current.end();
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    if (!isClient) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });

      const options = { mimeType: 'audio/webm' };
      mediaRecorder.current = new MediaRecorder(stream, options);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error al iniciar la grabación:', error);
    }
  }, [isClient]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = btoa(
            new Uint8Array(reader.result as ArrayBuffer)
              .reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          
          if (mqttClient.current) {
            const message = JSON.stringify({ speech: [base64Audio] });
            mqttClient.current.publish('peopleconnect/speech', message);
          }
        };
        reader.readAsArrayBuffer(audioBlob);
      };
    }
  }, [isRecording]);

  const handleButtonInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (e.type === 'mousedown' || e.type === 'touchstart') {
      startRecording();
    } else if (e.type === 'mouseup' || e.type === 'touchend') {
      stopRecording();
    }
  }, [startRecording, stopRecording]);

  if (!isClient) {
    return null; // No renderizar nada en el servidor
  }

  return (
    <button
      onMouseDown={handleButtonInteraction}
      onMouseUp={handleButtonInteraction}
      onTouchStart={handleButtonInteraction}
      onTouchEnd={handleButtonInteraction}
      className={`w-full px-8 py-6 rounded-lg transition-colors flex items-center justify-center shadow-lg select-none ${
        isRecording ? 'bg-red-600' : 'bg-custom-blue hover:bg-blue-700'
      }`}
    >
      <Mic className="text-white mr-3" size={32} />
      <span className="text-white text-xl font-semibold">
        {isRecording ? 'Te Escucho...' : 'Presiona para hablar'}
      </span>
    </button>
  );
};

export default AudioRecorder;