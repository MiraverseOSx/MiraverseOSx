import { getDesktopTheme, type DesktopThemeId } from './desktopThemes';
import { resolveAppDestination } from './appNavigation';
export const DESKTOP_APP_IDS = ['browser','files','mail','comms','maispace','passport','housing','finance','pulse','vitals','campus','lore','jobs','fieldOperations','meridionRegistry','documentStudio','dgaos','process','terminal','settings'];
export const DEFAULT_SHORTCUT_IDS = ['browser','files','mail','jobs','housing','lore'];
export const MAX_DESKTOP_SHORTCUTS = 8;
export const LAYOUT_IDS = ['everyday','personal','work'] as const;
export type LayoutId = typeof LAYOUT_IDS[number];
export const WIDGET_IDS = ['clock','notes','checklist','weather','music','assignments','inbox','recents'] as const;
export type WidgetId = typeof WIDGET_IDS[number];
export interface DesktopShortcut { id:string; kind:'app'|'folder'; target:string; label?:string }
export interface DesktopGroup { id:string; title:string; widget?:WidgetId; shortcuts?:DesktopShortcut[]; lane:'left'|'right'; hidden:boolean; collapsed:boolean }
export interface DesktopLayout { groups:DesktopGroup[] }
export interface DesktopAsset { id:string; name:string; type:string; size:number }
export interface RecentDesktopFile { id:string; name:string; openedAt:string }
export interface DesktopPreferences { shortcutIds:string[]; themeId:DesktopThemeId; layoutVersion:1; activeLayout:LayoutId; layouts:Record<LayoutId,DesktopLayout>; dockPins:string[]; note:string; checklist:{id:string;text:string;done:boolean}[]; music:DesktopAsset[]; volume:number; recentFiles:RecentDesktopFile[] }
const appIds=(ids:unknown, defaults:string[],max=20)=>Array.isArray(ids)?[...new Set(ids.filter((id):id is string=>typeof id==='string').map(id=>resolveAppDestination(id).appId).filter(id=>DESKTOP_APP_IDS.includes(id)))].slice(0,max):[...defaults];
export const widgetTitle:Record<WidgetId,string>={clock:'Clock & calendar',notes:'Sticky note',checklist:'My checklist',weather:'Aureline weather',music:'Music',assignments:'Active assignments',inbox:'Unread inbox',recents:'Recent files'};
export function defaultLayout(id:LayoutId,shortcuts=DEFAULT_SHORTCUT_IDS):DesktopLayout {
 const visible:Record<LayoutId,string[]>={everyday:['clock','notes','checklist'],personal:['clock','weather','notes','music'],work:['clock','assignments','inbox','recents']};
 const groups:DesktopGroup[]=WIDGET_IDS.map(widget=>({id:widget,title:widgetTitle[widget],widget,lane:['music','recents'].includes(widget)?'right':'left',hidden:!visible[id].includes(widget),collapsed:false}));
 groups.sort((a,b)=>(visible[id].includes(a.widget!)?visible[id].indexOf(a.widget!):99)-(visible[id].includes(b.widget!)?visible[id].indexOf(b.widget!):99));
 const apps=id==='everyday'?shortcuts:id==='personal'?['maispace','passport','housing','lore','campus','browser']:['dgaos','jobs','files','mail','documentStudio','fieldOperations'];
 groups.push({id:'apps',title:id==='everyday'?'My apps':id==='personal'?'Personal apps':'Work apps',lane:'right',hidden:false,collapsed:false,shortcuts:apps.map(target=>({id:`app:${target}`,kind:'app',target}))});
 if(id!=='everyday') groups.push({id:'folders',title:'Folders',lane:'right',hidden:false,collapsed:false,shortcuts:[{id:'folder:documents',kind:'folder',target:'/documents',label:'Documents'},{id:'folder:assignments',kind:'folder',target:'/assignments',label:'Assignments'}]});
 return {groups};
}
export function restoreDesktopPreferences(saved:unknown):DesktopPreferences {
 const s:any=saved&&typeof saved==='object'?saved:{};
 const shortcuts=appIds(s.shortcutIds,DEFAULT_SHORTCUT_IDS,8);
 const layouts={} as Record<LayoutId,DesktopLayout>;
 for(const id of LAYOUT_IDS) {
  const defaults=defaultLayout(id,shortcuts); const raw=s.layouts?.[id]?.groups; const seen=new Set<string>();
  const groups:DesktopGroup[]=Array.isArray(raw)?raw.filter(g=>g&&typeof g.id==='string'&&!seen.has(g.id)&&(seen.add(g.id),true)).slice(0,24).map(g=>({id:g.id,title:String(g.title||'Group').slice(0,60),...(WIDGET_IDS.includes(g.widget)?{widget:g.widget}:{shortcuts:Array.isArray(g.shortcuts)?g.shortcuts.filter(x=>x&&typeof x.id==='string'&&typeof x.target==='string'&&(x.kind==='app'?DESKTOP_APP_IDS.includes(resolveAppDestination(x.target).appId):x.kind==='folder'&&/^\/(?:home|root|documents|assignments|spells|diagnostics|system|downloads)(?:\/[^.\\]*)?$/.test(x.target))).slice(0,20).map(x=>({...x,target:x.kind==='app'?resolveAppDestination(x.target).appId:x.target})):[]} ),lane:g.lane==='right'?'right':'left',hidden:!!g.hidden,collapsed:!!g.collapsed})):defaults.groups;
  for(const widget of WIDGET_IDS) if(!groups.some(g=>g.widget===widget)) groups.push({...defaults.groups.find(g=>g.widget===widget)!,hidden:true});
  layouts[id]={groups};
 }
 const oldDefault=s.layoutVersion!==1&&(s.themeId===undefined||s.themeId==='heather');
 return {shortcutIds:shortcuts,themeId:oldDefault?'cherry-mist':getDesktopTheme(s.themeId).id,layoutVersion:1,activeLayout:LAYOUT_IDS.includes(s.activeLayout)?s.activeLayout:'everyday',layouts,dockPins:appIds(s.dockPins,['browser','files','mail']),note:typeof s.note==='string'?s.note:'',checklist:Array.isArray(s.checklist)?s.checklist.filter(x=>x&&typeof x.id==='string'&&typeof x.text==='string').map(x=>({id:x.id,text:x.text,done:!!x.done})):[],music:Array.isArray(s.music)?s.music.filter(x=>x&&typeof x.id==='string'&&typeof x.name==='string'&&/^audio\//.test(x.type)&&Number.isFinite(x.size)&&x.size>0&&x.size<=8*1024*1024):[],volume:typeof s.volume==='number'&&Number.isFinite(s.volume)?Math.min(1,Math.max(0,s.volume)):.65,recentFiles:Array.isArray(s.recentFiles)?s.recentFiles.filter(x=>x&&typeof x.id==='string'&&typeof x.name==='string'&&typeof x.openedAt==='string').slice(0,15):[]};
}
export type DesktopAction =
 | {type:'layout';id:LayoutId}|{type:'reset-layout'}|{type:'group';id:string;patch:Partial<DesktopGroup>}
 | {type:'move';id:string;lane:'left'|'right';index:number}|{type:'add-group';title:string}|{type:'remove-group';id:string}
 | {type:'pins';ids:string[]}|{type:'note';text:string}|{type:'check-add';text:string}|{type:'check-toggle';id:string}|{type:'check-remove';id:string}
 | {type:'music-add';asset:DesktopAsset}|{type:'music-remove';id:string}|{type:'volume';value:number}|{type:'recent';file:{id:string;name:string}};
export function changeDesktop(saved:DesktopPreferences,action:DesktopAction):DesktopPreferences {
 const p=structuredClone(saved),layout=p.layouts[p.activeLayout];
 switch(action.type){
 case 'layout':p.activeLayout=action.id;break;
 case 'reset-layout':p.layouts[p.activeLayout]=defaultLayout(p.activeLayout,p.shortcutIds);break;
 case 'group':{const g=layout.groups.find(g=>g.id===action.id);if(g)Object.assign(g,action.patch,{id:g.id});break;}
 case 'move':{const g=layout.groups.find(g=>g.id===action.id);if(!g)break;layout.groups=layout.groups.filter(x=>x.id!==g.id);g.lane=action.lane;const inLane=layout.groups.filter(x=>x.lane===g.lane&&!x.hidden);const before=inLane[Math.max(0,action.index)];const at=before?layout.groups.indexOf(before):layout.groups.length;layout.groups.splice(at,0,g);break;}
 case 'add-group':if(action.title.trim())layout.groups.push({id:crypto.randomUUID(),title:action.title.trim(),shortcuts:[],lane:'right',hidden:false,collapsed:false});break;
 case 'remove-group':layout.groups=layout.groups.filter(g=>g.id!==action.id||g.widget);break;
 case 'pins':p.dockPins=action.ids;break;
 case 'note':p.note=action.text;break;
 case 'check-add':if(action.text.trim())p.checklist.push({id:crypto.randomUUID(),text:action.text.trim(),done:false});break;
 case 'check-toggle':p.checklist=p.checklist.map(x=>x.id===action.id?{...x,done:!x.done}:x);break;
 case 'check-remove':p.checklist=p.checklist.filter(x=>x.id!==action.id);break;
 case 'music-add':p.music.push(action.asset);break;
 case 'music-remove':p.music=p.music.filter(x=>x.id!==action.id);break;
 case 'volume':p.volume=action.value;break;
 case 'recent':p.recentFiles=[{...action.file,openedAt:new Date().toISOString()},...p.recentFiles.filter(x=>x.id!==action.file.id)].slice(0,15);break;
 }
 return restoreDesktopPreferences(p);
}
