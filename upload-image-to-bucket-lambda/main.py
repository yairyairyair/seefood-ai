import os
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from minio import Minio
load_dotenv()


ACCESS_KEY = os.environ.get('ACCESS_KEY', 'minioadmin')
SECRET_KEY = os.environ.get('SECRET_KEY', 'minioadmin')

BUCKET_ENDPOINT = os.environ.get('BUCKET_ENDPOINT')
BUCKET_NAME = os.environ.get('BUCKET_NAME')

if(not BUCKET_ENDPOINT or not BUCKET_NAME):
    print('error, set BUCKET_ENDPOINT and BUCKET_NAME environment variables')
    exit(1)

MINIO_CLIENT = Minio(BUCKET_ENDPOINT, access_key=ACCESS_KEY, secret_key=SECRET_KEY, secure=False)

found = MINIO_CLIENT.bucket_exists(BUCKET_NAME)
if not found:
    print("Bucket does not exists, creating bucket")
    MINIO_CLIENT.make_bucket(BUCKET_NAME)
    print("Bucket created successfully")
else:
    print("Bucket already exists")


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post('/upload')
def upload(file: UploadFile = File(...)):
    try:
        # upload to bucket
        file_size = os.fstat(file.file.fileno()).st_size
        MINIO_CLIENT.put_object(BUCKET_NAME, file.filename, file.file, file_size)

    except Exception:
        raise HTTPException(status_code=500, detail='Something went wrong')
    finally:
        file.file.close()

    message = "It is successfully uploaded to bucket"
    print(message)
    return {"message": message}
