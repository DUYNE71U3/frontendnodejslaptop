import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './CustomerServiceChat.css';

const CustomerServiceChat = ({ onRefresh }) => {
    const [messages, setMessages] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [connected, setConnected] = useState(false);
    const [chatHistory, setChatHistory] = useState({});

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    
    // Kiểm tra localStorage để tải lịch sử chat đã lưu
    useEffect(() => {
        const savedHistory = localStorage.getItem('cs_chat_history');
        if (savedHistory) {
            try {
                setChatHistory(JSON.parse(savedHistory));
            } catch (error) {
                console.error('Error parsing saved chat history:', error);
                setChatHistory({});
            }
        }
        
        // Tải lại thông tin người dùng được chọn gần nhất
        const lastSelectedUser = localStorage.getItem('cs_selected_user');
        if (lastSelectedUser) {
            try {
                const userData = JSON.parse(lastSelectedUser);
                setSelectedUser(userData);
            } catch (error) {
                console.error('Error parsing last selected user:', error);
            }
        }
    }, []);
    
    // Lưu lịch sử chat vào localStorage khi có thay đổi
    useEffect(() => {
        if (Object.keys(chatHistory).length > 0) {
            localStorage.setItem('cs_chat_history', JSON.stringify(chatHistory));
        }
    }, [chatHistory]);
    
    // Lưu thông tin người dùng được chọn gần nhất
    useEffect(() => {
        if (selectedUser) {
            localStorage.setItem('cs_selected_user', JSON.stringify(selectedUser));
        }
    }, [selectedUser]);

    useEffect(() => {
        if (socketRef.current) return;

        console.log('Initializing socket connection...');
        const socket = io('http://localhost:5000');
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            setConnected(true);
            socket.emit('register', {
                userId: localStorage.getItem('userId'),
                username: localStorage.getItem('username'),
                role: 'customer_service'
            });
            
            // Trigger refresh when connected
            if (onRefresh) onRefresh();
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            setConnected(false);
        });

        socket.on('active_users', (users) => {
            console.log('Active users received:', users);
            setActiveUsers(users);
            if (onRefresh) onRefresh();
        });

        socket.on('user_connected', (user) => {
            console.log('User connected:', user);
            setActiveUsers(prev => {
                // Tránh trùng lặp
                if (prev.some(u => u.socketId === user.socketId)) {
                    return prev;
                }
                return [...prev, user];
            });
            if (onRefresh) onRefresh();
        });

        socket.on('user_disconnected', (socketId) => {
            console.log('User disconnected:', socketId);
            setActiveUsers(prev => prev.filter(user => user.socketId !== socketId));
            
            // Lưu trữ thông tin người dùng đã ngắt kết nối
            if (selectedUser?.socketId === socketId) {
                setSelectedUser(prev => prev ? {...prev, isOffline: true} : null);
            }
            
            if (onRefresh) onRefresh();
        });

        socket.on('chat_message', (messageData) => {
            console.log('New chat message received:', messageData);
            
            // Xử lý tin nhắn mới
            if (messageData.userSocketId || (selectedUser && messageData.from === selectedUser.userId)) {
                const userId = messageData.userSocketId || selectedUser.socketId;
                
                // Cập nhật lịch sử chat
                setChatHistory(prev => {
                    const userHistory = prev[userId] || [];
                    return {
                        ...prev,
                        [userId]: [...userHistory, messageData]
                    };
                });
                
                // Hiển thị tin nhắn nếu đang chọn người dùng này
                if (selectedUser && (messageData.userSocketId === selectedUser.socketId || messageData.to === selectedUser.socketId)) {
                    setMessages(prev => [...prev, messageData]);
                }
                
                if (onRefresh) onRefresh();
            }
        });

        socket.on('chat_history', (history) => {
            console.log('Chat history received:', history);
            
            if (selectedUser) {
                // Lưu vào lịch sử chat
                setChatHistory(prev => ({
                    ...prev,
                    [selectedUser.socketId]: history
                }));
                
                // Hiển thị lịch sử
                setMessages(history || []);
                
                if (onRefresh) onRefresh();
            }
        });

        return () => {
            console.log('Cleaning up socket connection');
            socket.disconnect();
            socketRef.current = null;
        };
    }, [onRefresh]);

    // Auto-scroll khi có tin nhắn mới
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSelectUser = (user) => {
        console.log('Selecting user:', user);
        setSelectedUser(user);
        
        // Tải lịch sử chat từ state local
        if (chatHistory[user.socketId]) {
            setMessages(chatHistory[user.socketId]);
        } else {
            setMessages([]);
        }
        
        // Sau đó yêu cầu server để đảm bảo có dữ liệu mới nhất
        if (socketRef.current) {
            socketRef.current.emit('select_user', user.socketId);
        }
        
        if (onRefresh) onRefresh();
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedUser || !socketRef.current) return;

        console.log('Sending message to:', selectedUser.username);
        const messageData = {
            from: localStorage.getItem('username'),
            to: selectedUser.socketId,
            message: message.trim(),
            role: 'customer_service',
            timestamp: new Date().toISOString()
        };

        socketRef.current.emit('chat_message', messageData);
        
        // Thêm tin nhắn vào lịch sử local và hiển thị ngay
        setChatHistory(prev => {
            const userHistory = prev[selectedUser.socketId] || [];
            return {
                ...prev,
                [selectedUser.socketId]: [...userHistory, messageData]
            };
        });
        
        setMessages(prev => [...prev, messageData]);
        setMessage('');
        
        // Trigger refresh
        if (onRefresh) onRefresh();
    };

    // Render component
    return (
        <div className="cs-chat-container">
            <div className="users-sidebar">
                <h4>Active Users ({activeUsers.length})</h4>
                {activeUsers.length === 0 ? (
                    <p className="no-users">No users online</p>
                ) : (
                    activeUsers.map((user) => (
                        <div
                            key={user.socketId}
                            className={`user-item ${selectedUser?.socketId === user.socketId ? 'active' : ''}`}
                            onClick={() => handleSelectUser(user)}
                        >
                            <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
                            <div className="user-info">
                                <h5>{user.username}</h5>
                                <p>Online</p>
                            </div>
                        </div>
                    ))
                )}
                
                {/* Hiển thị các cuộc hội thoại đã lưu nhưng người dùng đã offline */}
                {Object.keys(chatHistory).length > 0 && (
                    <div className="offline-users-section">
                        <h5>Recent Conversations</h5>
                        {Object.keys(chatHistory).map(socketId => {
                            // Kiểm tra nếu người dùng không còn trong danh sách active
                            const isActive = activeUsers.some(u => u.socketId === socketId);
                            if (!isActive && chatHistory[socketId].length > 0) {
                                // Tìm thông tin người dùng từ tin nhắn đầu tiên
                                const userMessage = chatHistory[socketId].find(msg => msg.role === 'user');
                                if (!userMessage) return null;
                                
                                const username = userMessage.from;
                                const offlineUser = {
                                    socketId: socketId,
                                    username: username,
                                    isOffline: true
                                };
                                
                                return (
                                    <div
                                        key={`offline-${socketId}`}
                                        className={`user-item offline ${selectedUser?.socketId === socketId ? 'active' : ''}`}
                                        onClick={() => handleSelectUser(offlineUser)}
                                    >
                                        <div className="user-avatar">{username.charAt(0).toUpperCase()}</div>
                                        <div className="user-info">
                                            <h5>{username}</h5>
                                            <p className="offline-status">Offline</p>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                )}
            </div>
            
            <div className="chat-area">
                {selectedUser ? (
                    <>
                        <div className="chat-header">
                            <h5>
                                Chat with {selectedUser.username}
                                {selectedUser.isOffline && <span className="offline-badge"> (Offline)</span>}
                            </h5>
                        </div>
                        <div className="chat-messages">
                            {messages.length === 0 ? (
                                <div className="empty-chat-message">
                                    <p>No messages yet with this user</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`message ${msg.role === 'customer_service' ? 'sent' : 'received'}`}
                                    >
                                        <p>{msg.message}</p>
                                        <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
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
                                placeholder="Type a message..."
                                disabled={selectedUser.isOffline}
                            />
                            <button 
                                type="submit" 
                                className="send-button" 
                                disabled={!message.trim() || selectedUser.isOffline}
                            >
                                Send
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-user-selected">
                        <p>Select a user to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerServiceChat;
