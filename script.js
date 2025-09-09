  class NeuralCanvas {
            constructor() {
                this.canvas = document.getElementById('mainCanvas');
                this.ctx = this.canvas.getContext('2d');
                this.originalImageData = null;
                this.currentFilter = 'none';
                this.isProcessing = false;

                this.filters = {
                    intensity: 100,
                    contrast: 0,
                    brightness: 0,
                    saturation: 0,
                    blur: 0
                };

                this.initializeEventListeners();
                this.setupTheme();
            }

            initializeEventListeners() {
                // File upload
                const fileInput = document.getElementById('fileInput');
                const uploadArea = document.getElementById('uploadArea');

                fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

                uploadArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    uploadArea.classList.add('dragover');
                });

                uploadArea.addEventListener('dragleave', () => {
                    uploadArea.classList.remove('dragover');
                });

                uploadArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    uploadArea.classList.remove('dragover');
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                        this.loadImage(files[0]);
                    }
                });

                // Filter buttons
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => this.applyFilter(e.target.dataset.filter));
                });

                // Sliders
                const sliders = ['intensity', 'contrast', 'brightness', 'saturation', 'blur'];
                sliders.forEach(slider => {
                    const element = document.getElementById(`${slider}Slider`);
                    const valueElement = document.getElementById(`${slider}Value`);

                    element.addEventListener('input', (e) => {
                        const value = parseInt(e.target.value);
                        this.filters[slider] = value;

                        if (slider === 'blur') {
                            valueElement.textContent = `${value}px`;
                        } else {
                            valueElement.textContent = `${value}%`;
                        }

                        this.debounce(() => this.applyCurrentFilter(), 100)();
                    });
                });

                // Control buttons
                document.getElementById('resetBtn').addEventListener('click', () => this.resetImage());
                document.getElementById('compareBtn').addEventListener('click', () => this.toggleComparison());
                document.getElementById('downloadBtn').addEventListener('click', () => this.downloadImage());
                document.getElementById('shareBtn').addEventListener('click', () => this.shareImage());
                document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
            }

            setupTheme() {
                const theme = localStorage.getItem('theme') || 'dark';
                if (theme === 'light') {
                    document.body.classList.add('light-theme');
                    document.getElementById('themeToggle').textContent = '☀️';
                }
            }

            toggleTheme() {
                document.body.classList.toggle('light-theme');
                const isLight = document.body.classList.contains('light-theme');
                document.getElementById('themeToggle').textContent = isLight ? '☀️' : '🌙';
                localStorage.setItem('theme', isLight ? 'light' : 'dark');
            }

            handleFileSelect(event) {
                const file = event.target.files[0];
                if (file) {
                    this.loadImage(file);
                }
            }

            loadImage(file) {
                if (!file.type.startsWith('image/')) {
                    alert('Please select a valid image file.');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        this.setupCanvas(img);
                        this.showCanvas();
                        this.enableControls();
                        // Add fade-in animation
                        document.getElementById('canvasContainer').classList.add('fade-in');
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }

            setupCanvas(img) {
                // Calculate canvas size maintaining aspect ratio
                const maxWidth = 800;
                const maxHeight = 600;

                let { width, height } = img;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }

                this.canvas.width = width;
                this.canvas.height = height;

                // Draw original image
                this.ctx.clearRect(0, 0, width, height);
                this.ctx.drawImage(img, 0, 0, width, height);

                // Store original image data
                this.originalImageData = this.ctx.getImageData(0, 0, width, height);
            }

            showCanvas() {
                document.getElementById('placeholder').style.display = 'none';
                document.getElementById('canvasContainer').style.display = 'block';
                document.getElementById('beforeAfter').style.display = 'none';
            }

            enableControls() {
                document.getElementById('downloadBtn').disabled = false;
                document.getElementById('shareBtn').disabled = false;
            }

            applyFilter(filterName) {
                // Update active filter button
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelector(`[data-filter="${filterName}"]`).classList.add('active');

                this.currentFilter = filterName;
                this.applyCurrentFilter();
            }

            applyCurrentFilter() {
                if (!this.originalImageData || this.isProcessing) return;

                this.showProcessing();

                // Use setTimeout to allow UI to update
                setTimeout(() => {
                    let imageData = new ImageData(
                        new Uint8ClampedArray(this.originalImageData.data),
                        this.originalImageData.width,
                        this.originalImageData.height
                    );

                    // Apply the selected filter
                    imageData = this.applyFilterEffect(imageData, this.currentFilter);

                    // Apply adjustments
                    imageData = this.applyAdjustments(imageData);

                    // Draw processed image
                    this.ctx.putImageData(imageData, 0, 0);

                    this.hideProcessing();
                }, 10);
            }

            applyFilterEffect(imageData, filterName) {
                const data = imageData.data;
                const intensity = this.filters.intensity / 100;

                switch (filterName) {
                    case 'vintage':
                        return this.applyVintageFilter(imageData, intensity);
                    case 'oil':
                        return this.applyOilPaintFilter(imageData, intensity);
                    case 'watercolor':
                        return this.applyWatercolorFilter(imageData, intensity);
                    case 'sketch':
                        return this.applySketchFilter(imageData, intensity);
                    case 'neon':
                        return this.applyNeonFilter(imageData, intensity);
                    case 'dramatic':
                        return this.applyDramaticFilter(imageData, intensity);
                    case 'dreamy':
                        return this.applyDreamyFilter(imageData, intensity);
                    default:
                        return imageData;
                }
            }

            applyVintageFilter(imageData, intensity) {
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Sepia effect
                    const tr = 0.393 * r + 0.769 * g + 0.189 * b;
                    const tg = 0.349 * r + 0.686 * g + 0.168 * b;
                    const tb = 0.272 * r + 0.534 * g + 0.131 * b;

                    data[i] = Math.min(255, r + (tr - r) * intensity);
                    data[i + 1] = Math.min(255, g + (tg - g) * intensity);
                    data[i + 2] = Math.min(255, b + (tb - b) * intensity);
                }
                return imageData;
            }

            applyOilPaintFilter(imageData, intensity) {
                const data = imageData.data;
                const width = imageData.width;
                const height = imageData.height;
                const output = new Uint8ClampedArray(data);

                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const idx = (y * width + x) * 4;
                        let r = 0, g = 0, b = 0, count = 0;

                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                const nx = x + dx;
                                const ny = y + dy;
                                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                    const nidx = (ny * width + nx) * 4;
                                    r += data[nidx];
                                    g += data[nidx + 1];
                                    b += data[nidx + 2];
                                    count++;
                                }
                            }
                        }

                        output[idx] = r / count;
                        output[idx + 1] = g / count;
                        output[idx + 2] = b / count;
                        output[idx + 3] = data[idx + 3];
                    }
                }

                return new ImageData(output, width, height);
            }

            applyWatercolorFilter(imageData, intensity) {
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Soften colors
                    data[i] = r + (255 - r) * 0.1 * intensity;
                    data[i + 1] = g + (255 - g) * 0.1 * intensity;
                    data[i + 2] = b + (255 - b) * 0.1 * intensity;
                }
                return imageData;
            }

            applySketchFilter(imageData, intensity) {
                const data = imageData.data;
                const width = imageData.width;
                const height = imageData.height;
                const gray = new Uint8ClampedArray(width * height);

                // Convert to grayscale
                for (let i = 0; i < data.length; i += 4) {
                    const grayValue = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
                    gray[i / 4] = grayValue;
                }

                // Apply edge detection
                for (let y = 1; y < height - 1; y++) {
                    for (let x = 1; x < width - 1; x++) {
                        const idx = y * width + x;
                        const center = gray[idx];
                        const left = gray[idx - 1];
                        const right = gray[idx + 1];
                        const top = gray[idx - width];
                        const bottom = gray[idx + width];

                        const edge = Math.abs(center - left) + Math.abs(center - right) +
                                   Math.abs(center - top) + Math.abs(center - bottom);

                        const edgeValue = Math.min(255, edge * intensity);
                        const pixelIdx = idx * 4;
                        data[pixelIdx] = data[pixelIdx + 1] = data[pixelIdx + 2] = 255 - edgeValue;
                    }
                }

                return imageData;
            }

            applyNeonFilter(imageData, intensity) {
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Boost bright colors
                    data[i] = Math.min(255, r * (1 + intensity * 0.5));
                    data[i + 1] = Math.min(255, g * (1 + intensity * 0.5));
                    data[i + 2] = Math.min(255, b * (1 + intensity * 0.5));
                }
                return imageData;
            }

            applyDramaticFilter(imageData, intensity) {
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Increase contrast
                    data[i] = Math.min(255, Math.max(0, (r - 128) * (1 + intensity) + 128));
                    data[i + 1] = Math.min(255, Math.max(0, (g - 128) * (1 + intensity) + 128));
                    data[i + 2] = Math.min(255, Math.max(0, (b - 128) * (1 + intensity) + 128));
                }
                return imageData;
            }

            applyDreamyFilter(imageData, intensity) {
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Soft glow effect
                    data[i] = r + (255 - r) * 0.2 * intensity;
                    data[i + 1] = g + (255 - g) * 0.2 * intensity;
                    data[i + 2] = b + (255 - b) * 0.2 * intensity;
                }
                return imageData;
            }

            applyAdjustments(imageData) {
                const data = imageData.data;
                const contrast = (this.filters.contrast / 100) + 1;
                const brightness = this.filters.brightness;
                const saturation = (this.filters.saturation / 100) + 1;
                const blur = this.filters.blur;

                for (let i = 0; i < data.length; i += 4) {
                    let r = data[i];
                    let g = data[i + 1];
                    let b = data[i + 2];

                    // Apply brightness
                    r = Math.min(255, Math.max(0, r + brightness));
                    g = Math.min(255, Math.max(0, g + brightness));
                    b = Math.min(255, Math.max(0, b + brightness));

                    // Apply contrast
                    r = ((r / 255 - 0.5) * contrast + 0.5) * 255;
                    g = ((g / 255 - 0.5) * contrast + 0.5) * 255;
                    b = ((b / 255 - 0.5) * contrast + 0.5) * 255;

                    // Apply saturation
                    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                    r = gray + (r - gray) * saturation;
                    g = gray + (g - gray) * saturation;
                    b = gray + (b - gray) * saturation;

                    data[i] = Math.min(255, Math.max(0, r));
                    data[i + 1] = Math.min(255, Math.max(0, g));
                    data[i + 2] = Math.min(255, Math.max(0, b));
                }

                // Apply blur if needed
                if (blur > 0) {
                    return this.applyBlur(imageData, blur);
                }

                return imageData;
            }

            applyBlur(imageData, radius) {
                // Simple box blur implementation
                const data = imageData.data;
                const width = imageData.width;
                const height = imageData.height;
                const output = new Uint8ClampedArray(data);

                for (let y = radius; y < height - radius; y++) {
                    for (let x = radius; x < width - radius; x++) {
                        let r = 0, g = 0, b = 0, a = 0, count = 0;

                        for (let dy = -radius; dy <= radius; dy++) {
                            for (let dx = -radius; dx <= radius; dx++) {
                                const idx = ((y + dy) * width + (x + dx)) * 4;
                                r += data[idx];
                                g += data[idx + 1];
                                b += data[idx + 2];
                                a += data[idx + 3];
                                count++;
                            }
                        }

                        const outIdx = (y * width + x) * 4;
                        output[outIdx] = r / count;
                        output[outIdx + 1] = g / count;
                        output[outIdx + 2] = b / count;
                        output[outIdx + 3] = a / count;
                    }
                }

                return new ImageData(output, width, height);
            }

            showProcessing() {
                this.isProcessing = true;
                document.getElementById('processingOverlay').style.display = 'block';
            }

            hideProcessing() {
                this.isProcessing = false;
                document.getElementById('processingOverlay').style.display = 'none';
            }

            resetImage() {
                if (this.originalImageData) {
                    this.ctx.putImageData(this.originalImageData, 0, 0);
                    this.currentFilter = 'none';
                    document.querySelectorAll('.filter-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    document.querySelector('[data-filter="none"]').classList.add('active');
                }
            }

            toggleComparison() {
                const canvasContainer = document.getElementById('canvasContainer');
                const beforeAfter = document.getElementById('beforeAfter');
                const beforeImg = document.getElementById('beforeImg');
                const afterImg = document.getElementById('afterImg');

                if (beforeAfter.style.display === 'none') {
                    // Show comparison
                    const originalCanvas = document.createElement('canvas');
                    originalCanvas.width = this.canvas.width;
                    originalCanvas.height = this.canvas.height;
                    const originalCtx = originalCanvas.getContext('2d');
                    originalCtx.putImageData(this.originalImageData, 0, 0);

                    beforeImg.src = originalCanvas.toDataURL();
                    afterImg.src = this.canvas.toDataURL();

                    canvasContainer.style.display = 'none';
                    beforeAfter.style.display = 'flex';
                } else {
                    // Hide comparison
                    canvasContainer.style.display = 'block';
                    beforeAfter.style.display = 'none';
                }
            }

            downloadImage() {
                const link = document.createElement('a');
                link.download = 'neural-canvas-art.png';
                link.href = this.canvas.toDataURL();
                link.click();
            }

            async shareImage() {
                try {
                    // Convert canvas to blob
                    this.canvas.toBlob(async (blob) => {
                        if (!blob) {
                            alert('Failed to create image for sharing.');
                            return;
                        }

                        const file = new File([blob], 'neural-canvas-art.png', { type: 'image/png' });

                        // Check if Web Share API is supported and can share files
                        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                            try {
                                await navigator.share({
                                    title: 'Neural Canvas Art',
                                    text: 'Check out this amazing art I created with Neural Canvas!',
                                    files: [file]
                                });
                            } catch (error) {
                                if (error.name !== 'AbortError') {
                                    console.error('Error sharing:', error);
                                    this.fallbackShare();
                                }
                            }
                        } else {
                            // Fallback for browsers that don't support file sharing
                            this.fallbackShare();
                        }
                    });
                } catch (error) {
                    console.error('Error in shareImage:', error);
                    this.fallbackShare();
                }
            }

            fallbackShare() {
                // Copy image URL to clipboard as fallback
                const imageUrl = this.canvas.toDataURL();
                if (navigator.clipboard && navigator.clipboard.write) {
                    // Try to copy the image data
                    fetch(imageUrl)
                        .then(res => res.blob())
                        .then(blob => {
                            const item = new ClipboardItem({ 'image/png': blob });
                            return navigator.clipboard.write([item]);
                        })
                        .then(() => {
                            alert('Image copied to clipboard! You can now paste it anywhere.');
                        })
                        .catch(() => {
                            // If clipboard API fails, copy URL instead
                            navigator.clipboard.writeText(imageUrl).then(() => {
                                alert('Image URL copied to clipboard! You can share it now.');
                            });
                        });
                } else {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = imageUrl;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    alert('Image URL copied to clipboard! You can share it now.');
                }
            }

            debounce(func, wait) {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            }
        }

        // Initialize the app
        document.addEventListener('DOMContentLoaded', () => {
            new NeuralCanvas();
        });