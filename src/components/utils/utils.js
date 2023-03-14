import {Decimal} from "decimal.js";
import isMobileJS from 'ismobilejs';

//16:9
const proportion16 = new Decimal(16).div(new Decimal(9)) ;

const proportion9 = new Decimal(9).div(new Decimal(16));

/**
 * 计算高 16：9
 * @param width 宽
 */
export function calculateHigh(width) {
    if(!width){
        return null;
    }
    return new Decimal(width).mul(proportion9).toNumber();
}

/**
 * 是否为移动设备？
 * @returns 
 */
export function _isMobile() {
    let flag = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
    return !!flag;
}




//用户代理
const ua = navigator.userAgent.toLowerCase()

export const isMobile = isMobileJS(ua).any
export const isPhone = isMobileJS(ua).phone
export const isAndroid = isMobileJS(ua).android
export const isApple = isMobileJS(ua).apple && isMobileJS(ua).apple.device
export const isSafari = isApple && _isSafari()
export const isTencentGroup = /MQQBrowser/i.test(ua)
export const isUC = /ucbrowser/i.test(ua)
export const isChrome = /chrome/i.test(ua)
export const isWechat = /MicroMessenger/i.test(ua)
export const isFirefox = /firefox/i.test(ua)
