import { readFile } from "node:fs/promises";
import { retrieveStreamChat, retrieveClip } from "./descargar.ts";

const VENTANA_SEGUNDOS = 30;
const MARGEN_CLIP_ANTES = 15;
const MARGEN_CLIP_DESPUES = 15;
const MIN_USUARIOS_ABSOLUTO = 2;

let nombreFichero = process.argv[2];
let contenido: string = "";

//Check if arg provided is a JSON file or a ID
try {
  if (nombreFichero === undefined) {
    console.error(
      "No se ha proporcionado un ID o un nombre de fichero. Por favor proporcione un fichero con nombre valido por ejemplo: node index.ts sample.json o node index.ts 2886360563",
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
    `No se ha encontrado el fichero:  ${nombreFichero}. Por favor proporcione un fichero con nombre valido por ejemplo: node index.ts sample.json`,
  );
  process.exit(1);
}

type Message = {
  body: string;
};

type Commenter = {
  name: string;
};

type Momento = {
  inicio: string;
  fin: string;
  mensajes: Comentario[];
};

type Comentario = {
  content_offset_seconds: number;
  commenter: Commenter;
  message: Message;
};

type Video = {
  title: string;
  id: string;
};

type Chat = {
  comments: Comentario[];
  video: Video;
};

function formatearTiempo(segundos: number): string {
  const fecha = new Date(segundos * 1000);
  return fecha.toISOString().slice(11, 19);
}

const chat: Chat = JSON.parse(contenido);
const chatSinBots = chat.comments.filter(
  (c) => c.commenter.name !== "nightbot",
);
const numeroUsuariosActivos = new Set(chatSinBots.map((c) => c.commenter.name));

const FRACCION_MINIMA = 0.1;
const minUsuarios = Math.max(
  MIN_USUARIOS_ABSOLUTO,
  Math.ceil(numeroUsuariosActivos.size * FRACCION_MINIMA),
);

const patronMensajeDeRisa = /jaja|xd|lol/i;
const mensajesDeRisa = chatSinBots.filter((c) =>
  patronMensajeDeRisa.test(c.message.body),
);

const idStream = chat.video.id;

function detectarMomentos(comentarios: Comentario[]) {
  let ultimaFechaRisa = 0;
  const momentos : Momento[] = []
  for (const comentario of comentarios) {
    const fechaClip = formatearTiempo(
      Math.max(0, comentario.content_offset_seconds - MARGEN_CLIP_ANTES),
    );
    const fechaHasta = formatearTiempo(
      comentario.content_offset_seconds + MARGEN_CLIP_DESPUES,
    );

    const fechaSinFormato = comentario.content_offset_seconds;

    const enVentana = comentarios.filter(
      (m) =>
        m.content_offset_seconds >= comentario.content_offset_seconds &&
        m.content_offset_seconds <=
          comentario.content_offset_seconds + VENTANA_SEGUNDOS,
    );

    const usuarios = new Set(enVentana.map((m) => m.commenter.name));

    if (
      usuarios.size >= minUsuarios &&
      fechaSinFormato - ultimaFechaRisa >= VENTANA_SEGUNDOS
    ) {
      momentos.push({
          inicio: fechaClip,
          fin: fechaHasta,
          mensajes: enVentana
        })
      const ultimo = enVentana.at(-1);
      if (ultimo !== undefined) {
        ultimaFechaRisa = ultimo.content_offset_seconds;
      }
    }
  }
  return momentos
}

function mostrarMomentos ( momentos : Momento[]){
  momentos.forEach((element, index) => {
    console.log('--------------------------');
    console.log(`Listando momento gracioso [${element.inicio}-${element.fin}] `+(index+1));
      element.mensajes.forEach((mensaje)=>{
        console.log(`${mensaje.commenter.name}:${mensaje.message.body}`);
      })
  });
}

const momentos = detectarMomentos(mensajesDeRisa)
mostrarMomentos(momentos)

// for (const momento of momentos){
//   try {
//     await retrieveClip(idStream, momento.inicio, momento.fin);
//   } catch {
//     console.error(`Descarga fallida`);
//     process.exit(1);
//   }
// }

