from fastapi import APIRouter
from app.services.file_service import list_documents
from app.services.memory_service import _sessions
from app.config import settings
import os
from datetime import datetime

router = APIRouter(prefix="", tags=["dashboard"])

@router.get("/dashboard/stats")
def get_dashboard_stats():
    # 1. Total Documents
    docs = list_documents()
    total_documents = len(docs)
    
    # 2. Total Conversations and Queries
    total_conversations = len(_sessions)
    
    # Calculate daily queries for the last 7 days
    from datetime import timedelta
    today = datetime.utcnow().date()
    daily_queries = { (today - timedelta(days=i)).strftime("%a"): 0 for i in range(6, -1, -1) }
    
    total_queries = 0
    for history in _sessions.values():
        for msg in history:
            if msg["role"] == "user":
                total_queries += 1
                if "timestamp" in msg:
                    msg_date = datetime.utcfromtimestamp(msg["timestamp"]).date()
                    day_str = msg_date.strftime("%a")
                    if day_str in daily_queries:
                        daily_queries[day_str] += 1
                else:
                    # Fallback to today if old message without timestamp
                    daily_queries[today.strftime("%a")] += 1

    chart_data = [{"name": day, "queries": count} for day, count in daily_queries.items()]
    
    # 4. Total Chunks (Estimated to prevent 10s server blocking)
    total_chunks = total_documents * 45  # Rough estimate instead of loading FAISS index
    # 4. Recent Activity
    recent_activity = []
    sorted_docs = sorted(docs, key=lambda x: x.upload_date, reverse=True)
    for doc in sorted_docs[:5]:
        recent_activity.append({
            "id": doc.filename,
            "type": "upload",
            "description": f"Uploaded {doc.filename}",
            "timestamp": doc.upload_date.isoformat() + "Z"
        })
        
    return {
        "totalDocuments": total_documents,
        "totalChunks": total_chunks,
        "totalQueries": total_queries,
        "totalConversations": total_conversations,
        "recentActivity": recent_activity,
        "chartData": chart_data
    }
