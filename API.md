# API Documentation
Endpoint: `https://stickerizdemo.hkaden.me/api`

## Stickers
#### `GET /stickers` Get stickers with pagination
Returns stickers, only the first 5 images of the first pack is returned. 

*  **Query Params**

    **Optional:**
    
    `limit=[integer, max 20]`
    
    `offset=[integer]`
    

* **Success Response:**

    * **Code:** 200 <br />
    * **Content:** 
     ```json
     {
         "count": 6,
         "data": [
             {
                 "_id": "5bdfcc8fd1b8dc2baf99cba7",
                 "uuid": "2abf7795-0f8a-45d0-9f77-3d4b4da2584f",
                 "publisher": "asd",
                 "name": "asd",
                 "updatedAt": "2018-11-07T05:10:57.140Z",
                 "createdAt": "2018-11-07T05:10:57.140Z",
                 "trays": [
                     "/static/imageStore/tray/2abf7795-0f8a-45d0-9f77-3d4b4da2584f/418b7ae0-ea29-4bde-b2db-a07870508014.png"
                 ],
                 "stickers": [
                     [
                         "/static/imageStore/stickers/2abf7795-0f8a-45d0-9f77-3d4b4da2584f/1c9b9afc-2d40-4e6a-8238-7af458dbf5b3.webp",
                         "/static/imageStore/stickers/2abf7795-0f8a-45d0-9f77-3d4b4da2584f/266a4322-9a83-4aff-8688-433b581c13e1.webp",
                         "/static/imageStore/stickers/2abf7795-0f8a-45d0-9f77-3d4b4da2584f/d715ebba-1df1-411e-97cb-ffabee8f8083.webp",
                         "/static/imageStore/stickers/2abf7795-0f8a-45d0-9f77-3d4b4da2584f/ca738720-3a5a-4232-a371-49ecb2520edf.webp",
                         "/static/imageStore/stickers/2abf7795-0f8a-45d0-9f77-3d4b4da2584f/ca738720-3a5a-4232-a371-49ecb2520edf.webp"
                     ]
                 ],
             },
             {...}
         ]
     }
     ```

#### `GET /stickers/:uuid` Get stickers with UUID 

*  **URL Params**

    **Required:**
    
    `uuid=[string]`    

* **Success Response:**

    * **Code:** 200 <br />
    * **Content:** 
     ```json
     {
         "_id": "5bdfcc8fd1b8dc2baf99cba7",
         "uuid": "2abf7795-0f8a-45d0-9f77-3d4b4da2584f",
         "publisher": "asd",
         "name": "asd",
         "trays": [
             "/static/imageStore/tray/2abf7795-0f8a-45d0-9f77-3d4b4da2584f/418b7ae0-ea29-4bde-b2db-a07870508014.png"
         ],
         "updatedAt": "2018-11-07T05:15:14.405Z",
         "createdAt": "2018-11-07T05:15:14.405Z",
         "stickers": [
             [
                 "/static/imageStore/stickers/2abf7795-0f8a-45d0-9f77-3d4b4da2584f/1c9b9afc-2d40-4e6a-8238-7af458dbf5b3.webp",
                 "/static/imageStore/stickers/2abf7795-0f8a-45d0-9f77-3d4b4da2584f/266a4322-9a83-4aff-8688-433b581c13e1.webp",
                 "/static/imageStore/stickers/2abf7795-0f8a-45d0-9f77-3d4b4da2584f/d715ebba-1df1-411e-97cb-ffabee8f8083.webp",
                 "/static/imageStore/stickers/2abf7795-0f8a-45d0-9f77-3d4b4da2584f/ca738720-3a5a-4232-a371-49ecb2520edf.webp",
                 "/static/imageStore/stickers/2abf7795-0f8a-45d0-9f77-3d4b4da2584f/ca738720-3a5a-4232-a371-49ecb2520edf.webp",
                 "/static/imageStore/stickers/2abf7795-0f8a-45d0-9f77-3d4b4da2584f/ca738720-3a5a-4232-a371-49ecb2520edf.webp",
                 "/static/imageStore/stickers/2abf7795-0f8a-45d0-9f77-3d4b4da2584f/ca738720-3a5a-4232-a371-49ecb2520edf.webp",
                 "/static/imageStore/stickers/2abf7795-0f8a-45d0-9f77-3d4b4da2584f/ca738720-3a5a-4232-a371-49ecb2520edf.webp"
             ]
         ]
     }
     ```


## Authentication & Authorization
#### `POST /register` Register a user
Register a user and send an verification email to the given email address

*  **Query Params**

    **Required:**
    
    `username=[string, min: 4, max: 20, not in restrictedUsernames]`

    `password=[string, min: 6]`

    `confirmPassword=[string, min: 6]`

    `email=[email]`
    

* **Success Response:**

    * **Code:** 200 <br />
    * **Content:** 
     ```json
     {
        "type": "VERIFICATION_EMAIL_SENT",
        "message": "A verification email has been sent to testUser@gmail.com"
     }
     ```

#### `POST /verifyAccount` Verify an account
Verify an account based on a given token

*  **Query Params**

    **Required:**
    
    `token=[string]`
    

* **Success Response:**

    * **Code:** 200 <br />
    * **Content:** 
     ```json
     {
        "type": "ACCOUNT_VERIFIED",
        "message": "The account has been verified"
     }
     ```

#### `POST /login` 
Only allow users who have already verified to login

*  **Query Params**

    **Required:**
    
    `email=[email]`

    `password=[string, min: 6]`
    

* **Success Response:**

    * **Code:** 200 <br />
    * **Content:** 
     ```json
     {
        "type": "LOGIN_SUCCESS",
        "message": "Login Successfully",
        "user": {
            "uuid": "ce1f0b89-dd71-44f0-adf4-ed1d5c6aa273",
            "username": "testUser",
            "email": "testUser@gmail.com",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3RVc2VyIiwiZW1haWwiOiJ3aW5na3dvbmcubWVAZ21haWwuY29tIiwiaWQiOiJjZTFmMGI4OS1kZDcxLTQ0ZjAtYWRmNC1lZDFkNWM2YWEyNzMiLCJleHAiOjE1NDcwMzM5MjUsImlhdCI6MTU0MTg0OTkyNX0.NKrWb-gfoi8IvZeQFhVJ2kiHzokFDmPKYmejBicRg2g"
        }
     }
     ```