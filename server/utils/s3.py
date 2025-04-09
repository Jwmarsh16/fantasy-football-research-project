# utils/s3.py
from werkzeug.utils import secure_filename
import os
from config import s3, app

S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def upload_to_s3(file, user_id):
    file_key = f"user_{user_id}/{secure_filename(file.filename)}"
    try:
        s3.upload_fileobj(file, S3_BUCKET_NAME, file_key, ExtraArgs={"ACL": "private", "ContentType": file.content_type})
        return file_key
    except Exception as e:
        print(f"Error uploading file to S3: {e}")
        return None

def delete_from_s3(file_key):
    try:
        s3.delete_object(Bucket=S3_BUCKET_NAME, Key=file_key)
    except Exception as e:
        print(f"Error deleting file from S3: {e}")

def generate_presigned_url(file_key):
    try:
        return s3.generate_presigned_url('get_object', Params={'Bucket': S3_BUCKET_NAME, 'Key': file_key}, ExpiresIn=86400)
    except Exception as e:
        print(f"Error generating pre-signed URL: {e}")
        return None
