const LOAD_STICKERS_LIST = 'LOAD_STICKERS_LIST';

export const loadStickersList = (stickersList) => {
    return { type: LOAD_STICKERS_LIST, stickersList };
};

const DECODE_WEBP_BY_PATH = 'DECODE_WEBP_BY_PATH';
export const decodeWebpByPath = (converter, bytes, path) => {
    return {
        type: DECODE_WEBP_BY_PATH,
        converter,
        bytes,
        path,
    }
};

export const decodeWebp = (converter) => {
    return async (dispatch, getState) => {
        const stickersList = getState().stickersList;
        for (let stickersListIndex = 0; stickersListIndex < stickersList.length; stickersListIndex++) {
            const stickersKey = stickersList[stickersListIndex].stickers ? 'stickers' : 'preview';
            const stickers = stickersList[stickersListIndex].stickers || stickersList[stickersListIndex].preview;
            for (let packIndex = 0; packIndex < stickers.length; packIndex++) {
                const pack = stickers[packIndex];
                for (let stickerIndex = 0; stickerIndex < pack.length; stickerIndex++) {
                    const webpUrl = pack[stickerIndex];
                    const path = `[${stickersListIndex}].${stickersKey}[${packIndex}][${stickerIndex}]`;
                    const bytes = new Uint8Array(await (await fetch(webpUrl)).arrayBuffer());
                    await dispatch(decodeWebpByPath(converter, bytes, path));
                    // sleep for 1ms to allow image to be rendered independently
                    await new Promise(resolve => setTimeout(resolve, 1));
                }
            }
        }
    };
};


export const stickersListReducer = (state = {}, action) => {
    switch (action.type) {
        case LOAD_STICKERS_LIST:
            return action.stickersList;
        case DECODE_WEBP_BY_PATH:
            const convertedStickers = _.clone(state);
            _.set(state, action.path, action.converter.convertWebpUint8ArrayToPngURL(action.bytes));
            return convertedStickers;
        default:
            return state;
    }
};
