import {useState} from 'react';
import {AppRegistry, View, Text, FocusScope} from '@ps5-react/core';
import catalog from './catalog.js';
import {Logo, Cover, Art} from './platform.jsx';

const TABS = ['Inicial', 'Explore', 'Biblioteca', 'Favoritos', 'Busca'];
const KEYS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
  'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
  'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
  'Y', 'Z', 'Ç', 'Á', 'É', 'Í', 'Ó', 'Ú',
];

const id = a => a.titleid || a.name;
const normalize = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const pad = n => String(n).padStart(2, '0');
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
const join = parts => parts.filter(Boolean).join('  ·  ');

/* ---------- Tipografia ---------- */

function Tag({children}) {
  return <Text className="font-sans text-xs text-pipow-cyan">{children}</Text>;
}
function Title({children}) {
  return <Text className="font-sans text-4xl text-pipow-text">{children}</Text>;
}
function Hero({children}) {
  return <Text className="font-display text-6xl text-pipow-text">{children}</Text>;
}
function Body({children}) {
  return <Text className="font-sans text-base text-pipow-text">{children}</Text>;
}
function Muted({children}) {
  return <Text className="font-sans text-sm text-pipow-muted">{children}</Text>;
}
function Tiny({children}) {
  return <Text className="font-sans text-xs text-pipow-muted2">{children}</Text>;
}
function Section({children, right}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-sans text-xl text-pipow-text">{children}</Text>
      {right ? <Muted>{right}</Muted> : null}
    </View>
  );
}

/* ---------- Componentes ---------- */

function Header({screen, onSelect}) {
  return (
    <View className="flex-row items-center justify-between h-[56px]">
      <Logo />
      <View className="flex-row items-center gap-2">
        {TABS.map(t => {
          const active = screen === t;
          return (
            <View key={t} focusable onPress={() => onSelect(t)}
              className="items-center px-4 py-2 rounded-lg border-2 border-transparent focused:bg-pipow-blue focused:border-pipow-text">
              <Text className={`font-sans text-sm ${active ? 'text-pipow-text' : 'text-pipow-muted'}`}>{t}</Text>
              <View className={`mt-1 h-[2px] w-[20px] rounded-full ${active ? 'bg-pipow-text' : 'bg-transparent'}`} />
            </View>
          );
        })}
      </View>
      <View className="w-[150px]" />
    </View>
  );
}

function Footer({action}) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-6">
        <Tiny>✥  Navegar</Tiny>
        <Tiny>{'OK  ' + action}</Tiny>
        <Tiny>↩  Voltar</Tiny>
      </View>
      <Tiny>Todos os jogos são gratuitos.</Tiny>
    </View>
  );
}

function PrimaryButton({label, onPress}) {
  return (
    <View focusable onPress={onPress}
      className="flex-row items-center h-[44px] px-6 rounded-xl bg-pipow-blue border-2 border-transparent focused:bg-pipow-blueHi focused:border-pipow-text">
      <Text className="font-sans text-base text-pipow-text">{label}</Text>
    </View>
  );
}

function GhostButton({label, onPress}) {
  return (
    <View focusable onPress={onPress}
      className="flex-row items-center h-[44px] px-6 rounded-xl bg-pipow-surface border-2 border-pipow-border focused:border-pipow-text">
      <Text className="font-sans text-base text-pipow-text">{label}</Text>
    </View>
  );
}

function Chip({label, active, onPress}) {
  return (
    <View focusable onPress={onPress}
      className={`px-4 py-2 rounded-full border-2 focused:border-pipow-text ${active ? 'bg-pipow-blue border-pipow-blue' : 'bg-pipow-surface border-pipow-surface'}`}>
      <Text className="font-sans text-sm text-pipow-text">{label}</Text>
    </View>
  );
}

// O plugin Tailwind so aceita classes fixas, entao cada tamanho tem seu proprio className literal
function TileInfo({app, sub}) {
  return (
    <View className="px-1 pb-2 gap-1">
      <Text className="font-sans text-base text-pipow-text">{app.name}</Text>
      <Muted>{sub || app.category || 'Jogo'}</Muted>
    </View>
  );
}

function Tile({app, size = 'md', sub, onPress}) {
  if (size === 'sm') {
    return (
      <View focusable onPress={onPress}
        className="w-[204px] gap-2 rounded-xl border-2 border-transparent focused:border-pipow-text">
        <Cover titleid={app.titleid} size="sm" />
        <TileInfo app={app} sub={sub} />
      </View>
    );
  }
  if (size === 'lg') {
    return (
      <View focusable onPress={onPress}
        className="w-[276px] gap-2 rounded-xl border-2 border-transparent focused:border-pipow-text">
        <Cover titleid={app.titleid} size="lg" />
        <TileInfo app={app} sub={sub} />
      </View>
    );
  }
  return (
    <View focusable onPress={onPress}
      className="w-[224px] gap-2 rounded-xl border-2 border-transparent focused:border-pipow-text">
      <Cover titleid={app.titleid} size="md" />
      <TileInfo app={app} sub={sub} />
    </View>
  );
}

function Empty({title, text, action, onPress}) {
  return (
    <View className="w-[560px] gap-3 p-8 rounded-2xl bg-pipow-surface border-2 border-pipow-border">
      <Text className="font-sans text-xl text-pipow-text">{title}</Text>
      <Muted>{text}</Muted>
      <View className="flex-row pt-2">
        <PrimaryButton label={action} onPress={onPress} />
      </View>
    </View>
  );
}

/* ---------- App ---------- */

export function PipowStore() {
  const [screen, setScreen] = useState('Inicial');
  const [selected, setSelected] = useState(null);
  const [hero, setHero] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [library, setLibrary] = useState([]);
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('Todos');

  const apps = catalog.apps || [];
  const featured = apps[hero] || apps[0];
  const genres = ['Todos', ...new Set(apps.map(a => a.category).filter(Boolean))];

  const onSelect = t => { setScreen(t); setSelected(null); };
  const isFav = app => favorites.includes(id(app));

  const obtain = app => {
    const url = app.artifact_url || (app.downloads && app.downloads[0] && app.downloads[0].url);
    setLibrary(v => v.includes(id(app)) ? v : [...v, id(app)]);
    if (!url) return;
    console.log('Obter:', url);
  };
  const toggleFav = app => {
    const k = id(app);
    setFavorites(v => v.includes(k) ? v.filter(x => x !== k) : [...v, k]);
  };

  const explored = genre === 'Todos' ? apps : apps.filter(a => a.category === genre);
  const favList = apps.filter(a => favorites.includes(id(a)));
  const libList = apps.filter(a => library.includes(id(a)));
  const results = query.trim()
    ? apps.filter(a => normalize([a.name, a.category, a.author].join(' ')).includes(normalize(query)))
    : [];

  let body;
  let action = 'Selecionar';

  if (selected) {
    /* ----- Detalhe ----- */
    const d = selected;
    action = 'Obter jogo';
    const info = [
      ['EXPERIÊNCIA', d.players],
      ['IDIOMA', d.language],
      ['TAMANHO', d.size],
      ['CLASSIFICAÇÃO', d.rating],
    ].filter(([, v]) => v);
    body = (
      <View className="flex-row justify-between flex-1">
        <View className="w-[544px] gap-3">
          <View focusable onPress={() => setSelected(null)}
            className="flex-row self-start px-2 py-1 rounded-md border-2 border-transparent focused:border-pipow-text">
            <Tiny>{screen + '   /   ' + (d.category || 'Jogo')}</Tiny>
          </View>
          <Hero>{d.name}</Hero>
          {d.subtitle ? <Text className="font-sans text-xl text-pipow-text">{d.subtitle.toUpperCase()}</Text> : null}
          <Muted>{join([d.author, d.version ? 'v' + d.version : null])}</Muted>
          <Body>{d.description}</Body>
          <View className="flex-row gap-3 pt-2">
            <PrimaryButton label="↓  Obter jogo" onPress={() => obtain(d)} />
            <GhostButton label={isFav(d) ? '♥  Favoritado' : '♡  Favoritar'} onPress={() => toggleFav(d)} />
          </View>
          <Tiny>Jogo completo e gratuito. Acesso livre à experiência inteira.</Tiny>
          {info.length ? (
            <View className="flex-row gap-8 pt-4">
              {info.map(([k, v]) => (
                <View key={k} className="gap-1">
                  <Tiny>{k}</Tiny>
                  <Body>{v}</Body>
                </View>
              ))}
            </View>
          ) : d.meta_line ? <View className="pt-4"><Muted>{d.meta_line}</Muted></View> : null}
        </View>
        <Art titleid={d.titleid} size="detail" />
      </View>
    );
  } else if (screen === 'Inicial') {
    /* ----- Inicial ----- */
    action = 'Obter jogo';
    body = featured ? (
      <View className="gap-5 flex-1">
        <View className="flex-row justify-between h-[320px]">
          <View className="w-[576px] gap-3 justify-center">
            <Tag>{(featured.hero_tag || 'EM DESTAQUE').toUpperCase()}</Tag>
            <Hero>{featured.name}</Hero>
            {featured.subtitle ? <Text className="font-sans text-xl text-pipow-text">{featured.subtitle.toUpperCase()}</Text> : null}
            <Body>{featured.description}</Body>
            {featured.meta_line ? <Muted>{featured.meta_line}</Muted> : null}
            <View className="flex-row items-center gap-3 pt-2">
              <PrimaryButton label="↓  Obter jogo" onPress={() => obtain(featured)} />
              <GhostButton label="Ver detalhes" onPress={() => setSelected(featured)} />
              <View focusable onPress={() => setHero(v => (v + 1) % apps.length)}
                className="px-3 py-2 rounded-lg border-2 border-transparent focused:border-pipow-text">
                <Muted>{pad(hero + 1) + ' / ' + pad(apps.length)}</Muted>
              </View>
            </View>
          </View>
          <Art titleid={featured.titleid} size="home" />
        </View>
        <View className="gap-3">
          <Section right="↓  Mais coleções">Populares</Section>
          <View className="flex-row gap-4">
            {apps.slice(0, 5).map(a => <Tile key={id(a)} app={a} onPress={() => setSelected(a)} />)}
          </View>
        </View>
      </View>
    ) : <Empty title="Catálogo vazio" text="Nenhum jogo foi encontrado no catálogo." action="Recarregar" onPress={() => onSelect('Inicial')} />;
  } else if (screen === 'Explore') {
    /* ----- Explore ----- */
    body = (
      <View className="gap-5 flex-1">
        <View className="gap-2">
          <Title>Encontre seu próximo universo.</Title>
          <Muted>Explore por gênero. Descubra no seu ritmo. Jogue sem pagar.</Muted>
        </View>
        <View className="flex-row gap-3">
          {genres.map(g => <Chip key={g} label={g} active={genre === g} onPress={() => setGenre(g)} />)}
        </View>
        {featured ? (
          <View focusable onPress={() => setSelected(featured)}
            className="flex-row items-center justify-between p-2 pl-6 rounded-2xl bg-pipow-surface border-2 border-pipow-border focused:border-pipow-text">
            <View className="w-[600px] gap-2">
              <Tag>SELEÇÃO PIPOW</Tag>
              <Text className="font-sans text-2xl text-pipow-text">{featured.name}</Text>
              <Muted>{featured.description}</Muted>
            </View>
            <Art titleid={featured.titleid} size="banner" />
          </View>
        ) : null}
        <View className="gap-3">
          <Section right={plural(explored.length, 'jogo', 'jogos')}>{genre === 'Todos' ? 'Todos os jogos' : genre}</Section>
          <View className="flex-row gap-4">
            {explored.slice(0, 5).map(a => <Tile key={id(a)} app={a} onPress={() => setSelected(a)} />)}
          </View>
        </View>
      </View>
    );
  } else if (screen === 'Biblioteca') {
    /* ----- Biblioteca ----- */
    action = 'Ver jogo';
    body = (
      <View className="gap-6 flex-1">
        <View className="gap-2">
          <Title>Seu próximo capítulo.</Title>
          <Muted>{plural(libList.length, 'jogo obtido', 'jogos obtidos') + '. Sempre seus, sempre gratuitos.'}</Muted>
        </View>
        {libList.length ? (
          <View className="flex-row gap-6 flex-wrap">
            {libList.map(a => <Tile key={id(a)} app={a} size="lg" sub={join([a.category, 'Obtido'])} onPress={() => setSelected(a)} />)}
          </View>
        ) : (
          <Empty title="Sua biblioteca está vazia" text="Os jogos que você obtiver aparecem aqui."
            action="Ir para Explore" onPress={() => onSelect('Explore')} />
        )}
      </View>
    );
  } else if (screen === 'Favoritos') {
    /* ----- Favoritos ----- */
    action = 'Ver jogo';
    body = (
      <View className="gap-6 flex-1">
        <View className="gap-2">
          <Title>Mundos que você quer visitar.</Title>
          <Muted>{plural(favList.length, 'jogo salvo', 'jogos salvos') + '. Uma seleção só sua.'}</Muted>
        </View>
        {favList.length ? (
          <View className="gap-3">
            <Tag>SUA LISTA</Tag>
            <View className="flex-row gap-6 flex-wrap">
              {favList.map(a => <Tile key={id(a)} app={a} size="lg" onPress={() => setSelected(a)} />)}
            </View>
          </View>
        ) : (
          <Empty title="Nenhum favorito ainda" text="Abra um jogo e escolha Favoritar para salvar aqui."
            action="Ir para Explore" onPress={() => onSelect('Explore')} />
        )}
      </View>
    );
  } else {
    /* ----- Busca ----- */
    action = 'Inserir letra';
    const type = k => setQuery(q => (q + k).toLowerCase());
    body = (
      <View className="gap-5 flex-1">
        <View className="gap-2">
          <Title>Qual será o próximo destino?</Title>
          <Muted>Busque por jogo, gênero ou estúdio.</Muted>
        </View>
        <View className="flex-row items-center h-[48px] px-4 rounded-xl bg-pipow-surface border-2 border-pipow-border">
          <Text className={`font-sans text-lg ${query ? 'text-pipow-text' : 'text-pipow-muted2'}`}>{query ? query + '|' : 'Digite com o teclado abaixo'}</Text>
        </View>
        <View className="flex-row gap-10">
          <View className="w-[472px] gap-2">
            {[0, 1, 2, 3].map(r => (
              <View key={r} className="flex-row gap-2">
                {KEYS.slice(r * 8, r * 8 + 8).map(k => (
                  <View key={k} focusable onPress={() => type(k)}
                    className="w-[52px] h-[44px] items-center justify-center rounded-lg bg-pipow-surface border-2 border-transparent focused:bg-pipow-blue focused:border-pipow-text">
                    <Text className="font-sans text-base text-pipow-text">{k}</Text>
                  </View>
                ))}
              </View>
            ))}
            <View className="flex-row gap-2">
              <View focusable onPress={() => type(' ')}
                className="w-[232px] h-[44px] items-center justify-center rounded-lg bg-pipow-surface border-2 border-transparent focused:bg-pipow-blue focused:border-pipow-text">
                <Text className="font-sans text-base text-pipow-text">Espaço</Text>
              </View>
              <View focusable onPress={() => setQuery(q => q.slice(0, -1))}
                className="w-[112px] h-[44px] items-center justify-center rounded-lg bg-pipow-surface border-2 border-transparent focused:bg-pipow-blue focused:border-pipow-text">
                <Text className="font-sans text-base text-pipow-text">⌫</Text>
              </View>
              <View focusable onPress={() => setQuery('')}
                className="w-[112px] h-[44px] items-center justify-center rounded-lg bg-pipow-surface border-2 border-transparent focused:bg-pipow-blue focused:border-pipow-text">
                <Text className="font-sans text-base text-pipow-text">Limpar</Text>
              </View>
            </View>
          </View>
          <View className="flex-1 gap-3">
            <Section right={query ? plural(results.length, 'jogo', 'jogos') : null}>
              {query ? 'Resultados para "' + query + '"' : 'Resultados'}
            </Section>
            {results.length ? (
              <View className="flex-row gap-4">
                {results.slice(0, 3).map(a => <Tile key={id(a)} app={a} size="sm" onPress={() => setSelected(a)} />)}
              </View>
            ) : (
              <Muted>{query ? 'Nenhum jogo encontrado. Tente outro nome ou gênero.' : 'Os resultados aparecem aqui enquanto você digita.'}</Muted>
            )}
            {results.length ? <Tiny>→  Continue à direita para selecionar um resultado.</Tiny> : null}
          </View>
        </View>
      </View>
    );
  }

  return (
    <FocusScope autoFocus wrap>
      <View className="w-screen h-screen bg-pipow-bg px-12 py-6 gap-5">
        <Header screen={screen} onSelect={onSelect} />
        {body}
        <Footer action={action} />
      </View>
    </FocusScope>
  );
}

AppRegistry.registerComponent('pipow-store', () => PipowStore);
