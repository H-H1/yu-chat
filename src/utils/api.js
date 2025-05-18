/**
 * API接口地址管理
 */

// 基础URL
const BASE_URL = {
  // 开发环境
  dev: 'http://127.0.0.1:5000',
  // 生产环境
  prod: ''
};

// 当前环境
const currentEnv = process.env.NODE_ENV === 'development' ? 'dev' : 'prod';

// API接口地址
const API_URL = {
  // 用户相关
  login: `${BASE_URL[currentEnv]}/api/public/login`,
  register: `${BASE_URL[currentEnv]}/api/public/register`,
  getSmsCode: `${BASE_URL[currentEnv]}/api/public/dx`, // 获取短信验证码
  
  // 其他接口...
};

export default API_URL; 