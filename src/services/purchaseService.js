/**
 * 购买服务相关API
 */
import API_URL from '@/utils/api.js';
import { getTokenValue } from '@/utils/auth';

class PurchaseService {
  /**
   * 获取服务套餐列表
   */
  // 获取用户服务信息（统一字段为驼峰）
  static async getUserServiceInfo() {
    const token = getTokenValue();
    try {
      const response = await uni.request({
        url: API_URL.getUserServiceInfo,
        method: 'GET',
        header: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.statusCode !== 200) {
        throw new Error(`请求失败: ${response.statusCode}`);
      }

      const body = response.data || {};
      const payload = body.data || body.Data || {};
      const normalized = {
        vipLevel: payload.VipLevel ?? payload.vipLevel ?? 0,
        points: payload.Points ?? payload.points ?? 0,
        days: payload.Days ?? payload.days ?? 0
      };
      return normalized;
    } catch (err) {
      console.error('获取用户服务信息失败:', err);
      throw err;
    }
  }
  /**
   * 创建订单
   * @param {Object} orderData - 订单数据
   * @param {number} orderData.packageId - 套餐ID
   * @param {number} orderData.price - 价格
   * @param {string} orderData.packageName - 套餐名称
   */
  static async createOrder(orderData) {
    try {
      const token = getTokenValue();
      const response = await uni.request({
        url: API_URL.createOrder,
        method: 'POST',
        header: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        data: {
          packageId: orderData.packageId,
          price: orderData.price,
          packageName: orderData.packageName,
          timestamp: Date.now()
        }
      });
      
      if (response.data && response.data.Success) {
        return response.data.Data;
      } else {
        throw new Error(response.data?.Message || '创建订单失败');
      }
    } catch (error) {
      console.error('创建订单失败:', error);
      throw error;
    }
  }

  /**
   * 获取订单列表
   * @param {Object} params - 查询参数
   * @param {number} params.pageNum - 页码
   * @param {number} params.pageSize - 每页数量
   */
  static async getOrderList(params = {}) {
    try {
      const token = getTokenValue();
      const response = await uni.request({
        url: API_URL.getOrderList,
        method: 'GET',
        header: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        data: {
          pageNum: params.pageNum || 1,
          pageSize: params.pageSize || 10,
          timestamp: Date.now()
        }
      });
      
      if (response.data && response.data.Success) {
        return response.data.Data;
      } else {
        throw new Error(response.data?.Message || '获取订单列表失败');
      }
    } catch (error) {
      console.error('获取订单列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取订单详情
   * @param {string} orderId - 订单ID
   */
  static async getOrderDetail(orderId) {
    try {
      const token = getTokenValue();
      const response = await uni.request({
        url: `${API_URL.getOrderDetail}/${orderId}`,
        method: 'GET',
        header: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.Success) {
        return response.data.Data;
      } else {
        throw new Error(response.data?.Message || '获取订单详情失败');
      }
    } catch (error) {
      console.error('获取订单详情失败:', error);
      throw error;
    }
  }

  /**
   * 取消订单
   * @param {string} orderId - 订单ID
   */
  static async cancelOrder(orderId) {
    try {
      const token = getTokenValue();
      const response = await uni.request({
        url: API_URL.cancelOrder,
        method: 'POST',
        header: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        data: {
          orderId: orderId,
          timestamp: Date.now()
        }
      });
      
      if (response.data && response.data.Success) {
        return response.data.Data;
      } else {
        throw new Error(response.data?.Message || '取消订单失败');
      }
    } catch (error) {
      console.error('取消订单失败:', error);
      throw error;
    }
  }

  /**
   * 支付订单
   * @param {Object} paymentData - 支付数据
   * @param {string} paymentData.orderId - 订单ID
   * @param {string} paymentData.paymentMethod - 支付方式 (wechat/alipay)
   */
  static async payOrder(paymentData) {
    try {
      const token = getTokenValue();
      const response = await uni.request({
        url: API_URL.payOrder,
        method: 'POST',
        header: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        data: {
          orderId: paymentData.orderId,
          paymentMethod: paymentData.paymentMethod,
          timestamp: Date.now()
        }
      });
      
      if (response.data && response.data.Success) {
        return response.data.Data;
      } else {
        throw new Error(response.data?.Message || '支付失败');
      }
    } catch (error) {
      console.error('支付失败:', error);
      throw error;
    }
  }

  /**
   * 查询支付状态
   * @param {string} orderId - 订单ID
   */
  static async getPaymentStatus(orderId) {
    try {
      const token = getTokenValue();
      const response = await uni.request({
        url: `${API_URL.getPaymentStatus}/${orderId}`,
        method: 'GET',
        header: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.Success) {
        return response.data.Data;
      } else {
        throw new Error(response.data?.Message || '查询支付状态失败');
      }
    } catch (error) {
      console.error('查询支付状态失败:', error);
      throw error;
    }
  }



  /**
   * 处理支付结果
   * @param {Object} paymentResult - 支付结果
   */
  static async handlePaymentResult(paymentResult) {
    try {
      const token = getTokenValue();
      const response = await uni.request({
        url: `${API_URL.payOrder}/callback`,
        method: 'POST',
        header: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        data: {
          ...paymentResult,
          timestamp: Date.now()
        }
      });
      
      if (response.data && response.data.Success) {
        return response.data.Data;
      } else {
        throw new Error(response.data?.Message || '处理支付结果失败');
      }
    } catch (error) {
      console.error('处理支付结果失败:', error);
      throw error;
    }
  }
}

export default PurchaseService;
