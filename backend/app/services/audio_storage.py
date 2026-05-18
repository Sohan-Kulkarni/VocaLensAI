from pathlib import Path
from uuid import uuid4

import aiofiles
from fastapi import HTTPException, UploadFile, status

from app.config.settings import get_settings


ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".m4a", ".webm", ".ogg"}


def _safe_suffix(filename: str) -> str:
    suffix = Path(filename or "").suffix.lower()
    if suffix not in ALLOWED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported audio format. Upload mp3, wav, m4a, webm, or ogg.",
        )
    return suffix


async def save_audio_upload(file: UploadFile) -> str:
    settings = get_settings()
    suffix = _safe_suffix(file.filename or "")
    target = settings.upload_dir / f"{uuid4().hex}{suffix}"
    max_bytes = settings.max_upload_mb * 1024 * 1024
    total_bytes = 0

    async with aiofiles.open(target, "wb") as out_file:
        while chunk := await file.read(1024 * 1024):
            total_bytes += len(chunk)
            if total_bytes > max_bytes:
                target.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Audio file is too large. Max size is {settings.max_upload_mb} MB.",
                )
            await out_file.write(chunk)

    return str(target)
