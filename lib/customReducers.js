const LOAD_STICKERS_LIST = 'LOAD_STICKERS_LIST';
const SET_IS_LOGGED_IN = 'SET_IS_LOGGED_IN';
const GET_LOCALES = 'GET_LOCALES';
const SET_LOCALES = 'SET_LOCALES';

export const loadStickersList = stickersList => ({ type: LOAD_STICKERS_LIST, stickersList });

const DECODE_WEBP_BY_PATH = 'DECODE_WEBP_BY_PATH';
export const decodeWebpByPath = (converter, bytes, path) => ({
  type: DECODE_WEBP_BY_PATH,
  converter,
  bytes,
  path,
});

export const decodeWebp = converter => async (dispatch, getState) => {
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

export const setIsLoggedIn = (isLoggedIn) => ({
  type: SET_IS_LOGGED_IN,
  isLoggedIn,
});

export const setLocales = (locales) => ({
  type: SET_LOCALES,
  locales
});

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


export const authReducer = (state = { isLoggedIn: false }, action) => {
  switch (action.type) {
    case SET_IS_LOGGED_IN:
      return { isLoggedIn: action.isLoggedIn };
    default:
      return state;
  }
}


export const localesReducer = (state = { }, action) => {
  switch (action.type) {
    case GET_LOCALES:
      return action.locales;
    case SET_LOCALES:
    return action.locales;
    default:
      return state;
  }
}