import { readFile } from "node:fs/promises";
import { retrieveStreamChat, retrieveClip } from "./descargar.ts";
import { detectarMomentos, depurar, leerChat } from "./analisis.ts";
import type { Momento, Chat } from "./analisis.ts";

let nombreFichero = process.argv[2];
let contenido: string = "";

export function mostrarMomentos(momentos: Momento[]) {
  momentos.forEach((element, index) => {
    console.log("--------------------------");
    console.log(
      `Listando momento gracioso [${element.inicio}-${element.fin}] ` +
        (index + 1),
    );
    element.mensajes.forEach((mensaje) => {
      console.log(`${mensaje.commenter.name}:${mensaje.message.body}`);
    });
  });
}

try {
  if (nombreFichero === undefined) {
    console.error(
      "No se ha proporcionado un ID o un nombre de fichero. Por favor proporcione un fichero con nombre valido por ejemplo: node cli.ts sample.json o node cli.ts 2886360563",
    );
    process.exit(1);
  } else {
    if (!nombreFichero.endsWith(".json")) {
      nombreFichero = await retrieveStreamChat(nombreFichero);
    }
  }
} catch {
  console.error(
    `El ID proporcionado no es valido, por favor incluya un ID de Twitch valido`,
  );
  process.exit(1);
}

try {
  contenido = await readFile(nombreFichero, "utf-8");
} catch {
  console.error(
    `No se ha encontrado el fichero:  ${nombreFichero}. Por favor proporcione un fichero con nombre valido por ejemplo: node cli.ts sample.json`,
  );
  process.exit(1);
}

let chatLeido: Chat;

try {
  chatLeido = leerChat(contenido);
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error(`Detalle del error: ${error.message}`);
  }
  process.exit(1);
}

const chatDepurado = depurar(chatLeido);
mostrarMomentos(detectarMomentos(chatDepurado));

// for (const momento of momentos){
//   try {
//     await retrieveClip(idStream, momento.inicio, momento.fin);
//   } catch {
//     console.error(`Descarga fallida`);
//     process.exit(1);
//   }
// }
