import { log } from 'node:console';
import {readFile} from 'node:fs/promises';

const VENTANA_SEGUNDOS = 30;
const MARGEN_CLIP = 30
const MIN_USUARIOS_ABSOLUTO = 2;

const contenido = await readFile('./sample.json', 'utf-8');

type Message = {
    body: string
}

type Commenter = {
    name: string
}

type Comentario = {
  content_offset_seconds: number;
  commenter: Commenter;
  message: Message;
};

type Chat = {
    comments: Comentario[]
}

function formatearTiempo(segundos: number): string{

    const fecha = new Date(segundos * 1000);
    return fecha.toISOString().slice(11, 19)

}

const chat: Chat = JSON.parse(contenido);
const chatSinBots = chat.comments.filter(c => c.commenter.name !== "nightbot")
const numeroUsuariosActivos = new Set(chatSinBots.map(c => c.commenter.name))

const FRACCION_MINIMA = 0.1;
const minUsuarios = Math.max(MIN_USUARIOS_ABSOLUTO, Math.ceil(numeroUsuariosActivos.size * FRACCION_MINIMA));

const patronMensajeDeRisa = /jaja|xd|lol/i
const mensajesDeRisa = chatSinBots.filter( c => patronMensajeDeRisa.test(c.message.body));


for (const comentario of mensajesDeRisa) {
    const fechaClip = formatearTiempo(Math.max(0, comentario.content_offset_seconds - MARGEN_CLIP))
    const fechaRisa = formatearTiempo(comentario.content_offset_seconds)

    const enVentana = mensajesDeRisa.filter(m =>
        m.content_offset_seconds >= comentario.content_offset_seconds &&
        m.content_offset_seconds <= comentario.content_offset_seconds + VENTANA_SEGUNDOS
    );

    


    //console.log(`Hacer clip desde -> ${fechaClip} hasta ${fechaRisa.padEnd(25)} ->${comentario.commenter.name}=${comentario.message.body}`);
}