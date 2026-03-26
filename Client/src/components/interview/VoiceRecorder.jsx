import { motion as Motion } from 'framer-motion';
import { useVoice } from '../../hooks/useVoice.js';
import { useEffect } from 'react';

export default function VoiceRecorder({ onTranscriptChange }) {
  const { isRecording, transcript, isSupported, startRecording, stopRecording, setTranscript } = useVoice();

  useEffect(() => { onTranscriptChange?.(transcript); }, [transcript, onTranscriptChange]);

  if (!isSupported) {
    return (
      <div className="p-6 text-center bg-bg-card rounded-xl border border-border">
        <p className="text-text-muted">Voice recording not supported in this browser. Please type your answer below.</p>
        <textarea
          className="mt-4 w-full h-40 p-4 bg-bg-surface border border-border rounded-lg text-sm resize-none focus:outline-none focus:border-primary"
          placeholder="Type your answer here..."
          onChange={(e) => { setTranscript(e.target.value); onTranscriptChange?.(e.target.value); }}
        />
      </div>
    );
  }

  return (
    <div className="bg-bg-card rounded-xl border border-border p-6">
      <div className="flex flex-col items-center gap-4">
        <Motion.button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-colors ${isRecording ? 'bg-danger shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-primary hover:bg-primary-hover'}`}
          animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
          transition={isRecording ? { duration: 1.5, repeat: Infinity } : {}}
          whileTap={{ scale: 0.9 }}
        >
          {isRecording ? '⏹' : '🎙️'}
        </Motion.button>
        <p className="text-sm text-text-muted">{isRecording ? 'Recording... Click to stop' : 'Click to start recording'}</p>
      </div>

      <div className="mt-4 p-4 bg-bg-surface rounded-lg min-h-[120px] border border-border">
        <p className="text-xs text-text-muted mb-2">Transcript:</p>
        <p className="text-sm text-text-primary whitespace-pre-wrap">{transcript || 'Your speech will appear here...'}</p>
        {isRecording && <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5" />}
      </div>
    </div>
  );
}
