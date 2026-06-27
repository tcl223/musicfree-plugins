"use strict";

const migu = require("./migu");

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
