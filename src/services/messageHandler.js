import wsService from './websocket.js';

// 消息类型枚举
export const MESSAGE_TYPES = {
  TEXT: 0,
  IMAGE: 1,
  FILE: 2,
  VOICE: 3,
  VIDEO: 4,
  SYSTEM: 5
};

// 消息状态枚举
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed'
};

// 高性能消息解析器
class MessageParser {
  constructor() {
    // 使用WeakMap缓存已解析的消息结构，提高性能
    this.messageCache = new WeakMap();
    // 预定义的消息字段类型
    this.fieldTypes = {
      msg_uid: 'number',
      room_friend_uid: 'number',
      room_group_uid: 'number',
      msg: 'string',
      time: 'string',
      type: 'number',
      from_uid: 'number'
    };
  }

  // 高性能消息解析
  parseMessage(rawData) {
    try {
      // 如果数据已经是对象，直接返回
      if (typeof rawData === 'object' && rawData !== null) {
        return this.validateAndTransform(rawData);
      }

      // 解析JSON字符串
      const parsed = JSON.parse(rawData);
      
      // 处理数组格式
      if (Array.isArray(parsed)) {
        return parsed.map(item => this.validateAndTransform(item));
      }
      
      // 处理单个对象
      return this.validateAndTransform(parsed);
    } catch (error) {
      console.error('消息解析失败:', error);
      return null;
    }
  }

  // 验证和转换消息数据
  validateAndTransform(data) {
    if (!data || typeof data !== 'object') {
      return null;
    }

    // 使用结构化克隆来创建新对象，避免引用问题
    const message = {
      msg_uid: Number(data.msg_uid) || 0,
      room_friend_uid: Number(data.room_friend_uid) || 0,
      room_group_uid: Number(data.room_group_uid) || 0,
      msg: String(data.msg || ''),
      time: String(data.time || ''),
      type: Number(data.type) || MESSAGE_TYPES.TEXT,
      from_uid: Number(data.from_uid) || 0,
      // 添加额外字段
      timestamp: Date.now(),
      status: MESSAGE_STATUS.SENT,
      isRead: false
    };

    // 验证必要字段
    if (!message.msg_uid || !message.msg) {
      return null;
    }

    return message;
  }
}

// 全局消息处理器
class GlobalMessageHandler {
  constructor() {
    this.parser = new MessageParser();
    this.messageQueue = [];
    this.processors = new Map();
    this.isProcessing = false;
    this.batchSize = 10; // 批处理大小
    this.processInterval = 16; // 16ms处理间隔（约60fps）
    
    // 初始化WebSocket监听
    this.initWebSocketListener();
    
    // 启动批处理
    this.startBatchProcessing();
  }

  // 初始化WebSocket监听器
  initWebSocketListener() {
    wsService.addMessageListener((rawData) => {
      this.handleIncomingMessage(rawData);
    });

    // 监听连接状态
    wsService.addConnectionListener((isConnected) => {
      if (isConnected) {
        console.log('WebSocket连接已建立，消息处理器已激活');
        this.processPendingMessages();
      } else {
        console.log('WebSocket连接已断开，消息处理器已暂停');
      }
    });
  }

  // 处理接收到的消息
  handleIncomingMessage(rawData) {
    const messages = this.parser.parseMessage(rawData);
    
    if (!messages) {
      return;
    }

    // 将消息添加到队列
    if (Array.isArray(messages)) {
      this.messageQueue.push(...messages);
    } else {
      this.messageQueue.push(messages);
    }

    // 如果队列过长，进行清理
    if (this.messageQueue.length > 1000) {
      this.messageQueue = this.messageQueue.slice(-500);
      console.warn('消息队列过长，已清理旧消息');
    }
  }

  // 启动批处理
  startBatchProcessing() {
    setInterval(() => {
      if (!this.isProcessing && this.messageQueue.length > 0) {
        this.processBatch();
      }
    }, this.processInterval);
  }

  // 批处理消息
  async processBatch() {
    if (this.isProcessing || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    try {
      // 获取一批消息进行处理
      const batch = this.messageQueue.splice(0, this.batchSize);
      
      // 按类型分组处理
      const groupedMessages = this.groupMessagesByType(batch);
      
      // 并行处理不同类型的消息
      await Promise.all([
        this.processTextMessages(groupedMessages.text || []),
        this.processMediaMessages(groupedMessages.media || []),
        this.processSystemMessages(groupedMessages.system || [])
      ]);

      // 通知所有处理器
      this.notifyProcessors(batch);
      
    } catch (error) {
      console.error('批处理消息时出错:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // 按类型分组消息
  groupMessagesByType(messages) {
    const groups = {
      text: [],
      media: [],
      system: []
    };

    messages.forEach(message => {
      switch (message.type) {
        case MESSAGE_TYPES.TEXT:
          groups.text.push(message);
          break;
        case MESSAGE_TYPES.IMAGE:
        case MESSAGE_TYPES.FILE:
        case MESSAGE_TYPES.VOICE:
        case MESSAGE_TYPES.VIDEO:
          groups.media.push(message);
          break;
        case MESSAGE_TYPES.SYSTEM:
          groups.system.push(message);
          break;
        default:
          groups.text.push(message);
      }
    });

    return groups;
  }

  // 处理文本消息
  async processTextMessages(messages) {
    if (messages.length === 0) return;
    
    // 文本消息的特殊处理逻辑
    messages.forEach(message => {
      // 可以在这里添加文本过滤、敏感词检测等
      message.processed = true;
    });
  }

  // 处理媒体消息
  async processMediaMessages(messages) {
    if (messages.length === 0) return;
    
    // 媒体消息的特殊处理逻辑
    messages.forEach(message => {
      // 可以在这里添加媒体文件验证、缩略图生成等
      message.processed = true;
    });
  }

  // 处理系统消息
  async processSystemMessages(messages) {
    if (messages.length === 0) return;
    
    // 系统消息的特殊处理逻辑
    messages.forEach(message => {
      // 可以在这里添加系统通知、状态更新等
      message.processed = true;
    });
  }

  // 通知所有处理器
  notifyProcessors(messages) {
    this.processors.forEach((processor, key) => {
      try {
        if (typeof processor === 'function') {
          processor(messages);
        }
      } catch (error) {
        console.error(`处理器 ${key} 执行出错:`, error);
      }
    });
  }

  // 添加消息处理器
  addProcessor(key, processor) {
    if (typeof processor === 'function') {
      this.processors.set(key, processor);
    }
  }

  // 移除消息处理器
  removeProcessor(key) {
    this.processors.delete(key);
  }

  // 获取特定房间的消息
  getMessagesByRoom(roomFriendUid, roomGroupUid = 0) {
    return this.messageQueue.filter(message => 
      message.room_friend_uid === roomFriendUid && 
      message.room_group_uid === roomGroupUid
    );
  }

  // 获取特定用户的消息
  getMessagesByUser(fromUid) {
    return this.messageQueue.filter(message => 
      message.from_uid === fromUid
    );
  }

  // 获取未读消息数量
  getUnreadCount(roomFriendUid, roomGroupUid = 0) {
    return this.messageQueue.filter(message => 
      message.room_friend_uid === roomFriendUid && 
      message.room_group_uid === roomGroupUid &&
      !message.isRead
    ).length;
  }

  // 标记消息为已读
  markAsRead(roomFriendUid, roomGroupUid = 0) {
    this.messageQueue.forEach(message => {
      if (message.room_friend_uid === roomFriendUid && 
          message.room_group_uid === roomGroupUid) {
        message.isRead = true;
      }
    });
  }

  // 处理待处理消息
  processPendingMessages() {
    if (this.messageQueue.length > 0) {
      this.processBatch();
    }
  }

  // 清空消息队列
  clearQueue() {
    this.messageQueue = [];
  }

  // 获取队列统计信息
  getQueueStats() {
    return {
      total: this.messageQueue.length,
      unread: this.messageQueue.filter(m => !m.isRead).length,
      byType: this.messageQueue.reduce((acc, m) => {
        acc[m.type] = (acc[m.type] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

// 创建全局实例
const globalMessageHandler = new GlobalMessageHandler();

// 导出实例和工具函数
export default globalMessageHandler;

// 导出便捷函数
export const addMessageProcessor = (key, processor) => {
  globalMessageHandler.addProcessor(key, processor);
};

export const removeMessageProcessor = (key) => {
  globalMessageHandler.removeProcessor(key);
};

export const getMessagesByRoom = (roomFriendUid, roomGroupUid) => {
  return globalMessageHandler.getMessagesByRoom(roomFriendUid, roomGroupUid);
};

export const getUnreadCount = (roomFriendUid, roomGroupUid) => {
  return globalMessageHandler.getUnreadCount(roomFriendUid, roomGroupUid);
};

export const markAsRead = (roomFriendUid, roomGroupUid) => {
  globalMessageHandler.markAsRead(roomFriendUid, roomGroupUid);
};

