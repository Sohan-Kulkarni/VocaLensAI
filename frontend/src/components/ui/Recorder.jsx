import { Mic, Square, Timer, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { formatDuration } from '../../utils/format';

export function Recorder({ onRecorded, onClear, audioUrl }) {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const secondsRef = useRef(0);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let timer;
    if (recording) {
      timer = window.setInterval(
        () =>
          setSeconds((value) => {
            const next = value + 1;
            secondsRef.current = next;
            return next;
          }),
        1000,
      );
    }
    return () => window.clearInterval(timer);
  }, [recording]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined;
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const file = new File([blob], `browser-recording-${Date.now()}.webm`, {
          type: blob.type,
        });
        const url = URL.createObjectURL(blob);
        onRecorded(file, secondsRef.current || 1, url);
        stream.getTracks().forEach((track) => track.stop());
      };

      setSeconds(0);
      secondsRef.current = 0;
      setRecording(true);
      recorder.start();
    } catch {
      toast.error('Microphone permission is required to record.');
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold">Browser recorder</p>
          <p className="mt-1 text-sm text-slate-400">Record an answer and submit it for transcription.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white/[0.07] px-3 py-2 text-sm text-slate-200">
          <Timer size={16} />
          {formatDuration(seconds)}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {!recording ? (
          <button type="button" className="btn-primary" onClick={startRecording}>
            <Mic size={16} />
            Record
          </button>
        ) : (
          <button type="button" className="btn-secondary" onClick={stopRecording}>
            <Square size={16} />
            Stop
          </button>
        )}
        {audioUrl ? (
          <button type="button" className="btn-secondary" onClick={onClear}>
            <Trash2 size={16} />
            Clear recording
          </button>
        ) : null}
      </div>

      {audioUrl ? <audio className="mt-5 w-full" controls src={audioUrl} /> : null}
    </div>
  );
}
