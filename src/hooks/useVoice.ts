import { useState, useRef, useCallback, useEffect } from "react";

interface VoiceSettings {
  enabled: boolean;
  voiceType: "male" | "female";
  speed: number;
}

export interface UseVoiceReturn {
  // TTS
  speak: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  // STT
  startListening: () => void;
  stopListening: () => void;
  isListening: boolean;
  transcript: string;
  clearTranscript: () => void;
  // Settings
  voiceSettings: VoiceSettings;
  setVoiceSettings: React.Dispatch<React.SetStateAction<VoiceSettings>>;
  // Availability
  ttsAvailable: boolean;
  sttAvailable: boolean;
}

const SpeechRecognitionAPI =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export function useVoice(): UseVoiceReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    enabled: true,
    voiceType: "female",
    speed: 1.0,
  });

  const recognitionRef = useRef<any>(null);
  const ttsAvailable = typeof window !== "undefined" && "speechSynthesis" in window;
  const sttAvailable = !!SpeechRecognitionAPI;

  // Pick a voice matching the selected type
  const getVoice = useCallback((): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const langVoices = voices.filter(v => v.lang.startsWith("en"));
    const preferred = voiceSettings.voiceType === "female"
      ? langVoices.find(v => /female|samantha|zira|karen|moira|fiona|tessa/i.test(v.name))
      : langVoices.find(v => /male|daniel|david|james|alex|tom|fred|george/i.test(v.name) && !/female/i.test(v.name));

    return preferred || langVoices[0] || voices[0];
  }, [voiceSettings.voiceType]);

  const speak = useCallback((text: string) => {
    if (!ttsAvailable || !voiceSettings.enabled) return;
    window.speechSynthesis.cancel();

    // Split long text into chunks to avoid browser cutting off
    const chunks = text.match(/.{1,200}[.!?,;]?\s*/g) || [text];
    let idx = 0;
    setIsSpeaking(true);

    const speakNext = () => {
      if (idx >= chunks.length) {
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(chunks[idx]);
      const voice = getVoice();
      if (voice) utterance.voice = voice;
      utterance.rate = voiceSettings.speed;
      utterance.pitch = 1;
      utterance.onend = () => { idx++; speakNext(); };
      utterance.onerror = () => { setIsSpeaking(false); };
      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  }, [ttsAvailable, voiceSettings.enabled, voiceSettings.speed, getVoice]);

  const stopSpeaking = useCallback(() => {
    if (ttsAvailable) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [ttsAvailable]);

  const startListening = useCallback(() => {
    if (!sttAvailable) return;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t + " ";
        } else {
          interim = t;
        }
      }
      setTranscript(finalTranscript + interim);
    };

    recognition.onerror = () => { setIsListening(false); };
    recognition.onend = () => { setIsListening(false); };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, [sttAvailable]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => setTranscript(""), []);

  // Preload voices
  useEffect(() => {
    if (ttsAvailable) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {};
    }
    return () => {
      if (ttsAvailable) window.speechSynthesis.cancel();
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch {}
    };
  }, [ttsAvailable]);

  return {
    speak, stopSpeaking, isSpeaking,
    startListening, stopListening, isListening, transcript, clearTranscript,
    voiceSettings, setVoiceSettings,
    ttsAvailable, sttAvailable,
  };
}
