# API Documentation
Endpoint: `https://stickerizdemo.hkaden.me/api`

## Stickers
### Sticker model
```json5
    {
        "uuid": "2a2c5c58-d10b-4481-841b-b99a17037829",
        "publisher": "asd",
        "name": "asd",
        "updatedAt": "2018-11-10T12:23:38.137Z",
        "createdAt": "2018-11-10T12:23:38.137Z",
        "sharingType": "public", // public or link
        "adminTags": ["original"],
        "userTags": ["Pet", "Dog"],
        "stats": {
            "yearlyDownloads": 15,
            "monthlyDownloads": 15,
            "weeklyDownloads": 15,
            "dailyDownloads": 15,
            "yearlyViews": 1,
            "monthlyViews": 1,
            "weeklyViews": 1,
            "dailyViews": 1,
            "stickers": 28,
            "packs": 1
        },
        "tray": "/static/imageStore/tray/2a2c5c58-d10b-4481-841b-b99a17037829/88b90063-f432-4ede-bbeb-becade9eea1a.png",
        "trays": [
            "/static/imageStore/tray/2a2c5c58-d10b-4481-841b-b99a17037829/66628ed2-4701-4658-8c29-d9de962bebe5.png"
        ],
        "stickers": [
            [
                "/static/imageStore/stickers/2a2c5c58-d10b-4481-841b-b99a17037829/b40d38fe-5f0b-4860-9401-ec31543a1964.webp",
                "/static/imageStore/stickers/2a2c5c58-d10b-4481-841b-b99a17037829/7f97de73-8f99-4c5f-b730-832fd1a63378.webp",
                "/static/imageStore/stickers/2a2c5c58-d10b-4481-841b-b99a17037829/acf53661-edac-40a9-bcb4-a6625ec93700.webp",
                "/static/imageStore/stickers/2a2c5c58-d10b-4481-841b-b99a17037829/1ebe0e46-b80b-4b08-884d-de3296a8ebed.webp",
                "/static/imageStore/stickers/2a2c5c58-d10b-4481-841b-b99a17037829/a6938ec0-b460-49d7-9da9-d9019201effb.webp"
            ],
            [
                "/static/imageStore/stickers/2a2c5c58-d10b-4481-841b-b99a17037829/b40d38fe-5f0b-4860-9401-ec31543a1964.webp",
                "/static/imageStore/stickers/2a2c5c58-d10b-4481-841b-b99a17037829/7f97de73-8f99-4c5f-b730-832fd1a63378.webp",
                "/static/imageStore/stickers/2a2c5c58-d10b-4481-841b-b99a17037829/acf53661-edac-40a9-bcb4-a6625ec93700.webp",
                "/static/imageStore/stickers/2a2c5c58-d10b-4481-841b-b99a17037829/1ebe0e46-b80b-4b08-884d-de3296a8ebed.webp",
                "/static/imageStore/stickers/2a2c5c58-d10b-4481-841b-b99a17037829/a6938ec0-b460-49d7-9da9-d9019201effb.webp"
            ]
        ]
    }
```
#### `GET /stickers` Get stickers with pagination
Returns stickers, only the first 5 images of the first pack is returned. 

*  **Query Params**

    **Optional:**
    
    `limit=[integer, max 20]`
    
    `offset=[integer]`
    
    `sort=['createdAt', 'popular', 'packs', 'stickers',
            'dailyViews', 'weeklyViews', 'monthlyViews', 'yearlyViews',
            'dailyDownloads', 'weeklyDownloads', 'monthlyDownloads', 'yearlyDownloads',
          ]`
    
    `order=['asc', 'desc']`
    

* **Success Response:**

    * **Code:** 200 <br />
    * **Content:** 
     ```json5
     {
         "count": 6,
         "data": [
            /* sticker model */,
            /* sticker model */
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
     /* sticker model */
     ```

## Stickers Statistics
#### `GET /statistics/stickers` Get stickers statistics 

* **Success Response:**

    * **Code:** 200 <br />
    * **Content:** 
     ```json5
    {
      "public": {
        "packs": 5,
        "stickers": 48,
        "dailyViews": 25,
        "weeklyViews": 25,
        "monthlyViews": 25,
        "yearlyViews": 25,
        "dailyDownloads": 15,
        "weeklyDownloads": 15,
        "monthlyDownloads": 15,
        "yearlyDownloads": 15
      },
      "link": {
        "packs": 0,
        "stickers": 0,
        "dailyViews": 25,
        "weeklyViews": 25,
        "monthlyViews": 25,
        "yearlyViews": 25,
        "dailyDownloads": 15,
        "weeklyDownloads": 15,
        "monthlyDownloads": 15,
        "yearlyDownloads": 15
      },
      "private": {
        "packs": 0,
        "stickers": 0,
        "dailyViews": 25,
        "weeklyViews": 25,
        "monthlyViews": 25,
        "yearlyViews": 25,
        "dailyDownloads": 15,
        "weeklyDownloads": 15,
        "monthlyDownloads": 15,
        "yearlyDownloads": 15
      }
    }
     ```

#### `POST /statistics/stickers/:uuid/download` Increment download count for sticker 

*  **URL Params**

    **Required:**
    
    `uuid=[string]`    

* **Success Response:**

    * **Code:** 200 <br />

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
        "type": "VERIFICATION_EMAIL_SENT",
        "message": "A verification email has been sent to user@gmail.com"
    }
     ```

#### `POST /resendVerificationEmail` Resend verification email 
Resend verification email 

*  **Query Params**

    **Required:**
    
    `email=[email]`
    

* **Success Response:**

    * **Code:** 200 <br />
    * **Content:** 
     ```json
    {
        "type": "VERIFICATION_EMAIL_SENT",
        "message": "A verification email has been sent to user@gmail.com"
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

#### `POST /logout` 
Only allow users who have already logged in to logout

*  **Query Params**

    **Required:**
    
    `jwtToken=[String] in cookie`
    

* **Success Response:**

    * **Code:** 200 <br />
    * **Content:** 
     ```json
     {
        "type": "LOGGED_OUT_SUCCESS",
        "message": "Logged out Successfully"
        }
     }
     ```
