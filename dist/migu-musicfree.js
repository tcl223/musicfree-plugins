"use strict";

const __mapper = (() => {
function firstString() {
  for (const value of arguments) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function firstNumber() {
  for (const value of arguments) {
    const number = Number(value);
    if (Number.isFinite(number) && number > 0) {
      return number;
    }
  }
  return undefined;
}

function isDirectAudioUrl(value) {
  const url = firstString(value);
  if (!url) {
    return false;
  }

  return /\.(mp3|m4a|aac|flac|wav|ogg|wma)(?:$|\?)/i.test(url);
}

function pickArtwork(raw) {
  if (!raw) {
    return "";
  }

  if (Array.isArray(raw.imgs)) {
    const image = raw.imgs.find((entry) => entry && (entry.img || entry.url));
    if (image) {
      return firstString(image.img, image.url);
    }
  }

  if (Array.isArray(raw.imgItems)) {
    const item = raw.imgItems.find((entry) => entry && (entry.img || entry.imgUrl || entry.url));
    if (item) {
      return firstString(item.img, item.imgUrl, item.url);
    }
  }

  return firstString(
    raw.cover,
    raw.coverUrl,
    raw.albumPic,
    raw.picUrl,
    raw.img,
    raw.imgUrl,
    raw.musicListPicUrl,
    raw.imageUrl,
    raw.avatar,
    raw.img1,
    raw.img2,
    raw.img3
  );
}

function normalizeArtists(raw) {
  const source = raw.singerName || raw.artistName || raw.singers || raw.artists || raw.singerList || raw.singer;

  if (Array.isArray(source)) {
    return source
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }
        return firstString(item.name, item.singerName, item.artistName);
      })
      .filter(Boolean)
      .join(", ");
  }

  return firstString(source);
}

function mapMusicItem(raw) {
  const copyrightId = firstString(raw.copyrightId, raw.copyright_id, raw.cpId);
  const songId = firstString(raw.songId, raw.id, raw.resourceId, raw.musicId, raw.contentId);
  const id = copyrightId || songId;
  const ext = raw.ext && typeof raw.ext === "object" ? raw.ext : {};
  const listenUrl = firstString(raw.listenUrl, raw.playUrl);
  const fallbackUrl = isDirectAudioUrl(raw.url) ? firstString(raw.url) : "";

  return {
    id,
    title: firstString(raw.songName, raw.title, raw.name),
    artist: normalizeArtists(raw),
    album: firstString(raw.albumName, raw.album, raw.albumTitle),
    artwork: pickArtwork(raw),
    duration: firstNumber(raw.duration, raw.length, raw.interval),
    copyrightId,
    songId,
    contentId: firstString(raw.contentId, raw.contentID, raw.content_id, raw.cid),
    platform: "咪咕音乐",
    url: listenUrl || fallbackUrl,
    rawLrc: firstString(raw.lrc, raw.lyric),
    lrcUrl: firstString(raw.lrcUrl, ext.lrcUrl),
    $raw: raw
  };
}

function mapSheetItem(raw) {
  const id = firstString(raw.playListId, raw.playlistId, raw.id, raw.listId);

  return {
    id,
    title: firstString(raw.playListName, raw.playlistName, raw.title, raw.name),
    artist: firstString(raw.createName, raw.creator, raw.userName, raw.author),
    artwork: pickArtwork(raw),
    platform: "咪咕音乐",
    worksNum: firstNumber(raw.musicNum, raw.totalCount),
    playCount: firstNumber(raw.playNum),
    $raw: raw
  };
}

function mapAlbumItem(raw) {
  return {
    id: firstString(raw.albumId, raw.id),
    title: firstString(raw.albumName, raw.title, raw.name),
    artist: normalizeArtists(raw),
    artwork: pickArtwork(raw),
    platform: "咪咕音乐",
    createAt: firstString(raw.publishDate),
    $raw: raw
  };
}

function mapArtistItem(raw) {
  return {
    id: firstString(raw.singerId, raw.artistId, raw.id),
    name: firstString(raw.singerName, raw.artistName, raw.name, raw.singer),
    avatar: pickArtwork(raw),
    platform: "咪咕音乐",
    description: firstString(raw.summary),
    $raw: raw
  };
}

return {
  firstString,
  isDirectAudioUrl,
  mapAlbumItem,
  mapArtistItem,
  mapMusicItem,
  mapSheetItem
};

})();

const __migu = (() => {
const { mapAlbumItem, mapArtistItem, mapMusicItem, mapSheetItem } = __mapper;


const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const DEFAULT_HEADERS = {
  appid: "h5",
  activityid: "MUSIC-WWW",
  channel: "014X031",
  imei: "h5page",
  imsi: "h5page",
  logid: "cfrom=&appId=h5",
  origin: "https://music.migu.cn",
  platform: "H5",
  pacmtoken: "",
  referer: "https://music.migu.cn/",
  subchannel: "014X031",
  test: "00",
  ua: "Android_migu",
  uid: "",
  version: "6.8.8",
  accept: "application/json, text/plain, */*",
  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
  "user-agent": USER_AGENT
};

const PLAYBACK_HEADERS = {
  ...DEFAULT_HEADERS,
  signversion: "H001",
  ua: "H5_migu"
};

const MOBILE_PLAYBACK_HEADERS = {
  Accept: "application/json, text/plain, */*",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  Connection: "keep-alive",
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  Host: "m.music.migu.cn",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  "User-Agent": USER_AGENT,
  "X-Requested-With": "XMLHttpRequest"
};

const SEARCH_CONFIG = {
  music: {
    url: "https://app.u.nf.migu.cn/pc/resource/song/item/search/v1.0",
    params: (query, page) => ({
      text: query,
      pageNo: String(page),
      pageSize: "20"
    }),
    pickList: (payload) => (Array.isArray(payload) ? payload : [])
  },
  album: {
    url: "https://app.u.nf.migu.cn/pc/bmw/album/search/v1.0",
    params: (query, page) => ({
      text: query,
      pageNo: String(page),
      pageSize: "20"
    }),
    pickList: (payload) => (((payload || {}).data || {}).result || [])
  },
  artist: {
    url: "https://app.u.nf.migu.cn/pc/resource/search/singer/v1.0",
    params: (query) => ({
      text: query
    }),
    pickList: (payload) => (((payload || {}).data) || [])
  },
  sheet: {
    url: "https://app.u.nf.migu.cn/pc/v1.0/content/search_all.do",
    params: (query, page) => ({
      text: query,
      pageNo: String(page),
      pageSize: "20",
      searchSwitch: "{\"songlist\": 1}"
    }),
    pickList: (payload) => (((payload || {}).songListResultData || {}).result || [])
  }
};

function loadAxios() {
  try {
    return require("axios");
  } catch (error) {
    return null;
  }
}

function getUserVariables() {
  if (typeof env !== "undefined" && env && typeof env.getUserVariables === "function") {
    return env.getUserVariables() || {};
  }
  return {};
}

function getCookieHeader() {
  const vars = getUserVariables();
  const raw = vars.cookie || vars.Cookie || vars.miguCookie || "";
  return String(raw).replace(/^cookie\s*:\s*/i, "").trim();
}

function getCookieValue(name) {
  const cookie = getCookieHeader();
  if (!cookie) {
    return "";
  }

  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]*)`, "i"));
  return match ? match[1] : "";
}

function getConfiguredDeviceId() {
  const vars = getUserVariables();
  const value = vars.deviceId || vars.deviceid || "";
  return String(value).trim();
}

function buildDeviceId() {
  const configured = getConfiguredDeviceId();
  if (configured) {
    return configured;
  }
  return "5220F205-2F28-4B53-9AD0-CAC868059B72";
}

function buildHeaders(extraHeaders, baseHeaders) {
  const cookie = getCookieHeader();
  const pacmtoken = getCookieValue("pacmtoken");
  return {
    ...(baseHeaders || DEFAULT_HEADERS),
    timestamp: String(Date.now()),
    deviceid: buildDeviceId(),
    ...(pacmtoken ? { pacmtoken } : {}),
    ...(cookie ? { cookie } : {}),
    ...extraHeaders
  };
}

function normalizeMethod(method) {
  return String(method || "GET").toUpperCase();
}

function buildUrl(baseUrl, params) {
  const url = new URL(baseUrl);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

async function requestJson(url, options) {
  const axios = loadAxios();
  const headers = buildHeaders((options && options.headers) || {}, options && options.baseHeaders);
  const method = normalizeMethod(options && options.method);
  const data = options && options.data;

  if (axios) {
    const response = await axios.request({
      url,
      method,
      headers,
      timeout: 15000,
      data
    });
    return typeof response.data === "string" ? JSON.parse(response.data) : response.data;
  }

  if (typeof fetch !== "function") {
    throw new Error("Neither axios nor fetch is available in this plugin runtime.");
  }

  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  return JSON.parse(text);
}

async function requestText(url, options) {
  const axios = loadAxios();
  const headers = buildHeaders((options && options.headers) || {}, options && options.baseHeaders);
  const method = normalizeMethod(options && options.method);
  const data = options && options.data;

  if (axios) {
    const response = await axios.request({
      url,
      method,
      headers,
      timeout: 15000,
      responseType: "text",
      data
    });
    return typeof response.data === "string" ? response.data : String(response.data || "");
  }

  if (typeof fetch !== "function") {
    throw new Error("Neither axios nor fetch is available in this plugin runtime.");
  }

  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function requestArrayBuffer(url, options) {
  const axios = loadAxios();
  const headers = buildHeaders((options && options.headers) || {}, options && options.baseHeaders);
  const method = normalizeMethod(options && options.method);
  const data = options && options.data;

  if (axios) {
    const response = await axios.request({
      url,
      method,
      headers,
      timeout: 15000,
      responseType: "arraybuffer",
      data
    });
    return response.data;
  }

  if (typeof fetch !== "function") {
    throw new Error("Neither axios nor fetch is available in this plugin runtime.");
  }

  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.arrayBuffer();
}

function decryptMiguResponse(buffer, keyStr) {
  const e = new Uint8Array(buffer);
  const n = e.length;
  if (n < 4 || e[0] !== 171 || e[1] !== 205 || e[2] !== 1) {
      return null;
  }
  
  const t = e[3];
  let a;
  if (typeof TextEncoder !== "undefined") {
    a = new TextEncoder().encode(keyStr);
  } else {
    a = new Uint8Array(keyStr.length);
    for (let j = 0; j < keyStr.length; j++) {
      a[j] = keyStr.charCodeAt(j);
    }
  }
  
  const i = a.length;
  const o = new Uint8Array(n - 4);
  
  let s = 0;
  for (let u = 4; u < n; u++, s++) {
    let val = e[u] + t - a[s % i];
    o[s] = val & 0xFF;
  }
  
  if (typeof TextDecoder !== "undefined") {
    return new TextDecoder().decode(o);
  } else {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(o).toString('utf8');
    }
    let out = "";
    for (let j = 0; j < o.length; j++) {
      out += String.fromCharCode(o[j]);
    }
    try {
      return decodeURIComponent(escape(out));
    } catch(err) {
      return out;
    }
  }
}

function pickMapper(type) {
  if (type === "album") {
    return mapAlbumItem;
  }
  if (type === "artist") {
    return mapArtistItem;
  }
  if (type === "sheet") {
    return mapSheetItem;
  }
  return mapMusicItem;
}

function ensureSuccess(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && payload.code && payload.code !== "000000") {
    throw new Error(payload.info || "Migu request failed.");
  }

  return payload;
}

function pickFirstSong(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }
  return items[0];
}

async function checkCanListen(contentId) {
  const url = "https://app.c.nf.migu.cn/strategy/pc/can-listen/v1.0";
  const payload = await requestJson(url, {
    method: "POST",
    baseHeaders: PLAYBACK_HEADERS,
    headers: {
      "content-type": "application/json",
      origin: "https://music.migu.cn"
    },
    data: {
      contentId: String(contentId)
    }
  });

  const list =
    (((payload || {}).data || {}).canListenRespItemList || [])
      .filter(Boolean);
  const item = list.find((entry) => String(entry.contentId) === String(contentId)) || list[0];

  return item || null;
}

async function search(query, page, type) {
  const searchType = SEARCH_CONFIG[type] ? type : "music";
  const config = SEARCH_CONFIG[searchType];
  const url = buildUrl(config.url, config.params(query, page || 1));
  const payload = ensureSuccess(await requestJson(url));
  const list = config.pickList(payload);
  const mapper = pickMapper(searchType);
  const data = list.map(mapper).filter((item) => item && item.id);

  return {
    isEnd: data.length < 20,
    data
  };
}

async function getLyric(musicItem) {
  if (musicItem && musicItem.lrcUrl) {
    return {
      rawLrc: await requestText(musicItem.lrcUrl, {
        headers: {
          referer: "https://music.migu.cn/"
        }
      })
    };
  }

  const copyrightId = musicItem && (musicItem.copyrightId || musicItem.id);
  if (!copyrightId) {
    throw new Error("Missing copyright id.");
  }

  const url = buildUrl("https://music.migu.cn/v3/api/music/audioPlayer/getLyric", {
    copyrightId
  });
  const payload = ensureSuccess(await requestJson(url));
  const data = payload.data || payload;

  return {
    rawLrc: data.lyric || data.lrc || data.rawLrc || "",
    translation: data.translateLyric || data.transLrc || ""
  };
}

async function getPlayInfo(musicItem) {
  const contentId = musicItem && (
    musicItem.contentId ||
    musicItem.$raw && (musicItem.$raw.contentId || musicItem.$raw.contentID || musicItem.$raw.content_id || musicItem.$raw.cid)
  );
  const copyrightId = musicItem && (
    musicItem.copyrightId ||
    musicItem.$raw && (musicItem.$raw.copyrightId || musicItem.$raw.copyright_id || musicItem.$raw.cpId)
  );
  const resourceType = musicItem && (
    musicItem.resourceType || 
    (musicItem.$raw && musicItem.$raw.resourceType) || "2"
  );
  
  if (!contentId || !copyrightId) {
    throw new Error("Missing contentId or copyrightId.");
  }

  const url = "https://app.c.nf.migu.cn/MIGUM3.0/strategy/pc/listen/v2.0";
  const params = {
    contentId: String(contentId),
    copyrightId: String(copyrightId),
    resourceType: String(resourceType),
    netType: "01",
    toneFlag: "PQ",
    scene: ""
  };
  const queryString = Object.entries(params).map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join("&");
  const fullUrl = `${url}?${queryString}`;
  
  const buffer = await requestArrayBuffer(fullUrl, {
    baseHeaders: PLAYBACK_HEADERS,
    headers: {
      birth: "h5page",
      signature: "1"
    }
  });

  const decrypted = decryptMiguResponse(buffer, "Jk8qzuePiJ1qE3mDYhLQ3T73DtDoAhLP");
  if (!decrypted) {
    throw new Error("Failed to decrypt Migu v5 playback data.");
  }

  let payload;
  try {
    payload = JSON.parse(decrypted);
  } catch (e) {
    throw new Error("Failed to parse decrypted data.");
  }

  if (payload.code && payload.code !== "000000") {
     throw new Error(payload.info || "Migu playback request failed.");
  }

  const playUrl = payload.data && payload.data.url;
  if (!playUrl) {
    throw new Error((payload.data && payload.data.dialogInfo && payload.data.dialogInfo.text) || "No playable source returned by Migu.");
  }

  return {
    url: playUrl,
    headers: {
      referer: "https://music.migu.cn/",
      origin: "https://music.migu.cn",
      "user-agent": USER_AGENT,
      signversion: "H001",
      ua: "H5_migu",
      ...(getCookieHeader() ? { cookie: getCookieHeader() } : {}),
      ...(getCookieValue("pacmtoken") ? { pacmtoken: getCookieValue("pacmtoken") } : {})
    }
  };
}

async function getMusicInfo(musicItem) {
  return musicItem && musicItem.$raw ? {
    artwork: musicItem.artwork,
    album: musicItem.album,
    duration: musicItem.duration,
    rawLrc: musicItem.rawLrc,
    lrcUrl: musicItem.lrcUrl
  } : {};
}

function firstPlayableUrl(song) {
  const candidates = [
    song.listenUrl,
    song.playUrl,
    song.url,
    song.mp3Url,
    song.hqUrl,
    song.sqUrl,
    song.zq24Url,
    song.m4aUrl,
    song.ext && song.ext.listenUrl,
    song.ext && song.ext.playUrl,
    song.ext && song.ext.url,
    song.ext && song.ext.audioUrl,
    song.ext && song.ext.mp3Url
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      const url = candidate.trim();
      if (url === song.url && !isPlayableUrl(url)) {
        continue;
      }
      return url;
    }
  }

  return "";
}

function isPlayableUrl(value) {
  return /\.(mp3|m4a|aac|flac|wav|ogg|wma)(?:$|\?)/i.test(String(value || "").trim());
}

function parseSheetId(urlLike) {
  const text = String(urlLike || "").trim();
  if (!text) {
    return "";
  }

  const patterns = [
    /playlist\/(\d+)/i,
    /playlistId=(\d+)/i,
    /playListId=(\d+)/i,
    /musicListId=(\d+)/i,
    /^(\d+)$/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return "";
}

async function getSheetInfo() {
  throw new Error("Playlist detail is not implemented for the v5 adapter yet.");
}

return {
  getLyric,
  getPlayInfo,
  getMusicInfo,
  getSheetInfo,
  parseSheetId,
  requestJson,
  search
};

})();

const migu = __migu;


async function safeCall(action, fallback) {
  try {
    return await action();
  } catch (error) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw error;
  }
}

module.exports = {
  platform: "咪咕音乐",
  author: "MusicFree community",
  version: "0.2.6",
  srcUrl: "",
  cacheControl: "no-cache",
  supportedSearchType: ["music", "album", "artist", "sheet"],
  userVariables: [
    {
      key: "cookie",
      name: "Cookie",
      hint: "登录咪咕后，从浏览器开发者工具里复制完整 Cookie"
    },
    {
      key: "deviceId",
      name: "DeviceId",
      hint: "从咪咕网页请求头里复制 deviceId，例如 5220F205-2F28-4B53-9AD0-CAC868059B72"
    }
  ],
  hints: {
    importMusicSheet: ["咪咕歌单链接", "咪咕歌单ID"]
  },

  async search(query, page, type) {
    if (!query) {
      return {
        isEnd: true,
        data: []
      };
    }

    return migu.search(query, page || 1, type || "music");
  },

  async getMediaSource(musicItem) {
    if (!musicItem) {
      throw new Error("Missing music item.");
    }

    try {
      return await migu.getPlayInfo(musicItem);
    } catch (error) {
      if (musicItem.url) {
        return {
          url: musicItem.url,
          headers: {
            referer: "https://music.migu.cn/",
            origin: "https://music.migu.cn",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
          }
        };
      }

      throw error;
    }
  },

  async getLyric(musicItem) {
    return safeCall(() => migu.getLyric(musicItem), {
      rawLrc: ""
    });
  },

  async getMusicInfo(musicItem) {
    return safeCall(() => migu.getMusicInfo(musicItem), {});
  },

  async importMusicSheet(urlLike) {
    const id = migu.parseSheetId(urlLike);
    if (!id) {
      return null;
    }

    return {
      id,
      title: `咪咕歌单 ${id}`,
      platform: "咪咕音乐"
    };
  },

  async getMusicSheetInfo(sheetItem, page) {
    return migu.getSheetInfo(sheetItem, page || 1);
  }
};

