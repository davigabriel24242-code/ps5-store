import {useState} from 'react';
import {AppRegistry, View, Text, useController, FocusScope} from '@ps5-react/core';
import catalog from './catalog.js';
import {Logo, Cover, HeroArt} from './platform.jsx';

const tabs = ['Inicial', 'Explore', 'Biblioteca', 'Favoritos', 'Busca'];
const id = a => a.titleid || a.name;
const normalize = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function Label({children}) {
  return <Text className="font-sans text-base text-pipow-text">{children}</Text>;
}
function Muted({children}) {
  return <Text className="font-sans text-sm text-pipow-muted">{children}</Text>;
}
function Tiny({children}) {
  return <Text className="font-sans text-xs text-pipow-muted2">{children}</Text>;
}
function Display({children}) {
  return <Text className="font-display text-4xl text-pipow-text">{children}</Text>;
}
function DisplayLg({children}) {
  return <Text className="font-display text-7xl text-pipow-text">{children}</Text>;
}
function Tag({children}) {
  return <Text className="font-display text-sm text-pipow-cyan">{children}</Text>;
}

function Nav({screen, onSelect}) {
  return <View className="flex-row gap-6 items-center">
    {tabs.map(t => (
      <View key={t} focusable onPress={() => onSelect(t)}
        className={`px-4 py-2 rounded-lg focused:bg-pipow-blueHi ${screen === t ? 'bg-pipow-blue' : 'bg-pipow-surface'}`}>
        <Label>{t}</Label>
      </View>
    ))}
  </View>;
}

function PrimaryButton({label, onPress}) {
  return <View focusable onPress={onPress}
    className="px-8 py-4 rounded-xl bg-pipow-blue focused:bg-pipow-blueHi">
    <Text className="font-sans text-lg text-pipow-text">{label}</Text>
  </View>;
}

function GhostButton({label, onPress}) {
  return <View focusable onPress={onPress}
    className="px-8 py-4 rounded-xl bg-pipow-surface border-2 border-pipow-border focused:border-pipow-cyan">
    <Text className="font-sans text-lg text-pipow-text">{label}</Text>
  </View>;
}

function Card({app, onPress}) {
  return <View focusable onPress={onPress}
    className="w-[280px] rounded-xl bg-pipow-surface border-2 border-transparent focused:border-pipow-cyan">
    <Cover titleid={app.titleid} className="w-[280px] h-[158px] rounded-t-xl" />
    <View className="p-4 gap-1">
      <Text className="font-sans text-lg text-pipow-text">{app.name}</Text>
      <Muted>{app.category || 'Jogo'}</Muted>
    </View>
  </View>;
}

export function PipowStore() {
  const [screen, setScreen] = useState('Inicial');
  const [selected, setSelected] = useState(null);
  const [hero, setHero] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('Todos');

  const apps = catalog.apps || [];
  const featured = apps[hero] || apps[0];
  const genres = ['Todos', ...new Set(apps.map(a => a.category).filter(Boolean))];

  const list = screen === 'Favoritos' ? apps.filter(a => favorites.includes(id(a)))
    : screen === 'Biblioteca' ? []
    : screen === 'Busca' ? apps.filter(a => normalize([a.name, a.category, a.author].join(' ')).includes(normalize(query)))
    : screen === 'Explore' && genre !== 'Todos' ? apps.filter(a => a.category === genre)
    : apps;

  const onSelect = t => { setScreen(t); setSelected(null); };

  const obtain = app => {
    const url = app.artifact_url || (app.downloads && app.downloads[0] && app.downloads[0].url);
    if (!url) return;
    console.log('Obter:', url);
  };

  const toggleFav = app => {
    const k = id(app);
    setFavorites(v => v.includes(k) ? v.filter(x => x !== k) : [...v, k]);
  };

  const detail = selected;

  return (
    <FocusScope autoFocus wrap>
      <View className="w-screen h-screen bg-pipow-bg p-10 gap-6">
        <View className="flex-row items-center gap-8">
          <Logo />
          <Nav screen={screen} onSelect={onSelect} />
        </View>

        {detail ? (
          <View className="flex-row gap-8 flex-1">
            <HeroArt titleid={detail.titleid} className="w-[720px] h-full rounded-2xl" />
            <View className="flex-1 gap-4 p-6">
              <Tag>{(detail.hero_tag || 'EM DESTAQUE').toUpperCase()}</Tag>
              <DisplayLg>{detail.name}</DisplayLg>
              <Muted>{detail.category + ' · ' + detail.author + ' · v' + detail.version}</Muted>
              <View className="h-2" />
              <Label>{detail.description}</Label>
              <View className="h-4" />
              <View className="flex-row gap-3">
                <PrimaryButton label={detail.kind === 'game' ? 'OBTER JOGO' : 'OBTER APP'} onPress={() => obtain(detail)} />
                <GhostButton label={favorites.includes(id(detail)) ? '♥ Favoritado' : '♡ Favoritar'} onPress={() => toggleFav(detail)} />
              </View>
              <View className="h-2" />
              <Muted>{detail.meta_line || ''}</Muted>
              <Tiny>D-pad: navegar · X: selecionar · Circle: voltar</Tiny>
            </View>
          </View>
        ) : screen === 'Inicial' && featured ? (
          <View className="gap-6 flex-1">
            <View className="flex-row gap-8 h-[420px]">
              <HeroArt titleid={featured.titleid} className="w-[820px] h-full rounded-2xl" />
              <View className="flex-1 gap-3 p-4">
                <Tag>{(featured.hero_tag || 'EM DESTAQUE').toUpperCase()}</Tag>
                <DisplayLg>{featured.name}</DisplayLg>
                <Muted>{featured.category}</Muted>
                <View className="h-2" />
                <Label>{featured.description}</Label>
                <View className="h-4" />
                <View className="flex-row gap-3">
                  <PrimaryButton label="OBTER" onPress={() => obtain(featured)} />
                  <GhostButton label="Ver detalhes" onPress={() => setSelected(featured)} />
                  <GhostButton label="Proximo" onPress={() => setHero(v => (v + 1) % apps.length)} />
                </View>
              </View>
            </View>
            <Text className="font-display text-3xl text-pipow-text">Populares</Text>
            <View className="flex-row gap-6 flex-wrap">
              {apps.map(a => <Card key={id(a)} app={a} onPress={() => obtain(a)} />)}
            </View>
          </View>
        ) : (
          <View className="gap-6 flex-1">
            {screen === 'Explore' && (
              <View className="gap-4">
                <Text className="font-display text-4xl text-pipow-text">Explore</Text>
                <View className="flex-row gap-3 flex-wrap">
                  {genres.map(g => (
                    <View key={g} focusable onPress={() => setGenre(g)}
                      className={`px-5 py-3 rounded-full focused:bg-pipow-blueHi ${genre === g ? 'bg-pipow-blue' : 'bg-pipow-surface'}`}>
                      <Label>{g}</Label>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {screen === 'Biblioteca' && <Text className="font-display text-4xl text-pipow-text">Biblioteca</Text>}
            {screen === 'Favoritos' && <Text className="font-display text-4xl text-pipow-text">Favoritos</Text>}
            {screen === 'Busca' && (
              <View className="gap-4">
                <Text className="font-display text-4xl text-pipow-text">Busca</Text>
                <Text className="font-sans text-lg text-pipow-muted">{query || 'Navegue com D-pad'}</Text>
              </View>
            )}
            <View className="flex-row gap-6 flex-wrap">
              {list.map(a => <Card key={id(a)} app={a} onPress={() => setSelected(a)} />)}
            </View>
          </View>
        )}
      </View>
    </FocusScope>
  );
}

AppRegistry.registerComponent('pipow-store', () => PipowStore);