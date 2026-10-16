const prefix='discovery_digital_rehearsal_v1';
export function loadProject(player,kind,storage=globalThis.localStorage){
 try{const value=JSON.parse(storage.getItem(`${prefix}:${player}:${kind}`)||'null');return value?.version===1?value:null;}catch{return null;}
}
export function saveProject(player,kind,value,storage=globalThis.localStorage){
 try{const data=JSON.stringify({...value,version:1});if(data.length>400000)return false;storage.setItem(`${prefix}:${player}:${kind}`,data);return true;}catch{return false;}
}
