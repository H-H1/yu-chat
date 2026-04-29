export const getTokenValue = () => {
    const tokenStr = uni.getStorageSync('token');
    if (!tokenStr) {
      console.log('无Token');
      uni.removeStorageSync('token');
      uni.removeStorageSync('userInfo');
      uni.navigateTo({
        url: '/pages/login/login'
      });
      return null;
    }

    let tokenData;
    try {
      tokenData = JSON.parse(tokenStr);
    } catch (e) {
      // 旧格式，直接返回
      return tokenStr;
      log.console()
    }
  
    if (tokenData && tokenData.value && tokenData.expiry) {
      const now = new Date();
      if (now.getTime()  > tokenData.expiry) {
        console.log('Token已过期');
        uni.removeStorageSync('token');
        uni.removeStorageSync('userInfo');
        uni.navigateTo({
          url: '/pages/login/login'
        });
        return null;
      }
      return tokenData.value;
    } else {
      // 非标准格式
      return tokenStr;
    }
  };
// 设置token（带7天有效期）

export const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7天（单位：毫秒）



