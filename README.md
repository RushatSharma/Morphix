# Morphix – Precision Image Transformation

Morphix is an all-in-one, web-based image processing platform designed for both casual users and professional workflows. With an intuitive, responsive UI and real-time sliders, you can fine-tune brightness, contrast, saturation, hue, temperature, and sharpness directly in your browser. Advanced users benefit from OpenCV.js integration—sketch, sepia, vignette, edge detection, thresholding, pixelation, oil painting, and vintage filters—while a Flask-powered backend enables batch processing, PDF exports, and server-side enhancements. Ideal for social media creatives, print-prep specialists, and developers seeking an extensible imaging pipeline, Morphix delivers high-quality results with minimal setup.

---
## 📌 About

Morphix merges the simplicity of client-side canvas adjustments with the power of OpenCV without requiring heavy installs. Drag and drop images to tweak colour properties instantly; switch to the Advanced tab for creative filters or precise edge-detection workflows. The optional Python Flask backend supports:

- **Automated batch jobs:** process multiple images in one request  
- **Compression & sizing:** on-the-fly quality control and live size estimates  
- **PDF exports:** bundle single or multiple images into a multi-page PDF  

Morphix’s modular codebase invites developers to add new filters, themes, and export formats with ease.

---

## ✨ Features

### 1. Basic Adjustments (Client-Side)
- Real-time sliders for brightness, contrast, saturation, hue, temperature, sharpness  
- Non-destructive edits powered by HTML5 Canvas  
- Responsive design: mobile and desktop friendly  

### 2. Advanced Filters & Tools (OpenCV.js)
- **Resize & Crop**  
  - Custom dimensions or percentage scaling  
  - Aspect-ratio lock and common presets (720p, 1080p, square)  
- **Artistic Effects**  
  - Sketch, Sepia, Vignette, Grayscale, Invert, Pixelate, Oil Painting, Vintage  
- **Edge Detection & Threshold**  
  - Blur filters: Mean, Gaussian, Median  
  - Edge detectors: Laplacian, Sobel, Canny  
  - Binarisation: Simple threshold and Otsu’s method  
- **Compression & Export**  
  - JPEG/WebP quality slider (1–100)  
  - Lossless PNG output  
  - Pre-resize optimization for smaller files  
  - Live file-size preview before download  

### 3. Download & Export Options
- Export processed images as PNG, JPG, WebP  
- Bundle images into a single PDF (via jsPDF)  
- Auto-generated filenames, white-background padding for transparency  

---

## 🛠️ Tech Stack

- **Frontend:**  
  - HTML5, CSS3 (Flexbox & Grid)  
  - Vanilla JavaScript & OpenCV.js  
  - jsPDF for PDF generation  
- **Backend:**  
  - Python 3 & Flask  
  - OpenCV-Python & NumPy  
  - In-memory file handling with `io.BytesIO`  
- **Templating & Assets:**  
  - Jinja2 for dynamic HTML rendering  
  - Organized static files (`static/css`, `static/js`, `static/img`)  

---

## 🚀 Getting Started

### Prerequisites

- Python 3.8 or higher  
- `pip` package manager  
- Git (for cloning the repository)

### Installation & Launch

```bash
# Clone the repository
git clone https://github.com/yourusername/morphix.git
cd morphix

# Install Python dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py

# Open your browser at:
# http://localhost:5000
````

---

## 🖥️ Usage

1. **Basic Adjustments**

   * Navigate to the “Adjustments” tab
   * Upload or drag-drop an image
   * Slide controls for brightness, contrast, saturation, hue, temperature, sharpness
2. **Advanced Tools**

   * Switch to the “Advanced” tab
   * Choose resize/crop presets or input custom values
   * Apply artistic filters, edge detection, thresholding
   * Adjust compression quality and view real-time file size
3. **Download**

   * Select output format (PNG, JPG, WebP, PDF)
   * Click “Download” to save your edited image(s)

---

## 📂 Project Structure

```text
morphix/
├── app.py                 # Flask application entrypoint
├── requirements.txt       # Python dependencies
├── templates/             # Jinja2 HTML templates
│   ├── index.html
│   ├── adjustments.html
│   └── advanced.html
└── static/                # Static assets
    ├── css/
    │   └── style.css
    └── js/
        ├── script.js
        ├── adjustments.js
        └── advanced.js
```

---

## 🔧 Extending Morphix

1. **Add New Filters**

   * Frontend: add OpenCV.js routines in `static/js/advanced.js`
   * Backend: implement corresponding Python/OpenCV functions in `app.py`
2. **Customize Themes**

   * Edit `static/css/style.css` or integrate a CSS framework (Bootstrap, Tailwind)
3. **Support More Formats**

   * Leverage Pillow or imageio to add TIFF, BMP, GIF exports

---

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch:

   ```bash
   git checkout -b feature/YourFeature
   ```
3. Commit your changes:

   ```bash
   git commit -m "Add awesome feature"
   ```
4. Push to your branch:

   ```bash
   git push origin feature/YourFeature
   ```
5. Open a Pull Request and describe your updates.

Please follow existing code style, include tests when applicable, and update this README for any new functionality.

---

