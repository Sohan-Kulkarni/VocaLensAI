import { UploadCloud, X } from 'lucide-react';
import { useRef, useState } from 'react';

export function UploadDropzone({ file, onFileSelected, onClear }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) onFileSelected(dropped);
  }

  return (
    <div
      className={`rounded-xl border border-dashed p-6 text-center transition ${
        dragging ? 'border-cyan-300 bg-cyan-300/10' : 'border-white/15 bg-white/[0.04]'
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/mp4"
        className="hidden"
        onChange={(event) => {
          const selected = event.target.files?.[0];
          if (selected) onFileSelected(selected);
        }}
      />
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
        <UploadCloud size={26} />
      </div>
      <p className="mt-4 font-semibold">{file ? file.name : 'Drop audio here or browse'}</p>
      <p className="mt-1 text-sm text-slate-400">MP3, WAV, or M4A up to your configured backend limit</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button type="button" className="btn-primary py-2" onClick={() => inputRef.current?.click()}>
          Choose file
        </button>
        {file ? (
          <button type="button" className="btn-secondary py-2" onClick={onClear}>
            <X size={16} />
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
