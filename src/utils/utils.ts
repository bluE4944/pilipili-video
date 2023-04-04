import {Decimal} from "decimal.js";
import isMobileJS from 'ismobilejs';
import JSEncrypt from "jsencrypt";

//16:9
const proportion16: Decimal = new Decimal(16).div(new Decimal(9)) ;

const proportion9: Decimal = new Decimal(9).div(new Decimal(16));

const public_key:string = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCCvcEblIslDk91/zsyPW9X2ZG9xhEEmPeT6LsK\n" +
"7o9hzXn8Ue1ywPOQCHIWdkaHnTnEQbBQAVHh70zHKyN9XUzVVLXxl3Pz+mscBVLpJO/1xrVZf3Rb\n" +
"9d9Yxww0AhOtx49RSfJuugWkF3/fCR3E0VKLNWDpzq0/SBdmuM1797uJyQIDAQAB";

/**
 * 计算高 16：9
 * @param width 宽
 */
export function calculateHigh(width: number | string | Decimal): number{
    if(!width){
        return null;
    }
    return new Decimal(width).mul(proportion9).toNumber();
}

/**
 * 是否为移动设备？
 * @returns 
 */
export function _isMobile(): boolean {
    let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
    return !!flag;
}

/**
 * 加密算法
 * @param {*} word 明文
 * @param {*} keyStr 密钥
 * @returns 加密后的数据
 */
export function encodeRSA(word: string, keyStr: string): string | false {
    //这个是公钥,有入参时用入参，没有入参用默认公钥
    keyStr = keyStr ? keyStr : public_key;
    //创建对象
    const jsRsa = new JSEncrypt();
    //设置公钥
    jsRsa.setPublicKey(keyStr);
    //返回加密后结果
    return jsRsa.encrypt(word);
}

//用户代理
const ua = navigator.userAgent.toLowerCase()

//设备类型
export const isMobile = isMobileJS(ua).any
export const isPhone = isMobileJS(ua).phone
export const isAndroid = isMobileJS(ua).android
export const isApple = isMobileJS(ua).apple && isMobileJS(ua).apple.device
export const isTencentGroup = /MQQBrowser/i.test(ua)
export const isUC = /ucbrowser/i.test(ua)
export const isChrome = /chrome/i.test(ua)
export const isWechat = /MicroMessenger/i.test(ua)
export const isFirefox = /firefox/i.test(ua)


export default {
    encodeRSA,_isMobile,calculateHigh
  }