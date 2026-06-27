"use strict";

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

module.exports = {
  firstString,
  isDirectAudioUrl,
  mapAlbumItem,
  mapArtistItem,
  mapMusicItem,
  mapSheetItem
};
