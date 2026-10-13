import { describe, it, expect } from "vitest";
import { ChatDepurado, detectarMomentos, leerChat } from "./analisis.ts";

// leerChat con un texto que es JSON válido pero con otra forma: lanza un error (mira expect(() => ...).toThrow()).
// detectarMomentos con un ChatDepurado inventado por ti, con dos usuarios distintos riendo a la vez: devuelve 1 momento.
// El mismo, con un solo usuario riendo muchas veces: devuelve 0.

describe("leerChat", () => {
  it("Leer el fichero de chat en formato string y pasarlo a tipo Json con los campos existentes en Zod", () => {
    expect(() => leerChat('{"hola":"Hola"}')).toThrow(SyntaxError);
  });
});

describe("detectarMomentos", () => {
  it("Recibe un chatDepurado y devuelve 1 momento entre 2 usuarios riedose", () => {
    const chatDepurado: ChatDepurado = {
      comments: [
        {
          content_offset_seconds: 10054,
          commenter: { name: "d3_roman2" },
          message: { body: "xd" },
        },
        {
          content_offset_seconds: 10056,
          commenter: { name: "d3_roman" },
          message: { body: "XDDDDDDDDD" },
        },
      ],
      video: {
        title: "Aprendamos JUNTOS JavaScript  (PointerEvents) Junior a Senior",
        id: "2894278470",
      },
      minUsuarios: 2,
    };
    expect(detectarMomentos(chatDepurado)).toStrictEqual([
      {
        inicio: "02:47:19",
        fin: "02:47:49",
        mensajes: [
          {
            content_offset_seconds: 10054,
            commenter: { name: "d3_roman2" },
            message: { body: "xd" },
          },
          {
            content_offset_seconds: 10056,
            commenter: { name: "d3_roman" },
            message: { body: "XDDDDDDDDD" },
          },
        ],
      },
    ]);
  });
});

describe("detectarMomentos", () => {
  it("Recibe un chatDepurado con un array desordenado, ahora esta ordenado, deberia de dar OK", () => {
    const chatDepurado: ChatDepurado = {
      comments: [
        {
          content_offset_seconds: 10056,
          commenter: { name: "d3_roman2" },
          message: { body: "xd" },
        },
        {
          content_offset_seconds: 10054,
          commenter: { name: "d3_roman" },
          message: { body: "XDDDDDDDDD" },
        },
      ],
      video: {
        title: "Aprendamos JUNTOS JavaScript  (PointerEvents) Junior a Senior",
        id: "2894278470",
      },
      minUsuarios: 2,
    };
    expect(detectarMomentos(chatDepurado)).toStrictEqual([
      {
        inicio: "02:47:19",
        fin: "02:47:49",
        mensajes: [
          {
            content_offset_seconds: 10054,
            commenter: { name: "d3_roman" },
            message: { body: "XDDDDDDDDD" },
          },
          {
            content_offset_seconds: 10056,
            commenter: { name: "d3_roman2" },
            message: { body: "xd" },
          },
        ],
      },
    ]);
  });
});

describe("detectarMomentos sin respuesta ", () => {
  it("Recibe un chatDepurado y no devuelve nada ya que todos los mensajes son del mismo usuario", () => {
    const chatDepurado: ChatDepurado = {
      comments: [
        {
          content_offset_seconds: 10056,
          commenter: { name: "d3_roman" },
          message: { body: "xd" },
        },
        {
          content_offset_seconds: 10057,
          commenter: { name: "d3_roman" },
          message: { body: "XDDDDDDDDD" },
        },
        {
          content_offset_seconds: 10058,
          commenter: { name: "d3_roman" },
          message: { body: "XDDDDDDDDD" },
        },
        {
          content_offset_seconds: 10059,
          commenter: { name: "d3_roman" },
          message: { body: "XDDDDDDDDD" },
        },
        {
          content_offset_seconds: 10060,
          commenter: { name: "d3_roman" },
          message: { body: "XDDDDDDDDD" },
        },
      ],
      video: {
        title: "Aprendamos JUNTOS JavaScript  (PointerEvents) Junior a Senior",
        id: "2894278470",
      },
      minUsuarios: 2,
    };
    expect(detectarMomentos(chatDepurado)).toStrictEqual([]);
  });
});
