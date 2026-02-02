// 注意：这些依赖在旧代码中使用，新代码已不使用
// 如果不需要这些功能，可以删除此文件或注释掉相关代码
// import {Decimal} from "decimal.js";
// import isMobileJS from 'ismobilejs';
// import JSEncrypt from "jsencrypt";

// 临时禁用这些导入以避免类型错误
// 如果需要使用，请安装相应的依赖：npm install decimal.js ismobilejs jsencrypt
// 并安装类型定义：npm install --save-dev @types/jsencrypt

//16:9
// const proportion16: Decimal = new Decimal(16).div(new Decimal(9)) ;

const proportion9 = 9 / 16; // 简化为数字计算

const public_key:string = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCCvcEblIslDk91/zsyPW9X2ZG9xhEEmPeT6LsK\n" +
"7o9hzXn8Ue1ywPOQCHIWdkaHnTnEQbBQAVHh70zHKyN9XUzVVLXxl3Pz+mscBVLpJO/1xrVZf3Rb\n" +
"9d9Yxww0AhOtx49RSfJuugWkF3/fCR3E0VKLNWDpzq0/SBdmuM1797uJyQIDAQAB";

/**
 * 计算高 16：9
 * @param width 宽
 */
export function calculateHigh(width: number | string | null | undefined): number | null {
    if(!width){
        return null;
    }
    const numWidth = typeof width === 'string' ? parseFloat(width) : width;
    return numWidth * proportion9;
}

/**
 * 是否为移动设备？
 * @returns 
 */
export function _isMobile(): boolean {
    const flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
    return !!flag;
}

/**
 * 加密算法（需要安装 jsencrypt 依赖）
 * @param {*} word 明文
 * @param {*} keyStr 密钥
 * @returns 加密后的数据
 */
export function encodeRSA(_word: string, _keyStr: string): string | false {
    // 此功能需要安装 jsencrypt 依赖
    // 如果不需要加密功能，可以删除此函数
    console.warn('encodeRSA requires jsencrypt package. Please install it: npm install jsencrypt')
    return false;
}

//用户代理
const ua = navigator.userAgent.toLowerCase()

//设备类型（简化版本，不依赖 ismobilejs）
export const isMobile = _isMobile()
export const isPhone = /(phone|iPhone|iPod|Android)/i.test(ua)
export const isAndroid = /android/i.test(ua)
export const isApple = /(iPhone|iPad|iPod)/i.test(ua)
export const isTencentGroup = /MQQBrowser/i.test(ua)
export const isUC = /ucbrowser/i.test(ua)
export const isChrome = /chrome/i.test(ua) && !/edge/i.test(ua)
export const isWechat = /MicroMessenger/i.test(ua)
export const isFirefox = /firefox/i.test(ua)

export default {
    encodeRSA,
    _isMobile,
    calculateHigh
}