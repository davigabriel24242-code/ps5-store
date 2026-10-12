import {useState} from 'react';
import {AppRegistry, View, Text, useController} from '@ps5-react/core';
import catalog from './catalog.js';
import {NativeArtwork} from './platform.jsx';

const tabs = ['Inicial', 'Explore', 'Biblioteca', 'Favoritos', 'Busca'];
const id = a => a.titleid || a.name;
const normalize = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function Label({children, muted = false}) {
  return muted
    ? <Text className="text-slate-400">{children}</Text>
    : <Text className="text-white">{children}</Text>;
}
function Control({label, active, focused}) {
  return <View focused={focused} selected={active} className="rounded-xl bg-slate-800 px-6 py-4 focused:bg-sky-800"><Label>{label}</Label></View>;
}

export function PipowStore() {
  const [screen, setScreen] = useState('Inicial');
  const [selected, setSelected] = useState(null);
  const [focus, setFocus] = useState(0);
  const [hero, setHero] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('Todos');
  const [notice, setNotice] = useState('');
  const apps = catalog.apps || [];
  const featured = apps[hero] || apps[0];
  const genres = ['Todos', ...new Set(apps.map(a => a.category).filter(Boolean))];
  const list = screen === 'Favoritos' ? apps.filter(a => favorites.includes(id(a)))
    : screen === 'Biblioteca' ? []
    : screen === 'Busca' ? apps.filter(a => normalize([a.name, a.category, a.author].join(' ')).includes(normalize(query)))
    : screen === 'Explore' && genre !== 'Todos' ? apps.filter(a => a.category === genre)
    : apps;
  const controls = tabs.map(label => ({label, run: () => {
    setScreen(label); setSelected(null); setNotice(''); setFocus(0);
  }}));
  if (selected) {
    controls.push(
      {label: 'Obter ' + (selected.kind === 'game' ? 'jogo' : 'app'), run: () => setNotice('Download não integrado ao host nativo. Nenhum arquivo foi baixado.')},
      {label: favorites.includes(id(selected)) ? 'Remover favorito' : 'Favoritar', run: () => setFavorites(v => v.includes(id(selected)) ? v.filter(x => x !== id(selected)) : [...v, id(selected)])}
    );
  } else {
    if (screen === 'Inicial' && featured) controls.push(
      {label: 'Próximo destaque', run: () => setHero(v => (v + 1) % apps.length)},
      {label: 'Ver detalhes', run: () => {setSelected(featured); setFocus(0);}}
    );
    if (screen === 'Explore') genres.forEach(g => controls.push({label: g, run: () => {setGenre(g); setFocus(0);}}));
    if (screen === 'Busca') {
      Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZÇÁÉÍÓÚ0123456789').forEach(c => controls.push({label: c, run: () => setQuery(v => v + c)}));
      controls.push({label: 'Espaço', run: () => setQuery(v => v + ' ')}, {label: 'Apagar', run: () => setQuery(v => v.slice(0, -1))}, {label: 'Limpar', run: () => setQuery('')});
    }
    list.forEach(a => controls.push({label: a.name, run: () => {setSelected(a); setFocus(0);}}));
  }
  useController(action => {
    if (action === 'previous') setFocus(v => (v - 1 + controls.length) % controls.length);
    if (action === 'next') setFocus(v => (v + 1) % controls.length);
    if (action === 'confirm') controls[Math.min(focus, controls.length - 1)]?.run();
    if (action === 'back') {
      if (notice) setNotice('');
      else if (selected) {setSelected(null); setFocus(0);}
      else {setScreen('Inicial'); setFocus(0);}
    }
  });
  const chooseFocus = label => controls.findIndex(c => c.label === label);
  const start = Math.max(0, list.findIndex(a => a.name === controls[focus]?.label) - 2);

  return (
    <View className="bg-slate-950 p-8">
      <NativeArtwork kind="logo" />
      <View className="flex-row">{tabs.map(t => <Control key={t} label={t} active={screen === t} focused={focus === chooseFocus(t)} />)}</View>
      {selected ? (
        <View className="p-8">
          <NativeArtwork kind="hero" titleid={selected.titleid} />
          <Text className="text-4xl text-white">{selected.name}</Text>
          <Label muted>{selected.category} · {selected.author} · v{selected.version}</Label>
          <Label>{selected.description}</Label>
          <View className="flex-row">{controls.slice(5).map((c, i) => <Control key={c.label} label={c.label} focused={focus === i + 5} />)}</View>
          <Label muted>{selected.meta_line}</Label>
          <Label muted>{selected.size_gb ?? selected.downloads?.[0]?.size_gb ?? 'Tamanho não informado'} GB</Label>
        </View>
      ) : (
        <View className="p-8">
          {screen === 'Inicial' && featured && (
            <View>
              <NativeArtwork kind="hero" titleid={featured.titleid} />
              <Label>{featured.hero_tag || 'EM DESTAQUE'}</Label>
              <Text className="text-4xl text-white">{featured.name}</Text>
              <Label>{featured.category}</Label><Label muted>{featured.description}</Label>
              <View className="flex-row">{controls.slice(5, 7).map((c, i) => <Control key={c.label} label={c.label} focused={focus === i + 5} />)}</View>
              <Text className="text-xl text-white">Populares</Text>
            </View>
          )}
          {screen === 'Explore' && (
            <View>
              <Text className="text-4xl text-white">Encontre seu próximo universo.</Text>
              <Label muted>Explore por gênero. Descubra no seu ritmo.</Label>
              <View className="flex-row">{genres.map(g => <Control key={g} label={g} active={genre === g} focused={focus === chooseFocus(g)} />)}</View>
            </View>
          )}
          {screen === 'Biblioteca' && <View><Text className="text-4xl text-white">Seu próximo capítulo.</Text><Label muted>Instalação e downloads não integrados ao host nativo.</Label></View>}
          {screen === 'Favoritos' && <View><Text className="text-4xl text-white">Mundos que você quer visitar.</Text><Label muted>Favoritos desta sessão. Salvamento permanente não integrado.</Label></View>}
          {screen === 'Busca' && <View><Text className="text-4xl text-white">Qual será o próximo destino?</Text><Label>{query || 'Buscar no catálogo'}</Label><Label muted>Teclado: navegue com D-pad e confirme com Cross.</Label><Control label={controls[focus]?.label || ''} focused={true} /></View>}
          <View className="flex-row">
            {list.slice(start, start + 5).map(a => {
              const isFocused = focus === chooseFocus(a.name);
              return (
              <View key={id(a)} focused={isFocused} className="rounded-xl bg-slate-800 p-4 focused:bg-sky-800">
                <NativeArtwork kind="card" titleid={a.titleid} />
                <Label>{a.name}</Label><Label muted>{a.category}</Label>
              </View>
              );
            })}
          </View>
        </View>
      )}
      {notice && <View className="rounded-xl bg-slate-800 p-4"><Label>{notice}</Label></View>}
      <Label muted>D-pad: navegar · Cross: selecionar · Circle: voltar</Label>
    </View>
  );
}
AppRegistry.registerComponent('pipow-store', () => PipowStore);
