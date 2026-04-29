/**
 * 支付服务 - 支持微信支付和支付宝支付
 */
import PurchaseService from './purchaseService.js';

class PaymentService {
  /**
   * 发起支付
   * @param {Object} orderData - 订单数据
   * @param {string} paymentMethod - 支付方式 'wechat' | 'alipay'
   */
  static async initiatePayment(orderData, paymentMethod = 'alipay') {
    try {
      // 1. 创建订单
      const order = await PurchaseService.createOrder(orderData);

      // 2. 获取支付参数（后端调用支付宝 SDK 生成支付 URL）
      const paymentData = await PurchaseService.payOrder({
        orderId: order.orderId,
        paymentMethod
      });

      // 3. 调起支付
      const paymentResult = await this.callNativePayment(paymentData, paymentMethod);

      // 4. 支付宝 H5 跳转后是 pending 状态，需要轮询确认
      if (paymentResult.pending) {
        return {
          success: true,
          pending: true,
          orderId: order.orderId,
          message: '请在支付宝完成支付后返回'
        };
      }

      if (paymentResult.success) {
        return { success: true, orderId: order.orderId, message: '支付成功' };
      } else {
        return { success: false, orderId: order.orderId, message: paymentResult.message || '支付失败' };
      }
    } catch (error) {
      console.error('支付流程失败:', error);
      throw error;
    }
  }

  /**
   * 调用原生支付
   * @param {Object} paymentData - 支付数据（后端返回）
   * @param {string} paymentMethod - 支付方式
   */
  static async callNativePayment(paymentData, paymentMethod) {
    return new Promise((resolve) => {
      if (paymentMethod === 'wechat') {
        this.callWechatPay(paymentData, resolve);
      } else if (paymentMethod === 'alipay') {
        this.callAlipay(paymentData, resolve);
      } else {
        resolve({ success: false, message: '不支持的支付方式' });
      }
    });
  }

  /**
   * 微信支付
   */
  static callWechatPay(paymentData, callback) {
    // #ifdef H5
    if (typeof WeixinJSBridge !== 'undefined') {
      WeixinJSBridge.invoke('getBrandWCPayRequest', {
        appId: paymentData.appId,
        timeStamp: paymentData.timeStamp,
        nonceStr: paymentData.nonceStr,
        package: paymentData.package,
        signType: paymentData.signType,
        paySign: paymentData.paySign
      }, (res) => {
        callback({
          success: res.err_msg === 'get_brand_wcpay_request:ok',
          message: res.err_msg
        });
      });
    } else {
      callback({ success: false, message: '请在微信浏览器中打开' });
    }
    // #endif

    // #ifdef APP-PLUS
    uni.requestPayment({
      provider: 'wxpay',
      orderInfo: paymentData.orderInfo,
      success: (res) => callback({ success: true, result: res }),
      fail: (err) => callback({ success: false, message: err.errMsg })
    });
    // #endif
  }

  /**
   * 支付宝 H5 支付 - 后端返回支付 URL，直接跳转
   */
  static callAlipay(paymentData, callback) {
    // #ifdef H5
    // 后端返回支付宝支付 URL（alipayUrl）或表单（alipayForm）
    if (paymentData.alipayUrl) {
      // 直接跳转到支付宝收银台
      window.location.href = paymentData.alipayUrl;
      // 跳转后页面会离开，这里返回 pending 状态
      // 支付结果通过后端回调 + 轮询支付状态来确认
      callback({ success: true, pending: true, message: '已跳转到支付宝' });
    } else if (paymentData.alipayForm) {
      // 后端返回 HTML 表单字符串，插入 DOM 并提交
      const div = document.createElement('div');
      div.innerHTML = paymentData.alipayForm;
      document.body.appendChild(div);
      div.querySelector('form').submit();
      callback({ success: true, pending: true, message: '已跳转到支付宝' });
    } else {
      callback({ success: false, message: '支付宝支付参数错误' });
    }
    // #endif

    // #ifdef APP-PLUS
    uni.requestPayment({
      provider: 'alipay',
      orderInfo: paymentData.orderInfo,
      success: (res) => callback({ success: true, result: res }),
      fail: (err) => callback({ success: false, message: err.errMsg })
    });
    // #endif
  }

  /**
   * 查询支付状态
   * @param {string} orderId - 订单ID
   */
  static async checkPaymentStatus(orderId) {
    try {
      const status = await PurchaseService.getPaymentStatus(orderId);
      return status;
    } catch (error) {
      console.error('查询支付状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取支持的支付方式
   */
  static getSupportedPaymentMethods() {
    const methods = [];
    
    // #ifdef MP-WEIXIN || H5 || APP-PLUS
    methods.push({
      id: 'wechat',
      name: '微信支付',
      icon: 'wechat'
    });
    // #endif

    // #ifdef MP-ALIPAY || H5 || APP-PLUS
    methods.push({
      id: 'alipay',
      name: '支付宝',
      icon: 'alipay'
    });
    // #endif

    return methods;
  }

  /**
   * 模拟支付（用于测试）
   * @param {Object} orderData - 订单数据
   */
  static async mockPayment(orderData) {
    return new Promise((resolve) => {
      uni.showModal({
        title: '模拟支付',
        content: `确认支付 ¥${orderData.price} 购买 ${orderData.packageName}？`,
        success: (res) => {
          if (res.confirm) {
            // 模拟支付延迟
            setTimeout(() => {
              resolve({
                success: true,
                orderId: 'MOCK_' + Date.now(),
                message: '模拟支付成功'
              });
            }, 1000);
          } else {
            resolve({
              success: false,
              message: '用户取消支付'
            });
          }
        }
      });
    });
  }
}

export default PaymentService;
