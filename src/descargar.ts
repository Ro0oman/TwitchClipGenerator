import { execFile } from "node:child_process";
import { promisify } from "node:util";

//Retrieve stream by url

export async function retrieveStreamChat(id: string): Promise<string> {
  const ejecutar = promisify(execFile);
  const idToNumber = Number(id);
  const route = "./samples/" + idToNumber + ".json";

  const { stdout } = await ejecutar(
    "./TwitchDownloaderCLI-1.56.5-Windows-x64/TwitchDownloaderCLI.exe",
    [
      "chatdownload",
      "-u",
      "https://www.twitch.tv/videos/" + idToNumber,
      "-o",
      route,
      "--collision",
      "Overwrite",
    ],
  );

  console.log(stdout);

  return route;
}

function toSeconds(time: string): number {
  const [horas, minutos, segundos] = time.split(":").map(Number);

  return horas * 3600 + minutos * 60 + segundos;
}

export async function retrieveClip(
  id: string,
  beggining: string,
  ending: string,
): Promise<string> {
  const ejecutar = promisify(execFile);
  const idToNumber = Number(id);
  const route = "./clips/" + idToNumber + "-" + toSeconds(beggining) + ".mp4";

  const { stdout } = await ejecutar(
    "./TwitchDownloaderCLI-1.56.5-Windows-x64/TwitchDownloaderCLI.exe",
    [
      "videodownload",
      "-u",
      "https://www.twitch.tv/videos/" + idToNumber,
      "-o",
      route,
      "-b",
      beggining,
      "-e",
      ending,
      "--collision",
      "Overwrite",
    ],
  );
  console.log(stdout);

  return route;
}
