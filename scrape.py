import base64
import json
import io
from typing import Optional, Dict, Any
from PIL import Image, ImageEnhance, ImageFilter
import sys
import os
from dotenv import load_dotenv

# 强制加载环境变量
load_dotenv(override=True)

# 添加项目根目录到路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

class GeminiInvoiceOCRService:
    def __init__(self):
        # 加载环境变量
        load_dotenv(override=True)
        
        # 获取 API Keys
        self.gemini_api_key = (
            os.getenv("GEMINI_API_KEY") or 
            os.getenv("GOOGLE_API_KEY") or
            os.environ.get("GEMINI_API_KEY") or
            os.environ.get("GOOGLE_API_KEY")
        )
        
        print(f"🔑 Gemini API Key: {'已配置' if self.gemini_api_key else '未配置'}")
        
        if not self.gemini_api_key:
            print("❌ Gemini API Key未配置")
            self.client = None
        else:
            try:
                import google.generativeai as genai
                
                # 配置 Gemini
                genai.configure(api_key=self.gemini_api_key)
                
                # 创建模型实例
                self.model = genai.GenerativeModel(
                    model_name="gemini-2.0-flash-exp",  # 使用最新的 Gemini 2.0 Flash
                    generation_config={
                        "temperature": 0.1,  # 低温度保证稳定性
                        "top_p": 0.8,
                        "top_k": 40,
                        "max_output_tokens": 4096,
                    },
                    safety_settings=[
                        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
                    ]
                )
                
                self.client = genai
                print("✅ Gemini 2.0 Flash 客户端初始化成功")
                
            except ImportError:
                print("❌ google-generativeai 库未安装")
                print("💡 请运行: pip install google-generativeai")
                self.client = None
            except Exception as e:
                print(f"❌ Gemini 客户端初始化失败: {e}")
                self.client = None
    
    def advanced_image_preprocessing(self, image_bytes: bytes) -> bytes:
        """高级图像预处理 - 针对各种发票格式优化"""
        try:
            image = Image.open(io.BytesIO(image_bytes))
            original_size = (image.width, image.height)
            print(f"📷 原始图像: {original_size[0]}x{original_size[1]}, 模式: {image.mode}")
            
            # 1. 转换为RGB
            if image.mode != 'RGB':
                image = image.convert('RGB')
                print("🎨 转换为RGB模式")
            
            # 2. 尺寸优化 - 保持足够清晰度的同时控制大小
            max_dimension = 2048
            if max(image.width, image.height) > max_dimension:
                ratio = max_dimension / max(image.width, image.height)
                new_size = (int(image.width * ratio), int(image.height * ratio))
                image = image.resize(new_size, Image.Resampling.LANCZOS)
                print(f"📏 尺寸调整: {new_size[0]}x{new_size[1]}")
            
            # 3. 图像增强处理
            # 锐化处理 - 提高文字清晰度
            image = image.filter(ImageFilter.UnsharpMask(radius=1, percent=150, threshold=3))
            
            # 对比度增强 - 提高文字与背景对比
            enhancer = ImageEnhance.Contrast(image)
            image = enhancer.enhance(1.2)
            
            # 清晰度增强
            enhancer = ImageEnhance.Sharpness(image)
            image = enhancer.enhance(1.1)
            
            # 4. 特殊处理：针对可能的扫描文档
            # 如果图像整体较暗，适当增加亮度
            import numpy as np
            img_array = np.array(image)
            avg_brightness = np.mean(img_array)
            
            if avg_brightness < 120:  # 图像较暗
                enhancer = ImageEnhance.Brightness(image)
                image = enhancer.enhance(1.1)
                print("💡 增强图像亮度")
            
            # 5. 保存为高质量图像
            output = io.BytesIO()
            image.save(output, format='PNG', optimize=True, quality=95)
            processed_bytes = output.getvalue()
            
            size_reduction = (1 - len(processed_bytes) / len(image_bytes)) * 100
            print(f"✨ 图像处理完成，大小变化: {size_reduction:+.1f}%")
            
            return processed_bytes
            
        except Exception as e:
            print(f"⚠️  图像预处理失败: {e}")
            return image_bytes
    
    def build_universal_invoice_prompt(self) -> str:
        """构建通用发票识别提示词 - 适应各种格式"""
        return """你是一个世界级的发票OCR专家，具备识别全球各种发票格式的能力。

## 发票分析任务
请仔细分析这张发票图像，无论其格式、语言或布局如何，都要准确提取所有信息。

## 发票格式适应性
- 支持各种语言：中文、英文、日文、韩文、欧洲语言等
- 支持各种布局：表格式、列表式、自由格式等
- 支持各种类型：商业发票、税务发票、形式发票、收据等
- 支持各种扫描质量：清晰扫描、手机拍照、传真件等

## 识别策略
1. **布局分析**：首先理解整体布局结构
2. **信息定位**：识别关键信息区域（抬头、表格、汇总等）
3. **文字识别**：准确识别所有可见文字，包括数字
4. **逻辑理解**：理解发票的商业逻辑和数字关系
5. **结构化输出**：按标准格式组织信息

## 关键识别要点
- **发票编号**：可能出现在任何位置，各种格式（数字、字母数字组合等）
- **日期信息**：支持各种日期格式（YYYY-MM-DD, DD/MM/YYYY, 中文日期等）
- **公司信息**：买方和卖方的完整信息，包括地址、联系方式
- **商品表格**：仔细扫描整个表格区域，不遗漏任何行
- **金额信息**：识别各种货币符号和数字格式
- **税费信息**：增值税、服务税等
- **其他条款**：付款条件、交货方式等

## 表格识别重点
- 逐行扫描表格，确保不遗漏任何商品项目
- 识别表格边界，即使没有明显的线条
- 理解列的对应关系（商品名-数量-单价-金额）
- 处理合并单元格和特殊格式
- 识别小计、税费、总计等汇总行

## 数字处理
- 正确识别各种数字格式：1,234.56 或 1 234,56 或 1.234,56
- 区分数量、单价、金额
- 验证数学关系：数量 × 单价 = 金额
- 处理百分比、税率等

## 输出要求
请严格按照以下JSON格式输出，确保数据类型正确：

```json
{
    "invoice_number": "发票编号（字符串）",
    "date": "YYYY-MM-DD格式日期",
    "buyer_info": {
        "company_name": "买方公司名称",
        "contact_person": "联系人姓名",
        "phone": "电话号码",
        "address": "完整地址",
        "tax_id": "税号（如果有）"
    },
    "supplier_info": {
        "company_name": "供应商公司名称",
        "address": "供应商地址",
        "phone": "供应商电话",
        "tax_id": "供应商税号",
        "bank_info": "银行信息"
    },
    "items": [
        {
            "item_number": 行号（数字）,
            "product_name": "商品名称（完整）",
            "specification": "规格型号",
            "quantity": 数量（数字）,
            "unit": "单位（件、个、米等）",
            "unit_price": 单价（数字）,
            "amount": 金额（数字）,
            "tax_rate": 税率（数字，如0.13表示13%）
        }
    ],
    "subtotal": 小计金额（数字）,
    "tax_amount": 税费金额（数字）,
    "shipping_cost": 运费（数字）,
    "discount": 折扣金额（数字）,
    "total_amount": 总金额（数字）,
    "currency": "货币代码（USD、CNY、EUR等）",
    "payment_terms": {
        "trade_terms": "贸易条款",
        "payment_method": "付款方式",
        "payment_period": "付款期限",
        "delivery": "交货条款"
    },
    "additional_info": {
        "notes": "备注信息",
        "stamps": "印章信息",
        "signatures": "签名信息"
    }
}
```

## 重要提醒
1. **只输出JSON**，不要添加任何解释文字或markdown标记
2. **数字字段必须是数字类型**，不要包含货币符号或逗号
3. **如果信息不存在或无法识别，使用null**
4. **确保JSON格式完全正确**，可以被直接解析
5. **商品列表要完整**，不要遗漏任何行
6. **金额计算要准确**，验证数学关系

现在开始分析图像："""
    
    async def extract_invoice_data(self, image_bytes: bytes):
        """使用Gemini进行发票数据提取"""
        from app.schemas.invoice import OCRResult
        
        if not self.client:
            return OCRResult(
                success=False,
                error_message="Gemini客户端未初始化"
            )
        
        try:
            print("🔄 开始Gemini OCR处理...")
            
            # 高级图像预处理
            processed_image = self.advanced_image_preprocessing(image_bytes)
            
            # 准备图像数据
            image_data = {
                'mime_type': 'image/png',
                'data': processed_image
            }
            
            # 构建提示词
            prompt = self.build_universal_invoice_prompt()
            
            print("📡 调用Gemini 2.0 Flash API...")
            
            # 调用Gemini API
            response = self.model.generate_content([prompt, image_data])
            
            if not response.text:
                return OCRResult(
                    success=False,
                    error_message="Gemini返回空响应"
                )
            
            print(f"📝 收到Gemini响应: {len(response.text)} 字符")
            
            # 解析JSON响应
            cleaned_json = self._extract_json_from_response(response.text)
            
            if not cleaned_json:
                return OCRResult(
                    success=False,
                    error_message="无法从Gemini响应中提取有效JSON"
                )
            
            print("🔧 解析JSON数据...")
            invoice_dict = json.loads(cleaned_json)
            
            # 数据清理和验证
            validated_data = self._comprehensive_data_validation(invoice_dict)
            
            # 创建发票对象
            from app.schemas.invoice import InvoiceData
            invoice_data = InvoiceData(**validated_data)
            
            # 计算置信度
            confidence = self._calculate_confidence_score(invoice_data, invoice_dict)
            
            print(f"🎯 Gemini OCR完成! 识别到 {len(invoice_data.items)} 个项目，置信度: {confidence:.2f}")
            
            return OCRResult(
                success=True,
                extracted_data=invoice_data,
                confidence_score=confidence
            )
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON解析失败: {e}")
            return OCRResult(
                success=False,
                error_message=f"JSON解析错误: {str(e)}"
            )
        except Exception as e:
            print(f"❌ Gemini OCR处理失败: {e}")
            return OCRResult(
                success=False,
                error_message=f"OCR处理失败: {str(e)}"
            )
    
    def _extract_json_from_response(self, response_text: str) -> Optional[str]:
        """从Gemini响应中提取JSON"""
        try:
            # 移除可能的markdown格式
            text = response_text.strip()
            
            # 移除```json和```
            if '```json' in text:
                start = text.find('```json') + 7
                end = text.find('```', start)
                if end > start:
                    text = text[start:end]
            elif '```' in text:
                start = text.find('```') + 3
                end = text.find('```', start)
                if end > start:
                    text = text[start:end]
            
            # 查找JSON对象
            start_idx = text.find('{')
            end_idx = text.rfind('}')
            
            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                json_text = text[start_idx:end_idx + 1]
                
                # 验证JSON有效性
                json.loads(json_text)
                return json_text
            
            return None
            
        except Exception as e:
            print(f"❌ JSON提取失败: {e}")
            return None
    
    def _comprehensive_data_validation(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """全面的数据验证和清理"""
        print("🔍 进行全面数据验证...")
        
        # 确保基本结构存在
        default_structure = {
            'invoice_number': '',
            'date': '',
            'buyer_info': {},
            'supplier_info': {},
            'items': [],
            'subtotal': 0.0,
            'tax_amount': 0.0,
            'shipping_cost': 0.0,
            'discount': 0.0,
            'total_amount': 0.0,
            'currency': 'USD',
            'payment_terms': {},
            'additional_info': {}
        }
        
        # 合并默认结构
        for key, default_value in default_structure.items():
            if key not in data:
                data[key] = default_value
        
        # 清理商品数据
        if 'items' in data and isinstance(data['items'], list):
            cleaned_items = []
            for i, item in enumerate(data['items']):
                if isinstance(item, dict):
                    cleaned_item = self._clean_item_data(item, i + 1)
                    if cleaned_item['product_name']:  # 只保留有产品名的项目
                        cleaned_items.append(cleaned_item)
                        print(f"✅ 商品 {len(cleaned_items)}: {cleaned_item['product_name']}")
            
            data['items'] = cleaned_items
        
        # 清理金额字段
        amount_fields = ['subtotal', 'tax_amount', 'shipping_cost', 'discount', 'total_amount']
        for field in amount_fields:
            data[field] = self._clean_amount(data.get(field, 0))
        
        # 验证金额逻辑
        self._validate_amount_logic(data)
        
        # 清理日期格式
        data['date'] = self._clean_date(data.get('date', ''))
        
        # 确保信息字典结构
        for info_field in ['buyer_info', 'supplier_info', 'payment_terms', 'additional_info']:
            if not isinstance(data.get(info_field), dict):
                data[info_field] = {}
        
        print(f"✅ 数据验证完成，包含 {len(data['items'])} 个有效商品")
        return data
    
    def _clean_item_data(self, item: Dict[str, Any], default_number: int) -> Dict[str, Any]:
        """清理单个商品数据"""
        return {
            'item_number': item.get('item_number', default_number),
            'product_name': str(item.get('product_name', '')).strip(),
            'specification': str(item.get('specification', '')).strip(),
            'quantity': max(1, self._safe_number_conversion(item.get('quantity', 1), int)),
            'unit_price': self._clean_amount(item.get('unit_price', 0)),
            'amount': self._clean_amount(item.get('amount', 0))
        }
    
    def _clean_amount(self, value: Any) -> float:
        """清理金额数据"""
        if value is None:
            return 0.0
        
        try:
            # 如果是字符串，清理格式
            if isinstance(value, str):
                # 移除货币符号和格式字符
                cleaned = value.replace('$', '').replace('¥', '').replace('€', '').replace('£', '')
                cleaned = cleaned.replace(',', '').replace(' ', '').strip()
                
                # 处理不同的小数点格式
                if '.' in cleaned and cleaned.count('.') == 1:
                    # 标准格式：1234.56
                    return float(cleaned)
                elif ',' in cleaned and cleaned.count(',') == 1 and '.' not in cleaned:
                    # 欧洲格式：1234,56
                    return float(cleaned.replace(',', '.'))
                else:
                    # 其他格式，尝试直接转换
                    return float(cleaned)
            
            return float(value)
            
        except (ValueError, TypeError):
            return 0.0
    
    def _clean_date(self, date_value: Any) -> str:
        """清理日期格式"""
        if not date_value:
            return ""
        
        try:
            from datetime import datetime
            
            date_str = str(date_value).strip()
            
            # 尝试各种日期格式
            date_formats = [
                '%Y-%m-%d',
                '%Y/%m/%d',
                '%d/%m/%Y',
                '%m/%d/%Y',
                '%d-%m-%Y',
                '%m-%d-%Y',
                '%Y年%m月%d日',
                '%Y.%m.%d'
            ]
            
            for fmt in date_formats:
                try:
                    dt = datetime.strptime(date_str, fmt)
                    return dt.strftime('%Y-%m-%d')
                except ValueError:
                    continue
            
            # 如果都失败了，返回原值
            return date_str
            
        except Exception:
            return str(date_value)
    
    def _safe_number_conversion(self, value: Any, target_type) -> int:
        """安全的数字转换"""
        try:
            if isinstance(value, str):
                value = value.replace(',', '').strip()
            return target_type(float(value))
        except (ValueError, TypeError):
            return 1 if target_type == int else 0.0
    
    def _validate_amount_logic(self, data: Dict[str, Any]) -> None:
        """验证金额逻辑"""
        items = data.get('items', [])
        if not items:
            return
        
        # 计算商品总额
        calculated_subtotal = sum(item.get('amount', 0) for item in items)
        
        # 如果小计为0但有商品，用计算值
        if data['subtotal'] == 0 and calculated_subtotal > 0:
            data['subtotal'] = calculated_subtotal
            print(f"💡 自动设置小计: {calculated_subtotal}")
        
        # 如果总计为0，尝试计算
        if data['total_amount'] == 0:
            calculated_total = (data['subtotal'] + 
                              data.get('tax_amount', 0) + 
                              data.get('shipping_cost', 0) - 
                              data.get('discount', 0))
            if calculated_total > 0:
                data['total_amount'] = calculated_total
                print(f"💡 自动设置总计: {calculated_total}")
    
    def _calculate_confidence_score(self, invoice_data, raw_dict: Dict[str, Any]) -> float:
        """计算识别置信度"""
        score = 0.0
        max_score = 100.0
        
        # 基本信息 (25分)
        if invoice_data.invoice_number:
            score += 15
        if invoice_data.date:
            score += 10
        
        # 公司信息 (20分)
        if invoice_data.supplier_info and invoice_data.supplier_info.get('company_name'):
            score += 15
        if invoice_data.buyer_info and invoice_data.buyer_info.get('company_name'):
            score += 5
        
        # 商品信息 (35分)
        if invoice_data.items:
            score += 15  # 有商品基础分
            
            # 商品完整性
            complete_items = sum(1 for item in invoice_data.items 
                               if item.product_name and item.quantity > 0 and item.amount > 0)
            
            if complete_items > 0:
                completeness = min(1.0, complete_items / len(invoice_data.items))
                score += 20 * completeness
        
        # 金额一致性 (20分)
        if invoice_data.items:
            calculated_subtotal = sum(item.quantity * item.unit_price for item in invoice_data.items)
            
            if invoice_data.subtotal > 0:
                error_ratio = abs(calculated_subtotal - invoice_data.subtotal) / invoice_data.subtotal
                if error_ratio < 0.01:
                    score += 15
                elif error_ratio < 0.05:
                    score += 10
                elif error_ratio < 0.1:
                    score += 5
            
            # 总计验证
            if invoice_data.total_amount > 0:
                score += 5
        
        return min(1.0, score / max_score)
    
    async def validate_extraction(self, extracted_data) -> Dict[str, Any]:
        """验证提取结果"""
        issues = []
        warnings = []
        
        # 基本验证
        if not extracted_data.invoice_number:
            warnings.append("未识别到发票编号")
        
        if not extracted_data.items:
            issues.append("未识别到任何商品项目")
        else:
            # 商品验证
            for i, item in enumerate(extracted_data.items):
                if not item.product_name:
                    issues.append(f"商品 {i+1} 缺少名称")
                
                # 金额验证
                expected_amount = item.quantity * item.unit_price
                if abs(expected_amount - item.amount) > 0.01:
                    warnings.append(f"商品 {i+1} 金额计算差异: 期望 {expected_amount:.2f}")
        
        # 总金额验证
        if extracted_data.items:
            calculated_subtotal = sum(item.amount for item in extracted_data.items)
            
            if extracted_data.subtotal > 0:
                diff = abs(calculated_subtotal - extracted_data.subtotal)
                if diff > 0.01:
                    warnings.append(f"小计差异: {diff:.2f}")
        
        is_valid = len(issues) == 0
        confidence = max(0.0, 1.0 - (len(issues) * 0.2 + len(warnings) * 0.1))
        
        return {
            "is_valid": is_valid,
            "issues": issues,
            "warnings": warnings,
            "confidence": confidence,
            "items_count": len(extracted_data.items),
            "validation_summary": f"发现 {len(issues)} 个错误, {len(warnings)} 个警告"
        }