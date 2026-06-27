# MusicFree 咪咕音乐插件

这是一个可直接导入 MusicFree 的外部插件工程骨架，目标是接入咪咕音乐的公开可访问内容，支持搜索、歌词、歌单链接解析与歌单导入的开发流程。

重要边界：

- 本项目不包含会员绕过、加密破解、私有接口复用、音源提取等实现。
- 播放函数只返回公开接口直接给出的可播放地址；拿不到时会返回空结果。
- 如果后续要开源发布，请先确认咪咕音乐的服务条款、版权授权和第三方接入许可。

## 文件结构

- `dist/migu-musicfree.js`：MusicFree 可直接导入的插件文件。
- `src/index.js`：插件入口与 MusicFree 协议函数。
- `src/migu.js`：咪咕公开网页接口适配层。
- `src/mapper.js`：咪咕数据到 MusicFree 数据结构的映射。
- `tests/smoke.test.js`：离线烟测，不依赖网络。
- `tests/live.test.js`：真实网络测试，依赖当前网络与咪咕接口可用性。

## 使用

先运行离线测试：

```powershell
npm.cmd test
```

生成可导入文件：

```powershell
npm.cmd run build
```

然后在 MusicFree 的插件管理页面中导入：

```text
D:\musicplugins\dist\migu-musicfree.js
```

## 开发路线

1. 先跑通 `search`，确认 MusicFree 里能显示歌曲。
2. 再跑通 `getLyric`，补全歌词体验。
3. 再处理 `importMusicSheet` 和 `getMusicSheetInfo`，支持歌单导入。
4. 最后处理 `getMediaSource`，只接入公开允许的可播放地址。

