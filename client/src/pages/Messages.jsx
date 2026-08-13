import React, { useState, useEffect, useContext } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { AuthContext, socket } from '../context/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import { FiMoreVertical } from 'react-icons/fi';
import './styles/Messages.css';
import { MessagesSkeleton } from '../components/Skeleton';

const Messages = () => {
  const { user, setUnreadTotal, setActiveChatId } = useContext(AuthContext);
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const messagesEndRef = React.useRef(null);
  const menuRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (currentChat) {
      setActiveChatId(currentChat._id);
    } else {
      setActiveChatId(null);
    }
    return () => setActiveChatId(null);
  }, [currentChat, setActiveChatId]);

  /* Lock body scroll when delete chat modal is active */
  useEffect(() => {
    if (showDeleteModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showDeleteModal]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    const handleReceiveMsg = (data) => {
      if (currentChat && currentChat._id === data.room) {
        setMessages((prev) => [...prev, data.message]);
        setConversations((prevConvs) => prevConvs.map(c => 
          c._id === data.room ? { ...c, lastMessage: data.message.message, unreadCount: 0 } : c
        ));

        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        axios.put(`${API_BASE_URL}/api/messages/read/${data.room}`, {}, config).catch(console.error);
      } else {
        setConversations((prevConvs) => prevConvs.map(c => 
          c._id === data.room ? { ...c, lastMessage: data.message.message, unreadCount: (c.unreadCount || 0) + 1 } : c
        ));
      }
    };

    socket.on('receive_message', handleReceiveMsg);

    return () => {
      socket.off('receive_message', handleReceiveMsg);
    };
  }, [currentChat]);

  const fetchConversations = async () => {
    try {
      setLoadingConvs(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${API_BASE_URL}/api/messages/conversations`, config);
      setConversations(res.data);

      if (location.state?.conversationId) {
        const targetConv = res.data.find(c => c._id === location.state.conversationId);
        if (targetConv) {
          getMessages(targetConv);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingConvs(false);
    }
  };

  const getMessages = async (conversation) => {
    try {
      setCurrentChat(conversation);
      socket.emit('join_room', conversation._id);
      
      if (conversation.unreadCount > 0) {
        setUnreadTotal(prev => Math.max(0, prev - conversation.unreadCount));
      }

      setConversations(prev => prev.map(c => 
        c._id === conversation._id ? { ...c, unreadCount: 0 } : c
      ));

      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${API_BASE_URL}/api/messages/${conversation._id}`, config);
      setMessages(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat) return;

    const receiverId = currentChat.participants.find((p) => p._id !== user._id)._id;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.post(`${API_BASE_URL}/api/messages/${receiverId}`, { message: newMessage }, config);
      
      const msgData = res.data;
      setMessages([...messages, msgData]);
      setNewMessage('');

      setConversations((prevConvs) => {
        const updated = prevConvs.map(c => 
          c._id === currentChat._id ? { ...c, lastMessage: msgData.message } : c
        );
        const activeIdx = updated.findIndex(c => c._id === currentChat._id);
        if (activeIdx > 0) {
          const [activeConv] = updated.splice(activeIdx, 1);
          updated.unshift(activeConv);
        }
        return updated;
      });

      socket.emit('send_message', {
        room: currentChat._id,
        message: msgData,
      });

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 50);

    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteChatClick = () => {
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  const confirmDeleteChat = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${API_BASE_URL}/api/messages/conversation/${currentChat._id}/delete`, {}, config);
      setCurrentChat(null);
      setMessages([]);
      setShowDeleteModal(false);
      fetchConversations();
    } catch (error) {
      console.error(error);
    }
  };

  if (loadingConvs) {
    return <MessagesSkeleton />;
  }

  return (
    <div className={`container-fluid messages-container ${currentChat ? 'has-chat' : 'no-chat'}`}>
      
      {/* Conversations List */}
      <div className="card conversations-sidebar">
        <h3 className="conversations-title">Messages</h3>
        {conversations.map((c) => {
          const otherUser = c.participants.find(p => p._id !== user._id);
          return (
            <div 
              key={c._id} 
              onClick={() => getMessages(c)}
              className={`conversation-item ${currentChat?._id === c._id ? 'conversation-item-active' : ''}`}
            >
              <div className="conversation-item-header">
                <h4 className="conversation-user-name">{otherUser?.name || 'Unknown'}</h4>
                {c.unreadCount > 0 && (
                  <div className="unread-badge">
                    {c.unreadCount}
                  </div>
                )}
              </div>
              <p className={`conversation-last-msg ${c.unreadCount > 0 ? 'msg-unread' : 'msg-read'}`}>
                {c.lastMessage || 'No messages yet'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Chat Area */}
      <div className="card chat-area">
        {currentChat ? (
          <>
            <div className="chat-header">
              <div className="chat-header-user">
                <button onClick={() => setCurrentChat(null)} className="chat-back-btn">&larr;</button>
                <h3 className="chat-user-name">
                  <Link to={`/user/${currentChat.participants.find(p => p._id !== user._id)?._id}`} className="chat-user-link">
                    {currentChat.participants.find(p => p._id !== user._id)?.name}
                  </Link>
                </h3>
              </div>
              
              {/* 3-dots menu */}
              <div className="menu-wrapper" ref={menuRef}>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="menu-toggle-btn"
                >
                  <FiMoreVertical size={20} />
                </button>
                {showMenu && (
                  <div className="dropdown-menu">
                    <button 
                      onClick={handleDeleteChatClick}
                      className="delete-chat-menu-btn"
                    >
                      Delete Chat
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div key={currentChat._id} className="chat-messages-box">
              <div ref={messagesEndRef} />
              {[...messages].reverse().map((m, index) => (
                <div 
                  key={index} 
                  className={`message-bubble ${m.senderId === user._id ? 'message-sender' : 'message-receiver'}`}
                >
                  {m.message}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-form">
              <input 
                type="text" 
                className="input" 
                placeholder="Type a message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Send</button>
            </form>
          </>
        ) : (
          <div className="chat-empty-state">
            Select a conversation to start chatting
          </div>
        )}
      </div>

      {/* Delete Chat Confirmation Modal via React Portal */}
      {showDeleteModal && currentChat && ReactDOM.createPortal(
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="delete-modal-title">
              Delete chat with {currentChat.participants.find(p => p._id !== user._id)?.name}?
            </h3>
            <p className="delete-modal-desc">
              Messages will be removed from this device.
            </p>
            <div className="modal-actions">
              <button 
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="delete-cancel-btn"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={confirmDeleteChat}
                className="delete-confirm-btn"
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Messages;
