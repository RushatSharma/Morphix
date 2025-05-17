const fileInput = document.getElementById('fileInput');
const filterSelect = document.getElementById('filterSelect');
const uploadForm = document.getElementById('uploadForm');
const originalPreview = document.getElementById('originalPreview');
const processedPreview = document.getElementById('processedPreview');
const downloadLink = document.getElementById('downloadLink');
const processingStatus = document.createElement('div');
const formatSelect = document.getElementById('formatSelect');
const qualityRange = document.getElementById('qualityRange');
const qualityValue = document.getElementById('qualityValue');
const qualityControl = document.getElementById('qualityControl');

// Ensure no conflicting download handlers
document.addEventListener('DOMContentLoaded', function() {
    downloadLink.removeEventListener('click', handleDownload);
});

// Processing Status Setup
processingStatus.className = 'processing-status';
processingStatus.innerHTML = 'Loading OpenCV...';
processingStatus.style.textAlign = 'center';
processingStatus.style.padding = '10px';
processingStatus.style.marginBottom = '20px';
processingStatus.style.color = '#EB5A3C';
processingStatus.style.fontWeight = 'bold';
document.querySelector('.download-container').before(processingStatus);

let currentBlobURL = null;
let cvReady = false;
let processingCanvas = document.createElement('canvas');
let currentFormat = 'png';

// Wait for OpenCV to initialize
function onOpenCVReady() {
    cvReady = true;
    processingStatus.innerHTML = 'OpenCV ready!';
}

// Event Listeners
fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            originalPreview.src = e.target.result;
            originalPreview.style.display = 'block';
        };
        reader.onerror = (e) => {
            alert('Error loading image!');
        };
        reader.readAsDataURL(this.files[0]);
    }
});

qualityRange.addEventListener('input', (e) => {
    qualityValue.textContent = `${Math.round(e.target.value * 100)}%`;
});

formatSelect.addEventListener('change', () => {
    currentFormat = formatSelect.value;
    qualityControl.style.display = ['png', 'pdf'].includes(currentFormat) ? 'none' : 'flex';
});

// Image Processing
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!cvReady) {
        alert('OpenCV is not ready yet. Please wait a moment and try again.');
        return;
    }
    
    if (!fileInput.files.length) {
        alert('Please select an image!');
        return;
    }
    
    if (filterSelect.value === 'none') {
        alert('Please select a filter!');
        return;
    }

    processingStatus.innerHTML = 'Processing...';
    processingStatus.style.color = '#EB5A3C';

    try {
        // Create a new image element to ensure the image is fully loaded
        const img = new Image();
        
        img.onload = function() {
            try {
                // Set canvas dimensions
                processingCanvas.width = img.naturalWidth;
                processingCanvas.height = img.naturalHeight;
                
                // Check if the image is too small
                if (processingCanvas.width < 5 || processingCanvas.height < 5) {
                    throw new Error('Image too small (minimum 5x5 pixels)');
                }
                
                const ctx = processingCanvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                // Get image data from canvas
                const imgData = ctx.getImageData(0, 0, processingCanvas.width, processingCanvas.height);
                
                // Apply the selected filter
                applyFilter(imgData);
                
            } catch (error) {
                console.error('Processing error:', error);
                processingStatus.innerHTML = `Error: ${error.message}`;
                processingStatus.style.color = '#F44336';
                alert(`Processing failed: ${error.message}`);
            }
        };
        
        img.onerror = function() {
            processingStatus.innerHTML = 'Failed to load image';
            processingStatus.style.color = '#F44336';
            alert('Failed to load image');
        };
        
        img.src = URL.createObjectURL(fileInput.files[0]);
        
    } catch (error) {
        console.error('Error:', error);
        processingStatus.innerHTML = `Error: ${error.message}`;
        processingStatus.style.color = '#F44336';
        alert(`Processing failed: ${error.message}`);
    }
});

function applyFilter(imgData) {
    let src = null;
    let dst = null;
    
    try {
        // Create OpenCV matrices
        src = cv.matFromImageData(imgData);
        dst = new cv.Mat();
        
        const width = src.cols;
        const height = src.rows;
        
        // Apply the selected filter
        switch(filterSelect.value) {
            case 'mean':
                let kSize = 5;
                if (width < 5 || height < 5) kSize = 3;
                if (width < 3 || height < 3) throw new Error('Image too small for blur filter');
                cv.blur(src, dst, new cv.Size(kSize, kSize));
                break;
            case 'gaussian':
                let gSize = 5;
                if (width < 5 || height < 5) gSize = 3;
                if (width < 3 || height < 3) throw new Error('Image too small for Gaussian blur');
                cv.GaussianBlur(src, dst, new cv.Size(gSize, gSize), 0, 0, cv.BORDER_DEFAULT);
                break;
            case 'median':
                let mSize = 5;
                if (width < 5 || height < 5) mSize = 3;
                if (width < 3 || height < 3) throw new Error('Image too small for median filter');
                cv.medianBlur(src, dst, mSize);
                break;
            case 'laplacian': {
                let gray = new cv.Mat();
                cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
                cv.Laplacian(gray, dst, cv.CV_8U, 1);
                cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA);
                gray.delete();
                break;
            }
            case 'sobel': {
                let gray = new cv.Mat();
                cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
                let gradX = new cv.Mat();
                let gradY = new cv.Mat();
                cv.Sobel(gray, gradX, cv.CV_8U, 1, 0, 3);
                cv.Sobel(gray, gradY, cv.CV_8U, 0, 1, 3);
                cv.addWeighted(gradX, 0.5, gradY, 0.5, 0, dst);
                cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA);
                gray.delete(); gradX.delete(); gradY.delete();
                break;
            }
            case 'canny': {
                let gray = new cv.Mat();
                cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
                cv.Canny(gray, dst, 50, 150);
                cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA);
                gray.delete();
                break;
            }
            case 'binary': {
                let gray = new cv.Mat();
                cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
                cv.threshold(gray, dst, 127, 255, cv.THRESH_BINARY);
                cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA);
                gray.delete();
                break;
            }
            case 'otsu': {
                let gray = new cv.Mat();
                cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
                cv.threshold(gray, dst, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
                cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA);
                gray.delete();
                break;
            }
            default:
                src.copyTo(dst);
        }
        
        // Display the processed image
        cv.imshow(processingCanvas, dst);
        processedPreview.src = processingCanvas.toDataURL();
        processedPreview.style.display = 'block';
        
        // Update download link
        updateDownloadLink();
        downloadLink.style.display = 'inline-block';
        
        processingStatus.innerHTML = 'Processed!';
        processingStatus.style.color = '#00796b';
        
    } catch (error) {
        console.error('OpenCV error:', error);
        processingStatus.innerHTML = `Error: ${error.message || 'OpenCV processing error'}`;
        processingStatus.style.color = '#F44336';
        alert(`Processing failed: ${error.message || 'OpenCV processing error'}`);
    } finally {
        if (src && !src.isDeleted()) src.delete();
        if (dst && !dst.isDeleted()) dst.delete();
    }
}

// Replace the entire updateDownloadLink function with this version
function updateDownloadLink() {
    // Remove the download event listener if it exists
    downloadLink.removeEventListener('click', handleDownload);
    
    // Add new download handler
    downloadLink.addEventListener('click', handleDownload);
    
    // Set the link attributes for visual purposes
    downloadLink.href = "#";
    downloadLink.download = `processed-image.${currentFormat}`;
    downloadLink.style.display = 'inline-block';
}

// New function to handle the download when the link is clicked
function handleDownload(e) {
    e.preventDefault();
    
    const quality = parseFloat(qualityRange.value);
    let mimeType;
    
    switch(currentFormat) {
        case 'jpg':
            mimeType = 'image/jpeg';
            break;
        case 'webp':
            mimeType = 'image/webp';
            break;
        case 'png':
            mimeType = 'image/png';
            break;
        case 'pdf':
            createAndDownloadPDF();
            return; // Exit early for PDF
        default:
            mimeType = 'image/png';
    }
    
    // Create temporary canvas
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = processingCanvas.width;
    tempCanvas.height = processingCanvas.height;
    
    // Handle background for non-transparent formats
    if (['jpg', 'webp'].includes(currentFormat)) {
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    }
    
    // Draw the processed image onto the temp canvas
    tempCtx.drawImage(processingCanvas, 0, 0);
    
    // Convert to blob and download
    tempCanvas.toBlob((blob) => {
        if (!blob) {
            processingStatus.innerHTML = 'Error: Failed to create image blob';
            processingStatus.style.color = '#F44336';
            return;
        }
        
        // Create downloadable link
        const blobUrl = URL.createObjectURL(blob);
        
        // Create a temporary anchor element
        const tempLink = document.createElement('a');
        tempLink.href = blobUrl;
        tempLink.download = `processed-image.${currentFormat}`;
        
        // Append to document, click and remove
        document.body.appendChild(tempLink);
        tempLink.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(tempLink);
            URL.revokeObjectURL(blobUrl);
        }, 100);
        
    }, mimeType, currentFormat === 'png' ? undefined : quality);
}

// Separate function to handle PDF creation and download
function createAndDownloadPDF() {
    try {
        // Check if jspdf is available
        if (typeof jspdf === 'undefined' || !jspdf.jsPDF) {
            throw new Error('PDF library not loaded');
        }
        
        const pdf = new jspdf.jsPDF();
        
        // Create temporary canvas with white background
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = processingCanvas.width;
        tempCanvas.height = processingCanvas.height;
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(processingCanvas, 0, 0);
        
        // Get data URL from the canvas
        const imgData = tempCanvas.toDataURL('image/png');
        
        // Calculate dimensions to fit in PDF
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (tempCanvas.height * pdfWidth) / tempCanvas.width;
        
        // Add image to PDF
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        // Save PDF
        pdf.save('processed-image.pdf');
        
    } catch (error) {
        console.error('PDF creation error:', error);
        processingStatus.innerHTML = `Error: ${error.message}`;
        processingStatus.style.color = '#F44336';
        alert(`PDF creation failed: ${error.message}`);
    }
}

// Carousel Logic — page by 4 cards, slower transition
const filterGrid = document.getElementById('filterGrid');
const prevBtn    = document.getElementById('prevBtn');
const nextBtn    = document.getElementById('nextBtn');
const cards      = Array.from(document.querySelectorAll('.filter-card'));
const container  = document.querySelector('.filter-grid-container');

let currentPage = 0;

// How many cards fit in view
function cardsPerView() {
  return window.innerWidth <= 576 ? 1
       : window.innerWidth <= 768 ? 2
       : window.innerWidth <= 992 ? 3
       : 4;
}

// Jump to the correct page
function updateCarousel() {
  const perPage = cardsPerView();
  const totalPages = Math.ceil(cards.length / perPage);
  // clamp page
  currentPage = Math.max(0, Math.min(currentPage, totalPages - 1));

  // find the left offset of the first card on this page
  const startIdx = currentPage * perPage;
  const offset = cards[startIdx].offsetLeft;

  filterGrid.style.transform = `translateX(-${offset}px)`;

  prevBtn.disabled = (currentPage === 0);
  nextBtn.disabled = (currentPage === totalPages - 1);
}

// Wire up buttons
prevBtn.addEventListener('click', () => {
  currentPage--;
  updateCarousel();
});
nextBtn.addEventListener('click', () => {
  currentPage++;
  updateCarousel();
});

// Recalc on resize
window.addEventListener('resize', updateCarousel);

// Slow down the transition
filterGrid.style.transition = 'transform 1s ease';

// Initial draw
updateCarousel();


