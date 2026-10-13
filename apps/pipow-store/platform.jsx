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

// O plugin Tailwind so aceita classes fixas no build.
// Por isso cada tamanho tem seu proprio className literal (sem objetos nem variaveis).

export function Logo() {
  return <Image source={logo} resizeMode="contain" className="w-[150px] h-[40px]" />;
}

function CoverFallback({titleid, size}) {
  const label = String(titleid || '----').slice(0, 4);
  if (size === 'sm') {
    return (
      <View className="w-[200px] h-[112px] rounded-lg bg-pipow-surface2 items-center justify-center">
        <Text className="font-display text-2xl text-pipow-muted">{label}</Text>
      </View>
    );
  }
  if (size === 'lg') {
    return (
      <View className="w-[272px] h-[153px] rounded-lg bg-pipow-surface2 items-center justify-center">
        <Text className="font-display text-2xl text-pipow-muted">{label}</Text>
      </View>
    );
  }
  return (
    <View className="w-[220px] h-[124px] rounded-lg bg-pipow-surface2 items-center justify-center">
      <Text className="font-display text-2xl text-pipow-muted">{label}</Text>
    </View>
  );
}

export function Cover({titleid, size = 'md'}) {
  const src = COVERS[titleid];
  if (!src) return <CoverFallback titleid={titleid} size={size} />;
  if (size === 'sm') return <Image source={src} resizeMode="cover" className="w-[200px] h-[112px] rounded-lg" />;
  if (size === 'lg') return <Image source={src} resizeMode="cover" className="w-[272px] h-[153px] rounded-lg" />;
  return <Image source={src} resizeMode="cover" className="w-[220px] h-[124px] rounded-lg" />;
}

export function Art({titleid, size = 'home'}) {
  const src = COVERS[titleid] || hero;
  if (size === 'detail') return <Image source={src} resizeMode="cover" className="w-[600px] h-[520px] rounded-2xl" />;
  if (size === 'banner') return <Image source={src} resizeMode="cover" className="w-[480px] h-[148px] rounded-xl" />;
  return <Image source={src} resizeMode="cover" className="w-[568px] h-[320px] rounded-2xl" />;
}
