import os
import asyncio
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def _sync_enhance_description(text: str):
    prompt = f"""
    Improve the following description to make it more detailed, professional and attractive.
    Write ONLY a continuous 2-3 line paragraph. Do not use bullet points, headers, or formatting.
    Keep it concise and engaging.

    Description:
    {text}
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You improve descriptions."},
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