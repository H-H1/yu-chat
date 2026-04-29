/**
 * 加密工具类
 * 提供SHA-256哈希加密和加盐功能
 */

// 盐值常量
const SALT = 'yuchat';

/**
 * 降级哈希函数 - 用于非 HTTPS 环境
 * 使用简单的哈希算法（不如 SHA-256 安全，但可用）
 * @param {string} str - 要哈希的字符串
 * @returns {string} - 返回哈希值
 */
const fallbackHash = (str) => {
	let hash = 0;
	if (str.length === 0) return hash.toString(16);
	
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	
	// 转换为十六进制并确保长度
	let hex = Math.abs(hash).toString(16);
	// 填充到至少 8 位
	while (hex.length < 8) {
		hex = '0' + hex;
	}
	
	// 多次迭代增加复杂度
	for (let i = 0; i < 3; i++) {
		let newHash = 0;
		for (let j = 0; j < hex.length; j++) {
			const char = hex.charCodeAt(j);
			newHash = ((newHash << 5) - newHash) + char;
			newHash = newHash & newHash;
		}
		hex = Math.abs(newHash).toString(16);
		while (hex.length < 8) {
			hex = '0' + hex;
		}
	}
	
	// 填充到 64 位（模拟 SHA-256 的长度）
	while (hex.length < 64) {
		hex = hex + hex.split('').reverse().join('');
	}
	
	return hex.substring(0, 64);
};

/**
 * 将字符串转换为SHA-256哈希
 * @param {string} message - 要加密的消息
 * @returns {Promise<string>} - 返回十六进制格式的SHA-256哈希值
 */
export const sha256 = async (message) => {
	try {
		// 检查 crypto.subtle 是否可用（需要 HTTPS 或 localhost）
		if (typeof crypto !== 'undefined' && crypto.subtle && window.isSecureContext) {
			// 将字符串转换为UTF-8编码的Uint8Array
			const msgBuffer = new TextEncoder().encode(message);
			
			// 使用Web Crypto API进行SHA-256哈希
			const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
			
			// 将ArrayBuffer转换为十六进制字符串
			const hashArray = Array.from(new Uint8Array(hashBuffer));
			const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
			
			return hashHex;
		} else {
			// 降级到简单哈希算法
			console.warn('⚠️ crypto.subtle 不可用，使用降级哈希算法（建议使用 HTTPS）');
			return fallbackHash(message);
		}
	} catch (error) {
		console.error('SHA-256 加密失败，使用降级方案:', error);
		return fallbackHash(message);
	}
};

/**
 * 对密码进行SHA-256哈希加密并加盐
 * @param {string} password - 原始密码
 * @returns {Promise<string>} - 返回加密后的密码哈希值
 */
export const hashPassword = async (password) => {
	try {
		// 将密码和盐值组合
		const saltedPassword = password + SALT;
		
		// 进行SHA-256哈希加密
		const hashedPassword = await sha256(saltedPassword);
		
		return hashedPassword;
	} catch (error) {
		console.error('密码加密失败:', error);
		throw new Error('密码加密失败');
	}
};

/**
 * 验证密码是否匹配
 * @param {string} inputPassword - 输入的密码
 * @param {string} hashedPassword - 存储的哈希密码
 * @returns {Promise<boolean>} - 返回密码是否匹配
 */
export const verifyPassword = async (inputPassword, hashedPassword) => {
	try {
		const inputHashed = await hashPassword(inputPassword);
		return inputHashed === hashedPassword;
	} catch (error) {
		console.error('密码验证失败:', error);
		return false;
	}
};

export default {
	sha256,
	hashPassword,
	verifyPassword
}; 