from fastapi import APIRouter, Depends
from app.config import settings
from app.routers.auth import get_current_user
from app.models.supabase_models import User
from app.database.supabase_client import supabase_client
import os
from datetime import datetime, timedelta

router = APIRouter(prefix="", tags=["dashboard"])

@router.get("/dashboard/stats")
def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    total_documents = 0
    total_chunks = 0
    total_conversations = 0
    total_queries = 0
    recent_activity = []
    
    today = datetime.utcnow().date()
    daily_queries = { (today - timedelta(days=i)).strftime("%a"): 0 for i in range(6, -1, -1) }
    
    if supabase_client:
        try:
            # 1. Documents and Chunks
            docs_response = supabase_client.table('documents').select('filename, upload_date, chunks_count').eq('user_id', str(current_user.id)).order('upload_date', desc=True).execute()
            docs_data = docs_response.data
            total_documents = len(docs_data)
            total_chunks = sum([d.get('chunks_count', 0) for d in docs_data])
            
            # 2. Recent Activity (from documents)
            for doc in docs_data[:5]:
                # Format timestamp appropriately
                timestamp = doc.get('upload_date', '')
                if timestamp and not timestamp.endswith('Z') and '+' not in timestamp:
                    timestamp += 'Z'
                
                recent_activity.append({
                    "id": doc.get('filename', ''),
                    "type": "upload",
                    "description": f"Uploaded {doc.get('filename', '')}",
                    "timestamp": timestamp
                })

            # 3. Total Conversations
            conv_response = supabase_client.table('conversations').select('id', count='exact').eq('user_id', str(current_user.id)).execute()
            total_conversations = conv_response.count if conv_response.count is not None else 0
            
            # Fetch user's conversation IDs to filter messages
            conv_list_response = supabase_client.table('conversations').select('id').eq('user_id', str(current_user.id)).execute()
            user_conv_ids = [c['id'] for c in conv_list_response.data]
            
            if user_conv_ids:
                # 4. Total Queries
                msg_response = supabase_client.table('messages').select('id', count='exact').eq('role', 'user').in_('conversation_id', user_conv_ids).execute()
                total_queries = msg_response.count if msg_response.count is not None else 0
                
                # 5. 7-day Analytics
                seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
                recent_msgs_response = supabase_client.table('messages') \
                    .select('created_at') \
                    .eq('role', 'user') \
                    .gte('created_at', seven_days_ago) \
                    .in_('conversation_id', user_conv_ids) \
                    .execute()
                    
                for msg in recent_msgs_response.data:
                    # Handle Z suffix for python < 3.11
                    created_at_str = msg['created_at'].replace('Z', '+00:00')
                    msg_date = datetime.fromisoformat(created_at_str).date()
                    day_str = msg_date.strftime("%a")
                    if day_str in daily_queries:
                        daily_queries[day_str] += 1
        except Exception as e:
            print(f"Error fetching dashboard stats from supabase: {e}")

    chart_data = [{"name": day, "queries": count} for day, count in daily_queries.items()]
    
    return {
        "totalDocuments": total_documents,
        "totalChunks": total_chunks,
        "totalQueries": total_queries,
        "totalConversations": total_conversations,
        "recentActivity": recent_activity,
        "chartData": chart_data
    }
