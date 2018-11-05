**Fetch Sticker**
----
  get sticker pack

* **URL**

  https://stickerizdemo.hkaden.me/api/fetchsticker/:uuid

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**
 
   `uuid=[string]`

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** 
    ```json
    {  
       "_id":"5bdfb4c3e413bf6f8cd69db8",
       "name":"a",
       "publisher":"a",
       "uuid":"d23db856-6dca-4d17-b8ae-0924975a29f5",
       "create":"2018-11-05T03:10:59.972Z",
       "stickers":[  
          [  
             "/static/imageStore/stickers/d23db856-6dca-4d17-b8ae-0924975a29f5/f3188c9b-87c9-4fc2-9f03-5234ce4d5237.png",
             "/static/imageStore/stickers/d23db856-6dca-4d17-b8ae-0924975a29f5/f7ab38f4-b7ec-40dc-9169-c07b5dc5b49b.png",
             "/static/imageStore/stickers/d23db856-6dca-4d17-b8ae-0924975a29f5/0a5c763b-e366-4c8a-908c-87b4d977e64f.png"
          ]
       ],
       "tray":[  
          "/static/imageStore/tray/d23db856-6dca-4d17-b8ae-0924975a29f5/cc336dc7-7242-43a3-8b4a-58cd51026222.png"
       ]
    }    
    ```

 **Listing Sticker**
 ----
   Listing sticker with pagination
 
 * **URL**
 
   https://stickerizdemo.hkaden.me/api/liststicker
 
 * **Method:**
 
   `GET`
   
 *  **URL Params**
 
    **Required:**
  
    `currentPage=[integer]`
 
 * **Data Params**
 
   None
 
 * **Success Response:**
 
   * **Code:** 200 <br />
     **Content:** 
     ```json
     {  
        "stickers": [
            {
                "name": "test",
                "publisher": "test",
                "preview": [
                         [
                         "data:imge/webp;base64,.........."
                    ]
                ]
            }
        ]
     }    
     ```
     
 **Fetch stickers json**
 ----
   return json
 
 * **URL**
 
   https://stickerizdemo.hkaden.me/api/addtowhatsapp/:uuid
 
 * **Method:**
 
   `GET`
   
 *  **URL Params**
 
    **Required:**
  
    `chunk=[integer]`
 
 * **Data Params**
 
   None
 
 * **Success Response:**
 
   * **Code:** 200 <br />
     **Content:** 
     ```json
     {  
        "identifier": "3db09b22-33d7-4ac0-b943-639cac6b9849_chunk0",
        "name": "test",
        "publisher": "test",
        "tray_image": "/static/imageStore/tray/d23db856-6dca-4d17-b8ae-0924975a29f5/cc336dc7-7242-43a3-8b4a-58cd51026222.png",
        "sticker": [
            {
               "image_data": "/static/imageStore/stickers/d23db856-6dca-4d17-b8ae-0924975a29f5/f3188c9b-87c9-4fc2-9f03-5234ce4d5237.png"
            },
            {
                "image_data": "/static/imageStore/stickers/d23db856-6dca-4d17-b8ae-0924975a29f5/f3188c9b-87c9-4fc2-9f03-5234ce4d5237.png"
            }
        ]
     }    
     ```
 
 
  
 


