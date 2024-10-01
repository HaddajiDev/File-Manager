
# API Documentation
## Environment variables
```
PORT = 5000
URI = your_mongodb_connection_string
```

## Overview
This API allows you to upload, download, list, and delete files using MongoDB's GridFS, as well as manage text entries. 

### Base URL
```
http://localhost:5000
```

---

## Routes

### Files Routes

1. **List All Files**

    - **Endpoint**: `GET /files/all`
    - **Description**: Retrieves a list of all files with their ID, filename, and size (in KB or MB).
    - **Curl Command**:
      ```bash
      curl http://localhost:5000/files/all
      ```
    - **Response Example**:
      ```
      ID: "66f426e38c65b40cff414e8b", Filename: "test.txt", Size: "1.23 MB"
      ID: "66f5919a9bfbe27a99f26a8b", Filename: "script1.py", Size: "500 bytes"
      ```

2. **Upload a File**

    - **Endpoint**: `POST /files/upload`
    - **Description**: Uploads a file to the server and stores it in MongoDB's GridFS.
    - **Curl Command**:
      ```bash
      curl -X POST -F "file=@/path/to/your/file.txt" http://localhost:5000/files/upload
      ```
    - **Response**: 
      ```json
      {
        "msg": "File uploaded successfully"
      }
      ```

3. **Download a File by ID**

    - **Endpoint**: `GET /files/download/:id`
    - **Description**: Downloads a file stored in GridFS using its unique ID.
    - **Curl Command**:
      ```bash
      curl -o downloaded_file.txt http://localhost:5000/files/download/<fileId>
      ```
    - **Response**: The file will be downloaded with the name `downloaded_file.txt`.

4. **Delete a File by ID**

    - **Endpoint**: `DELETE /files/delete/:id`
    - **Description**: Deletes a file and its associated chunks by its unique ID.
    - **Curl Command**:
      ```bash
      curl -X DELETE http://localhost:5000/files/delete/<fileId>
      ```
    - **Response**:
      ```json
      {
        "msg": "File deleted"
      }
      ```

### Text Routes

1. **Upload Text**

    - **Endpoint**: `POST /texts/upload`
    - **Description**: Uploads a text entry to the server.
    - **Curl Command**:
      ```bash
      curl -d "text=Your text here" http://localhost:5000/text/upload
      ```
    - **Response**: 
      ```json
      {
        "msg": "Done"
      }
      ```

2. **Get All Texts**

    - **Endpoint**: `GET /texts/all`
    - **Description**: Retrieves a list of all text entries.
    - **Curl Command**:
      ```bash
      curl http://localhost:5000/text/all
      ```
    - **Response Example**:
      ```
      0 - Your first text entry
      1 - Another text entry
      ```

3. **Delete a Text by Index**

    - **Endpoint**: `DELETE /texts/delete/:index`
    - **Description**: Deletes a text entry by its index in the list.
    - **Curl Command**:
      ```bash
      curl -X DELETE http://localhost:5000/text/delete/0
      ```
    - **Response**:
      ```json
      {
        "msg": "Done"
      }
      ```
