import globalMessageHandler, { 
  addMessageProcessor, 
  removeMessageProcessor,
  getMessagesByRoom,
  getUnreadCount,
  markAsRead,
  MESSAGE_TYPES,
  MESSAGE_STATUS
} from '../services/messageHandler.js';

// 消息格式化工具
export const formatMessage = (message) => {
  if (!message) return null;
  
  return {
    ...message,
    formattedTime: formatTime(message.time),
    displayText: getDisplayText(message),
    isOwnMessage: isOwnMessage(message),
    statusIcon: getStatusIcon(message.status)
  };
};

// 格式化时间
export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  
  try {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now - date;
    
    // 今天的消息只显示时间
    if (isToday(date)) {
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // 昨天的消息显示"昨天"
    if (isYesterday(date)) {
      return '昨天 ' + date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // 一周内的消息显示星期
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return weekdays[date.getDay()] + ' ' + date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // 更早的消息显示完整日期
    return date.toLocaleDateString('zh-CN', { 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch (error) {
    return timeStr;
  }
};

// 获取显示文本
export const getDisplayText = (message) => {
  if (!message) return '';
  
  switch (message.type) {
    case MESSAGE_TYPES.TEXT:
      return message.msg;
    case MESSAGE_TYPES.IMAGE:
      return '[图片]';
    case MESSAGE_TYPES.FILE:
      return '[文件]';
    case MESSAGE_TYPES.VOICE:
      return '[语音]';
    case MESSAGE_TYPES.VIDEO:
      return '[视频]';
    case MESSAGE_TYPES.SYSTEM:
      return `[系统] ${message.msg}`;
    default:
      return message.msg;
  }
};

// 判断是否为自己的消息
export const isOwnMessage = (message) => {
  // 这里需要根据实际的用户ID来判断
  // 可以从localStorage、Vuex store或其他地方获取当前用户ID
  const currentUserId = getCurrentUserId();
  return message.from_uid === currentUserId;
};

// 获取状态图标
export const getStatusIcon = (status) => {
  switch (status) {
    case MESSAGE_STATUS.SENDING:
      return '⏳';
    case MESSAGE_STATUS.SENT:
      return '✓';
    case MESSAGE_STATUS.DELIVERED:
      return '✓✓';
    case MESSAGE_STATUS.READ:
      return '✓✓';
    case MESSAGE_STATUS.FAILED:
      return '❌';
    default:
      return '';
  }
};

// 获取当前用户ID（需要根据实际项目实现）
const getCurrentUserId = () => {
  // 从localStorage获取
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      const parsed = JSON.parse(userInfo);
      return parsed.uid || 0;
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
  }
  
  // 从Vuex store获取（如果使用Vuex）
  // return store.state.user.uid || 0;
  
  return 0;
};

// 判断是否为今天
const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

// 判断是否为昨天
const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
         date.getMonth() === yesterday.getMonth() &&
         date.getFullYear() === yesterday.getFullYear();
};

// 消息分组工具
export const groupMessagesByDate = (messages) => {
  if (!Array.isArray(messages)) return [];
  
  const groups = {};
  
  messages.forEach(message => {
    const date = new Date(message.time);
    const dateKey = date.toDateString();
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    
    groups[dateKey].push(message);
  });
  
  // 转换为数组格式并按时间排序
  return Object.entries(groups)
    .map(([dateKey, msgs]) => ({
      date: dateKey,
      messages: msgs.sort((a, b) => new Date(a.time) - new Date(b.time))
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

// 消息搜索工具
export const searchMessages = (messages, keyword) => {
  if (!Array.isArray(messages) || !keyword) return [];
  
  const lowerKeyword = keyword.toLowerCase();
  
  return messages.filter(message => {
    // 搜索消息内容
    if (message.msg && message.msg.toLowerCase().includes(lowerKeyword)) {
      return true;
    }
    
    // 搜索发送者ID
    if (message.from_uid && message.from_uid.toString().includes(keyword)) {
      return true;
    }
    
    // 搜索房间ID
    if (message.room_friend_uid && message.room_friend_uid.toString().includes(keyword)) {
      return true;
    }
    
    return false;
  });
};

// 消息统计工具
export const getMessageStats = (messages) => {
  if (!Array.isArray(messages)) return {};
  
  const stats = {
    total: messages.length,
    byType: {},
    byUser: {},
    byRoom: {},
    unread: 0
  };
  
  messages.forEach(message => {
    // 按类型统计
    const typeKey = MESSAGE_TYPES[message.type] || 'unknown';
    stats.byType[typeKey] = (stats.byType[typeKey] || 0) + 1;
    
    // 按用户统计
    const userKey = message.from_uid;
    if (!stats.byUser[userKey]) {
      stats.byUser[userKey] = { count: 0, lastMessage: null };
    }
    stats.byUser[userKey].count++;
    if (!stats.byUser[userKey].lastMessage || 
        new Date(message.time) > new Date(stats.byUser[userKey].lastMessage.time)) {
      stats.byUser[userKey].lastMessage = message;
    }
    
    // 按房间统计
    const roomKey = `${message.room_friend_uid}_${message.room_group_uid}`;
    if (!stats.byRoom[roomKey]) {
      stats.byRoom[roomKey] = { count: 0, unread: 0 };
    }
    stats.byRoom[roomKey].count++;
    if (!message.isRead) {
      stats.byRoom[roomKey].unread++;
      stats.unread++;
    }
  });
  
  return stats;
};

// 导出所有工具函数
export {
  globalMessageHandler,
  addMessageProcessor,
  removeMessageProcessor,
  getMessagesByRoom,
  getUnreadCount,
  markAsRead,
  MESSAGE_TYPES,
  MESSAGE_STATUS
};

