import os
import asyncio
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

#for running tests in the ci pipeline.
_client = None
def _get_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY is required to call the Groq API")
        _client = Groq(api_key=api_key)
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
        response = _get_client().chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a multilingual property description enhancer. Always respond in the same language as the user's input."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        return response.choices[0].message.content
    except Exception as e:
        raise Exception(f"API Error: {str(e)}")

async def enhance_description(text: str):
    return await asyncio.to_thread(_sync_enhance_description, text)