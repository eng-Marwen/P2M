import os
import asyncio
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
_client = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is required to call the Gemini API")
        _client = genai.Client(api_key=api_key)
    return _client

def _sync_enhance_description(text: str):
    prompt = f"""
    Improve the following description to make it more detailed, professional and attractive.
    IMPORTANT: Respond in the SAME LANGUAGE as the input (English, French, or any other language).
    Write ONLY a continuous  one single line and half . Do not use bullet points, headers, or formatting.
    Keep it concise and engaging.

    Description:
    {text}
    """
    
    try:
        response = _get_client().models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=(
                    "You are a multilingual property description enhancer. "
                    "Always respond in the same language as the user's input."
                ),
                temperature=0.7,
                max_output_tokens=500,
            ),
        )
        return response.text
    except Exception as e:
        raise Exception(f"API Error: {str(e)}")

async def enhance_description(text: str):
    return await asyncio.to_thread(_sync_enhance_description, text)