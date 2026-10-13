// Cada chave é o nome de um .ttf em fonts/ (sem a extensão).
// "sizes" são os tamanhos em px que o motor gera: precisam cobrir todo text-* usado no app
// (text-xs 12, sm 14, base 16, lg 18, xl 20, 2xl 24, 3xl 30, 4xl 36, 5xl 48).
export default {
  fonts: {
    'WorkSans-Regular': {
      sizes: [12, 14, 16, 18, 20, 24, 30, 36, 48],
      glyphs: 'latin-ext',
      extraGlyphs: '· — “ ” ↑ ↓ ↩ ÇÁÉÍÓÚÃÕÂÊÔÀçáéíóúãõâêôà',
    },
    'Orbitron-Bold': {
      sizes: [14, 24, 30, 36, 48, 60],
      glyphs: 'latin-ext',
      extraGlyphs: 'ÇÁÉÍÓÚÃÕÂÊÔÀ',
    },
  },
};
