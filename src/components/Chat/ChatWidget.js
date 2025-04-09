import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './Chat.css';

const ChatWidget = () => {
    // States
    const [isOpen, setIsOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [hasEnteredName, setHasEnteredName] = useState(false);
    const [userId, setUserId] = useState('');
    const [connected, setConnected] = useState(false);
    const [isSending, setIsSending] = useState(false); // Thêm trạng thái để kiểm soát việc gửi tin nhắn

    // Refs
    const messagesEndRef = useRef(null);
    const chatBoxRef = useRef(null);
    const socketRef = useRef(null);
    
    // Get stored user info
    const storedUserName = localStorage.getItem('username');
    const storedUserId = localStorage.getItem('userId');

    // Initialize socket connection once on component mount
    useEffect(() => {
        if (socketRef.current) return; // Prevent multiple socket connections

        const newSocket = io('http://localhost:5000');
        socketRef.current = newSocket;
        setSocket(newSocket);
        
        // Socket connection events
        newSocket.on('connect', () => {
            console.log('Socket.IO connected:', newSocket.id);
            setConnected(true);

            // Auto-register if user is logged in
            if (storedUserName && storedUserId) {
                registerWithSocket(storedUserName, storedUserId);
            }
        });
        
        newSocket.on('disconnect', () => {
            console.log('Socket.IO disconnected');
            setConnected(false);
        });

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [storedUserName, storedUserId]);

    // Handle socket events for chat
    useEffect(() => {
        if (!socketRef.current) return;
        
        // Message handler
        const handleChatMessage = (msg) => {
            console.log('New message received:', msg);
            setMessages(prevMessages => [...prevMessages, msg]);
        };
        
        // Chat history handler
        const handleChatHistory = (history) => {
            console.log('Chat history received:', history);
            setMessages(history || []);
        };
        
        // Add event listeners
        socketRef.current.on('chat_message', handleChatMessage);
        socketRef.current.on('chat_history', handleChatHistory);
        
        // Cleanup event listeners
        return () => {
            if (socketRef.current) {
                socketRef.current.off('chat_message', handleChatMessage);
                socketRef.current.off('chat_history', handleChatHistory);
            }
        };
    }, []);
    
    // Auto scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current && isOpen) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    // Register user with socket server
    const registerWithSocket = (name, id) => {
        if (!socketRef.current) return;
        
        const userId = id || `guest-${Date.now()}`;
        
        socketRef.current.emit('register', {
            userId,
            username: name,
            role: 'user'
        });
        
        setHasEnteredName(true);
        setUserName(name);
        setUserId(userId);
    };

    // Handle chat toggle
    const handleToggleChat = () => {
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);
        
        // Register when opening chat if already have name
        if (newIsOpen && hasEnteredName && connected) {
            registerWithSocket(userName, userId);
        }
    };

    // Handle name submission
    const handleStartChat = (e) => {
        e.preventDefault();
        if (!userName.trim() || !connected) return;
        
        const id = storedUserId || `guest-${Date.now()}`;
        setUserId(id);
        setHasEnteredName(true);
        registerWithSocket(userName, id);
    };

    // Handle message submission
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || !socketRef.current || !connected || isSending) return;

        setIsSending(true); // Đặt trạng thái gửi tin nhắn
        try {
            socketRef.current.emit('chat_message', {
                from: userId,
                message: message.trim(),
                role: 'user',
            });
            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false); // Đặt lại trạng thái sau khi gửi xong
        }
    };

    // Format timestamp to readable time
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="chat-widget">
            {/* Chat toggle button */}
            <button className="chat-toggle-button" onClick={handleToggleChat}>
                <i className={isOpen ? "bi bi-x" : "bi bi-chat-dots"}></i>
            </button>

            {/* Chat window */}
            {isOpen && (
                <div className="chat-window" ref={chatBoxRef}>
                    <div className="chat-header">
                        <h3>Hỗ trợ trực tuyến</h3>
                        <button className="chat-close" onClick={() => setIsOpen(false)}>
                            <i className="bi bi-x"></i>
                        </button>
                    </div>
                    
                    {!hasEnteredName ? (
                        <div className="chat-welcome">
                            <p>Vui lòng nhập tên của bạn để bắt đầu chat</p>
                            <form onSubmit={handleStartChat}>
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    placeholder="Tên của bạn"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    required
                                />
                                <button 
                                    type="submit" 
                                    className="btn btn-primary w-100"
                                    disabled={!userName.trim() || !connected}
                                >
                                    Bắt đầu chat
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="chat-content">
                            <div className="chat-messages">
                                {messages.length === 0 ? (
                                    <div className="welcome-message">
                                        <p>Xin chào {userName}! Chúng tôi có thể giúp gì cho bạn?</p>
                                    </div>
                                ) : (
                                    messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`message ${msg.role === 'customer_service' ? 'received' : 'sent'}`}
                                        >
                                            <div className="message-content">{msg.message}</div>
                                            <div className="message-time">
                                                {formatTime(msg.timestamp)}
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            
                            <form className="chat-input-form" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    className="chat-input"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Nhập tin nhắn..."
                                    disabled={!connected || isSending}
                                />
                                <button
                                    type="submit"
                                    className="send-button"
                                    disabled={!message.trim() || !connected || isSending}
                                >
                                    <i className="bi bi-send"></i>
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
