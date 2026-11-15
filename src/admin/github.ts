/** Клиент защищённого same-origin API. Секрет GitHub хранится только в Cloudflare Worker. */
export const REPO = { owner: 'marcostavar24633-cyber', name: 'slopay-buket', branch: 'feature/admin-pro-foundation' }
const KEY_BY_PATH: Record<string,string> = {'content/site.json':'site','content/hero.json':'hero','content/products.json':'products','content/reviews.json':'reviews','content/faq.json':'faq','content/occasions.json':'occasions','content/seasons.json':'seasons','content/messages.json':'messages','content/page.json':'page'}
export class ApiError extends Error { constructor(public status:number,message:string){super(message);this.name='ApiError'} }
async function api<T>(path:string,init:RequestInit={}):Promise<T>{
 let response:Response
 try { response=await fetch(path,{...init,credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json',...(init.body?{'Content-Type':'application/json'}:{}),...init.headers}}) }
 catch { throw new ApiError(0,'Не удалось связаться с сервером админки. Проверьте соединение.') }
 const payload=await response.json().catch(()=>({})) as {error?:string}
 if(!response.ok) throw new ApiError(response.status,response.status===401?'Сеанс Cloudflare Access не подтверждён. Пройдите вход через /admin/.':payload.error||'Ошибка API: HTTP '+response.status)
 return payload as T
}
export type User={login:string;name:string|null;avatar_url:string}
export type Deploy={id:number;status:string;conclusion:string|null;created_at:string;title:string;url:string}
export async function getSession(){const r=await api<{authenticated:boolean}>('/api/session');return r.authenticated===true}
export async function getUser(_unused?:string):Promise<User>{await getSession();return {login:'Cloudflare Access',name:'Администратор',avatar_url:''}}
export async function checkRepo(_unused?:string){await getSession()}
export async function readFile<T>(_unused:string,path:string):Promise<{data:T;sha:string}>{const key=KEY_BY_PATH[path];if(!key)throw new ApiError(400,'Файл не разрешён.');return api('/api/content/'+key)}
export async function writeFile(_unused:string,path:string,data:unknown,sha:string|undefined,_message:string):Promise<string>{const key=KEY_BY_PATH[path];if(!key)throw new ApiError(400,'Файл не разрешён.');if(!sha)throw new ApiError(409,'Нет SHA исходной версии. Обновите страницу.');const r=await api<{sha:string|null}>('/api/content/'+key,{method:'PUT',body:JSON.stringify({data,sha})});if(!r.sha)throw new ApiError(502,'Сервер не вернул SHA сохранённой версии.');return r.sha}
export async function uploadImage(_unused:string,_file:File):Promise<string>{throw new ApiError(501,'Загрузка фото пока не подключена к защищённому API.')}
export async function getDeploys(_unused:string):Promise<Deploy[]>{throw new ApiError(501,'Статус публикаций ещё не подключён к API.')}
export const auth={get:():string|null=>null,set:(_token:string,_remember:boolean)=>undefined,clear:()=>undefined}
export function siteUrl(query=''){const path=location.pathname;if(/admin\.html$/.test(path))return path.replace(/admin\.html$/,'index.html')+query;return path.replace(/admin\/(index\.html)?$/,'')+query}
export const msgTarget=()=>location.origin==='null'?'*':location.origin
