from pathlib import Path

from app.config.settings import get_settings


MOCK_TRANSCRIPT = (
    "I built a full stack interview practice platform using React, FastAPI, and a machine "
    "learning analysis pipeline. The system accepts audio, creates a transcript, calculates "
    "communication metrics, and generates feedback. I focused on API design, authentication, "
    "database modeling, and clear user experience. The main challenge was balancing accuracy "
    "with latency, so I separated transcription, preprocessing, scoring, and reporting into "
    "modular services."
)


class SpeechTranscriber:
    def __init__(self) -> None:
        self.settings = get_settings()
        self._model = None

    def _load_model(self):
        if self._model is None:
            from faster_whisper import WhisperModel

            self._model = WhisperModel(
                self.settings.whisper_model_size,
                device="cpu",
                compute_type="int8",
            )
        return self._model

    def transcribe(self, audio_path: str | Path) -> dict:
        if self.settings.enable_mock_transcription:
            return {"text": MOCK_TRANSCRIPT, "language": "en", "duration_seconds": 95.0}

        try:
            model = self._load_model()
            segments, info = model.transcribe(str(audio_path), beam_size=5, vad_filter=True)
            segment_list = list(segments)
            transcript = " ".join(segment.text.strip() for segment in segment_list).strip()
            duration = getattr(info, "duration", 0.0) or (
                max((segment.end for segment in segment_list), default=0.0)
            )
            return {
                "text": transcript,
                "language": getattr(info, "language", "en") or "en",
                "duration_seconds": float(duration or 0.0),
            }
        except Exception as exc:
            raise RuntimeError(
                "Speech transcription failed. Install ffmpeg, ensure faster-whisper is available, "
                "or set ENABLE_MOCK_TRANSCRIPTION=true for demo mode."
            ) from exc
