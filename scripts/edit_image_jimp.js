/**
 * 图片编辑脚本：将图片中的"2024"替换为"2026"
 * 使用jimp库进行图片处理
 * 
 * 安装依赖: npm install jimp
 */

const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

async function editImage(inputPath, outputPath) {
    try {
        // 读取图片
        const image = await Jimp.read(inputPath);
        const width = image.bitmap.width;
        const height = image.bitmap.height;
        
        // 加载字体（jimp内置字体）
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        const whiteFont = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
        
        // 根据图片描述，需要修改两处：
        // 1. 有效期日期："2015.09.09-2024.09.08" -> "2015.09.09-2026.09.08"
        // 2. 报告编号："2024-15SS102081" -> "2026-15SS102081"（两处）
        
        // 估算位置（基于图片描述）
        // 有效期位置：大约在顶部20%，左侧30%的位置
        const dateX = Math.floor(width * 0.30);
        const dateY = Math.floor(height * 0.20);
        const dateWidth = Math.floor(width * 0.08);
        const dateHeight = Math.floor(height * 0.03);
        
        // 报告编号位置：大约在中间50%，左侧40%的位置
        const reportX1 = Math.floor(width * 0.40);
        const reportY1 = Math.floor(height * 0.50);
        const reportX2 = Math.floor(width * 0.40);
        const reportY2 = Math.floor(height * 0.52);
        const reportWidth = Math.floor(width * 0.08);
        const reportHeight = Math.floor(height * 0.03);
        
        // 绘制白色矩形覆盖"2024"
        // 有效期中的"2024"
        image.scan(dateX, dateY, dateWidth, dateHeight, function (x, y, idx) {
            this.bitmap.data[idx] = 255;     // R
            this.bitmap.data[idx + 1] = 255; // G
            this.bitmap.data[idx + 2] = 255; // B
            // alpha保持不变
        });
        
        // 报告编号中的"2024"（第一处）
        image.scan(reportX1, reportY1, reportWidth, reportHeight, function (x, y, idx) {
            this.bitmap.data[idx] = 255;     // R
            this.bitmap.data[idx + 1] = 255; // G
            this.bitmap.data[idx + 2] = 255; // B
        });
        
        // 报告编号中的"2024"（第二处）
        image.scan(reportX2, reportY2, reportWidth, reportHeight, function (x, y, idx) {
            this.bitmap.data[idx] = 255;     // R
            this.bitmap.data[idx + 1] = 255; // G
            this.bitmap.data[idx + 2] = 255; // B
        });
        
        // 绘制新的"2026"文字
        // 有效期中的"2026"
        image.print(font, dateX, dateY, '2026');
        
        // 报告编号中的"2026"（第一处）
        image.print(font, reportX1, reportY1, '2026');
        
        // 报告编号中的"2026"（第二处）
        image.print(font, reportX2, reportY2, '2026');
        
        // 保存图片
        await image.writeAsync(outputPath);
        
        console.log(`图片已保存到: ${outputPath}`);
        return true;
    } catch (error) {
        console.error('错误:', error.message);
        if (error.message.includes('jimp') || error.message.includes('Cannot find module')) {
            console.error('\n提示: 需要安装jimp库。运行: npm install jimp');
        }
        return false;
    }
}

// 主函数
async function main() {
    const inputImage = path.join(
        'C:',
        'Users',
        '11940',
        '.cursor',
        'projects',
        'd-workspace-pilipili-video',
        'assets',
        'c__Users_11940_AppData_Roaming_Cursor_User_workspaceStorage_e5bddcc666cc9054cf1c033b71c0dcb6_images______20260201113727_1_219-e5a46883-a21c-4dd3-8a3a-1f412d3185af.png'
    );
    
    const baseName = inputImage.replace(/\.png$/, '');
    const outputImage = `${baseName}_edited.png`;
    
    const success = await editImage(inputImage, outputImage);
    if (success) {
        console.log('图片编辑完成！');
    } else {
        console.log('图片编辑失败，请检查错误信息');
    }
}

// 运行
main().catch(console.error);
