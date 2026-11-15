/** Корень админки: проверка Cloudflare Access → каркас → раздел. */
import { useEffect,useState } from 'react'
import { getSession } from './github'
import { Login,Shell,useRoute } from './layout'
import { StoreProvider } from './store'
import { Dashboard } from './pages/dashboard'
import { Products } from './pages/products'
import { Reviews } from './pages/reviews'
import { Blocks } from './pages/blocks'
import { Faq } from './pages/faq'
import { Settings } from './pages/settings'
import { Editor } from './pages/editor'
export default function AdminApp(){
 const [authenticated,setAuthenticated]=useState(false)
 const [checking,setChecking]=useState(true)
 const [demo,setDemo]=useState(false)
 const [route,params,go]=useRoute()
 useEffect(()=>{let active=true;getSession().then(ok=>{if(active)setAuthenticated(ok)}).catch(()=>{if(active)setAuthenticated(false)}).finally(()=>{if(active)setChecking(false)});return()=>{active=false}},[])
 if(checking)return <main className="grid min-h-dvh place-items-center px-4"><p className="text-sm text-muted">Проверяем защищённый вход…</p></main>
 if(!authenticated&&!demo)return <Login onLogin={()=>setAuthenticated(true)} onDemo={()=>setDemo(true)}/>
 const session=authenticated?'cloudflare-access-session':null
 return <StoreProvider key={session??'demo'} token={session} onLogout={()=>{setAuthenticated(false);setDemo(false)}}>
  <Shell route={route} go={go}>
   {route==='dashboard'&&<Dashboard go={go}/>}
   {route==='editor'&&<Editor/>}
   {route==='products'&&<Products params={params}/>}
   {route==='reviews'&&<Reviews params={params}/>}
   {route==='blocks'&&<Blocks params={params} go={go}/>}
   {route==='faq'&&<Faq params={params}/>}
   {route==='settings'&&<Settings/>}
  </Shell>
 </StoreProvider>
}
