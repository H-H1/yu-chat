import API_URL from '@/utils/api';
import { getTokenValue } from '@/utils/auth';

class WebSocketService {
  static instance = null;
  ws = null;
  reconnectAttempts = 0;
  maxReconnectAttempts = 5;
  reconnectInterval = 3000; // 3秒
  reconnectTimer = null; // 添加重连定时器引用
  isConnecting = false; // 添加连接状态标志
  messageListeners = [];
  connectionListeners = [];
  
  // 消息存储
  messageStore = new Map(); // 按 room_friend_uid 分组存储消息
  allMessages = []; // 所有消息的数组
  
  // 单例模式
  static getInstance() {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }
  
  // 建立WebSocket连接
  connect(token) {
    // 防止重复连接
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket已连接，跳过重复连接');
      return;
    }
    
    // 防止并发连接
    if (this.isConnecting) {
      console.log('WebSocket正在连接中，跳过重复连接');
      return;
    }
    
    // 清除重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // 关闭之前的连接
    if (this.ws) {
      this.ws.close();
    }
    
    this.isConnecting = true;
    
    // 确保使用 /ws 路径
    const baseUrl = API_URL.ws;
    const wsUrl = `${baseUrl}?token=${token}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket连接已建立');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        // 清除重连定时器
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        // 通知所有监听者连接已建立
        this.connectionListeners.forEach(listener => listener(true));
      };
      
      this.ws.onmessage = (event) => {
        try {
          console.log('收到WebSocket消息:', event.data);
          if (event.data === '[]') {
            console.log('收到断开连接消息，清除用户信息并跳转到登录页');
            this.handleDisconnect();
            return;
          }
          const message = JSON.parse(event.data);
          
          // 解析并存储消息
          this.parseAndStoreMessage(message);
          
          // 通知所有消息监听者
          this.messageListeners.forEach(listener => listener(message));
        } catch (error) {
          console.error('解析WebSocket消息错误:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket错误:', error);
        this.isConnecting = false;
        // 打印更多错误信息
        if (error.message) {
          console.error('错误信息:', error.message);
        }
        if (error.type) {
          console.error('错误类型:', error.type);
        }
      };
      
      this.ws.onclose = (event) => {
        console.log('WebSocket连接已关闭', event ? `代码: ${event.code}, 原因: ${event.reason}` : '');
        this.isConnecting = false;
        // 通知所有监听者连接已关闭
        this.connectionListeners.forEach(listener => listener(false));
        // 只在非正常关闭时尝试重连
        if (event.code !== 1000) {
          this.attemptReconnect();
        }
      };
    } catch (error) {
      console.error('创建WebSocket实例失败:', error);
      this.isConnecting = false;
    }
  }
  
  // 处理断开连接
  handleDisconnect() {
    console.log('处理断开连接：清除用户信息并跳转到登录页');
    
    // 清除重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // 关闭 WebSocket 连接
    if (this.ws) {
      this.ws.close(1000, '用户主动断开');
      this.ws = null;
    }
    
    // 清除消息存储
    this.clearMessages();
    
    // 清除用户信息
    uni.removeStorageSync('userInfo');
    uni.removeStorageSync('token');
    
    // 跳转到登录页
    uni.reLaunch({
      url: '/pages/login/login'
    });
  }

  // 解析并存储消息
  parseAndStoreMessage(rawMessage) {
    try {
      console.log('开始解析消息:', rawMessage);
      
      let messages = [];
      
      // 处理数组格式
      if (Array.isArray(rawMessage)) {
        messages = rawMessage;
        if (messages.length === 0) {
          return;
        }
        console.log('消息是数组格式，包含', messages.length, '条消息');
      } else {
        messages = [rawMessage];
        console.log('消息是单个对象格式');
      }
      
      messages.forEach((message, index) => {
        console.log(`处理第 ${index + 1} 条消息:`, message);
        
        // 验证消息格式
        if (this.validateMessage(message)) {
          // 添加时间戳和状态
          const processedMessage = {
            ...message,
            timestamp: Date.now(),
            isRead: false
          };
          
          // 存储到所有消息数组
          this.allMessages.push(processedMessage);
          
          // 按 room_friend_uid 分组存储
          const roomKey = message.from_uid || 0;
          if (!this.messageStore.has(roomKey)) {
            this.messageStore.set(roomKey, []);
          }
          this.messageStore.get(roomKey).push(processedMessage);
          
          console.log(`✅ 消息已存储到房间 ${roomKey}:`, processedMessage);
        } else {
          console.warn(`❌ 消息格式验证失败:`, message);
        }
      });
      
      // 限制消息数量，避免内存溢出
      if (this.allMessages.length > 1000) {
        this.allMessages = this.allMessages.slice(-500);
        // 清理分组存储
        this.messageStore.forEach((messages, roomKey) => {
          if (messages.length > 100) {
            this.messageStore.set(roomKey, messages.slice(-50));
          }
        });
      }
      
      // 打印当前存储状态
      console.log('当前消息存储状态:');
      console.log('- 总消息数:', this.allMessages.length);
      console.log('- 房间数量:', this.messageStore.size);
      this.messageStore.forEach((messages, roomKey) => {
        console.log(`  - 房间 ${roomKey}: ${messages.length} 条消息`);
      });
      
    } catch (error) {
      console.error('解析和存储消息失败:', error);
    }
  }
  
  // 验证消息格式
  validateMessage(message) {
    const requiredFields = ['msg_uid', 'room_friend_uid', 'msg', 'time', 'type', 'from_uid'];
    const hasAllFields = requiredFields.every(field => message.hasOwnProperty(field));
    
    if (!hasAllFields) {
      console.warn('消息缺少必要字段:', {
        message,
        missingFields: requiredFields.filter(field => !message.hasOwnProperty(field))
      });
    }
    
    return hasAllFields;
  }
  
  // 获取指定房间的消息
  getMessagesByRoom(roomFriendUid) {
    const roomKey = roomFriendUid || 0;
    const messages = this.messageStore.get(roomKey) || [];
    
    console.log(`获取房间 ${roomKey} 的消息:`, {
      roomKey,
      messageCount: messages.length,
      messages: messages.slice(-5) // 只显示最后5条消息
    });
    
    return messages;
  }
  
  // 获取所有消息
  getAllMessages() {
    return this.allMessages;
  }
  
  // 标记房间消息为已读
  markRoomAsRead(roomFriendUid) {
    const roomKey = roomFriendUid || 0;
    const roomMessages = this.messageStore.get(roomKey);
    if (roomMessages) {
      roomMessages.forEach(message => {
        message.isRead = true;
      });
    }
  }
  
  // 获取房间未读消息数量
  getUnreadCount(roomFriendUid) {
    const roomKey = roomFriendUid || 0;
    const roomMessages = this.messageStore.get(roomKey) || [];
    return roomMessages.filter(message => !message.isRead).length;
  }
  
  // 清空消息存储
  clearMessages() {
    this.messageStore.clear();
    this.allMessages = [];
  }
  
  // 尝试重新连接
  attemptReconnect() {
    // 清除之前的重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('超过最大重连次数，放弃重连');
      return;
    }
    
    this.reconnectAttempts++;
    
    this.reconnectTimer = setTimeout(() => {
      console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      const token = getTokenValue();
      if (token) {
        // 检查用于重连的 URL
        console.log('重连使用的 WebSocket URL:', API_URL.ws);
        this.connect(token);
      } else {
        console.error('无法重连：未找到有效token');
      }
    }, this.reconnectInterval);
  }
  
  // 检查是否已连接
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
  
  // 发送消息
  sendMessage(message) {
    if (this.isConnected()) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket未连接，无法发送消息');
      // 不在这里自动重连，避免频繁重连
      // 让用户手动重试或等待自动重连
    }
  }
  
  // 断开连接
  disconnect() {
    console.log('主动断开 WebSocket 连接');
    
    // 清除重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // 重置重连次数
    this.reconnectAttempts = this.maxReconnectAttempts;
    
    // 关闭连接
    if (this.ws) {
      this.ws.close(1000, '用户主动断开');
      this.ws = null;
    }
    
    this.isConnecting = false;
  }
  
  // 添加消息监听器
  addMessageListener(listener) {
    if (typeof listener === 'function' && !this.messageListeners.includes(listener)) {
      this.messageListeners.push(listener);
    }
  }
  
  // 移除消息监听器
  removeMessageListener(listener) {
    const index = this.messageListeners.indexOf(listener);
    if (index !== -1) {
      this.messageListeners.splice(index, 1);
    }
  }
  
  // 添加连接状态监听器
  addConnectionListener(listener) {
    if (typeof listener === 'function' && !this.connectionListeners.includes(listener)) {
      this.connectionListeners.push(listener);
    }
  }
  
  // 移除连接状态监听器
  removeConnectionListener(listener) {
    const index = this.connectionListeners.indexOf(listener);
    if (index !== -1) {
      this.connectionListeners.splice(index, 1);
    }
  }
}

// 创建单例实例
const wsService = WebSocketService.getInstance();

export default wsService;