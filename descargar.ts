import { execFile } from "node:child_process";
import { promisify } from "node:util";

//Retrieve stream by url

export async function retrieveStreamChat(id: string):Promise<string>{
  const ejecutar = promisify(execFile);
  const idToNumber = Number(id)
  const route = "./samples/"+idToNumber+".json"

  const { stdout } = await ejecutar(
    "./TwitchDownloaderCLI-1.56.5-Windows-x64/TwitchDownloaderCLI.exe",
    [
      "chatdownload",
      "-u",
      "https://www.twitch.tv/videos/"+idToNumber,
      "-o",
      route,
      "--collision",
      "Overwrite",
    ],
  );

  console.log(stdout);

  return route
}

