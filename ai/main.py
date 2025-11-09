from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path
import uvicorn
# Load model directly
from transformers import AutoTokenizer, AutoModelForCausalLM

tokenizer = AutoTokenizer.from_pretrained("maya-research/maya1")
model = AutoModelForCausalLM.from_pretrained("maya-research/maya1")

app = FastAPI(title="AI Audio Server", description="FastAPI server for serving audio files")

# Create audio directory if it doesn't exist
AUDIO_DIR = Path("audio")
AUDIO_DIR.mkdir(exist_ok=True)

# Mount static files for direct access
app.mount("/audio", StaticFiles(directory=str(AUDIO_DIR)), name="audio")

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "AI Audio Server is running", "version": "1.0.0"}

@app.get("/audio")
async def get_audio(text: str):
    """
    Serve generated tts audio file based on input text
    """
    
    
    file_path = AUDIO_DIR / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Audio file '{filename}' not found")

    # Check if it's actually an audio file
    if file_path.suffix.lower() not in ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a']:
        raise HTTPException(status_code=400, detail="File is not an audio file")

    return FileResponse(
        path=file_path,
        media_type=f"audio/{file_path.suffix[1:]}",
        filename=filename
    )

@app.post("/audio/upload")
async def upload_audio(file: UploadFile = File(...)):
    """
    Upload an audio file
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    # Check file extension
    allowed_extensions = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a']
    file_extension = Path(file.filename).suffix.lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
        )

    # Save the file
    file_path = AUDIO_DIR / file.filename
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    return {
        "message": "Audio file uploaded successfully",
        "filename": file.filename,
        "size": len(content),
        "url": f"/audio/{file.filename}"
    }

@app.get("/audio/list")
async def list_audio():
    """
    List all available audio files
    """
    audio_files = []
    for file_path in AUDIO_DIR.iterdir():
        if file_path.is_file() and file_path.suffix.lower() in ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a']:
            stat = file_path.stat()
            audio_files.append({
                "filename": file_path.name,
                "size": stat.st_size,
                "url": f"/audio/{file_path.name}",
                "type": file_path.suffix[1:]
            })

    return {
        "count": len(audio_files),
        "files": audio_files
    }

@app.delete("/audio/{filename}")
async def delete_audio(filename: str):
    """
    Delete an audio file
    """
    file_path = AUDIO_DIR / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Audio file '{filename}' not found")

    try:
        file_path.unlink()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")

    return {"message": f"Audio file '{filename}' deleted successfully"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
