// app/ClientHome.tsx
"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const AudioRecorder = dynamic(() => import('./AudioRecorder'), { ssr: false });

const emotions = "Ponme BeattleJuice 2,El último de House of Dragons,Pon las noticias,Pon la carrera de la F1,Cámbiale a Fox Sports,Algo de Scarlett Johansson".split(',');

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-[#082f49]">
      <div className="flex flex-col items-center">
        <div className="w-1/6 max-w-[150px] min-w-[100px] mb-8">
          <Image
            src="/images/logos/TVBOX-blanco-sinfondo.png"
            alt="TVBOX Logo"
            width={150}
            height={150}
            style={{ width: '100%', height: 'auto' }}
            priority
          />
        </div>
        <Loader2 className="animate-spin text-white mb-4" size={48} />
        <h2 className="text-white text-2xl font-bold">Cargando...</h2>
        <p className="text-gray-300 mt-2">Preparando tu experiencia personalizada</p>
      </div>
    </div>
  );
};

export default function ClientHome() {
  const [inputText, setInputText] = useState('');
  const [currentEmotion, setCurrentEmotion] = useState(emotions[0]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [background, setBackground] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        const response = await fetch('/api/backgrounds');
        if (!response.ok) {
          throw new Error('Failed to fetch backgrounds');
        }
        const backgrounds = await response.json();
        const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        setBackground(`/images/backgrounds/${randomBackground}`);
      } catch (error) {
        console.error('Error fetching backgrounds:', error);
        // Fallback to a default background if there's an error
        setBackground('/images/backgrounds/default.webp');
      }
    };

    fetchBackgrounds();

    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 2000);

    let currentIndex = 0;
    
    const updateEmotion = () => {
      setCurrentEmotion(emotions[currentIndex]);
      currentIndex = (currentIndex + 1) % emotions.length;
    };

    intervalRef.current = setInterval(updateEmotion, 1000);

    return () => {
      clearTimeout(timer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Texto enviado:', inputText);
    setInputText('');
  }, [inputText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  return (
    <main className="relative flex flex-col items-center justify-between min-h-screen bg-deep-blue text-white font-bold font-sans">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url('${background}')` }}
      />
      
      <div className="absolute inset-0 bg-black bg-opacity-50 z-10" />
      
      {/* Logo letrero */}
      <div className="absolute top-9 left-4 w-1/4 max-w-[190px] min-w-[142px] z-30 opacity-90">
        <Image
          src="/images/logos/letrero.webp"
          alt="Letrero Logo"
          width={190}
          height={95}
          style={{ width: '95%', height: 'auto' }}
          priority
        />
      </div>
      
      {/* Logo TVBOX alineado a la misma altura */}
      <div className="absolute top-4 right-4 w-1/6 max-w-[150px] min-w-[100px] z-30 flex items-start">
        <Image
          src="/images/logos/TVBOX-blanco-sinfondo.png"
          alt="TVBOX Logo"
          width={150}
          height={150}
          style={{ width: '100%', height: 'auto' }}
          priority
        />
      </div>
      
      <div className="relative z-20 flex items-center justify-center min-h-screen w-full">
        <div className="w-full max-w-md p-6 bg-black bg-opacity-50 rounded-lg shadow-lg">
          <h1 className="text-2xl mb-6 text-center">
            ¿Qué quieres ver hoy?
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <div className="flex w-full mb-4 relative">
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                className="flex-grow px-3 py-3 rounded-l-md focus:outline-none text-black text-sm"
                placeholder={isInputFocused ? '' : `${currentEmotion}`}
              />
              <button
                type="submit"
                className="bg-custom-blue text-white px-4 py-3 rounded-r-md hover:bg-blue-700 transition-colors whitespace-nowrap text-sm"
              >
                Pedir
              </button>
            </div>
            <p className="text-[#fde047] text-sm text-center mt-4">
              Ponme la película de beetlejuice en inglés y con subtítulos en español
            </p>
          </form>
        </div>
      </div>
      
      <div className="absolute bottom-36 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-md px-4">
        <AudioRecorder />
      </div>
    </main>
  );
}