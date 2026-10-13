import { DEFAULTS } from "./defaults.ts";

export type Message = {
  body: string;
};

export type Commenter = {
  name: string;
};

export type Momento = {
  inicio: string;
  fin: string;
  mensajes: Comentario[];
};

export type Comentario = {
  content_offset_seconds: number;
  commenter: Commenter;
  message: Message;
};

export type Video = {
  title: string;
  id: string;
};

export type Chat = {
  comments: Comentario[];
  video: Video;
};

export type ChatDepurado = {
  comments: Comentario[];
  video: Video;
  minUsuarios: number;
};

function formatearTiempo(segundos: number): string {
  const fecha = new Date(segundos * 1000);
  return fecha.toISOString().slice(11, 19);
}

export function leerChat(contenido: string): Chat {
    const chat: Chat = JSON.parse(contenido);
    return chat;
}

export function depurar(chat:Chat):ChatDepurado{ //tal como viene del fichero.          Quita bots, deja las risas, calcula el umbral
  const chatSinBots = chat.comments.filter(
    (c) => c.commenter.name !== "nightbot",
  );
  const numeroUsuariosActivos = new Set(
    chatSinBots.map((c) => c.commenter.name),
  );

  //Establecer minimo de usuarios
  const minUsuarios = Math.max(
    DEFAULTS.MIN_USUARIOS_ABSOLUTO,
    Math.ceil(numeroUsuariosActivos.size * DEFAULTS.FRACCION_MINIMA),
  );

  const mensajesDeRisa = chatSinBots.filter((c) =>
    DEFAULTS.PATRON_MENSAJE_RISA.test(c.message.body),
  );

  const chatDepurado: ChatDepurado = {
    comments: mensajesDeRisa,
    video: chat.video,
    minUsuarios: minUsuarios,
  };

  return chatDepurado;
}

export function detectarMomentos(chatDepurado: ChatDepurado) {
  const comentarios = chatDepurado.comments;
  let ultimaFechaRisa = 0;
  const momentos: Momento[] = [];
  for (const comentario of comentarios) {
    const fechaClip = formatearTiempo(
      Math.max(
        0,
        comentario.content_offset_seconds - DEFAULTS.MARGEN_CLIP_ANTES,
      ),
    );
    const fechaHasta = formatearTiempo(
      comentario.content_offset_seconds + DEFAULTS.MARGEN_CLIP_DESPUES,
    );

    const fechaSinFormato = comentario.content_offset_seconds;

    const enVentana = comentarios.filter(
      (m) =>
        m.content_offset_seconds >= comentario.content_offset_seconds &&
        m.content_offset_seconds <=
          comentario.content_offset_seconds + DEFAULTS.VENTANA_SEGUNDOS,
    );

    const usuarios = new Set(enVentana.map((m) => m.commenter.name));

    if (
      usuarios.size >= chatDepurado.minUsuarios &&
      fechaSinFormato - ultimaFechaRisa >= DEFAULTS.VENTANA_SEGUNDOS
    ) {
      momentos.push({
        inicio: fechaClip,
        fin: fechaHasta,
        mensajes: enVentana,
      });
      const ultimo = enVentana.at(-1);
      if (ultimo !== undefined) {
        ultimaFechaRisa = ultimo.content_offset_seconds;
      }
    }
  }
  return momentos;
}
