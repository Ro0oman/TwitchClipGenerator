import {readFile} from 'node:fs/promises';

const contenido = await readFile('./sample.json', 'utf-8');

type Message = {
    body: string
}

type Commenter = {
    display_name: string
}

type Comentario = {
  content_offset_seconds: number;
  commenter_name: number;
  commenter: Commenter;
  message: Message;
};

type Chat = {
    comments: Comentario[]
}

const chat: Chat = JSON.parse(contenido);


for (const comentario of chat.comments) {
    console.log(`${comentario.commenter.display_name}=${comentario.message.body}`);
    
}