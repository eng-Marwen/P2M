from fastapi import APIRouter, HTTPException

from app.schemas import RagQueryRequest, RagQueryResponse
from app.services.rag_service import run_rag_query


router = APIRouter()


@router.post("/rag/query", response_model=RagQueryResponse)
async def rag_query(data: RagQueryRequest):
    query = (data.query or "").strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")

    try:
        return await run_rag_query(query=query, top_k=data.top_k)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        print(f"[RAG] Query failed: {exc}")
        raise HTTPException(status_code=500, detail=f"RAG query failed: {str(exc)}") from exc
