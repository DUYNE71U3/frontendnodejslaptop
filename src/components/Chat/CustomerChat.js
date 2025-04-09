import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './Chat.css';

const CustomerChat = () => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [chatOpen, setChatOpen] = useState(false);
    const [connected, setConnected] = useState(false);
    
    const messagesEndRef = useRef(null);
    const chatBoxRef = useRef(null);
    
    // Lấy thông tin người dùng từ localStorage
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('username');
    
    // Initialize socket connection when component mounts
    useEffect(() => {
        if (!userId || !userName) return;

        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket.IO connected:', newSocket.id); // Debugging
            newSocket.emit('register', { userId, username: userName, role: 'customer' });
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket.IO disconnected'); // Debugging
        });

        return () => {
            newSocket.disconnect();
        };
    }, [userId, userName]);
    
    // Handle socket events
    useEffect(() => {
        if (!socket) return;
        
        socket.on('connect', () => {
            console.log('Socket.IO connected');
            
            // Tự động đăng ký với server khi kết nối thành công
            socket.emit('register', {
                userId,
                username: userName,
                role: 'customer'
            });
            
            setConnected(true);
        });
        
        socket.on('chat_message', (messageData) => {
            setMessages(prevMessages => [...prevMessages, messageData]);
        });
        
        socket.on('chat_history', (history) => {
            setMessages(history);
        });
        
        return () => {
            socket.off('connect');
            socket.off('chat_message');
            socket.off('chat_history');
        };
    }, [socket, userId, userName]);
    
    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim() || !socket || !connected) return;
        
        socket.emit('chat_message', {
            from: userId,
            message,
            role: 'customer'
        });
        
        setMessage('');
    };
    
    const toggleChat = () => {
        setChatOpen(prev => !prev);
    };
    
    return (
        <div className="customer-chat">
            {/* Chat toggle button */}
            <button 
                className="chat-toggle-btn"
                onClick={toggleChat}
            >
                <i className="bi bi-chat-dots"></i>
                {!chatOpen ? 'Chat với CSKH' : 'Đóng chat'}
            </button>
            
            {/* Chat window */}
            {chatOpen && (
                <div className="chat-window" ref={chatBoxRef}>
                    <div className="chat-header">
                        <h5>Hỗ trợ khách hàng</h5>
                    </div>
                    
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
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    <form className="chat-input" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            disabled={!connected}
                        />
                        <button 
                            type="submit"
                            disabled={!message.trim() || !connected}
                        >
                            <i className="bi bi-send"></i>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CustomerChat;
