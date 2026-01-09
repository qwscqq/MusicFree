import Config from "@/core/appConfig";
import Toast from "@/utils/toast";
import { NativeModule, NativeModules } from "react-native";
import { errorLog } from "@/utils/log.ts";

export enum NativeTextAlignment {
    // 左对齐
    LEFT = 3,
    // 右对齐
    RIGHT = 5,
    // 居中
    CENTER = 17,
}

// 状态栏歌词的工具
interface ILyricUtil extends NativeModule {
    /** 显示状态栏歌词 */
    showStatusBarLyric: (
        initLyric?: string,
        config?: Record<string, any>,
    ) => Promise<void>;
    /** 隐藏状态栏歌词 */
    hideStatusBarLyric: () => Promise<void>;
    /** 设置歌词文本 */
    setStatusBarLyricText: (lyric: string) => Promise<void>;
    /** 设置距离顶部的距离 */
    setStatusBarLyricTop: (percent: number) => Promise<void>;
    /** 设置距离左部的距离 */
    setStatusBarLyricLeft: (percent: number) => Promise<void>;
    /** 设置宽度 */
    setStatusBarLyricWidth: (percent: number) => Promise<void>;
    /** 设置字体 */
    setStatusBarLyricFontSize: (fontSize: number) => Promise<void>;
    /** 设置对齐 */
    setStatusBarLyricAlign: (alignment: NativeTextAlignment) => Promise<void>;
    /** 设置颜色 */
    setStatusBarColors: (
        textColor: string | null,
        backgroundColor: string | null,
    ) => Promise<void>;
    /** 检查权限 */
    checkSystemAlertPermission: () => Promise<boolean>;
    /** 请求悬浮窗 */
    requestSystemAlertPermission: () => Promise<boolean>;
    /** 
     * 解密QRC加密歌词（Native实现）
     * 使用Triple-DES + Zlib解压算法
     * @param encryptedHex - QRC加密的十六进制字符串
     * @returns 解密后的原始文本（可能是XML格式）
     */
    decryptQRCLyric: (encryptedHex: string) => Promise<string>;
    
    /** ========== 蓝牙歌词新增接口 ========== */
    /** 启用/禁用蓝牙歌词 */
    enableBluetoothLyric: (enabled: boolean) => Promise<void>;
    /** 设置蓝牙歌词内容 */
    setBluetoothLyric: (lyricData: string) => Promise<void>;
    /** 检查蓝牙歌词支持 */
    isBluetoothLyricSupported: () => Promise<boolean>;
}

const LyricUtil: ILyricUtil = NativeModules.LyricUtil;

const originalShowStatusBarLyric = LyricUtil.showStatusBarLyric;

const showStatusBarLyric: ILyricUtil["showStatusBarLyric"] = async (
    initLyric,
    config,
) => {
    try {
        await originalShowStatusBarLyric(initLyric, config);
    } catch (e) {
        errorLog("状态栏歌词开启失败", e);
        Toast.warn("状态栏歌词开启失败，请到手机系统设置打开悬浮窗权限");
        Config.setConfig("lyric.showStatusBarLyric", false);
    }
};

LyricUtil.showStatusBarLyric = showStatusBarLyric;

/** ========== 蓝牙歌词封装方法 ========== */

/**
 * 启用蓝牙歌词功能
 */
export const enableBluetoothLyric = async (enabled: boolean): Promise<void> => {
    try {
        await LyricUtil.enableBluetoothLyric(enabled);
    } catch (e) {
        errorLog("蓝牙歌词设置失败", e);
        throw new Error(`蓝牙歌词设置失败: ${e.message}`);
    }
};

/**
 * 设置蓝牙歌词内容
 */
export const setBluetoothLyric = async (lyricData: {
    title: string;
    artist: string;
    lyric: string;
    translation?: string;
    romanization?: string;
}): Promise<void> => {
    try {
        await LyricUtil.setBluetoothLyric(JSON.stringify(lyricData));
    } catch (e) {
        errorLog("蓝牙歌词更新失败", e);
        // 不抛出错误，避免影响正常播放
    }
};

/**
 * 检查设备是否支持蓝牙歌词
 */
export const isBluetoothLyricSupported = async (): Promise<boolean> => {
    try {
        return await LyricUtil.isBluetoothLyricSupported();
    } catch (e) {
        errorLog("蓝牙歌词支持检查失败", e);
        return false;
    }
};

export default LyricUtil;
