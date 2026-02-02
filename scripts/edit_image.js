/**
 * 图片编辑脚本：将图片中的"2024"替换为"2026"
 * 使用sharp和canvas库进行图片处理
 */

const fs = require('fs');
const path = require('path');

// 检查是否安装了必要的库
let sharp, { createCanvas, loadImage, registerFont } = require('canvas');

async function editImage(inputPath, outputPath) {
    try {
        // 加载图片
        const img = await loadImage(inputPath);
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');
        
        // 绘制原图
        ctx.drawImage(img, 0, 0);
        
        // 获取图片尺寸
        const width = img.width;
        const height = img.height;
        
        // 注册中文字体（如果可用）
        const fontPaths = [
            'C:/Windows/Fonts/simsun.ttc',
            'C:/Windows/Fonts/msyh.ttc',
            'C:/Windows/Fonts/simhei.ttf',
        ];
        
        let fontPath = null;
        for (const fp of fontPaths) {
            if (fs.existsSync(fp)) {
                fontPath = fp;
                break;
            }
        }
        
        if (fontPath) {
            registerFont(fontPath, { family: 'ChineseFont' });
        }
        
        // 设置字体大小
        const fontSize = Math.floor(height * 0.025);
        ctx.font = `${fontSize}px ${fontPath ? 'ChineseFont' : 'Arial'}`;
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#FFFFFF';
        
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
        ctx.fillRect(dateX, dateY, dateWidth, dateHeight);
        
        // 报告编号中的"2024"（第一处）
        ctx.fillRect(reportX1, reportY1, reportWidth, reportHeight);
        
        // 报告编号中的"2024"（第二处）
        ctx.fillRect(reportX2, reportY2, reportWidth, reportHeight);
        
        // 绘制新的"2026"文字
        ctx.fillStyle = '#000000';
        
        // 有效期中的"2026"
        ctx.fillText('2026', dateX, dateY + dateHeight);
        
        // 报告编号中的"2026"（第一处）
        ctx.fillText('2026', reportX1, reportY1 + reportHeight);
        
        // 报告编号中的"2026"（第二处）
        ctx.fillText('2026', reportX2, reportY2 + reportHeight);
        
        // 保存图片
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(outputPath, buffer);
        
        console.log(`图片已保存到: ${outputPath}`);
        return true;
    } catch (error) {
        console.error('错误:', error.message);
        if (error.message.includes('canvas')) {
            console.error('\n提示: 需要安装canvas库。运行: npm install canvas');
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
