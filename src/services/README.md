# 全局WebSocket消息处理器

这是一个高性能的全局WebSocket消息处理器，用于处理实时聊天消息。它提供了消息解析、队列管理、批处理、消息分发等功能。

## 特性

- 🚀 **高性能**: 使用批处理和序列化解析优化性能
- 🔄 **实时处理**: 支持实时消息接收和处理
- 📊 **消息队列**: 智能消息队列管理，自动清理旧消息
- 🎯 **类型分组**: 按消息类型分组处理（文本、图片、文件、语音、视频、系统）
- 🔍 **消息搜索**: 支持关键词搜索和消息统计
- 📱 **Vue集成**: 完美集成Vue.js，提供响应式数据
- 🛡️ **错误处理**: 完善的错误处理和重连机制

## 文件结构

```
src/services/
├── websocket.js          # WebSocket基础服务
├── messageHandler.js     # 全局消息处理器
├── messageUtils.js       # 消息处理工具函数
└── README.md            # 使用说明文档

src/examples/
└── MessageHandlerExample.vue  # 使用示例组件
```

## 快速开始

### 1. 基本使用

```javascript
import { 
  globalMessageHandler,
  addMessageProcessor,
  getMessagesByRoom,
  getUnreadCount 
} from '@/services/messageHandler.js';

// 添加消息处理器
addMessageProcessor('my-component', (messages) => {
  console.log('收到新消息:', messages);
  // 处理新消息
});

// 获取特定房间的消息
const messages = getMessagesByRoom(14, 0);

// 获取未读消息数量
const unreadCount = getUnreadCount(14, 0);
```

### 2. 在Vue组件中使用

```vue
<template>
  <div>
    <div v-for="message in messages" :key="message.msg_uid">
      {{ message.msg }}
    </div>
  </div>
</template>

<script>
import { 
  addMessageProcessor, 
  removeMessageProcessor,
  getMessagesByRoom 
} from '@/services/messageHandler.js';

export default {
  data() {
    return {
      messages: [],
      processorKey: 'my-component'
    };
  },
  
  mounted() {
    // 添加消息处理器
    addMessageProcessor(this.processorKey, (messages) => {
      this.handleNewMessages(messages);
    });
    
    // 加载初始消息
    this.loadMessages();
  },
  
  beforeUnmount() {
    // 移除消息处理器
    removeMessageProcessor(this.processorKey);
  },
  
  methods: {
    handleNewMessages(messages) {
      // 处理新消息
      this.messages.push(...messages);
    },
    
    loadMessages() {
      // 加载房间消息
      this.messages = getMessagesByRoom(14, 0);
    }
  }
};
</script>
```

## API 参考

### 核心类

#### GlobalMessageHandler

全局消息处理器的主要类。

**方法:**

- `addProcessor(key, processor)`: 添加消息处理器
- `removeProcessor(key)`: 移除消息处理器
- `getMessagesByRoom(roomFriendUid, roomGroupUid)`: 获取特定房间的消息
- `getMessagesByUser(fromUid)`: 获取特定用户的消息
- `getUnreadCount(roomFriendUid, roomGroupUid)`: 获取未读消息数量
- `markAsRead(roomFriendUid, roomGroupUid)`: 标记消息为已读
- `getQueueStats()`: 获取队列统计信息

### 工具函数

#### 消息处理

- `addMessageProcessor(key, processor)`: 添加消息处理器
- `removeMessageProcessor(key)`: 移除消息处理器
- `getMessagesByRoom(roomFriendUid, roomGroupUid)`: 获取房间消息
- `getUnreadCount(roomFriendUid, roomGroupUid)`: 获取未读数量
- `markAsRead(roomFriendUid, roomGroupUid)`: 标记为已读

#### 消息格式化

- `formatMessage(message)`: 格式化消息对象
- `formatTime(timeStr)`: 格式化时间显示
- `getDisplayText(message)`: 获取显示文本
- `isOwnMessage(message)`: 判断是否为自己的消息
- `getStatusIcon(status)`: 获取状态图标

#### 消息工具

- `groupMessagesByDate(messages)`: 按日期分组消息
- `searchMessages(messages, keyword)`: 搜索消息
- `getMessageStats(messages)`: 获取消息统计

### 枚举常量

#### MESSAGE_TYPES

```javascript
export const MESSAGE_TYPES = {
  TEXT: 0,      // 文本消息
  IMAGE: 1,     // 图片消息
  FILE: 2,      // 文件消息
  VOICE: 3,     // 语音消息
  VIDEO: 4,     // 视频消息
  SYSTEM: 5     // 系统消息
};
```

#### MESSAGE_STATUS

```javascript
export const MESSAGE_STATUS = {
  SENDING: 'sending',     // 发送中
  SENT: 'sent',          // 已发送
  DELIVERED: 'delivered', // 已送达
  READ: 'read',          // 已读
  FAILED: 'failed'       // 发送失败
};
```

## 消息数据结构

### 输入消息格式

```javascript
{
  "msg_uid": 1755958158524,        // 消息唯一ID
  "room_friend_uid": 14,           // 好友房间ID
  "room_group_uid": 0,             // 群组房间ID
  "msg": "sagsag",                 // 消息内容
  "time": "2025-08-23 22:09:18",  // 消息时间
  "type": 0,                       // 消息类型
  "from_uid": 0                    // 发送者ID
}
```

### 处理后的消息格式

```javascript
{
  msg_uid: 1755958158524,
  room_friend_uid: 14,
  room_group_uid: 0,
  msg: "sagsag",
  time: "2025-08-23 22:09:18",
  type: 0,
  from_uid: 0,
  timestamp: 1692808158000,        // 时间戳
  status: "sent",                  // 消息状态
  isRead: false,                   // 是否已读
  processed: true                  // 是否已处理
}
```

## 性能优化

### 批处理

- 消息按批次处理，默认批次大小为10
- 处理间隔为16ms（约60fps），确保流畅的用户体验
- 支持并行处理不同类型的消息

### 内存管理

- 自动清理旧消息，队列长度超过1000时自动清理
- 使用WeakMap缓存已解析的消息结构
- 智能消息分组和过滤

### 连接管理

- 自动重连机制，最大重连次数为5次
- 连接状态监听和通知
- 错误处理和日志记录

## 最佳实践

### 1. 组件生命周期管理

```javascript
// 在mounted中添加处理器
mounted() {
  this.processorKey = `component-${Date.now()}`;
  addMessageProcessor(this.processorKey, this.handleMessages);
}

// 在beforeUnmount中移除处理器
beforeUnmount() {
  removeMessageProcessor(this.processorKey);
}
```

### 2. 消息处理优化

```javascript
// 使用防抖处理大量消息
let updateTimeout;
const handleMessages = (messages) => {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    this.updateUI(messages);
  }, 100);
};
```

### 3. 错误处理

```javascript
addMessageProcessor('my-component', (messages) => {
  try {
    this.processMessages(messages);
  } catch (error) {
    console.error('处理消息时出错:', error);
    // 记录错误日志或显示用户提示
  }
});
```

## 故障排除

### 常见问题

1. **消息不显示**
   - 检查WebSocket连接状态
   - 确认消息处理器是否正确添加
   - 查看控制台错误信息

2. **性能问题**
   - 检查消息队列长度
   - 确认批处理是否正常工作
   - 监控内存使用情况

3. **连接断开**
   - 检查网络连接
   - 确认token是否有效
   - 查看重连日志

### 调试模式

```javascript
// 启用详细日志
globalMessageHandler.debug = true;

// 查看队列状态
console.log(globalMessageHandler.getQueueStats());

// 查看连接状态
console.log(globalMessageHandler.isConnected());
```

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基本的消息处理功能
- 集成WebSocket服务
- 提供Vue组件示例

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

