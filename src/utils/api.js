/**
 * API接口地址管理
 * 兼容 H5 / 小程序 / App 多端
 */

// #ifdef H5
const _isH5 = true;
// #endif
// #ifndef H5
const _isH5 = false;
// #endif

const DEFAULT_BASE = 'http://127.0.0.1:5000';
const DEFAULT_WS   = 'ws://127.0.0.1:5001';

const getConfig = () => {
  // H5 端支持 localStorage 调试覆盖
  if (_isH5 && typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('API_BASE_URL');
    if (localUrl) {
      return {
        baseUrl: localUrl,
        wsUrl: localUrl.replace(/^https?/, (m) => m === 'https' ? 'wss' : 'ws')
      };
    }

    // H5 生产环境：用相对路径，nginx 反代
    const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    if (isProd) {
      const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return {
        baseUrl: '',
        wsUrl: `${wsProto}//${window.location.host}`
      };
    }
  }

  // 小程序 / App / 本地开发：直接用固定地址
  return { baseUrl: DEFAULT_BASE, wsUrl: DEFAULT_WS };
};

const { baseUrl, wsUrl } = getConfig();

const API_URL = {
  login:               `${baseUrl}/api/public/login`,
  register:            `${baseUrl}/api/public/register`,
  getSmsCode:          `${baseUrl}/api/public/dx`,
  captcha:             `${baseUrl}/api/public/captcha`,

  ws:                  `${wsUrl}/ws`,

  addFriend:           `${baseUrl}/api/user/add`,
  deleteFriend:        `${baseUrl}/api/user/delete`,
  agreeFriendApply:    `${baseUrl}/api/user/agree`,
  getFriendApplyList:  `${baseUrl}/api/user/getApplyList`,
  getUnreadApplyCount: `${baseUrl}/api/user/unreadApplyNum`,
  getFriendList:       `${baseUrl}/api/user/getFriendList`,
  isFriend:            `${baseUrl}/api/user/isFriend`,
  getUserInfoByName:   `${baseUrl}/api/user/getUserInfoByName`,

  getServicePackages:  `${baseUrl}/api/service/packages`,
  createOrder:         `${baseUrl}/api/service/createOrder`,
  getOrderList:        `${baseUrl}/api/service/orders`,
  getOrderDetail:      `${baseUrl}/api/service/order`,
  cancelOrder:         `${baseUrl}/api/service/cancelOrder`,
  payOrder:            `${baseUrl}/api/service/payOrder`,
  getPaymentStatus:    `${baseUrl}/api/service/paymentStatus`,
  getUserServiceInfo:  `${baseUrl}/api/service/userInfo`,

  skills:              `${baseUrl}/api/skills`,
  completion:          `${baseUrl}/api/chat/completion`,

  generateImage:       `${baseUrl}/api/image/image`,
  getHotNews:          `${baseUrl}/api/news/hot`,
};

export default API_URL;
