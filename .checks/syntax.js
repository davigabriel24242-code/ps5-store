// apps/pipow-store/index.jsx
import { useState } from "react";
import { AppRegistry, View as View2, Text as Text2, useController } from "@ps5-react/core";

// apps/pipow-store/catalog.js
var catalog_default = {
  "schema": "ps5-store-catalog/v1",
  "updated": "2026-10-12T21:42:36.172201+00:00",
  "count": 3,
  "apps": [
    {
      "titleid": "PPSA17019",
      "name": "The 7th Guest VR",
      "kind": "game",
      "category": "Aventura",
      "description": "Remake em VR do cl\xE1ssico de 1993. Voc\xEA explora a mans\xE3o Stauf em primeira pessoa, resolve enigmas e descobre o que aconteceu ali.",
      "hero_tag": "Em destaque \xB7 Aventura VR",
      "meta_line": "1 jogador \xB7 Ingl\xEAs \xB7 16 anos",
      "license": null,
      "author": "Vertigo Games",
      "version": "01.006",
      "source_repo": null,
      "artifact_url": "https://akirabox.to/QN9mEq51xm6d/file",
      "downloads": [
        {
          "host": "akirabox",
          "label": "AkiraBox",
          "url": "https://akirabox.to/QN9mEq51xm6d/file",
          "size_gb": 38.4,
          "password": null
        }
      ],
      "sha256": null,
      "icon_url": null,
      "featured": true,
      "region": null,
      "size_gb": null
    },
    {
      "titleid": "CUSA57220",
      "name": "EA Sports FC 27",
      "kind": "game",
      "category": "Esporte",
      "description": "Futebol anual da EA com modo carreira, Ultimate Team e partidas online. Elencos e ligas atualizados.",
      "hero_tag": "Em destaque \xB7 Esporte",
      "meta_line": "1-4 jogadores \xB7 PT-BR \xB7 Livre",
      "license": null,
      "author": "EA Vancouver",
      "version": "01.000",
      "source_repo": null,
      "artifact_url": "https://1fichier.com/?8lsewns7ilzuwv3yrwkp&af=2899507",
      "downloads": [
        {
          "host": "1fichier",
          "label": "1fichier",
          "url": "https://1fichier.com/?8lsewns7ilzuwv3yrwkp&af=2899507",
          "size_gb": 55,
          "password": null
        }
      ],
      "sha256": null,
      "icon_url": null,
      "featured": false,
      "region": null,
      "size_gb": null
    },
    {
      "titleid": "CUSA03041",
      "name": "Red Dead Redemption 2",
      "kind": "game",
      "category": "A\xE7\xE3o-Aventura",
      "description": "Saga de Arthur Morgan e da gangue Van der Linde no crep\xFAsculo do Velho Oeste. Mundo aberto, narrativa longa, ca\xE7a, tiro e sobreviv\xEAncia.",
      "hero_tag": "Em destaque \xB7 Velho Oeste",
      "meta_line": "1 jogador \xB7 PT-BR \xB7 18 anos",
      "license": null,
      "author": "Rockstar Games",
      "version": "01.000",
      "source_repo": null,
      "artifact_url": "https://akirabox.to/l76mZVwpZman/file",
      "downloads": [
        {
          "host": "akirabox",
          "label": "AkiraBox",
          "url": "https://akirabox.to/l76mZVwpZman/file",
          "size_gb": 105,
          "password": null
        }
      ],
      "sha256": null,
      "icon_url": null,
      "featured": false,
      "region": null,
      "size_gb": null
    }
  ]
};

// apps/pipow-store/platform.jsx
import { View, Text } from "@ps5-react/core";
function NativeArtwork({ kind, titleid }) {
  if (kind === "logo") return /* @__PURE__ */ React.createElement(Text, { className: "text-xl text-white" }, "PIPOW STORE");
  return /* @__PURE__ */ React.createElement(View, { className: "rounded-xl bg-slate-800 p-4" }, /* @__PURE__ */ React.createElement(Text, { className: "text-slate-400" }, titleid ? `covers/${titleid}.jpg` : "Arte local pendente"));
}

// apps/pipow-store/index.jsx
var tabs = ["Inicial", "Explore", "Biblioteca", "Favoritos", "Busca"];
var id = (a) => a.titleid || a.name;
var normalize = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
function Label({ children, muted = false }) {
  return /* @__PURE__ */ React.createElement(Text2, { className: muted ? "text-slate-400" : "text-white" }, children);
}
function Control({ label, active, focused }) {
  return /* @__PURE__ */ React.createElement(View2, { focused, selected: active, className: "rounded-xl bg-slate-800 px-6 py-4 focused:bg-sky-800" }, /* @__PURE__ */ React.createElement(Label, null, label));
}
function PipowStore() {
  const [screen, setScreen] = useState("Inicial"), [selected, setSelected] = useState(null), [focus, setFocus] = useState(0), [hero, setHero] = useState(0), [favorites, setFavorites] = useState([]), [query, setQuery] = useState(""), [genre, setGenre] = useState("Todos"), [notice, setNotice] = useState("");
  const apps = catalog_default.apps || [];
  const featured = apps[hero] || apps[0];
  const genres = ["Todos", ...new Set(apps.map((a) => a.category).filter(Boolean))];
  const list = screen === "Favoritos" ? apps.filter((a) => favorites.includes(id(a))) : screen === "Biblioteca" ? [] : screen === "Busca" ? apps.filter((a) => normalize([a.name, a.category, a.author].join(" ")).includes(normalize(query))) : screen === "Explore" && genre !== "Todos" ? apps.filter((a) => a.category === genre) : apps;
  const controls = tabs.map((label) => ({ label, run: () => {
    setScreen(label);
    setSelected(null);
    setNotice("");
    setFocus(0);
  } }));
  if (selected) {
    controls.push({ label: "Obter " + (selected.kind === "game" ? "jogo" : "app"), run: () => setNotice("Download n\xE3o integrado ao host nativo. Nenhum arquivo foi baixado.") }, { label: favorites.includes(id(selected)) ? "Remover favorito" : "Favoritar", run: () => setFavorites((v) => v.includes(id(selected)) ? v.filter((x) => x !== id(selected)) : [...v, id(selected)]) });
  } else {
    if (screen === "Inicial" && featured) controls.push({ label: "Pr\xF3ximo destaque", run: () => setHero((v) => (v + 1) % apps.length) }, { label: "Ver detalhes", run: () => {
      setSelected(featured);
      setFocus(0);
    } });
    if (screen === "Explore") genres.forEach((g) => controls.push({ label: g, run: () => {
      setGenre(g);
      setFocus(0);
    } }));
    if (screen === "Busca") {
      Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ\xC7\xC1\xC9\xCD\xD3\xDA0123456789").forEach((c) => controls.push({ label: c, run: () => setQuery((v) => v + c) }));
      controls.push({ label: "Espa\xE7o", run: () => setQuery((v) => v + " ") }, { label: "Apagar", run: () => setQuery((v) => v.slice(0, -1)) }, { label: "Limpar", run: () => setQuery("") });
    }
    list.forEach((a) => controls.push({ label: a.name, run: () => {
      setSelected(a);
      setFocus(0);
    } }));
  }
  useController((action) => {
    if (action === "previous") setFocus((v) => (v - 1 + controls.length) % controls.length);
    if (action === "next") setFocus((v) => (v + 1) % controls.length);
    if (action === "confirm") controls[Math.min(focus, controls.length - 1)]?.run();
    if (action === "back") {
      if (notice) setNotice("");
      else if (selected) {
        setSelected(null);
        setFocus(0);
      } else {
        setScreen("Inicial");
        setFocus(0);
      }
    }
  });
  const chooseFocus = (label) => controls.findIndex((c) => c.label === label);
  return /* @__PURE__ */ React.createElement(View2, { className: "bg-slate-950 p-8" }, /* @__PURE__ */ React.createElement(NativeArtwork, { kind: "logo" }), /* @__PURE__ */ React.createElement(View2, { className: "flex-row" }, tabs.map((t) => /* @__PURE__ */ React.createElement(Control, { key: t, label: t, active: screen === t, focused: focus === chooseFocus(t) }))), selected ? /* @__PURE__ */ React.createElement(View2, { className: "p-8" }, /* @__PURE__ */ React.createElement(NativeArtwork, { kind: "hero", titleid: selected.titleid }), /* @__PURE__ */ React.createElement(Text2, { className: "text-4xl text-white" }, selected.name), /* @__PURE__ */ React.createElement(Label, { muted: true }, selected.category, " \xB7 ", selected.author, " \xB7 v", selected.version), /* @__PURE__ */ React.createElement(Label, null, selected.description), /* @__PURE__ */ React.createElement(View2, { className: "flex-row" }, controls.slice(5).map((c, i) => /* @__PURE__ */ React.createElement(Control, { key: c.label, label: c.label, focused: focus === i + 5 }))), /* @__PURE__ */ React.createElement(Label, { muted: true }, selected.meta_line), /* @__PURE__ */ React.createElement(Label, { muted: true }, selected.size_gb ?? selected.downloads?.[0]?.size_gb ?? "Tamanho n\xE3o informado", " GB")) : /* @__PURE__ */ React.createElement(View2, { className: "p-8" }, screen === "Inicial" && featured && /* @__PURE__ */ React.createElement(View2, null, /* @__PURE__ */ React.createElement(NativeArtwork, { kind: "hero", titleid: featured.titleid }), /* @__PURE__ */ React.createElement(Label, null, featured.hero_tag || "EM DESTAQUE"), /* @__PURE__ */ React.createElement(Text2, { className: "text-4xl text-white" }, featured.name), /* @__PURE__ */ React.createElement(Label, null, featured.category), /* @__PURE__ */ React.createElement(Label, { muted: true }, featured.description), /* @__PURE__ */ React.createElement(View2, { className: "flex-row" }, controls.slice(5, 7).map((c, i) => /* @__PURE__ */ React.createElement(Control, { key: c.label, label: c.label, focused: focus === i + 5 }))), /* @__PURE__ */ React.createElement(Text2, { className: "text-xl text-white" }, "Populares")), screen === "Explore" && /* @__PURE__ */ React.createElement(View2, null, /* @__PURE__ */ React.createElement(Text2, { className: "text-4xl text-white" }, "Encontre seu pr\xF3ximo universo."), /* @__PURE__ */ React.createElement(Label, { muted: true }, "Explore por g\xEAnero. Descubra no seu ritmo."), /* @__PURE__ */ React.createElement(View2, { className: "flex-row" }, genres.map((g) => /* @__PURE__ */ React.createElement(Control, { key: g, label: g, active: genre === g, focused: focus === chooseFocus(g) })))), screen === "Biblioteca" && /* @__PURE__ */ React.createElement(View2, null, /* @__PURE__ */ React.createElement(Text2, { className: "text-4xl text-white" }, "Seu pr\xF3ximo cap\xEDtulo."), /* @__PURE__ */ React.createElement(Label, { muted: true }, "Instala\xE7\xE3o e downloads n\xE3o integrados ao host nativo.")), screen === "Favoritos" && /* @__PURE__ */ React.createElement(View2, null, /* @__PURE__ */ React.createElement(Text2, { className: "text-4xl text-white" }, "Mundos que voc\xEA quer visitar."), /* @__PURE__ */ React.createElement(Label, { muted: true }, "Favoritos desta sess\xE3o. Salvamento permanente n\xE3o integrado.")), screen === "Busca" && /* @__PURE__ */ React.createElement(View2, null, /* @__PURE__ */ React.createElement(Text2, { className: "text-4xl text-white" }, "Qual ser\xE1 o pr\xF3ximo destino?"), /* @__PURE__ */ React.createElement(Label, null, query || "Buscar no cat\xE1logo"), /* @__PURE__ */ React.createElement(Label, { muted: true }, "Teclado: navegue com D-pad e confirme com Cross."), /* @__PURE__ */ React.createElement(Control, { label: controls[focus]?.label || "", focused: true })), /* @__PURE__ */ React.createElement(View2, { className: "flex-row" }, list.slice(Math.max(0, list.findIndex((a) => a.name === controls[focus]?.label) - 2), Math.max(0, list.findIndex((a) => a.name === controls[focus]?.label) - 2) + 5).map((a) => /* @__PURE__ */ React.createElement(View2, { key: id(a), focused: focus === chooseFocus(a.name), className: "rounded-xl bg-slate-800 p-4 focused:bg-sky-800" }, /* @__PURE__ */ React.createElement(NativeArtwork, { kind: "card", titleid: a.titleid }), /* @__PURE__ */ React.createElement(Label, null, a.name), /* @__PURE__ */ React.createElement(Label, { muted: true }, a.category))))), notice && /* @__PURE__ */ React.createElement(View2, { className: "rounded-xl bg-slate-800 p-4" }, /* @__PURE__ */ React.createElement(Label, null, notice)), /* @__PURE__ */ React.createElement(Label, { muted: true }, "D-pad: navegar \xB7 Cross: selecionar \xB7 Circle: voltar"));
}
AppRegistry.registerComponent("pipow-store", () => PipowStore);
export {
  PipowStore
};
