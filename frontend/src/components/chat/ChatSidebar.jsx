import React, { useState } from 'react';
import { Plus, MessageSquare, MoreHorizontal, Trash2, Edit2, Search } from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';

export const ChatSidebar = ({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onRename,
  onDelete,
}) => {
  const [search, setSearch] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Group conversations by date
  const groupConversations = (convos) => {
    const groups = {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      'Previous 30 Days': [],
      Older: []
    };

    convos.forEach(conv => {
      // Allow searching by title (client side)
      if (search && !conv.title.toLowerCase().includes(search.toLowerCase())) return;

      const date = new Date(conv.updated_at || conv.created_at);
      if (isToday(date)) groups.Today.push(conv);
      else if (isYesterday(date)) groups.Yesterday.push(conv);
      else if (isThisWeek(date)) groups['Previous 7 Days'].push(conv);
      else if (isThisMonth(date)) groups['Previous 30 Days'].push(conv);
      else groups.Older.push(conv);
    });

    return groups;
  };

  const grouped = groupConversations(conversations);

  const startEdit = (e, conv) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
    setActiveMenu(null);
  };

  const submitEdit = (id) => {
    if (editTitle.trim() && editTitle.trim() !== conversations.find(c => c.id === id)?.title) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="w-64 flex-shrink-0 bg-bg-main border-r border-border flex flex-col h-full overflow-hidden transition-all duration-300">
      <div className="p-4 border-b border-border">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-3 py-3 bg-bg-card hover:bg-bg-hover text-text-main rounded-lg transition-colors border border-border shadow-sm font-medium"
        >
          <Plus size={18} />
          <span className="font-medium text-sm">New Chat</span>
        </button>
      </div>

      <div className="px-3 pb-2">
        <div className="relative mt-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-hover/50 border border-transparent rounded-md py-1.5 pl-8 pr-3 text-sm text-text-main placeholder-text-muted focus:outline-none focus:border-border focus:bg-bg-hover transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-3 pb-4">
        {Object.entries(grouped).map(([label, items]) => {
          if (items.length === 0) return null;
          return (
            <div key={label} className="mt-6 first:mt-2">
              <h3 className="text-xs font-semibold text-text-muted mb-2 px-2 tracking-wider">
                {label}
              </h3>
              <div className="space-y-0.5">
                {items.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => {
                        if(editingId !== conv.id) onSelect(conv.id)
                    }}
                    onMouseLeave={() => setActiveMenu(null)}
                    className={`group relative flex items-center gap-2.5 px-2 py-2 rounded-md cursor-pointer transition-colors ${
                      activeId === conv.id ? 'bg-bg-hover text-text-main font-medium' : 'text-text-main/80 hover:bg-bg-hover/50 hover:text-text-main'
                    }`}
                  >
                    <MessageSquare size={16} className={activeId === conv.id ? 'text-primary-500' : 'text-text-muted group-hover:text-primary-500/70'} shrink-0 />
                    
                    {editingId === conv.id ? (
                      <input
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => submitEdit(conv.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') submitEdit(conv.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="flex-1 bg-bg-card text-text-main text-sm outline-none border border-primary-500 rounded px-1 py-0.5 min-w-0"
                      />
                    ) : (
                      <div className="flex-1 truncate text-sm">
                        {conv.title}
                      </div>
                    )}

                    {/* Hover Actions Menu Trigger */}
                    {editingId !== conv.id && (
                      <div className={`absolute right-2 flex items-center ${activeMenu === conv.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === conv.id ? null : conv.id);
                          }}
                          className="p-1 text-text-muted hover:text-text-main rounded bg-gradient-to-l from-bg-hover via-bg-hover to-transparent pl-4"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        
                        {/* Dropdown */}
                        {activeMenu === conv.id && (
                          <div className="absolute right-0 top-6 w-32 bg-bg-card border border-border rounded-md shadow-xl py-1 z-50">
                            <button
                              onClick={(e) => startEdit(e, conv)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-text-muted hover:bg-bg-hover hover:text-text-main"
                            >
                              <Edit2 size={14} /> Rename
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(null);
                                onDelete(conv.id);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
