# Twemoji

### Requirements

* NodeJS, npm / yarn
* MongoDB
* Redis
* nodemon

### Installation

```sh
$ git clone https://github.com/hkaden/Twemoji.git
$ cd Twemoji-master
$ cp config.example.js config.js
# Edit config.js
$ yarn install
```

### JWT private / public key
```sh
cd server
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout > public.pem

# copy public.pem contents to server/public.js
# module.exports=-----BEGIN PUBLIC KEY-----\n...
```

### mailgun Setup
1. update .env
```
MAILGUN_API_KEY=apikey
```


### Run Dev 
```sh
$ yarn run dev
```

### Run Lint Test
```sh
$ yarn run lint
```

### Build
```sh
$ yarn run build
```


