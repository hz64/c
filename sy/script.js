// 全局变量
let originalImage = null;
let watermarkedImageUrl = null;
let watermarkImage = null; // 水印图片

// DOM元素
let elements = {};

// 初始化DOM元素
function initElements() {
    elements = {
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
    };
}



// 初始化函数
function init() {
    // 设置事件监听器
    setupEventListeners();
}

// 设置事件监听器
function setupEventListeners() {
    try {
        // 等待DOM元素初始化完成
        if (!elements || Object.keys(elements).length === 0) {
            console.warn('DOM元素尚未初始化，尝试重新初始化...');
            initElements();
        }
        
        // 文件上传相关
        if (elements.imageUpload) {
            elements.imageUpload.addEventListener('change', function(event) {
                try {
                    handleFileUpload(event);
                } catch (error) {
                    console.error('文件上传事件处理失败:', error);
                }
            });
        }
        
        if (elements.removeFile) {
            elements.removeFile.addEventListener('click', function() {
                try {
                    removeFile();
                } catch (error) {
                    console.error('移除文件事件处理失败:', error);
                }
            });
        }
        
        // 水印参数变化
        if (elements.watermarkOpacity) {
            elements.watermarkOpacity.addEventListener('input', function() {
                try {
                    updateOpacityValue();
                } catch (error) {
                    console.error('更新透明度值失败:', error);
                }
            });
        }
        
        if (elements.watermarkAngle) {
            elements.watermarkAngle.addEventListener('input', function() {
                try {
                    updateAngleValue();
                } catch (error) {
                    console.error('更新角度值失败:', error);
                }
            });
        }
        
        if (elements.watermarkSpacing) {
            elements.watermarkSpacing.addEventListener('input', function() {
                try {
                    updateSpacingValue();
                } catch (error) {
                    console.error('更新间隔值失败:', error);
                }
            });
        }
        
        if (elements.watermarkFontSize) {
            elements.watermarkFontSize.addEventListener('input', function() {
                try {
                    updateFontSizeValue();
                } catch (error) {
                    console.error('更新字体大小值失败:', error);
                }
            });
        }
        
        if (elements.watermarkImageSize) {
            elements.watermarkImageSize.addEventListener('input', function() {
                try {
                    updateImageSizeValue();
                } catch (error) {
                    console.error('更新水印图片大小值失败:', error);
                }
            });
        }
        
        // 水印类型切换
        if (elements.watermarkType && elements.watermarkType.length > 0) {
            elements.watermarkType.forEach(radio => {
                if (radio && radio.addEventListener) {
                    radio.addEventListener('change', function() {
                        try {
                            toggleWatermarkType();
                        } catch (error) {
                            console.error('切换水印类型事件处理失败:', error);
                        }
                    });
                }
            });
        }
        
        // 水印图片上传
        if (elements.watermarkImageUpload) {
            elements.watermarkImageUpload.addEventListener('change', function(event) {
                try {
                    handleWatermarkImageUpload(event);
                } catch (error) {
                    console.error('水印图片上传事件处理失败:', error);
                }
            });
        }
        
        if (elements.removeWatermarkImage) {
            elements.removeWatermarkImage.addEventListener('click', function() {
                try {
                    removeWatermarkImage();
                } catch (error) {
                    console.error('移除水印图片事件处理失败:', error);
                }
            });
        }
        
        // 自动刷新预览
        if (elements.autoRefresh) {
            elements.autoRefresh.addEventListener('change', function() {
                try {
                    handleAutoRefreshChange();
                } catch (error) {
                    console.error('自动刷新设置变更处理失败:', error);
                }
            });
        }
        
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
            if (control && control.addEventListener) {
                control.addEventListener('change', function() {
                    try {
                        if (elements.autoRefresh && elements.autoRefresh.checked && originalImage) {
                            applyWatermark();
                        }
                    } catch (error) {
                        console.error('水印参数变更处理失败:', error);
                    }
                });
            }
        });
        
        // 水印位置变化时刷新预览
        if (elements.watermarkPositions && elements.watermarkPositions.length > 0) {
            elements.watermarkPositions.forEach(checkbox => {
                if (checkbox && checkbox.addEventListener) {
                    checkbox.addEventListener('change', function() {
                        try {
                            // 当选择平铺时，取消其他位置选择
                            if (checkbox.value === 'tiled' && checkbox.checked && elements.watermarkPositions) {
                                elements.watermarkPositions.forEach(cb => {
                                    if (cb.value !== 'tiled') {
                                        cb.checked = false;
                                    }
                                });
                            } 
                            // 当选择其他位置时，取消平铺选择
                            else if (checkbox.value !== 'tiled' && checkbox.checked && elements.watermarkPositions) {
                                elements.watermarkPositions.forEach(cb => {
                                    if (cb.value === 'tiled') {
                                        cb.checked = false;
                                    }
                                });
                            }
                            
                            if (elements.autoRefresh && elements.autoRefresh.checked && originalImage) {
                                applyWatermark();
                            }
                        } catch (error) {
                            console.error('水印位置变更处理失败:', error);
                        }
                    });
                }
            });
        }
        
        // 预览图片点击下载
        if (elements.watermarkedImage) {
            elements.watermarkedImage.addEventListener('click', function() {
                try {
                    downloadWatermarkedImage();
                } catch (error) {
                    console.error('预览图点击下载失败:', error);
                }
            });
        }
        
        if (elements.downloadBtn) {
            elements.downloadBtn.addEventListener('click', function() {
                try {
                    downloadWatermarkedImage();
                } catch (error) {
                    console.error('下载按钮点击失败:', error);
                    alert('下载失败，请重试');
                }
            });
        }
        
        console.log('事件监听器设置完成');
    } catch (error) {
        console.error('设置事件监听器时出错:', error);
    }
}

// 处理文件上传
function handleFileUpload(event) {
    try {
        const file = event.target.files[0];
        if (!file) return;
        
        // 验证文件类型
        const validTypes = ['image/png', 'image/jpeg', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            alert('请上传PNG、JPG或GIF格式的图片');
            if (elements && elements.imageUpload) {
                elements.imageUpload.value = '';
            }
            return;
        }
        
        // 显示文件信息
        if (elements && elements.fileName && elements.selectedFileInfo) {
            elements.fileName.textContent = file.name;
            if (elements.selectedFileInfo.classList) {
                elements.selectedFileInfo.classList.remove('hidden');
            }
        }
        
        // 读取图片文件
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const img = new Image();
                // 确保canvas可以正确处理图像（增强跨域安全）
                img.crossOrigin = 'Anonymous';
                
                img.onload = function() {
                    try {
                        // 存储原始图片
                        originalImage = img;
                        
                        // 如果启用自动刷新且存在元素，则应用水印
                        if (elements && elements.autoRefresh && elements.autoRefresh.checked) {
                            try {
                                applyWatermark();
                            } catch (wmError) {
                                console.error('应用水印时出错:', wmError);
                                alert('处理图片时出现错误，请重试。');
                            }
                        } else {
                            // 即使未启用自动刷新，也尝试应用水印以确保预览更新
                            try {
                                applyWatermark();
                            } catch (wmError) {
                                console.error('初始应用水印时出错:', wmError);
                                // 此处不弹出错误，避免干扰用户
                            }
                        }
                    } catch (error) {
                        console.error('图片加载后处理出错:', error);
                        alert('图片处理失败，请重试');
                    }
                };
                
                img.onerror = function(error) {
                    console.error('图片加载失败:', error);
                    alert('图片加载失败，请重试');
                };
                
                img.src = e.target.result;
            } catch (error) {
                console.error('文件读取后处理出错:', error);
                alert('文件处理失败，请重试');
            }
        };
        
        reader.onerror = function(error) {
            console.error('文件读取失败:', error);
            alert('文件读取失败，请重试。');
        };
        
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('处理文件上传时出错:', error);
        alert('文件上传处理失败，请重试');
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
    try {
        // 直接从DOM获取，不依赖elements对象，确保函数可以在任何时候调用
        const isTextWatermark = document.querySelector('input[name="watermark-type"][value="text"]').checked;
        
        // 显示或隐藏对应的选项
        document.querySelectorAll('.text-watermark-options').forEach(el => {
            if (el && el.classList) {
                el.classList.toggle('hidden', !isTextWatermark);
            }
        });
        
        document.querySelectorAll('.image-watermark-options').forEach(el => {
            if (el && el.classList) {
                el.classList.toggle('hidden', isTextWatermark);
            }
        });
        
        // 如果启用自动刷新且有原图，则重新应用水印
        if (elements && elements.autoRefresh && elements.autoRefresh.checked && originalImage) {
            try {
                applyWatermark();
            } catch (error) {
                console.error('切换水印类型时应用水印出错:', error);
                // 不弹出错误提示，避免频繁干扰用户
            }
        }
    } catch (error) {
        console.error('切换水印类型时出错:', error);
        // 静默失败，避免初始化时出现问题
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
            // 确保canvas可以正确处理图像
            watermarkImage.crossOrigin = 'anonymous';
            watermarkImage.onload = function() {
                // 如果是图片水印且启用自动刷新，则应用水印
                const isImageWatermark = document.querySelector('input[name="watermark-type"][value="image"]').checked;
                if (isImageWatermark && elements.autoRefresh.checked && originalImage) {
                    try {
                        applyWatermark();
                    } catch (error) {
                        console.error('应用水印时出错:', error);
                        alert('处理水印图片时出现错误，请重试。');
                    }
                }
            };
            watermarkImage.onerror = function() {
                console.error('水印图片加载失败');
                alert('水印图片加载失败，请重试。');
            };
            watermarkImage.src = e.target.result;
        };
        reader.onerror = function() {
            console.error('水印文件读取失败');
            alert('水印文件读取失败，请重试。');
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
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
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
    
    try {
        // 创建下载链接
        const link = document.createElement('a');
        
        // 生成带时间戳的文件名
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const format = elements.outputFormat.value;
        link.download = `watermarked-${timestamp}.${format}`;
        link.href = watermarkedImageUrl;
        
        // 触发下载 - 使用更可靠的方式
        link.style.display = 'none';
        document.body.appendChild(link);
        
        // 使用鼠标事件触发点击，提高兼容性
        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        link.dispatchEvent(event);
        
        // 移除链接
        setTimeout(() => {
            document.body.removeChild(link);
        }, 100);
    } catch (error) {
        console.error('下载图片时出错:', error);
        alert('下载图片时出现错误，请右键点击预览图片并选择"保存图片"。');
    }
}



// 响应式处理
function handleResponsive() {
    try {
        // 检查必要的DOM元素是否存在
        if (!elements || !elements.watermarkedImage || !elements.previewCanvas) {
            console.warn('必要的DOM元素未找到，跳过响应式处理');
            return;
        }
        
        // 如果有预览图片，调整大小以适应屏幕
        if (elements.watermarkedImage.classList && !elements.watermarkedImage.classList.contains('hidden')) {
            try {
                const containerElement = elements.previewCanvas.parentElement;
                if (!containerElement) {
                    console.warn('预览容器元素未找到');
                    return;
                }
                
                const containerWidth = containerElement.clientWidth;
                const containerHeight = 500; // 最大高度
                
                const img = elements.watermarkedImage;
                if (img && img.naturalWidth && img.naturalHeight) {
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
            } catch (imgError) {
                console.error('调整图片大小时出错:', imgError);
            }
        }
    } catch (error) {
        console.error('响应式处理时出错:', error);
        // 静默失败，避免影响用户体验
    }
}

// 监听窗口调整大小事件
window.addEventListener('resize', function() {
    try {
        handleResponsive();
    } catch (error) {
        console.error('窗口调整大小时出错:', error);
    }
});

// 监听DOM加载完成事件
window.addEventListener('DOMContentLoaded', function() {
    // 添加延迟，确保所有DOM元素完全加载
    setTimeout(() => {
        try {
            // 首先初始化DOM元素引用
            initElements();
            
            // 然后设置事件监听器
            setupEventListeners();
            
            // 初始化UI状态
            toggleWatermarkType();
            
            // 立即处理响应式布局
            handleResponsive();
            
            console.log('应用初始化完成');
        } catch (error) {
            console.error('初始化过程中出错:', error);
            // 提供恢复机制
            setTimeout(() => {
                console.log('尝试重新初始化...');
                try {
                    // 重新初始化元素
                    initElements();
                    setupEventListeners();
                    toggleWatermarkType();
                    handleResponsive();
                    console.log('重新初始化成功');
                } catch (retryError) {
                    console.error('重新初始化失败:', retryError);
                    // 显示友好的错误提示给用户
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message';
                    errorMessage.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background-color: #e74c3c; color: white; padding: 15px; border-radius: 5px; z-index: 1000;';
                    errorMessage.textContent = '应用初始化失败，请刷新页面重试。如果问题持续，请尝试清除缓存。';
                    document.body.appendChild(errorMessage);
                    setTimeout(() => errorMessage.remove(), 10000);
                }
            }, 1000);
        }
    }, 300);
});