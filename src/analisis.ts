import { DEFAULTS } from "./defaults.ts";
import { z } from "zod";

const MessageSchema = z.object({
  body: z.string(),
});
const CommenterSchema = z.object({
  name: z.string(),
});
const ComentarioSchema = z.object({
  content_offset_seconds: z.number(),
  commenter: CommenterSchema,
  message: MessageSchema,
});
const VideoSchema = z.object({
  title: z.string(),
  id: z.string(),
});
const ChatSchema = z.object({
  comments: z.array(ComentarioSchema),
  video: VideoSchema,
});

export type ChatDepurado = {
  comments: Comentario[];
  video: Video;
  minUsuarios: number;
};
export type Momento = {
  inicio: string;
  fin: string;
  mensajes: Comentario[];
};

export type Message = z.infer<typeof MessageSchema>;
export type Commenter = z.infer<typeof CommenterSchema>;
export type Comentario = z.infer<typeof ComentarioSchema>;
export type Video = z.infer<typeof VideoSchema>;
export type Chat = z.infer<typeof ChatSchema>;

function formatearTiempo(segundos: number): string {
  const fecha = new Date(segundos * 1000);
  return fecha.toISOString().slice(11, 19);
}

export function leerChat(contenido: string): Chat {    
  const resultado = ChatSchema.safeParse(JSON.parse(contenido));
  if (!resultado.success) {
    const errores = resultado.error.issues
      .map((error) => `- ${error.path.join(".")}: ${error.message}`)
      .join("\n");

    throw new SyntaxError(`Errores de validación del chat:\n${errores}`);
  }

  return resultado.data;
}

export function depurar(chat: Chat): ChatDepurado {
  //tal como viene del fichero.          Quita bots, deja las risas, calcula el umbral
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

  const chatOrdenado = chatDepurado.comments.toSorted((a, b)=> a.content_offset_seconds - b.content_offset_seconds) 
    
  const comentarios = chatOrdenado;
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
