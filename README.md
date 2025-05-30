# Morphix – Precision Image Transformation   
#### Description:

Morphix is a comprehensive, web-based image processing application designed to serve both casual users and professional workflows. It combines client-side editing for quick, real-time adjustments with server-side processing for advanced features, all wrapped in a clean, responsive interface. Users can perform basic edits—brightness, contrast, saturation, hue, temperature, sharpness—via intuitive sliders, and apply powerful OpenCV filters such as sketch, sepia, vignette, pixelate, oil painting, motion blur, Canny edge detection, Sobel, Laplacian, thresholding, and vintage effects. Final outputs may be downloaded in PNG, JPG, WebP formats or bundled into a multi-page PDF, with live file-size estimates and adjustable compression settings.

When launching Morphix, the homepage will have information about 8 filters that user can apply on there images right away, just upload your image chose an image and then click on process image the transformed result will be shown to the user instantly.
The nav bar of home page will feature two other page: **Image Adjustments** and **Other Tools**, where user can visit and enhance or edit their image futher.

#### Detailed Functionality

**Image Adjustments Page:**

Afters clicking on **Image Adjustments**, users upload an image via the file input control. The image is loaded onto an HTML5 Canvas, where six sliders—brightness, contrast, saturation, hue, temperature, and sharpness—become available. Each slider is linked to a JavaScript event listener that recalculates and redraws pixel data in under 50 ms, ensuring instant visual feedback without page reloads. This non-destructive, client-side approach saves bandwidth and delivers a smooth, desktop-like experience in any modern browser.

**Other tools Page:**

The **Other Tools** tab brings in **OpenCV.js**, a WebAssembly port of the OpenCV library. Users upload an image and then choose from a suite of advanced filters executed entirely in the browser:  
- **Artistic Effects**: Sketch, Oil Painting, Vignette, Vintage  
- **Creative Distortions**: Motion Blur, Pixelate  
- **Edge Detectors**: Canny, Sobel, Laplacian  
- **Thresholding**: Binary, Otsu’s method  

Resize and crop tools include common presets (720p, 1080p, Instagram square) as well as custom dimensions with an aspect-ratio lock. A real-time compression preview shows estimated file size for JPEG/WebP outputs, enabling users to balance visual fidelity and storage constraints before downloading.

**Download & Export**  
Once editing is complete, users choose from PNG, JPG, or WebP formats for single-image exports. The integration of **jsPDF** supports bundling one or more images into a single PDF, complete with auto-generated filenames and white-background padding for transparency. Adjustable quality sliders let users optimize file size for email, web publishing, or device storage, all without leaving the browser.

#### Project Architecture

- **app.py**  
  - Flask application entry point  
  - Defines routes for `/`, `/adjustments` and `/advanced`.  
  - Handles file uploads, invokes OpenCV-Python functions, and streams results.  
- **requirements.txt**  
  - Lists dependencies: Flask, OpenCV-Python, NumPy, jsPDF  
- **templates/**  
  - (`index.html`, `adjustments.html`, `advanced.html`) rendering dynamic HTML and linking static assets  
- **static/css/style.css**  
  - Responsive layout (grid & flexbox), themed sliders, mobile-first media queries  
- **static/js/script.js**  
  - UI logic: tab switching, file-input handling, download triggers  
- **static/js/adjustments.js**  
  - Canvas setup, slider event handlers, pixel manipulation routines  
- **static/js/advanced.js**  
  - Loads OpenCV.js, defines each filter function, manages resize/crop, and compression estimation  

#### Development Process & Design Choices

I initially evaluated a fully server-side pipeline versus a fully client-side approach. A server-only design simplified JavaScript but increased server load and round-trip latency. A client-only approach risked browser performance issues on large images. I settled on a hybrid model: lightweight client-side edits for instantaneous feedback, OpenCV.js for browser-based advanced filters, and a minimal Flask backend for PDF exports and fallback processing.

Choosing **HTML5 Canvas** allowed fine-grained control over pixel data without external libraries. **OpenCV.js** brought battle-tested computer-vision algorithms to the front end, avoiding the need to rewrite complex filters in JavaScript. **Flask** was selected for its simplicity and robust routing, while `io.BytesIO` streams keep image data in memory, improving performance and eliminating filesystem dependencies.

#### Future Roadmap

- **User Accounts & Cloud Storage:** Save editing states and enable project retrieval across devices.  
- **Layer & History Support:** Add non-destructive layers, undo/redo functionality, and a visual history panel.  
- **AI-Driven Filters:** Integrate TensorFlow.js for super-resolution, background removal, and style transfer.  
- **Plugin System:** Expose a JavaScript API for third-party filter and export plugin development.

#### Contributing & Community

Contributions are welcome! To contribute:  
1. Fork the repo on GitHub.  
2. Create a feature branch:  
   ```bash
   git checkout -b feature/YourFeature
3. Commit changes with clear messages.
4. Push to your branch:

   ```bash
   git push origin feature/YourFeature
   ```
5. Open a Pull Request describing your enhancements.

Please follow PEP 8 for Python code, maintain consistent JavaScript formatting, and update this README for any added features.

---

Morphix demonstrates full-stack integration of modern web technologies—HTML5, CSS3, JavaScript, OpenCV.js, Flask, and OpenCV-Python—into a polished, extensible image editing tool. It balances performance and usability, offering a solid foundation for future enhancements.
