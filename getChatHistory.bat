@echo off
echo Getting chat
cd /d ".\TwitchDownloaderCLI-1.56.5-Windows-x64"
TwitchDownloaderCLI.exe chatdownload -u https://www.twitch.tv/videos/2894278470 -o ../sample.json
