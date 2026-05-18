import { motion } from 'framer-motion';
import { FileAudio, Loader2, Send, Type } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getApiError } from '../api/client';
import { analyzeText, uploadAudio } from '../api/interviews';
import { Recorder } from '../components/ui/Recorder';
import { UploadDropzone } from '../components/ui/UploadDropzone';
import { domains } from '../utils/format';

const samplePrompt =
  'I built a machine learning project that predicts customer churn using feature engineering, model validation, and explainability. I evaluated logistic regression and XGBoost, tracked precision and recall, and deployed the model behind a FastAPI endpoint.';

export function UploadInterview() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('Behavioral + technical practice');
  const [domain, setDomain] = useState('AI/ML');
  const [durationSeconds, setDurationSeconds] = useState(120);
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => Boolean(file || transcript.trim().length >= 20), [file, transcript]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  function setAudioFile(nextFile, nextDuration, url) {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setFile(nextFile);
    setDurationSeconds(Math.max(10, Math.round(nextDuration || durationSeconds || 60)));
    setAudioUrl(url || URL.createObjectURL(nextFile));
  }

  function clearAudio() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setFile(null);
    setAudioUrl('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) {
      toast.error('Add an audio file, recording, or transcript.');
      return;
    }
    setLoading(true);
    try {
      const session = file
        ? await uploadAudio({ title, domain, durationSeconds, file })
        : await analyzeText({
            title,
            domain,
            duration_seconds: Number(durationSeconds),
            transcript,
          });
      toast.success('Interview analysis complete.');
      navigate(`/analysis/${session.id}`);
    } catch (error) {
      toast.error(getApiError(error, 'Analysis failed.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-200">New Session</p>
        <h2 className="mt-2 text-3xl font-bold">Analyze an interview answer</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Upload audio, record in-browser, or paste a transcript for quick scoring.
        </p>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="glass rounded-xl p-5">
          <h3 className="text-lg font-semibold">Session details</h3>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Title</span>
              <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Technical domain</span>
              <select className="input" value={domain} onChange={(event) => setDomain(event.target.value)}>
                {domains.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Duration in seconds</span>
              <input
                className="input"
                type="number"
                min="10"
                value={durationSeconds}
                onChange={(event) => setDurationSeconds(event.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-xl p-5">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200">
                <FileAudio size={18} />
              </span>
              <div>
                <h3 className="font-semibold">Audio input</h3>
                <p className="text-sm text-slate-400">Upload a file or record directly.</p>
              </div>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <UploadDropzone file={file} onFileSelected={(selected) => setAudioFile(selected)} onClear={clearAudio} />
              <Recorder
                audioUrl={audioUrl}
                onRecorded={(recordedFile, seconds, url) => setAudioFile(recordedFile, seconds, url)}
                onClear={clearAudio}
              />
            </div>
          </div>

          <div className="glass rounded-xl p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-300/10 text-amber-200">
                  <Type size={18} />
                </span>
                <div>
                  <h3 className="font-semibold">Transcript mode</h3>
                  <p className="text-sm text-slate-400">Useful for instant demos when no audio model is loaded.</p>
                </div>
              </div>
              <button type="button" className="btn-secondary py-2" onClick={() => setTranscript(samplePrompt)}>
                Use sample
              </button>
            </div>
            <textarea
              className="input min-h-40 resize-y leading-7"
              placeholder="Paste an interview answer transcript..."
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary min-w-44" disabled={loading || !canSubmit}>
          {loading ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
          {loading ? 'Analyzing...' : 'Run analysis'}
        </button>
      </div>
    </form>
  );
}
