import { Mic, MicOff, Volume2, VolumeX, Settings2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

interface VoiceControlsProps {
  isSpeaking: boolean;
  isListening: boolean;
  voiceSettings: { enabled: boolean; voiceType: "male" | "female"; speed: number };
  onToggleMic: () => void;
  onStopSpeaking: () => void;
  onSettingsChange: (settings: any) => void;
  ttsAvailable: boolean;
  sttAvailable: boolean;
  transcript?: string;
  compact?: boolean;
}

export default function VoiceControls({
  isSpeaking, isListening, voiceSettings, onToggleMic, onStopSpeaking,
  onSettingsChange, ttsAvailable, sttAvailable, transcript, compact,
}: VoiceControlsProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="space-y-2">
      {/* Control buttons */}
      <div className="flex items-center gap-2">
        {/* Mic button */}
        {sttAvailable && (
          <button
            onClick={onToggleMic}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isListening
                ? "bg-destructive/20 text-destructive border border-destructive/40 animate-pulse"
                : "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
            }`}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            {isListening ? "Stop" : "Speak"}
          </button>
        )}

        {/* Speaker indicator */}
        {ttsAvailable && isSpeaking && (
          <button
            onClick={onStopSpeaking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary/20 text-secondary border border-secondary/30 hover:bg-secondary/30 transition-all"
          >
            <VolumeX className="w-3.5 h-3.5" />
            Stop AI
          </button>
        )}

        {ttsAvailable && !isSpeaking && voiceSettings.enabled && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Volume2 className="w-3 h-3" /> AI Voice On
          </span>
        )}

        {/* Settings toggle */}
        {!compact && (
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="ml-auto text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Voice waveform when listening */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-1 justify-center py-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-primary"
                  animate={{
                    height: [4, Math.random() * 20 + 4, 4],
                  }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.3,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>
            {transcript && (
              <p className="text-[10px] text-muted-foreground italic px-2 py-1 bg-muted/50 rounded max-h-16 overflow-y-auto">
                {transcript}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-3 space-y-3 border border-border/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">AI Voice</span>
                <Switch
                  checked={voiceSettings.enabled}
                  onCheckedChange={(checked) => onSettingsChange({ ...voiceSettings, enabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Voice Type</span>
                <div className="flex gap-1">
                  {(["female", "male"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => onSettingsChange({ ...voiceSettings, voiceType: t })}
                      className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                        voiceSettings.voiceType === t
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">Speed</span>
                  <span className="text-[10px] text-primary">{voiceSettings.speed.toFixed(1)}x</span>
                </div>
                <Slider
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[voiceSettings.speed]}
                  onValueChange={([v]) => onSettingsChange({ ...voiceSettings, speed: v })}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
