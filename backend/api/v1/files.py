"""
File Upload API - Handle file uploads for DocumentLoaderNode

Automatic Cleanup:
- Files older than 7 days are automatically deleted on server startup
- Files are deleted when replaced with a new upload
- Files are deleted when user clicks "Remove" button
- Manual cleanup can be triggered via POST /api/v1/files/cleanup
- Storage stats available at GET /api/v1/files/stats

This prevents disk space from filling up with orphaned files.
"""

import os
import uuid
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Any, List

from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse

router = APIRouter()

# Configure upload directory
UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt", ".md", ".markdown"}

# Maximum file size (10 MB)
MAX_FILE_SIZE = 10 * 1024 * 1024

# File retention period (7 days)
FILE_RETENTION_DAYS = 7


def get_file_extension(filename: str) -> str:
    """Get the file extension from filename"""
    return Path(filename).suffix.lower()


def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return get_file_extension(filename) in ALLOWED_EXTENSIONS


@router.post("/files/upload")
async def upload_file(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Upload a file for use in DocumentLoaderNode

    Args:
        file: The uploaded file

    Returns:
        Dictionary with file metadata and path
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")

        if not is_allowed_file(file.filename):
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )

        # Read file content
        content = await file.read()
        file_size = len(content)

        # Check file size
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024} MB"
            )

        # Generate unique filename
        file_ext = get_file_extension(file.filename)
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = UPLOAD_DIR / unique_filename

        # Save file
        with open(file_path, "wb") as f:
            f.write(content)

        # Return file metadata
        return {
            "success": True,
            "file": {
                "filename": file.filename,
                "original_name": file.filename,
                "stored_name": unique_filename,
                "path": str(file_path.absolute()),
                "size": file_size,
                "extension": file_ext,
                "uploaded_at": datetime.now().isoformat()
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")


@router.delete("/files/{filename}")
async def delete_file(filename: str) -> Dict[str, Any]:
    """
    Delete an uploaded file

    Args:
        filename: The stored filename to delete

    Returns:
        Success status
    """
    try:
        file_path = UPLOAD_DIR / filename

        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")

        # Delete file
        file_path.unlink()

        return {
            "success": True,
            "message": f"File {filename} deleted successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File deletion failed: {str(e)}")


@router.get("/files/{filename}/info")
async def get_file_info(filename: str) -> Dict[str, Any]:
    """
    Get information about an uploaded file

    Args:
        filename: The stored filename

    Returns:
        File metadata
    """
    try:
        file_path = UPLOAD_DIR / filename

        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")

        stat = file_path.stat()

        return {
            "success": True,
            "file": {
                "stored_name": filename,
                "path": str(file_path.absolute()),
                "size": stat.st_size,
                "extension": file_path.suffix.lower(),
                "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat()
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get file info: {str(e)}")


def cleanup_old_files() -> Dict[str, Any]:
    """
    Clean up files older than FILE_RETENTION_DAYS

    Returns:
        Dictionary with cleanup results
    """
    try:
        deleted_count = 0
        deleted_size = 0
        cutoff_time = time.time() - (FILE_RETENTION_DAYS * 24 * 60 * 60)

        for file_path in UPLOAD_DIR.glob("*"):
            # Skip .gitkeep
            if file_path.name == ".gitkeep":
                continue

            # Check if file is older than retention period
            if file_path.is_file() and file_path.stat().st_mtime < cutoff_time:
                file_size = file_path.stat().st_size
                file_path.unlink()
                deleted_count += 1
                deleted_size += file_size

        return {
            "success": True,
            "deleted_count": deleted_count,
            "deleted_size": deleted_size,
            "message": f"Cleaned up {deleted_count} files ({deleted_size / 1024:.2f} KB)"
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"Cleanup failed: {str(e)}"
        }


@router.post("/files/cleanup")
async def cleanup_files() -> Dict[str, Any]:
    """
    Manually trigger cleanup of old files

    Returns:
        Cleanup results
    """
    return cleanup_old_files()


@router.get("/files/stats")
async def get_storage_stats() -> Dict[str, Any]:
    """
    Get storage statistics for uploaded files

    Returns:
        Storage statistics
    """
    try:
        total_files = 0
        total_size = 0
        files_list: List[Dict[str, Any]] = []

        for file_path in UPLOAD_DIR.glob("*"):
            if file_path.name == ".gitkeep":
                continue

            if file_path.is_file():
                stat = file_path.stat()
                total_files += 1
                total_size += stat.st_size

                files_list.append({
                    "name": file_path.name,
                    "size": stat.st_size,
                    "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    "age_days": (time.time() - stat.st_mtime) / (24 * 60 * 60)
                })

        return {
            "success": True,
            "stats": {
                "total_files": total_files,
                "total_size_bytes": total_size,
                "total_size_mb": round(total_size / (1024 * 1024), 2),
                "retention_days": FILE_RETENTION_DAYS,
                "files": sorted(files_list, key=lambda x: x["age_days"], reverse=True)
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get storage stats: {str(e)}")
