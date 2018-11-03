/* global libwebp, WebAssembly */

import jimp from 'jimp';
import JSZip from 'jszip';
import EventEmitter from 'events';

const isWebAssemblySupported = () => {
  try {
    if (typeof WebAssembly === 'object'
      && typeof WebAssembly.instantiate === 'function') {
      const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
      if (module instanceof WebAssembly.Module) return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
    }
  } catch (e) {
    return false;
  }
  return false;
};

class WhatsAppStickersConverter {
  module = null;

  api = null;

  init() {
    if (!isWebAssemblySupported()) {
      throw new Error('WebAssembly is not supported.');
    }

    return new Promise((resolve, reject) => {
      // in case wasm is not loaded
      setTimeout(() => reject(new Error('WebAssembly is not loaded.')), 2000);
      libwebp({})
        .then((module) => {
          this.module = module;
          this.api = {
            version: module.cwrap('version', 'number', []),
            create_buffer: module.cwrap('create_buffer', 'number', ['number', 'number']),
            destroy_buffer: module.cwrap('destroy_buffer', '', ['number']),
            encode: module.cwrap('encode', '', ['number', 'number', 'number', 'number']),
            free_result: module.cwrap('free_result', '', ['number']),
            get_result_pointer: module.cwrap('get_result_pointer', 'number', []),
            get_result_size: module.cwrap('get_result_size', 'number', []),
          };
          console.log(`WebAssembly libwebp loaded, api version: ${this.api.version()}`);
          resolve();
        });
    });
  }

  async unzip(data) {
    return JSZip.loadAsync(data).then(async (zip) => {
      const imagePaths = [];
      zip.forEach((relativePath) => {
        if (!relativePath.startsWith('__MACOSX') && (relativePath.endsWith('.png') || relativePath.endsWith('.jpg'))) {
          imagePaths.push(relativePath);
        }
      });
      if (imagePaths.length < 3) {
        throw new Error('Less than 3 images are found!');
      }
      return {
        trayFile: await zip.file(imagePaths[0]).async('blob'),
        stickersFiles: await Promise.all(imagePaths.map(path => zip.file(path).async('blob'))),
      };
    });
  }

  async loadFile(file, type) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          if (type === 'tray') {
            resolve(await this.resizeAndConvert(reader.result, 96, false));
          } else if (type === 'stickers') {
            resolve(await this.resizeAndConvert(reader.result, 512, true));
          }
        } catch (e) {
          reject(e);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }

  convertImageDataToWebpURL(imageData, quality) {
    const p = this.api.create_buffer(imageData.width, imageData.height);
    this.module.HEAP8.set(imageData.data, p);
    this.api.encode(p, imageData.width, imageData.height, quality);
    const resultPointer = this.api.get_result_pointer();
    const resultSize = this.api.get_result_size();
    const resultView = new Uint8Array(this.module.HEAP8.buffer, resultPointer, resultSize);
    const result = new Uint8Array(resultView);
    this.api.free_result(resultPointer);
    this.api.destroy_buffer(p);
    return btoa(result.reduce((data, byte) => data + String.fromCharCode(byte), ''));
  }

  convertURLToWebpURL(url, quality) {
    // eslint-disable-next-line consistent-return
    return new Promise((resolve, reject) => {
      if (url == null) return reject();
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const image = new Image();
      image.addEventListener('load', () => {
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const useChrome = false;
        if (useChrome) {
          resolve(canvas.toDataURL('image/webp', quality));
        } else {
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          resolve(this.convertImageDataToWebpURL(imageData, Math.ceil(quality * 100)));
        }
      }, false);
      image.src = url;
    });
  }

  addNumberToURL(URI, text) {
    // eslint-disable-next-line consistent-return
    return new Promise(((resolve, reject) => {
      if (URI == null) return reject();
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const image = new Image();
      image.addEventListener('load', () => {
        canvas.width = image.width;
        canvas.height = image.height;

        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        context.save();

        // draw circle
        context.beginPath();
        context.arc(canvas.width - 0 - 16, canvas.height - 0 - 16, 16, 0, 2 * Math.PI);
        context.fillStyle = 'rgba(53, 67, 90, 0.85)';
        context.fill();

        context.restore();

        // draw number
        context.font = '30px helvetica';
        context.textAlign = 'center';
        context.fillStyle = '#f7f7f7';
        context.lineWidth = 2;
        context.fillText(`${text}`, canvas.width - 0 - 16, canvas.height - 0 - 6);
        resolve(canvas.toDataURL('image/png'));
      }, false);
      image.src = URI;
    }));
  }


  resizeAndConvert(input, px, toWebp) {
    return jimp.read(input).then((image) => {
      if (toWebp) {
        return image.contain(px, px).getBase64Async(jimp.MIME_PNG)
          .then(uri => this.convertURLToWebpURL(uri, 1).then(async (_webpUri) => {
            let webpUri = _webpUri;

            let quality = 1.0;
            while (btoa(webpUri).length > 99999 && quality >= 0.2) {
              quality -= 0.08;
              console.error(`WebP size ${Math.ceil(btoa(webpUri).length / 1024)}kb exceeded 100kb, resizing with quality ${quality}`);
              // eslint-disable-next-line no-await-in-loop
              webpUri = await this.convertURLToWebpURL(uri, quality);
            }
            return webpUri;
          }));
      }
      return image.contain(px, px).getBase64Async(jimp.MIME_PNG);
    });
  }

  convertImagesToPacks(trayFile, stickersFiles) {
    const emitter = new EventEmitter();
    (async () => {
      try {
        const tray = await this.loadFile(trayFile, 'tray');
        const stickersInPack = [];

        const numOfPacks = Math.ceil(stickersFiles.length / 30);

        for (let pack = 0; pack < numOfPacks; pack++) {
          stickersInPack.push([]);
        }

        const trays = await Promise.all(stickersInPack.map((pack, index) => (
          numOfPacks === 1 ? Promise.resolve(tray) : this.addNumberToURL(tray, `${index + 1}`)
        )));

        for (let i = 0; i < stickersFiles.length; i++) {
          // eslint-disable-next-line no-await-in-loop
          const sticker = await this.loadFile(stickersFiles[i], 'stickers');
          emitter.emit('stickerLoad');
          stickersInPack[Math.floor(i / 30)].push(sticker);
        }

        // balance stickers if the last pack has less than 3 images
        if (numOfPacks > 1 && stickersInPack[numOfPacks - 1].length < 3) {
          stickersInPack[numOfPacks - 1] = [
            ...stickersInPack[numOfPacks - 2].splice(-(3 - stickersInPack[numOfPacks - 1].length)),
            ...stickersInPack[numOfPacks - 1],
          ];
        }

        emitter.emit('load', { trays, stickersInPack });
      } catch (e) {
        emitter.emit('error', e);
      }
    })();
    return emitter;
  }
}

export default WhatsAppStickersConverter;
