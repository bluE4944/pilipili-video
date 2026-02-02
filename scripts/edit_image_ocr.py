#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图片编辑脚本：使用OCR定位并替换图片中的"2024"为"2026"
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import pytesseract
    from pytesseract import Output
    import cv2
    import numpy as np
    HAS_LIBS = True
except ImportError:
    HAS_LIBS = False
    print("警告: 缺少必要的库。请安装: pip install Pillow pytesseract opencv-python")

def find_text_positions(img, text="2024"):
    """
    使用OCR查找文本在图片中的位置
    """
    # 转换为OpenCV格式
    img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    
    # 使用pytesseract进行OCR
    data = pytesseract.image_to_data(img_cv, output_type=Output.DICT, lang='chi_sim+eng')
    
    # 查找包含目标文本的边界框
    positions = []
    n_boxes = len(data['text'])
    for i in range(n_boxes):
        if text in data['text'][i]:
            x = data['left'][i]
            y = data['top'][i]
            w = data['width'][i]
            h = data['height'][i]
            positions.append((x, y, w, h))
    
    return positions

def edit_image_with_ocr(input_path, output_path):
    """
    使用OCR定位并编辑图片
    """
    if not HAS_LIBS:
        print("错误: 缺少必要的库")
        return False
    
    # 打开图片
    img = Image.open(input_path)
    draw = ImageDraw.Draw(img)
    
    # 查找所有"2024"的位置
    try:
        positions = find_text_positions(img, "2024")
        print(f"找到 {len(positions)} 处'2024'")
    except Exception as e:
        print(f"OCR识别失败: {e}")
        print("将使用手动定位方法...")
        return edit_image_manual(input_path, output_path)
    
    if not positions:
        print("未找到'2024'，尝试手动定位...")
        return edit_image_manual(input_path, output_path)
    
    # 加载字体
    width, height = img.size
    font_size = int(height * 0.025)
    
    font_paths = [
        "C:/Windows/Fonts/simsun.ttc",
        "C:/Windows/Fonts/msyh.ttc",
        "C:/Windows/Fonts/simhei.ttf",
    ]
    
    font = None
    for font_path in font_paths:
        if os.path.exists(font_path):
            try:
                font = ImageFont.truetype(font_path, font_size)
                break
            except:
                continue
    
    if font is None:
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
    
    white = (255, 255, 255)
    black = (0, 0, 0)
    
    # 替换每一处"2024"
    for x, y, w, h in positions:
        # 绘制白色矩形覆盖
        draw.rectangle([x, y, x + w, y + h], fill=white)
        # 绘制"2026"
        draw.text((x, y), "2026", fill=black, font=font)
    
    # 保存图片
    img.save(output_path, "PNG")
    print(f"图片已保存到: {output_path}")
    return True

def edit_image_manual(input_path, output_path):
    """
    手动定位并编辑图片（备用方法）
    """
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        print("错误: 需要安装Pillow库")
        return False
    
    img = Image.open(input_path)
    draw = ImageDraw.Draw(img)
    width, height = img.size
    
    # 加载字体
    font_size = int(height * 0.025)
    font_paths = [
        "C:/Windows/Fonts/simsun.ttc",
        "C:/Windows/Fonts/msyh.ttc",
        "C:/Windows/Fonts/simhei.ttf",
    ]
    
    font = None
    for font_path in font_paths:
        if os.path.exists(font_path):
            try:
                font = ImageFont.truetype(font_path, font_size)
                break
            except:
                continue
    
    if font is None:
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
    
    white = (255, 255, 255)
    black = (0, 0, 0)
    
    # 根据图片描述手动定位（需要根据实际图片调整）
    # 有效期位置
    date_x = int(width * 0.30)
    date_y = int(height * 0.20)
    date_w = int(width * 0.08)
    date_h = int(height * 0.03)
    
    # 报告编号位置（两处）
    report_x1 = int(width * 0.40)
    report_y1 = int(height * 0.50)
    report_x2 = int(width * 0.40)
    report_y2 = int(height * 0.52)
    report_w = int(width * 0.08)
    report_h = int(height * 0.03)
    
    # 替换有效期中的"2024"
    draw.rectangle([date_x, date_y, date_x + date_w, date_y + date_h], fill=white)
    draw.text((date_x, date_y), "2026", fill=black, font=font)
    
    # 替换报告编号中的"2024"（第一处）
    draw.rectangle([report_x1, report_y1, report_x1 + report_w, report_y1 + report_h], fill=white)
    draw.text((report_x1, report_y1), "2026", fill=black, font=font)
    
    # 替换报告编号中的"2024"（第二处）
    draw.rectangle([report_x2, report_y2, report_x2 + report_w, report_y2 + report_h], fill=white)
    draw.text((report_x2, report_y2), "2026", fill=black, font=font)
    
    img.save(output_path, "PNG")
    print(f"图片已保存到: {output_path}")
    return True

if __name__ == "__main__":
    import os
    
    input_image = r"C:\Users\11940\.cursor\projects\d-workspace-pilipili-video\assets\c__Users_11940_AppData_Roaming_Cursor_User_workspaceStorage_e5bddcc666cc9054cf1c033b71c0dcb6_images______20260201113727_1_219-e5a46883-a21c-4dd3-8a3a-1f412d3185af.png"
    
    base_name = os.path.splitext(input_image)[0]
    output_image = f"{base_name}_edited.png"
    
    try:
        # 先尝试OCR方法
        if HAS_LIBS:
            success = edit_image_with_ocr(input_image, output_image)
        else:
            success = edit_image_manual(input_image, output_image)
        
        if success:
            print("图片编辑完成！")
        else:
            print("图片编辑失败，请检查错误信息")
    except Exception as e:
        print(f"错误: {e}")
        import traceback
        traceback.print_exc()
