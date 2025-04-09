import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './Chat.css';

const GuestChat = () => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [chatOpen, setChatOpen] = useState(false);
    const [connected, setConnected] = useState(false);
    const [guestName, setGuestName] = useState('');
    const [nameEntered, setNameEntered] = useState(false);
    
    const messagesEndRef = useRef(null);
    const chatBoxRef = useRef(null);
    
    // Initialize socket connection when component mounts
    useEffect(() => {
        // Connect to socket.io server
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);
        
        // Clean up socket connection when component unmounts
        return () => {
            if (newSocket) newSocket.disconnect();
        };
    }, []);
    
    // Handle socket events
    useEffect(() => {
        if (!socket) return;
        
        socket.on('connect', () => {
            console.log('Socket.IO connected - Guest');
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
    }, [socket]);
    
    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleStartChat = (e) => {
        if (e) e.preventDefault();
        if (!guestName.trim() || !socket) return;
        
        // Generate a guest ID
        const guestId = `guest-${Date.now()}`;
        
        // Register with the socket server
        socket.emit('register', {
            userId: guestId,
            username: guestName,
            role: 'customer'
        });
        
        setConnected(true);
        setNameEntered(true);
    };
    
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim() || !socket || !connected) return;
        
        // Send the message to the server
        socket.emit('chat_message', {
            from: `guest-${Date.now()}`, // Use a temporary ID
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
                {!chatOpen ? 'Chat with Support' : 'Close Chat'}
            </button>
            
            {/* Chat window */}
            {chatOpen && (
                <div className="chat-window" ref={chatBoxRef}>
                    <div className="chat-header">
                        <h5>Customer Support</h5>
                    </div>
                    
                    <div className="chat-messages">
                        {!nameEntered ? (
                            <div className="guest-login p-3">
                                <p className="text-center">Please enter your name to start chatting</p>
                                <form onSubmit={handleStartChat}>
                                    <div className="mb-3">
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            placeholder="Your name"
                                            value={guestName}
                                            onChange={(e) => setGuestName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary w-100"
                                        disabled={!guestName.trim()}
                                    >
                                        Start Chat
                                    </button>
                                </form>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="welcome-message">
                                <p>Welcome {guestName}! How can we help you today?</p>
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
                    
                    {nameEntered && (
                        <form className="chat-input" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                                disabled={!connected}
                            />
                            <button 
                                type="submit"
                                disabled={!message.trim() || !connected}
                            >
                                <i className="bi bi-send"></i>
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

export default GuestChat;
