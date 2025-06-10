from flask import Flask, render_template, request, send_file
import cv2
import numpy as np
import io
import os
from filters import apply_filter

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if 'file' not in request.files:
            return render_template('index.html', error='No file uploaded')
            
        file = request.files['file']
        filter_type = request.form.get('filter')
        
        if file.filename == '':
            return render_template('index.html', error='No file selected')
            
        if file and allowed_file(file.filename):
            in_memory_file = io.BytesIO()
            file.save(in_memory_file)
            data = np.frombuffer(in_memory_file.getvalue(), dtype=np.uint8)
            color_image = cv2.imdecode(data, cv2.IMREAD_COLOR)
            gray_image = cv2.cvtColor(color_image, cv2.COLOR_BGR2GRAY)
            
            processed = apply_filter(gray_image, filter_type)
            
            _, buffer = cv2.imencode('.png', processed)
            io_buf = io.BytesIO(buffer)
            
            return send_file(
                io_buf,
                mimetype='image/png',
                as_attachment=True,
                download_name=f'processed_{filter_type}.png'
            )
    
    return render_template('index.html')

@app.route('/adjustments')
def adjustments():
    return render_template('adjustments-new.html')

@app.route('/advanced')
def advanced():
    return render_template('advanced.html')


if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(host="0.0.0.0", debug=True)
