document.addEventListener('DOMContentLoaded', function() {
    const controls = {
        brightness:  document.getElementById('brightness'),
        contrast:    document.getElementById('contrast'),
        saturation:  document.getElementById('saturation'),
        hue:         document.getElementById('hue'),
        sharpness:   document.getElementById('sharpness'),
        temperature: document.getElementById('temperature')
    };

    const preview        = document.getElementById('adjustmentPreview');
    const downloadLink   = document.getElementById('downloadLink');
    const formatSelect   = document.getElementById('formatSelect');
    const qualityRange   = document.getElementById('qualityRange');
    const qualityValue   = document.getElementById('qualityValue');
    const qualityControl = document.getElementById('qualityControl');
    
    let currentImage     = null;
    let currentFormat    = 'png';
    let processingCanvas = document.createElement('canvas');

    Object.keys(controls).forEach(control => {
        controls[control].addEventListener('input', updateAdjustments);
    });

    document.getElementById('fileInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.src = e.target.result;
                preview.style.display = 'block';
                currentImage = new Image();
                currentImage.src = e.target.result;
                currentImage.onload = function() {
                    processingCanvas.width  = currentImage.width;
                    processingCanvas.height = currentImage.height;
                    updateAdjustments();
                };
            };
            reader.readAsDataURL(file);
        }
    });

    formatSelect.addEventListener('change', () => {
        currentFormat = formatSelect.value;
        qualityControl.style.display = ['png', 'pdf'].includes(currentFormat) ? 'none' : 'flex';
    });
    
    qualityRange.addEventListener('input', (e) => {
        qualityValue.textContent = `${Math.round(e.target.value * 100)}%`;
    });

    function updateAdjustments() {
        if (!currentImage) return;

        const brightness = controls.brightness.value;
        const contrast   = controls.contrast.value;
        const saturation = controls.saturation.value;
        const hue        = controls.hue.value;
        const sharpness  = +controls.sharpness.value;
        const temperature = +controls.temperature.value;

        // Compute sharpness filter for preview using CSS filter only when sharpness is below 100.
        let sharpnessFilter = '';
        if (sharpness !== 100) {
            if (sharpness > 100) {
                // For sharpness values above 100, sharpening will be handled in canvas processing.
                sharpnessFilter = '';
            } else {
                const blurPx = ((100 - sharpness) / 100) * 3;
                sharpnessFilter = `blur(${blurPx}px)`;
            }
        }

        // Temperature filter computation
        let temperatureFilter = '';
        if (temperature !== 0) {
            const tempAmount = Math.abs(temperature) / 100;
            if (temperature > 0) {
                // Warm filter (orange/red tones)
                temperatureFilter = `sepia(${tempAmount}) hue-rotate(-${tempAmount * 10}deg)`;
            } else {
                // Cool filter (blue tones)
                temperatureFilter = `hue-rotate(${tempAmount * 180}deg) saturate(${1 + tempAmount})`;
            }
        }

        // Update CSS filter for preview (this applies for non-sharpening parts).
        preview.style.filter = `
            brightness(${100 + parseInt(brightness)}%)
            contrast(${100 + parseInt(contrast)}%)
            saturate(${100 + parseInt(saturation)}%)
            hue-rotate(${hue}deg)
            ${sharpnessFilter}
            ${temperatureFilter}
        `.replace(/\n/g, ' ').replace(/\s+/g, ' ');

        // Update displayed values next to sliders.
        document.getElementById('brightnessValue').textContent   = `${brightness}%`;
        document.getElementById('contrastValue').textContent     = `${contrast}%`;
        document.getElementById('saturationValue').textContent   = `${saturation}%`;
        document.getElementById('hueValue').textContent          = `${hue}°`;
        document.getElementById('sharpnessValue').textContent    = `${sharpness}%`;
        document.getElementById('temperatureValue').textContent  = temperature > 0 ? `+${temperature}` : `${temperature}`;

        updateProcessingCanvas();
    }

    function updateProcessingCanvas() {
        if (!currentImage) return;
        const ctx = processingCanvas.getContext('2d');
        ctx.clearRect(0, 0, processingCanvas.width, processingCanvas.height);
        // Apply CSS filter as computed for initial effects.
        ctx.filter = preview.style.filter;
        ctx.drawImage(currentImage, 0, 0);
        ctx.filter = 'none';

        const sharpness = +controls.sharpness.value;
        if (sharpness > 100) {
            applySharpening(ctx, processingCanvas.width, processingCanvas.height, sharpness);
        }
        // Reflect the processed image (including sharpening) in the preview.
        preview.src = processingCanvas.toDataURL();
    }

    // Download & PDF creation
    downloadLink.addEventListener('click', handleDownload);
    function handleDownload(e) {
        e.preventDefault();
        if (!currentImage) {
            alert('Please upload an image first!');
            return;
        }
        const quality = parseFloat(qualityRange.value);
        let mimeType;
        switch(currentFormat) {
            case 'jpg':  mimeType = 'image/jpeg'; break;
            case 'webp': mimeType = 'image/webp';  break;
            case 'png':  mimeType = 'image/png';   break;
            case 'pdf':  createAndDownloadPDF();   return;
            default:     mimeType = 'image/png';
        }
        const tempCanvas = document.createElement('canvas');
        const tempCtx    = tempCanvas.getContext('2d');
        tempCanvas.width  = processingCanvas.width;
        tempCanvas.height = processingCanvas.height;
        if (['jpg', 'webp'].includes(currentFormat)) {
            tempCtx.fillStyle = '#ffffff';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        }
        tempCtx.drawImage(processingCanvas, 0, 0);
        tempCanvas.toBlob((blob) => {
            if (!blob) {
                alert('Error: Failed to create image blob');
                return;
            }
            const blobUrl = URL.createObjectURL(blob);
            const tempLink = document.createElement('a');
            tempLink.href = blobUrl;
            tempLink.download = `adjusted-image.${currentFormat}`;
            document.body.appendChild(tempLink);
            tempLink.click();
            setTimeout(() => {
                document.body.removeChild(tempLink);
                URL.revokeObjectURL(blobUrl);
            }, 100);
        }, mimeType, currentFormat === 'png' ? undefined : quality);
    }

    function createAndDownloadPDF() {
        try {
            if (typeof jspdf === 'undefined' || !jspdf.jsPDF) {
                throw new Error('PDF library not loaded');
            }
            const pdf = new jspdf.jsPDF();
            const tempCanvas = document.createElement('canvas');
            const tempCtx    = tempCanvas.getContext('2d');
            tempCanvas.width  = processingCanvas.width;
            tempCanvas.height = processingCanvas.height;
            tempCtx.fillStyle = '#ffffff';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(processingCanvas, 0, 0);
            const imgData = tempCanvas.toDataURL('image/png');
            const pdfWidth  = pdf.internal.pageSize.getWidth();
            const pdfHeight = (tempCanvas.height * pdfWidth) / tempCanvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('adjusted-image.pdf');
        } catch (error) {
            console.error('PDF creation error:', error);
            alert(`PDF creation failed: ${error.message}`);
        }
    }

    // Apply sharpening using a convolution filter.
    function applySharpening(ctx, width, height, sharpnessValue) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const strength = (sharpnessValue - 100) / 100; // Strength varies from 0 to 1

        // Define sharpening kernel
        const kernel = [
            0,   -strength, 0,
            -strength, 1 + 4 * strength, -strength,
            0,   -strength, 0
        ];
        const side = 3;
        const half = Math.floor(side / 2);

        const tempData = new Uint8ClampedArray(data.length);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0;
                for (let ky = 0; ky < side; ky++) {
                    for (let kx = 0; kx < side; kx++) {
                        const scy = y + ky - half;
                        const scx = x + kx - half;
                        if (scy >= 0 && scy < height && scx >= 0 && scx < width) {
                            const srcOff = (scy * width + scx) * 4;
                            const weight = kernel[ky * side + kx];
                            r += data[srcOff] * weight;
                            g += data[srcOff + 1] * weight;
                            b += data[srcOff + 2] * weight;
                        }
                    }
                }
                const dstOff = (y * width + x) * 4;
                tempData[dstOff] = Math.min(255, Math.max(0, r));
                tempData[dstOff + 1] = Math.min(255, Math.max(0, g));
                tempData[dstOff + 2] = Math.min(255, Math.max(0, b));
                tempData[dstOff + 3] = data[dstOff + 3]; // Preserve alpha
            }
        }
        ctx.putImageData(new ImageData(tempData, width, height), 0, 0);
    }

    window.resetAdjustments = function() {
        Object.keys(controls).forEach(control => {
            if (control === 'hue' || control === 'temperature') {
                controls[control].value = 0;
            } else if (control === 'sharpness') {
                controls[control].value = 100;
            } else {
                controls[control].value = 0;
            }
        });
        document.getElementById('sharpnessValue').textContent   = '100%';
        document.getElementById('temperatureValue').textContent = '0';
        updateAdjustments();
    }
});
