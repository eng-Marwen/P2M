from fastapi import APIRouter, HTTPException, Request, Response

from app.schemas import (
    RagClearHistoryRequest,
    RagClearHistoryResponse,
    RagQueryRequest,
    RagQueryResponse,
)
from app.services.rag_service import clear_rag_session_history, run_rag_query


router = APIRouter()


@router.post("/rag/query", response_model=RagQueryResponse)
async def rag_query(data: RagQueryRequest, request: Request, response: Response):
    query = (data.query or "").strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")

    try:
        cookie_session_id = request.cookies.get("rag_session_id")
        session_id = data.session_id or cookie_session_id

        result = await run_rag_query(
            query=query,
            top_k=data.top_k,
            session_id=session_id,
        )

        response.set_cookie(
            key="rag_session_id",
            value=result["session_id"],
            max_age=60 * 60 * 24 * 7,
            samesite="lax",
            httponly=False,
        )

        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        print(f"[RAG] Query failed: {exc}")
        raise HTTPException(status_code=500, detail=f"RAG query failed: {str(exc)}") from exc


@router.post("/rag/history/clear", response_model=RagClearHistoryResponse)
async def clear_rag_history(
    data: RagClearHistoryRequest,
    request: Request,
    response: Response,
):
    try:
        cookie_session_id = request.cookies.get("rag_session_id")
        session_id = data.session_id or cookie_session_id
        cleared = await clear_rag_session_history(session_id)

        response.delete_cookie(key="rag_session_id")
        return {
            "session_id": session_id,
            "cleared": cleared,
        }
    except Exception as exc:
        print(f"[RAG] Clear history failed: {exc}")
        raise HTTPException(status_code=500, detail="Failed to clear chat history") from exc
