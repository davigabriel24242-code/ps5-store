import {View,Text} from '@ps5-react/core';
// A API de assets/Image e o manifesto do starter nao puderam ser recuperados.
// Nao adivinhar source/src nem inventar identificadores de imagem do runtime.
// Substitua este componente pela integracao do starter apos verificar seus assets.
export function NativeArtwork({kind,titleid}){
 if(kind==='logo')return <Text className="text-xl text-white">PIPOW STORE</Text>;
 return <View className="rounded-xl bg-slate-800 p-4"><Text className="text-slate-400">{titleid?`covers/${titleid}.jpg`:'Arte local pendente'}</Text></View>;
}
