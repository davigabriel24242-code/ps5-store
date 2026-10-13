import {useRef,useEffect} from 'react';
import * as Core from '@ps5-react/core';
import {Image} from '@ps5-react/core';
import workSans from './fonts/WorkSans-Regular.ttf';
import orbitron from './fonts/Orbitron-Bold.ttf';
import logo from './assets/logo.png';
import hero from './assets/hero.png';
import a from './covers/PPSA17019.png';
import b from './covers/CUSA03041.png';
import c from './covers/CUSA57220.png';
export const FONTS={sans:workSans,display:orbitron};
const covers={PPSA17019:a,CUSA03041:b,CUSA57220:c};
export function Logo(){return <Image source={logo} resizeMode="contain" className="w-[150px] h-[48px]"/>;}
export function Background(){return <Image source={hero} resizeMode="cover" className="absolute top-0 left-0 w-[1280px] h-[720px]"/>;}
export function Banner(){return <Image source={hero} resizeMode="cover" className="absolute top-0 left-0 w-[1168px] h-[140px] rounded-xl"/>;}
export function Cover({titleid,size}){
const src=covers[titleid]||hero;
if(size==='favorite')return <Image source={src} resizeMode="cover" className="w-[272px] h-[240px] rounded-xl"/>;
if(size==='library')return <Image source={src} resizeMode="cover" className="w-[368px] h-[200px] rounded-xl"/>;
return <Image source={src} resizeMode="cover" className="w-[216px] h-[122px] rounded-lg"/>;
}

// ---- Animações (API Animated do motor; se o motor não exportar Animated, tudo vira no-op e o app roda como antes) ----
const A=Core.Animated;
const ease=Core.Easing?Core.Easing.cubicOut:undefined;
const canAnimate=!!(A&&A.Value&&A.timing&&A.View);
function useAnim(initial){
const ref=useRef(null);
if(ref.current===null&&canAnimate)ref.current=new A.Value(initial);
useEffect(()=>()=>{const v=ref.current;if(v&&v.destroy)v.destroy();},[]);
return ref.current;
}
function run(v,toValue,duration){
const a=A.timing(v,{toValue,duration,easing:ease,useNativeDriver:true});
a.start();
return a;
}
function halt(a){try{a.stop();}catch(e){}}
// Entrada de tela: fade + subida suave. Use com key para repetir a cada troca de tela.
export function Enter({children}){
const o=useAnim(0);
const y=useAnim(20);
useEffect(()=>{
if(!o||!y)return undefined;
const a=run(o,1,320);
const b=run(y,0,320);
return()=>{halt(a);halt(b);};
},[]);
if(!o||!y)return <>{children}</>;
return <A.View style={{position:'absolute',top:0,left:0,right:0,bottom:0,opacity:o,transform:[{translateY:y}]}}>{children}</A.View>;
}
// Zoom ao focar: ligue onFocus/onBlur no View focusável e envolva o conteúdo com <Zoom>.
export function useZoom(to){
const v=useAnim(1);
return {v,onFocus(){if(v)run(v,to,160);},onBlur(){if(v)run(v,1,160);}};
}
export function Zoom({z,children}){
if(!z.v)return <>{children}</>;
return <A.View style={{transform:[{scale:z.v}]}}>{children}</A.View>;
}
