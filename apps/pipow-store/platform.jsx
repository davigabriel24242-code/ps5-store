import {View, Image, Text} from '@ps5-react/core';
import logo from './assets/logo.png';
import hero from './assets/hero.png';
import coverPPSA17019 from './covers/PPSA17019.jpg';
import coverCUSA03041 from './covers/CUSA03041.jpg';
import coverCUSA57220 from './covers/CUSA57220.jpg';

const COVERS = {
  PPSA17019: coverPPSA17019,
  CUSA03041: coverCUSA03041,
  CUSA57220: coverCUSA57220,
};

export function Logo() {
  return <Image source={logo} resizeMode="contain" className="w-[220px] h-[70px]" />;
}

export function CardCover({titleid}) {
  const src = COVERS[titleid];
  if (!src) {
    return <View className="w-[280px] h-[158px] rounded-t-xl bg-pipow-surface2 items-center justify-center">
      <Text className="font-display text-2xl text-pipow-muted">{String(titleid || '----').slice(0, 4)}</Text>
    </View>;
  }
  return <Image source={src} resizeMode="cover" className="w-[280px] h-[158px] rounded-t-xl" />;
}

export function HomeHero({titleid}) {
  const src = COVERS[titleid] || hero;
  return <Image source={src} resizeMode="cover" className="w-[820px] h-[420px] rounded-2xl" />;
}

export function DetailHero({titleid}) {
  const src = COVERS[titleid] || hero;
  return <Image source={src} resizeMode="cover" className="w-[720px] h-[480px] rounded-2xl" />;
}