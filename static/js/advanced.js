// Ensure OpenCV is ready
function onOpenCVReady() {
  console.log("OpenCV.js is ready.");
  document.getElementById('opencv-status').textContent = "OpenCV Ready";
}

document.addEventListener("DOMContentLoaded", () => {
  // Global variables to hold the image and working mats
  let originalMat = null;
  let currentMat = null;
  let selectedFilter = null;

  // File input and file name display
  const fileInput = document.getElementById("fileInput");
  const fileNameDisplay = document.getElementById("fileName");

  fileInput.addEventListener("change", handleFileSelect);

  function handleFileSelect(e) {
      const file = e.target.files[0];
      if (!file) return;
      fileNameDisplay.textContent = file.name;

      const reader = new FileReader();
      reader.onload = function(event) {
          const img = new Image();
          img.onload = function() {
              if (originalMat) originalMat.delete();
              if (currentMat) currentMat.delete();

              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0);
              originalMat = cv.imread(canvas);
              currentMat = originalMat.clone();

              updateAllPreviews();
              updateDimensionInfo(originalMat.cols, originalMat.rows);
              
              document.getElementById("downloadLink").style.display = "inline-flex";
              document.querySelectorAll(".process-button").forEach(btn => {
                  btn.removeAttribute("disabled");
              });
          }
          img.src = event.target.result;
      }
      reader.readAsDataURL(file);
  }

  function updateAllPreviews() {
      if (!currentMat) return;
      
      const previewIds = ["resizePreview", "artisticPreview", "compressPreview"];
      previewIds.forEach(id => {
          updatePreview(id, currentMat);
          const container = document.getElementById(id).parentElement;
          if (container) {
              container.classList.add("has-image");
              const placeholder = container.querySelector(".placeholder-text");
              if (placeholder) placeholder.style.display = "none";
          }
      });
  }

  function updatePreview(previewId, mat) {
      let canvas = document.createElement("canvas");
      cv.imshow(canvas, mat);
      const dataURL = canvas.toDataURL("image/png");
      const previewElement = document.getElementById(previewId);
      if (previewElement) {
          previewElement.src = dataURL;
          previewElement.style.display = "block";
      }
  }

  function updateDimensionInfo(w, h, newW, newH) {
      const origLabel = document.getElementById("originalDimensions");
      const newLabel = document.getElementById("newDimensions");
      if (origLabel) origLabel.textContent = `Original: ${w} x ${h} px`;
      if (newLabel) newLabel.textContent = newW && newH ? 
          `New: ${newW} x ${newH} px` : `New: ${w} x ${h} px`;
  }

  // Tab navigation
  const toolTabs = document.querySelectorAll(".tool-tab");
  const toolPanels = document.querySelectorAll(".tool-panel");

  toolTabs.forEach(tab => {
      tab.addEventListener("click", () => {
          toolTabs.forEach(t => t.classList.remove("active"));
          toolPanels.forEach(panel => panel.classList.remove("active"));
          tab.classList.add("active");
          const tabName = tab.getAttribute("data-tab");
          const panel = document.getElementById(`${tabName}-panel`);
          if (panel) panel.classList.add("active");
      });
  });

  // Resize functionality
  const resizeButton = document.getElementById("resizeButton");
  resizeButton.addEventListener("click", handleResize);

  const presetButtons = document.querySelectorAll(".preset-button");
  presetButtons.forEach(button => {
      button.addEventListener("click", () => {
          const widthPreset = button.getAttribute("data-width");
          const heightPreset = button.getAttribute("data-height");
          document.getElementById("width").value = widthPreset;
          document.getElementById("height").value = heightPreset;
      });
  });

  const percentageSlider = document.getElementById("percentageSlider");
  const percentageValue = document.getElementById("percentageValue");
  percentageSlider.addEventListener("input", () => {
      percentageValue.textContent = `${percentageSlider.value}%`;
  });

  const qualitySlider = document.getElementById("compressQuality");
  const qualityDisplay = document.getElementById("qualityDisplayValue");
  qualitySlider.addEventListener("input", () => {
      qualityDisplay.textContent = `${Math.round(qualitySlider.value * 100)}%`;
  });

  function handleResize() {
      if (!originalMat) {
          alert("Please select an image first.");
          return;
      }

      const resizeType = document.querySelector('input[name="resize-type"]:checked').value;
      let newWidth, newHeight;
      const srcWidth = originalMat.cols;
      const srcHeight = originalMat.rows;
      const keepAspect = document.getElementById("keepAspectRatio").checked;

      if (resizeType === "dimensions") {
          newWidth = parseInt(document.getElementById("width").value) || srcWidth;
          newHeight = parseInt(document.getElementById("height").value) || srcHeight;
          if (keepAspect) {
              newHeight = Math.round((newWidth / srcWidth) * srcHeight);
          }
      } else if (resizeType === "percentage") {
          const percent = parseInt(percentageSlider.value) / 100;
          newWidth = Math.round(srcWidth * percent);
          newHeight = Math.round(srcHeight * percent);
      } else {
          alert("Unknown resize type.");
          return;
      }

      let dsize = new cv.Size(newWidth, newHeight);
      let dst = new cv.Mat();
      cv.resize(originalMat, dst, dsize, 0, 0, cv.INTER_AREA);
      
      if (currentMat) currentMat.delete();
      currentMat = dst.clone();
      dst.delete();

      updatePreview("resizePreview", currentMat);
      updateDimensionInfo(srcWidth, srcHeight, newWidth, newHeight);
      
      // Update download link
      const tempCanvas = document.createElement("canvas");
      cv.imshow(tempCanvas, currentMat);
      updateDownloadLink(tempCanvas.toDataURL("image/png"), "png");
      tempCanvas.remove();
  }

  // Artistic Filters functionality
  const filterOptions = document.querySelectorAll(".filter-option");
  filterOptions.forEach(option => {
      option.addEventListener("click", () => {
          filterOptions.forEach(opt => opt.classList.remove("selected"));
          option.classList.add("selected");
          selectedFilter = option.getAttribute("data-filter");
      });
  });

  const applyArtisticFilterBtn = document.getElementById("applyArtisticFilter");
  applyArtisticFilterBtn.addEventListener("click", () => {
      if (!originalMat) {
          alert("Please select an image first.");
          return;
      }
      if (!selectedFilter) {
          alert("Please select a filter.");
          return;
      }

      let src = originalMat.clone();
      let dst = null;

      switch(selectedFilter) {
          case "sketch":
              dst = applySketch(src);
              break;
          case "sepia":
              dst = applySepia(src);
              break;
          case "vignette":
              dst = applyVignette(src);
              break;
          case "grayscale":
              dst = applyGrayscale(src);
              break;
          case "blur":
              dst = applyMotionBlur(src);
              break;
          case "invert":
              dst = applyInvert(src);
              break;
          case "pixelate":
              dst = applyPixelate(src);
              break;
          case "oil_painting":
              dst = applyOilPainting(src);
              break;
          default:
              alert("Selected filter is not implemented.");
              src.delete();
              return;
      }
      src.delete();
      if (currentMat) currentMat.delete();
      currentMat = dst.clone();
      updatePreview("artisticPreview", currentMat);
      dst.delete();
      
      // Update download link
      const tempCanvas = document.createElement("canvas");
      cv.imshow(tempCanvas, currentMat);
      updateDownloadLink(tempCanvas.toDataURL("image/png"), "png");
      tempCanvas.remove();
  });

  // Filter implementations (keep all filter functions unchanged)
  // ... [Keep all filter functions from original code] ...
  function applySketch(src) {
    let gray = new cv.Mat();
    let inverted = new cv.Mat();
    let blurred = new cv.Mat();
    let dst = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    cv.bitwise_not(gray, inverted);
    // Using a 5x5 kernel and sigma = 0
    let ksize = new cv.Size(5, 5);
    cv.GaussianBlur(inverted, blurred, ksize, 0, 0, cv.BORDER_DEFAULT);
    // Avoid division by zero by adding a small constant
    let one = new cv.Mat(blurred.rows, blurred.cols, blurred.type(), new cv.Scalar(255));
    let temp = new cv.Mat();
    cv.subtract(one, blurred, temp, new cv.Mat(), -1);
    cv.divide(gray, temp, dst, 256);
    gray.delete(); inverted.delete(); blurred.delete(); one.delete(); temp.delete();
    // Convert dst back to 4-channel image for display
    cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA, 0);
    return dst;
  }

  // Sepia effect using a transformation matrix
  function applySepia(src) {
    let dst = new cv.Mat();
    let rgbMat = new cv.Mat();
    // Convert to RGB if not already
    if (src.channels() === 4) {
      cv.cvtColor(src, rgbMat, cv.COLOR_RGBA2RGB);
    } else {
      rgbMat = src.clone();
    }
    
    let sepiaKernel = cv.matFromArray(3, 3, cv.CV_32F, [
      0.272, 0.534, 0.131,
      0.349, 0.686, 0.168,
      0.393, 0.769, 0.189
    ]);
    
    // Convert to float for matrix multiplication
    let rgbFloat = new cv.Mat();
    rgbMat.convertTo(rgbFloat, cv.CV_32F);
    
    // Apply transformation
    cv.transform(rgbFloat, dst, sepiaKernel);
    sepiaKernel.delete(); rgbFloat.delete(); rgbMat.delete();
    
    // Convert back to 8-bit
    cv.normalize(dst, dst, 0, 255, cv.NORM_MINMAX);
    dst.convertTo(dst, cv.CV_8U);
    
    // Add alpha channel if needed
    if (src.channels() === 4) {
      cv.cvtColor(dst, dst, cv.COLOR_RGB2RGBA);
    }
    
    return dst;
  }

  // Vignette effect: create radial mask and multiply with image
  function applyVignette(src) {
    let dst = src.clone();
    let rows = src.rows, cols = src.cols;
    // Create a mask with the same dimensions
    let mask = new cv.Mat(rows, cols, cv.CV_32F);
    let center = {x: cols/2, y: rows/2};
    let maxDist = Math.sqrt(center.x * center.x + center.y * center.y);
    
    // Create radial gradient mask
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        let dx = j - center.x;
        let dy = i - center.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        let value = Math.max(0, 1 - (dist / maxDist) * 1.5); // Adjust 1.5 for effect strength
        mask.floatPtr(i, j)[0] = value;
      }
    }
    
    // Convert src to float for multiplication
    let srcFloat = new cv.Mat();
    src.convertTo(srcFloat, cv.CV_32F, 1/255);
    
    // Apply mask to each channel
    let channels = new cv.MatVector();
    cv.split(srcFloat, channels);
    for (let i = 0; i < channels.size(); i++) {
      let channel = channels.get(i);
      cv.multiply(channel, mask, channel);
      channels.set(i, channel);
    }
    
    // Merge channels and convert back to 8-bit
    cv.merge(channels, srcFloat);
    srcFloat.convertTo(dst, cv.CV_8U, 255);
    
    // Cleanup
    mask.delete(); srcFloat.delete();
    for (let i = 0; i < channels.size(); i++) {
      channels.get(i).delete();
    }
    channels.delete();
    
    return dst;
  }

  // Color Splash effect: keep one color channel and desaturate rest
  

  // Pixelate effect: downscale then upscale using nearest neighbor interpolation
  function applyPixelate(src) {
    let pixelSize = 10;
    let temp = new cv.Mat();
    let dsize = new cv.Size(Math.max(1, Math.floor(src.cols / pixelSize)),
                            Math.max(1, Math.floor(src.rows / pixelSize)));
    cv.resize(src, temp, dsize, 0, 0, cv.INTER_LINEAR);
    let dst = new cv.Mat();
    cv.resize(temp, dst, new cv.Size(src.cols, src.rows), 0, 0, cv.INTER_NEAREST);
    temp.delete();
    return dst;
  }
  
  // Oil painting effect 
  function applyOilPainting(src) {
    // Parameters for oil painting effect
    const radius = 4;
    const intensityLevels = 20;
    
    // Create destination image
    let dst = new cv.Mat.zeros(src.rows, src.cols, src.type());
    
    // Convert to RGB for processing
    let rgbImg = new cv.Mat();
    cv.cvtColor(src, rgbImg, cv.COLOR_RGBA2RGB);
    
    // For each pixel in the image
    for (let y = radius; y < src.rows - radius; y++) {
      for (let x = radius; x < src.cols - radius; x++) {
        // Initialize intensity count arrays
        let intensityCounts = new Array(intensityLevels).fill(0);
        let redAccum = new Array(intensityLevels).fill(0);
        let greenAccum = new Array(intensityLevels).fill(0);
        let blueAccum = new Array(intensityLevels).fill(0);
        
        // Process neighborhood
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            // Get the RGB values at current neighborhood pixel
            let pixel = rgbImg.ucharPtr(y + dy, x + dx);
            let r = pixel[0];
            let g = pixel[1];
            let b = pixel[2];
            
            // Calculate intensity (simple average)
            let intensity = Math.floor(((r + g + b) / 3.0) * intensityLevels / 255);
            intensityCounts[intensity]++;
            
            // Accumulate RGB values by intensity
            redAccum[intensity] += r;
            greenAccum[intensity] += g;
            blueAccum[intensity] += b;
          }
        }
        
        // Find the most common intensity
        let maxCount = 0;
        let maxIndex = 0;
        for (let i = 0; i < intensityLevels; i++) {
          if (intensityCounts[i] > maxCount) {
            maxCount = intensityCounts[i];
            maxIndex = i;
          }
        }
        
        // Set the pixel to the average color of the most common intensity
        if (maxCount > 0) {
          let r = Math.round(redAccum[maxIndex] / maxCount);
          let g = Math.round(greenAccum[maxIndex] / maxCount);
          let b = Math.round(blueAccum[maxIndex] / maxCount);
          
          let dstPixel = dst.ucharPtr(y, x);
          dstPixel[0] = r;
          dstPixel[1] = g;
          dstPixel[2] = b;
          if (dstPixel.length > 3) {
            dstPixel[3] = 255; // Alpha channel
          }
        }
      }
    }
    
    rgbImg.delete();
    return dst;
  }

  function applyGrayscale(src) {
    let dst = new cv.Mat();
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
    cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA);
    return dst;
  }
  
  function applyInvert(src) {
    // Split into channels (RGBA)
    let channels = new cv.MatVector();
    cv.split(src, channels);
  
    // Invert only RGB channels (0,1,2), leave alpha (3) unchanged
    for (let i = 0; i < 3; i++) {
      let inverted = new cv.Mat();
      cv.bitwise_not(channels.get(i), inverted);
      channels.set(i, inverted);
    }
  
    // Merge channels back
    let dst = new cv.Mat();
    cv.merge(channels, dst);
  
    // Cleanup
    channels.delete();
    return dst;
  }
  
  function applyVintage(src) {
    let dst = new cv.Mat();
    
    // 1. Add sepia base
    let sepia = applySepia(src);
    
    // 2. Add vignette effect
    let vignette = applyVignette(sepia);
    sepia.delete(); // Clean up sepia mat
    
    // 3. Add noise (fixed implementation)
    let noise = new cv.Mat(vignette.rows, vignette.cols, vignette.type());
    
    // Fill with random values and convert to proper type
    cv.randn(noise, new cv.Scalar(0, 0, 0, 0), new cv.Scalar(20, 20, 20, 0)); 
    
    // Now properly add the noise using cv.addWeighted instead of cv.add
    cv.addWeighted(vignette, 1, noise, 0.2, 0, dst);
    
    // Cleanup
    vignette.delete();
    noise.delete();
    
    return dst;
  }


  function applyMotionBlur(src) {
    let dst = new cv.Mat();
    // Horizontal motion blur kernel (adjust kernel size as needed)
    let kernel = cv.Mat.ones(1, 9, cv.CV_32F);
    kernel = kernel.mul(kernel, 1/9); // Normalize
    cv.filter2D(src, dst, -1, kernel, new cv.Point(-1, -1), 0, cv.BORDER_DEFAULT);
    kernel.delete();
    return dst;
  }
  // Compression functionality
  const compressButton = document.getElementById("compressButton");
  compressButton.addEventListener("click", handleCompression);

  function handleCompression() {
      if (!currentMat) {
          alert("Please load an image first.");
          return;
      }

      const format = document.getElementById("compressFormat").value;
      const quality = parseFloat(document.getElementById("compressQuality").value) || 0.7;
      const canvas = document.createElement("canvas");
      canvas.width = currentMat.cols;
      canvas.height = currentMat.rows;
      cv.imshow(canvas, currentMat);
      
      let mimeType;
      if (format === "jpg") mimeType = "image/jpeg";
      else if (format === "webp") mimeType = "image/webp";
      else mimeType = "image/png";
      
      const dataURL = canvas.toDataURL(mimeType, quality);
      updatePreview("compressPreview", currentMat);
      updateCompressionInfo(canvas, dataURL);
      if (dataURL) updateDownloadLink(dataURL, format);
  }

  function updateCompressionInfo(canvas, dataURL) {
      const originalDataURL = canvas.toDataURL("image/png");
      const originalSize = Math.round((originalDataURL.length * (3/4)) / 1024);
      const estimatedSize = Math.round((dataURL.length * (3/4)) / 1024);
      const reduction = originalSize ? Math.round(100 - (estimatedSize / originalSize * 100)) : 0;
      document.getElementById("originalSize").textContent = `${originalSize} KB`;
      document.getElementById("estimatedSize").textContent = `${estimatedSize} KB`;
      document.getElementById("reductionPercent").textContent = `${reduction}%`;
  }

  // Download functionality
  const downloadLink = document.getElementById("downloadLink");
  function updateDownloadLink(dataURL, format = 'png') {
      if (!dataURL) return;
      downloadLink.style.display = "inline-flex";
      downloadLink.href = dataURL;
      downloadLink.download = `processed_image.${format}`;
  }

  // Resize before compression handler
  const resizeBeforeCompress = document.getElementById("resizeBeforeCompress");
  const compressWidth = document.getElementById("compressWidth");
  const keepCompressAspectRatio = document.getElementById("keepCompressAspectRatio");
  
  if (resizeBeforeCompress) {
      resizeBeforeCompress.addEventListener("change", function() {
          compressWidth.disabled = !this.checked;
          keepCompressAspectRatio.disabled = !this.checked;
      });
  }
});
