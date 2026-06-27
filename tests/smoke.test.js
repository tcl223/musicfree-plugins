"use strict";

const assert = require("assert");
const plugin = require("../src");
const migu = require("../src/migu");
const { mapAlbumItem, mapArtistItem, mapMusicItem, mapSheetItem } = require("../src/mapper");

async function main() {
  assert.strictEqual(plugin.platform, "咪咕音乐");
  assert.strictEqual(plugin.version, "0.2.6");
  assert.ok(plugin.supportedSearchType.includes("music"));
  assert.ok(plugin.supportedSearchType.includes("sheet"));
  assert.ok(Array.isArray(plugin.userVariables));
  assert.strictEqual(plugin.userVariables[0].key, "cookie");
  assert.strictEqual(plugin.userVariables[1].key, "deviceId");

  const music = mapMusicItem({
    copyrightId: "60054701957",
    contentId: "600929000000096577",
    songId: "1140505222",
    songName: "测试歌曲",
    singerList: [{ name: "测试歌手" }],
    album: "测试专辑",
    img1: "https://example.com/cover.jpg",
    duration: 245,
    ext: {
      lrcUrl: "https://example.com/test.lrc"
    }
  });
  assert.strictEqual(music.id, "60054701957");
  assert.strictEqual(music.artist, "测试歌手");
  assert.strictEqual(music.artwork, "https://example.com/cover.jpg");
  assert.strictEqual(music.lrcUrl, "https://example.com/test.lrc");

  const album = mapAlbumItem({
    id: "600927015009000944",
    name: "最伟大的作品",
    singer: "周杰伦",
    imgItems: [{ img: "https://example.com/album.webp" }]
  });
  assert.strictEqual(album.artist, "周杰伦");

  const artist = mapArtistItem({
    id: "112",
    singer: "周杰伦",
    summary: "简介",
    imgs: [{ img: "https://example.com/avatar.webp" }]
  });
  assert.strictEqual(artist.name, "周杰伦");

  const sheet = mapSheetItem({
    id: "233754996",
    name: "周杰伦精选100首：青春百听不厌",
    musicNum: "100",
    playNum: "1481809",
    musicListPicUrl: "https://example.com/sheet.png"
  });
  assert.strictEqual(sheet.worksNum, 100);
  assert.strictEqual(sheet.playCount, 1481809);

  const info = await plugin.getMusicInfo(music);
  assert.strictEqual(info.artwork, "https://example.com/cover.jpg");
  assert.strictEqual(typeof migu.getPlayInfo, "function");

  const originalGetPlayInfo = migu.getPlayInfo;
  let getPlayInfoCalled = false;
  migu.getPlayInfo = async (musicItem) => {
    getPlayInfoCalled = true;
    assert.strictEqual(musicItem.id, music.id);
    return {
      url: "https://example.com/stream.mp3",
      headers: {
        referer: "https://music.migu.cn/"
      }
    };
  };

  const mediaSource = await plugin.getMediaSource({
    ...music,
    url: "https://example.com/search-result-url.mp3"
  });
  assert.ok(getPlayInfoCalled);
  assert.strictEqual(mediaSource.url, "https://example.com/stream.mp3");
  assert.strictEqual(mediaSource.headers.referer, "https://music.migu.cn/");

  migu.getPlayInfo = originalGetPlayInfo;

  assert.strictEqual((await plugin.importMusicSheet("https://music.migu.cn/v3/music/playlist/123456")).id, "123456");
  assert.strictEqual((await plugin.search("", 1, "music")).data.length, 0);

  console.log("Smoke tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
