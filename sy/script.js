// 全局变量
let originalImage = null;
let watermarkedImageUrl = null;
let watermarkImage = null; // 水印图片

// DOM元素
const elements = {
    imageUpload: document.getElementById('image-upload'),
    selectedFileInfo: document.getElementById('selected-file-info'),
    fileName: document.getElementById('file-name'),
    removeFile: document.getElementById('remove-file'),
    watermarkType: document.querySelectorAll('input[name="watermark-type"]'),
    watermarkText: document.getElementById('watermark-text'),
    watermarkColor: document.getElementById('watermark-color'),
    watermarkOpacity: document.getElementById('watermark-opacity'),
    opacityValue: document.getElementById('opacity-value'),
    watermarkAngle: document.getElementById('watermark-angle'),
    angleValue: document.getElementById('angle-value'),
    watermarkSpacing: document.getElementById('watermark-spacing'),
    spacingValue: document.getElementById('spacing-value'),
    watermarkFontSize: document.getElementById('watermark-font-size'),
    fontSizeValue: document.getElementById('font-size-value'),
    watermarkImageUpload: document.getElementById('watermark-image-upload'),
    watermarkImageInfo: document.getElementById('watermark-image-info'),
    watermarkImageName: document.getElementById('watermark-image-name'),
    removeWatermarkImage: document.getElementById('remove-watermark-image'),
    watermarkImageSize: document.getElementById('watermark-image-size'),
    imageSizeValue: document.getElementById('image-size-value'),
    watermarkBlendMode: document.getElementById('watermark-blend-mode'),
    watermarkPositions: document.querySelectorAll('input[name="watermark-position"]'),
    outputFormat: document.getElementById('output-format'),
    autoRefresh: document.getElementById('auto-refresh'),
    previewPlaceholder: document.getElementById('preview-placeholder'),
    previewCanvas: document.getElementById('preview-canvas'),
    watermarkedImage: document.getElementById('watermarked-image'),
    downloadBtn: document.getElementById('download-btn'),

}



// 初始化函数
function init() {
    // 设置事件监听器
    setupEventListeners();
}

// 设置事件监听器
function setupEventListeners() {
    // 文件上传
    elements.imageUpload.addEventListener('change', handleFileUpload);
    elements.removeFile.addEventListener('click', removeFile);
    
    // 水印参数变化
    elements.watermarkOpacity.addEventListener('input', updateOpacityValue);
    elements.watermarkAngle.addEventListener('input', updateAngleValue);
    elements.watermarkSpacing.addEventListener('input', updateSpacingValue);
    elements.watermarkFontSize.addEventListener('input', updateFontSizeValue);
    elements.watermarkImageSize.addEventListener('input', updateImageSizeValue);
    
    // 水印类型切换
    elements.watermarkType.forEach(radio => {
        radio.addEventListener('change', toggleWatermarkType);
    });
    
    // 水印图片上传
    elements.watermarkImageUpload.addEventListener('change', handleWatermarkImageUpload);
    elements.removeWatermarkImage.addEventListener('click', removeWatermarkImage);
    
    // 自动刷新预览
    elements.autoRefresh.addEventListener('change', handleAutoRefreshChange);
    
    // 水印参数变化时刷新预览
    const watermarkControls = [
        elements.watermarkText,
        elements.watermarkColor,
        elements.watermarkOpacity,
        elements.watermarkAngle,
        elements.watermarkSpacing,
        elements.watermarkFontSize,
        elements.watermarkImageSize,
        elements.watermarkBlendMode,
        elements.outputFormat
    ];
    
    watermarkControls.forEach(control => {
        control.addEventListener('change', () => {
            if (elements.autoRefresh.checked && originalImage) {
                applyWatermark();
            }
        });
    });
    
    // 水印位置变化时刷新预览
    elements.watermarkPositions.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // 当选择平铺时，取消其他位置选择
            if (checkbox.value === 'tiled' && checkbox.checked) {
                elements.watermarkPositions.forEach(cb => {
                    if (cb.value !== 'tiled') {
                        cb.checked = false;
                    }
                });
            } 
            // 当选择其他位置时，取消平铺选择
            else if (checkbox.value !== 'tiled' && checkbox.checked) {
                elements.watermarkPositions.forEach(cb => {
                    if (cb.value === 'tiled') {
                        cb.checked = false;
                    }
                });
            }
            
            if (elements.autoRefresh.checked && originalImage) {
                applyWatermark();
            }
        });
    });
    
    // 预览图片点击下载
    elements.watermarkedImage.addEventListener('click', downloadWatermarkedImage);
    elements.downloadBtn.addEventListener('click', downloadWatermarkedImage);
}

// 处理文件上传
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // 验证文件类型
        const validTypes = ['image/png', 'image/jpeg', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            alert('请上传PNG、JPG或GIF格式的图片');
            elements.imageUpload.value = '';
            return;
        }
        
        // 显示文件信息
        elements.fileName.textContent = file.name;
        elements.selectedFileInfo.classList.remove('hidden');
        
        // 读取图片文件
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage = new Image();
            originalImage.onload = function() {
                // 应用水印
                applyWatermark();
            };
            originalImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// 移除文件
function removeFile() {
    elements.imageUpload.value = '';
    elements.selectedFileInfo.classList.add('hidden');
    elements.previewPlaceholder.classList.remove('hidden');
    elements.watermarkedImage.classList.add('hidden');
    elements.downloadBtn.classList.add('hidden');
    elements.downloadBtn.disabled = true;
    originalImage = null;
    watermarkedImageUrl = null;
}

// 更新透明度显示值
function updateOpacityValue() {
    elements.opacityValue.textContent = elements.watermarkOpacity.value;
}

// 更新角度显示值
function updateAngleValue() {
    elements.angleValue.textContent = elements.watermarkAngle.value;
}

// 更新间隔显示值
function updateSpacingValue() {
    elements.spacingValue.textContent = elements.watermarkSpacing.value;
}

// 更新字体大小显示值
function updateFontSizeValue() {
    elements.fontSizeValue.textContent = elements.watermarkFontSize.value;
}

// 更新水印图片大小显示值
function updateImageSizeValue() {
    elements.imageSizeValue.textContent = elements.watermarkImageSize.value;
}

// 处理自动刷新变化
function handleAutoRefreshChange() {
    if (elements.autoRefresh.checked && originalImage) {
        applyWatermark();
    }
}

// 切换水印类型
function toggleWatermarkType() {
    const isTextWatermark = document.querySelector('input[name="watermark-type"][value="text"]').checked;
    
    // 显示或隐藏对应的选项
    document.querySelectorAll('.text-watermark-options').forEach(el => {
        el.classList.toggle('hidden', !isTextWatermark);
    });
    
    document.querySelectorAll('.image-watermark-options').forEach(el => {
        el.classList.toggle('hidden', isTextWatermark);
    });
    
    // 如果启用自动刷新且有原图，则重新应用水印
    if (elements.autoRefresh.checked && originalImage) {
        applyWatermark();
    }
}

// 处理水印图片上传
function handleWatermarkImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // 验证文件类型
        const validTypes = ['image/png', 'image/jpeg', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            alert('请上传PNG、JPG或GIF格式的图片');
            elements.watermarkImageUpload.value = '';
            return;
        }
        
        // 显示文件信息
        elements.watermarkImageName.textContent = file.name;
        elements.watermarkImageInfo.classList.remove('hidden');
        
        // 读取图片文件
        const reader = new FileReader();
        reader.onload = function(e) {
            watermarkImage = new Image();
            watermarkImage.onload = function() {
                // 如果是图片水印且启用自动刷新，则应用水印
                const isImageWatermark = document.querySelector('input[name="watermark-type"][value="image"]').checked;
                if (isImageWatermark && elements.autoRefresh.checked && originalImage) {
                    applyWatermark();
                }
            };
            watermarkImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// 移除水印图片
function removeWatermarkImage() {
    elements.watermarkImageUpload.value = '';
    elements.watermarkImageInfo.classList.add('hidden');
    watermarkImage = null;
    
    // 如果是图片水印且启用自动刷新，则重新应用水印
    const isImageWatermark = document.querySelector('input[name="watermark-type"][value="image"]').checked;
    if (isImageWatermark && elements.autoRefresh.checked && originalImage) {
        applyWatermark();
    }
}

// 应用水印
function applyWatermark() {
    if (!originalImage) return;
    
    const canvas = elements.previewCanvas;
    const ctx = canvas.getContext('2d');
    
    // 设置画布尺寸
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    
    // 绘制原图
    ctx.drawImage(originalImage, 0, 0);
    
    // 获取水印参数
    const opacity = parseInt(elements.watermarkOpacity.value) / 100;
    const isTextWatermark = document.querySelector('input[name="watermark-type"][value="text"]').checked;
    
    // 设置全局透明度
    ctx.globalAlpha = opacity;
    
    // 获取选中的水印位置
    const selectedPositions = Array.from(elements.watermarkPositions)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    // 应用水印
    if (isTextWatermark) {
        applyTextWatermark(ctx, selectedPositions);
    } else {
        applyImageWatermark(ctx, selectedPositions);
    }
    
    // 生成水印图片URL
    const format = elements.outputFormat.value;
    if (format === 'jpg') {
        // 对于JPG，需要在白色背景上重新绘制
        const jpgCanvas = document.createElement('canvas');
        jpgCanvas.width = canvas.width;
        jpgCanvas.height = canvas.height;
        const jpgCtx = jpgCanvas.getContext('2d');
        
        // 填充白色背景
        jpgCtx.fillStyle = '#ffffff';
        jpgCtx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);
        
        // 绘制水印后的图像
        jpgCtx.drawImage(canvas, 0, 0);
        
        watermarkedImageUrl = jpgCanvas.toDataURL('image/jpeg', 0.9);
    } else {
        // 对于PNG，直接导出
        watermarkedImageUrl = canvas.toDataURL('image/png');
    }
    
    // 更新预览
    elements.previewPlaceholder.classList.add('hidden');
    elements.watermarkedImage.src = watermarkedImageUrl;
    elements.watermarkedImage.classList.remove('hidden');
    elements.downloadBtn.classList.remove('hidden');
    elements.downloadBtn.disabled = false;
}

// 应用文本水印
function applyTextWatermark(ctx, selectedPositions) {
    const text = elements.watermarkText.value || '请勿外传';
    const color = elements.watermarkColor.value;
    const angle = parseInt(elements.watermarkAngle.value) * Math.PI / 180;
    const spacing = parseInt(elements.watermarkSpacing.value);
    const fontSize = parseInt(elements.watermarkFontSize.value);
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    
    // 保存当前的合成操作
    const originalComposite = ctx.globalCompositeOperation;
    
    // 设置文本样式
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px Arial`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    
    // 计算文本尺寸
    const textWidth = ctx.measureText(text).width;
    
    // 处理选中的位置
    selectedPositions.forEach(position => {
        if (position === 'tiled') {
            // 平铺全屏
            const textHeight = fontSize;
            const diagonal = Math.sqrt(textWidth * textWidth + textHeight * textHeight);
            const gridSize = diagonal + spacing * 2;
            
            // 计算水印网格的起始位置
            const offsetX = -gridSize;
            const offsetY = -gridSize;
            const cols = Math.ceil((canvasWidth + gridSize * 2) / gridSize);
            const rows = Math.ceil((canvasHeight + gridSize * 2) / gridSize);
            
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const x = offsetX + col * gridSize;
                    const y = offsetY + row * gridSize;
                    
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(angle);
                    ctx.fillText(text, 0, 0);
                    ctx.restore();
                }
            }
        } else {
            // 四个角落位置
            ctx.save();
            
            let x, y;
            const margin = 20; // 边距
            
            switch(position) {
                case 'top-left':
                    x = margin + textWidth / 2;
                    y = margin + fontSize / 2;
                    ctx.textAlign = 'left';
                    break;
                case 'top-right':
                    x = canvasWidth - margin - textWidth / 2;
                    y = margin + fontSize / 2;
                    ctx.textAlign = 'right';
                    break;
                case 'bottom-left':
                    x = margin + textWidth / 2;
                    y = canvasHeight - margin - fontSize / 2;
                    ctx.textAlign = 'left';
                    break;
                case 'bottom-right':
                    x = canvasWidth - margin - textWidth / 2;
                    y = canvasHeight - margin - fontSize / 2;
                    ctx.textAlign = 'right';
                    break;
            }
            
            // 不旋转角落水印
            ctx.fillText(text, x, y);
            ctx.restore();
        }
    });
    
    // 恢复原始合成操作
    ctx.globalCompositeOperation = originalComposite;
}

// 应用图片水印
function applyImageWatermark(ctx, selectedPositions) {
    if (!watermarkImage) return;
    
    const sizePercent = parseInt(elements.watermarkImageSize.value) / 100;
    const blendMode = elements.watermarkBlendMode.value;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    
    // 保存当前的合成操作
    const originalComposite = ctx.globalCompositeOperation;
    
    // 计算水印图片尺寸
    const watermarkWidth = watermarkImage.width * sizePercent;
    const watermarkHeight = watermarkImage.height * sizePercent;
    
    // 处理选中的位置
    selectedPositions.forEach(position => {
        if (position === 'tiled') {
            // 平铺全屏
            const spacing = 40; // 图片水印间距
            const gridWidth = watermarkWidth + spacing;
            const gridHeight = watermarkHeight + spacing;
            
            // 计算水印网格的起始位置
            const offsetX = -watermarkWidth;
            const offsetY = -watermarkHeight;
            const cols = Math.ceil((canvasWidth + watermarkWidth * 2) / gridWidth);
            const rows = Math.ceil((canvasHeight + watermarkHeight * 2) / gridHeight);
            
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const x = offsetX + col * gridWidth;
                    const y = offsetY + row * gridHeight;
                    ctx.save();
                    ctx.globalCompositeOperation = blendMode;
                    ctx.drawImage(watermarkImage, x, y, watermarkWidth, watermarkHeight);
                    ctx.restore();
                }
            }
        } else {
            // 四个角落位置
            let x, y;
            const margin = 20; // 边距
            
            switch(position) {
                case 'top-left':
                    x = margin;
                    y = margin;
                    break;
                case 'top-right':
                    x = canvasWidth - margin - watermarkWidth;
                    y = margin;
                    break;
                case 'bottom-left':
                    x = margin;
                    y = canvasHeight - margin - watermarkHeight;
                    break;
                case 'bottom-right':
                    x = canvasWidth - margin - watermarkWidth;
                    y = canvasHeight - margin - watermarkHeight;
                    break;
            }
            
            ctx.save();
            ctx.globalCompositeOperation = blendMode;
            ctx.drawImage(watermarkImage, x, y, watermarkWidth, watermarkHeight);
            ctx.restore();
    }
});
}

// 下载水印图片
function downloadWatermarkedImage() {
    if (!watermarkedImageUrl) return;
    
    // 创建下载链接
    const link = document.createElement('a');
    
    // 生成带时间戳的文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const format = elements.outputFormat.value;
    link.download = `watermarked-${timestamp}.${format}`;
    link.href = watermarkedImageUrl;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}



// 响应式处理
function handleResponsive() {
    // 如果有预览图片，调整大小以适应屏幕
    if (!elements.watermarkedImage.classList.contains('hidden')) {
        const containerWidth = elements.previewCanvas.parentElement.clientWidth;
        const containerHeight = 500; // 最大高度
        
        const img = elements.watermarkedImage;
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        
        // 计算缩放比例
        const scaleX = containerWidth / imgWidth;
        const scaleY = containerHeight / imgHeight;
        const scale = Math.min(scaleX, scaleY, 1); // 不超过原图大小
        
        // 设置图片样式
        img.style.width = `${imgWidth * scale}px`;
        img.style.height = `${imgHeight * scale}px`;
    }
}

// 窗口大小变化时重新调整预览
window.addEventListener('resize', handleResponsive);

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    toggleWatermarkType(); // 设置初始水印类型显示状态
    init();
});