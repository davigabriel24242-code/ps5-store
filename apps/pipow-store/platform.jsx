import {View, Image, Text} from '@ps5-react/core';
import logo from './assets/logo.png';
import hero from './assets/hero.png';
import coverPPSA17019 from './covers/PPSA17019.png';
import coverCUSA03041 from './covers/CUSA03041.png';
import coverCUSA57220 from './covers/CUSA57220.png';

const COVERS = {
  PPSA17019: coverPPSA17019,
  CUSA03041: coverCUSA03041,
  CUSA57220: coverCUSA57220,
};

// Classes literais (o compilador de estilos nao entende classes montadas dinamicamente)
const COVER_SIZE = {
  sm: 'w-[200px] h-[112px] rounded-lg',
  md: 'w-[220px] h-[124px] rounded-lg',
  lg: 'w-[272px] h-[153px] rounded-lg',
};

const ART_SIZE = {
  home: 'w-[568px] h-[320px] rounded-2xl',
  detail: 'w-[600px] h-[520px] rounded-2xl',
  banner: 'w-[480px] h-[148px] rounded-xl',
};

export function Logo() {
  return <Image source={logo} resizeMode="contain" className="w-[150px] h-[40px]" />;
}

export function Cover({titleid, size = 'md'}) {
  const src = COVERS[titleid];
  const cls = COVER_SIZE[size] || COVER_SIZE.md;
  if (!src) {
    return (
      <View className={`${cls} bg-pipow-surface2 items-center justify-center`}>
        <Text className="font-display text-2xl text-pipow-muted">{String(titleid || '----').slice(0, 4)}</Text>
      </View>
    );
  }
  return <Image source={src} resizeMode="cover" className={cls} />;
}

export function Art({titleid, size = 'home'}) {
  const src = COVERS[titleid] || hero;
  return <Image source={src} resizeMode="cover" className={ART_SIZE[size] || ART_SIZE.home} />;
}
