#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图片编辑脚本：将图片中的"2024"替换为"2026"
"""

from PIL import Image, ImageDraw, ImageFont
import os
import sys

def edit_image(input_path, output_path):
    """
    编辑图片，将"2024"替换为"2026"
    """
    # 打开图片
    img = Image.open(input_path)
    draw = ImageDraw.Draw(img)
    
    # 获取图片尺寸
    width, height = img.size
    
    # 尝试加载中文字体（如果系统有的话）
    # Windows系统常见字体路径
    font_paths = [
        "C:/Windows/Fonts/simsun.ttc",  # 宋体
        "C:/Windows/Fonts/msyh.ttc",    # 微软雅黑
        "C:/Windows/Fonts/simhei.ttf",  # 黑体
    ]
    
    font = None
    for font_path in font_paths:
        if os.path.exists(font_path):
            try:
                # 根据图片大小调整字体大小
                font_size = int(height * 0.025)  # 大约为图片高度的2.5%
                font = ImageFont.truetype(font_path, font_size)
                break
            except:
                continue
    
    if font is None:
        # 如果没有找到字体，使用默认字体
        font_size = int(height * 0.025)
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
    
    # 根据图片描述，需要修改两处：
    # 1. 有效期日期："2015.09.09-2024.09.08" -> "2015.09.09-2026.09.08"
    # 2. 报告编号："2024-15SS102081" -> "2026-15SS102081"（两处）
    
    # 由于无法精确定位，我们需要使用OCR或者手动指定位置
    # 这里使用一个更智能的方法：在整个图片中搜索"2024"并替换
    
    # 方法：使用PIL的文本绘制功能，但需要先找到"2024"的位置
    # 由于PIL没有内置OCR，我们使用一个变通方法：
    # 在图片的特定区域绘制白色矩形覆盖，然后绘制新文字
    
    # 根据图片描述，大致位置：
    # 1. 有效期在顶部偏左，MA标志下方
    # 2. 报告编号在中间，条形码下方
    
    # 估算位置（基于图片描述）：
    # 有效期位置：大约在顶部20%，左侧30%的位置
    # 报告编号位置：大约在中间50%，左侧40%的位置
    
    # 获取文字边界框（估算）
    # 有效期中的"2024"
    date_x = int(width * 0.30)
    date_y = int(height * 0.20)
    date_text_width = int(width * 0.08)  # "2024"的宽度
    date_text_height = int(height * 0.03)  # 文字高度
    
    # 报告编号中的"2024"（两处）
    report_x1 = int(width * 0.40)  # 条形码下方的"2024"
    report_y1 = int(height * 0.50)
    report_x2 = int(width * 0.40)  # 报告编号中的"2024"
    report_y2 = int(height * 0.52)
    report_text_width = int(width * 0.08)
    report_text_height = int(height * 0.03)
    
    # 绘制白色矩形覆盖"2024"
    white = (255, 255, 255)
    
    # 覆盖有效期中的"2024"
    draw.rectangle(
        [date_x, date_y, date_x + date_text_width, date_y + date_text_height],
        fill=white
    )
    
    # 覆盖报告编号中的"2024"（第一处）
    draw.rectangle(
        [report_x1, report_y1, report_x1 + report_text_width, report_y1 + report_text_height],
        fill=white
    )
    
    # 覆盖报告编号中的"2024"（第二处）
    draw.rectangle(
        [report_x2, report_y2, report_x2 + report_text_width, report_y2 + report_text_height],
        fill=white
    )
    
    # 绘制新的"2026"文字
    black = (0, 0, 0)
    
    # 绘制有效期中的"2026"
    draw.text((date_x, date_y), "2026", fill=black, font=font)
    
    # 绘制报告编号中的"2026"（第一处）
    draw.text((report_x1, report_y1), "2026", fill=black, font=font)
    
    # 绘制报告编号中的"2026"（第二处）
    draw.text((report_x2, report_y2), "2026", fill=black, font=font)
    
    # 保存图片
    img.save(output_path, "PNG")
    print(f"图片已保存到: {output_path}")

if __name__ == "__main__":
    # 图片路径
    input_image = r"C:\Users\11940\.cursor\projects\d-workspace-pilipili-video\assets\c__Users_11940_AppData_Roaming_Cursor_User_workspaceStorage_e5bddcc666cc9054cf1c033b71c0dcb6_images______20260201113727_1_219-e5a46883-a21c-4dd3-8a3a-1f412d3185af.png"
    
    # 输出路径（在同一目录下，添加_edited后缀）
    base_name = os.path.splitext(input_image)[0]
    output_image = f"{base_name}_edited.png"
    
    try:
        edit_image(input_image, output_image)
        print("图片编辑完成！")
    except Exception as e:
        print(f"错误: {e}")
        import traceback
        traceback.print_exc()
