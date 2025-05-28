import cv2
import numpy as np

def apply_filter(image, filter_type):
    # Original filters
    if filter_type == 'mean':
        return cv2.blur(image, (5,5))
    elif filter_type == 'gaussian':
        return cv2.GaussianBlur(image, (5,5), 0)
    elif filter_type == 'median':
        return cv2.medianBlur(image, 5)
    elif filter_type == 'laplacian':
        return cv2.Laplacian(image, cv2.CV_64F)
    elif filter_type == 'sobel':
        sobelx = cv2.Sobel(image, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(image, cv2.CV_64F, 0, 1, ksize=3)
        return cv2.bitwise_or(sobelx, sobely)
    elif filter_type == 'canny':
        return cv2.Canny(image, 100, 200)
    elif filter_type == 'binary':
        _, thresh = cv2.threshold(image, 127, 255, cv2.THRESH_BINARY)
        return thresh
    elif filter_type == 'otsu':
        _, thresh = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY+cv2.THRESH_OTSU)
        return thresh
    
    # Sketch-style filters
    elif filter_type == 'sketch':
        return apply_sketch_effect(image)
    elif filter_type == 'oil_painting':
        return apply_oil_painting_effect(image)
    elif filter_type == 'sepia':
        return apply_sepia_effect(image)
    elif filter_type == 'vignette':
        return apply_vignette_effect(image)
    elif filter_type == 'pixelate':
        return apply_pixelate(image)
    
    # New filters from advanced.js
    elif filter_type == 'grayscale':
        return apply_grayscale(image)
    elif filter_type == 'invert':
        return apply_invert(image)
    elif filter_type == 'motion_blur':
        return apply_motion_blur(image)
    
    
    return image

def resize_image(image, width=None, height=None, percent=None, keep_aspect_ratio=True):
    """Resize an image using width, height or percentage"""
    dim = None
    h, w = image.shape[:2]
    
    if percent is not None:
        dim = (int(w * percent), int(h * percent))
    elif width and height:
        dim = (width, height)
    elif width:
        r = width / w if keep_aspect_ratio else 1
        dim = (width, int(h * r))
    elif height:
        r = height / h if keep_aspect_ratio else 1
        dim = (int(w * r), height)
    
    return cv2.resize(image, dim, interpolation=cv2.INTER_AREA) if dim else image

# Core filter implementations
def apply_sketch_effect(image, ksize=5, sigma=0):
    """Apply a pencil sketch effect"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
    inverted = 255 - gray
    blurred = cv2.GaussianBlur(inverted, (ksize, ksize), sigma)
    return cv2.divide(gray, 255 - blurred, scale=256.0)

def apply_oil_painting_effect(image, size=7, dynamic_ratio=1):
    """Apply oil painting effect"""
    return cv2.xphoto.oilPainting(image, size, dynamic_ratio)

def apply_sepia_effect(image):
    """Apply sepia tone effect"""
    sepia_kernel = np.array([
        [0.272, 0.534, 0.131],
        [0.349, 0.686, 0.168],
        [0.393, 0.769, 0.189]
    ])
    sepia_img = cv2.transform(image, sepia_kernel)
    return np.clip(sepia_img, 0, 255).astype(np.uint8)

def apply_vignette_effect(image, sigma=150):
    """Apply vignette effect"""
    rows, cols = image.shape[:2]
    X = np.linspace(-cols/2, cols/2, cols)
    Y = np.linspace(-rows/2, rows/2, rows)
    X, Y = np.meshgrid(X, Y)
    mask = np.exp(-(X**2 + Y**2)/(2*(sigma**2)))
    mask = mask/mask.max()
    if len(image.shape) == 3:
        mask = mask[..., np.newaxis]
    return (image * mask).astype(np.uint8)

def apply_pixelate(image, pixel_size=10):
    """Pixelate the image"""
    h, w = image.shape[:2]
    small = cv2.resize(image, (max(1, w//pixel_size), max(1, h//pixel_size)), 
                      interpolation=cv2.INTER_LINEAR)
    return cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)

# New filter implementations
def apply_grayscale(image):
    """Convert image to grayscale"""
    if len(image.shape) == 3:
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return image

def apply_invert(image):
    """Invert image colors"""
    return cv2.bitwise_not(image)

def apply_motion_blur(image, kernel_size=9):
    """Apply horizontal motion blur effect"""
    kernel = np.zeros((1, kernel_size), np.float32)
    kernel[0, kernel_size//2] = 1.0
    kernel /= kernel_size
    return cv2.filter2D(image, -1, kernel)

