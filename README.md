# 🎬 TwitchClipGenerator

> Finds the funny moments in a past Twitch stream so you don't have to rewatch three hours of it.

Give it a Twitch VOD and it reads the chat, looks for laughter and reaction spikes, and gives you a short list of timestamps worth turning into clips.

**Status:** early days. Right now it reads the chat of a single VOD. Audio, transcription and the web UI come later.

---

## How it works

```
 VOD ID ──► download chat ──► filter bots ──► detect laughter ──► candidate timestamps
                                                                        │
                                                         (later) audio + transcript
                                                                        │
                                                         (later) LLM ranks & titles
                                                                        │
                                                         (later) cut with ffmpeg ──► review
```

A few lessons from real data that shape the design:

- **Count people, not messages.** One person typing a word per message looks like a huge spike. What matters is how many *different* users react.
- **Bots lie.** Nightbot posts the same announcement every half hour. It gets filtered out.
- **Laughter is messy.** `jajaja`, `Ajjajajaj`, `jjaja`, `JAJAJAJAJ`, `XD`, `lol`... detection has to tolerate typos and variants.
- **Chat is late.** Viewers react 5–15 s after the joke, so a clip has to start well *before* the spike.

## Roadmap

- [x] Download a VOD's chat with TwitchDownloaderCLI
- [ ] Read the chat from Node + TypeScript
- [ ] Filter bots and detect laughter
- [ ] Launch the downloader from Node given a VOD ID
- [ ] Audio signals (laughter, volume spikes)
- [ ] Transcription with Whisper
- [ ] LLM as a filter: rank candidates and suggest titles
- [ ] Cut clips with ffmpeg
- [ ] Web UI (Vue) to approve or discard clips

## Stack

| Part | Tech |
|---|---|
| Core & backend | Node + TypeScript (Express, later) |
| Frontend | Vue + TypeScript (later) |
| Models | Python script (Whisper, audio classifiers, later) |
| Chat download | [TwitchDownloaderCLI](https://github.com/lay295/TwitchDownloader) |

## Setup

1. Download TwitchDownloaderCLI from the [Releases page](https://github.com/lay295/TwitchDownloader/releases) and unzip it in the project root. The folder is git-ignored because it's big.
2. Download a VOD's chat:

   ```bash
   TwitchDownloaderCLI.exe chatdownload --id <VOD_ID> -o sample.json
   ```

The Node part comes next.

## ⚠️ A word of caution

Downloading other people's streams goes against Twitch's terms. Use this on your own channel or with the streamer's permission.

Purely visual humour can only be detected through chat or audio reactions, so expect good *candidates*, not perfect clips.

---

Built as a learning project for Node and TypeScript.
