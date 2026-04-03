from __future__ import annotations

import hashlib
import html
import os
import re
from pathlib import Path
from urllib.parse import parse_qs, urljoin, urlparse

import requests

from app.services.house_price_predictor import get_price_model_path


def _extract_google_drive_file_id(url: str) -> str | None:
    parsed = urlparse(url)

    # https://drive.google.com/file/d/<FILE_ID>/view?usp=sharing
    match = re.search(r"/file/d/([^/]+)", parsed.path)
    if match:
        return match.group(1)

    # https://drive.google.com/uc?export=download&id=<FILE_ID>
    query_id = parse_qs(parsed.query).get("id")
    if query_id:
        return query_id[0]

    return None


def _normalize_download_url(url: str) -> str:
    file_id = _extract_google_drive_file_id(url)
    if file_id:
        return f"https://drive.google.com/uc?export=download&id={file_id}"
    return url


def _sha256sum(file_path: Path) -> str:
    digest = hashlib.sha256()
    with file_path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _stream_to_file(response: requests.Response, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = destination.with_suffix(destination.suffix + ".part")

    with tmp_path.open("wb") as f:
        for chunk in response.iter_content(chunk_size=1024 * 1024):
            if chunk:
                f.write(chunk)

    tmp_path.replace(destination)


def _looks_like_html_response(response: requests.Response) -> bool:
    content_type = (response.headers.get("Content-Type") or "").lower()
    return "text/html" in content_type


def _extract_drive_confirm_request(page_html: str) -> tuple[str, dict[str, str]] | None:
    # Example in warning pages:
    # href="/uc?export=download&amp;confirm=t&amp;id=<FILE_ID>"
    href_match = re.search(r'href="(/uc\?export=download[^"]+)"', page_html)
    if href_match:
        return ("https://drive.google.com" + html.unescape(href_match.group(1)), {})

    # Newer Drive warning pages may use absolute links.
    abs_href_match = re.search(r'href="(https://drive\.usercontent\.google\.com/download[^"]+)"', page_html)
    if abs_href_match:
        return (html.unescape(abs_href_match.group(1)), {})

    # Fallback for forms used by some variants of Drive warning pages.
    form_match = re.search(
        r'<form[^>]*action="([^"]+)"[^>]*>(.*?)</form>',
        page_html,
        flags=re.IGNORECASE | re.DOTALL,
    )
    if form_match:
        action = urljoin("https://drive.google.com", html.unescape(form_match.group(1)))
        form_html = form_match.group(2)

        params: dict[str, str] = {}
        for input_tag in re.findall(r"<input[^>]*>", form_html, flags=re.IGNORECASE):
            name_match = re.search(r'name="([^"]+)"', input_tag)
            value_match = re.search(r'value="([^"]*)"', input_tag)
            if name_match and value_match:
                params[html.unescape(name_match.group(1))] = html.unescape(value_match.group(1))

        return (action, params)

    return None


def _is_html_file(file_path: Path) -> bool:
    if not file_path.exists() or file_path.stat().st_size == 0:
        return False

    with file_path.open("rb") as f:
        head = f.read(2048).lower()

    return b"<!doctype html" in head or b"<html" in head


def _download_file(url: str, destination: Path) -> None:
    normalized_url = _normalize_download_url(url)

    with requests.Session() as session:
        response = session.get(normalized_url, stream=True, timeout=300)
        response.raise_for_status()

        # Google Drive large-file confirmation flow
        warning_tokens = [
            value
            for key, value in response.cookies.items()
            if key.startswith("download_warning")
        ]
        if warning_tokens:
            file_id = _extract_google_drive_file_id(normalized_url) or _extract_google_drive_file_id(url)
            if file_id:
                response.close()
                response = session.get(
                    "https://drive.google.com/uc",
                    params={
                        "export": "download",
                        "id": file_id,
                        "confirm": warning_tokens[0],
                    },
                    stream=True,
                    timeout=300,
                )
                response.raise_for_status()

        # Some Google Drive responses return an HTML warning page with a confirm link,
        # but without the download_warning cookie. Follow that link when present.
        if _looks_like_html_response(response):
            confirm_request = _extract_drive_confirm_request(response.text)
            if confirm_request:
                confirm_url, confirm_params = confirm_request
                response.close()
                response = session.get(
                    confirm_url,
                    params=confirm_params or None,
                    stream=True,
                    timeout=300,
                )
                response.raise_for_status()

        _stream_to_file(response, destination)


def _ensure_single_model(model_type: str, url_env: str, sha_env: str) -> None:
    model_path = get_price_model_path(model_type)
    if model_path.exists():
        if _is_html_file(model_path):
            model_path.unlink(missing_ok=True)
            print(
                f"[Startup] Existing {model_type} model at {model_path} is invalid HTML. Re-downloading..."
            )
        else:
            print(f"[Startup] {model_type} model found: {model_path}")
            return

    model_url = os.getenv(url_env, "").strip()
    if not model_url:
        raise RuntimeError(
            f"{model_type} model is missing at {model_path} and {url_env} is not set"
        )

    print(f"[Startup] Downloading missing {model_type} model...")
    _download_file(model_url, model_path)

    if not model_path.exists() or model_path.stat().st_size == 0:
        raise RuntimeError(f"Downloaded {model_type} model is empty or missing: {model_path}")

    if _is_html_file(model_path):
        model_path.unlink(missing_ok=True)
        raise RuntimeError(
            f"Downloaded {model_type} model from {url_env} is HTML instead of a .joblib file. "
            "Google Drive link is likely private, quota-limited, or requires confirmation."
        )

    expected_sha = os.getenv(sha_env, "").strip().lower()
    if expected_sha:
        actual_sha = _sha256sum(model_path)
        if actual_sha != expected_sha:
            model_path.unlink(missing_ok=True)
            raise RuntimeError(
                f"SHA256 mismatch for {model_type} model. expected={expected_sha} actual={actual_sha}"
            )

    size_mb = model_path.stat().st_size / (1024 * 1024)
    print(f"[Startup] {model_type} model ready ({size_mb:.2f} MB): {model_path}")


def ensure_price_models_available() -> None:
    _ensure_single_model("sale", "SALE_MODEL_URL", "SALE_MODEL_SHA256")
    _ensure_single_model("rent", "RENT_MODEL_URL", "RENT_MODEL_SHA256")
