var idCache = []
var downloadIdCache = {}


function DownloadCreated(el) {
    for(id of idCache){
        if(el.url.match(id) != null){
            console.log(el)
            console.log(id)
            downloadIdCache[el.id] = {id:id}
            return;
        }
    }
}
function DownloadChanged(el) {
    console.log(el)
    if(downloadIdCache[el.id]){
        if(el.filename && typeof(el.filename.current) == 'string'){
            downloadIdCache[el.id].filename = el.filename.current
        }
        if(el.state && el.state.current == 'complete'){
            //console.log(el)
            console.log("complete")
            doExtractWallpaper(downloadIdCache[el.id].filename, downloadIdCache[el.id].id)
            delete downloadIdCache[id]
        }
    }
}


function onDisconnected() {
	console.log(chrome.runtime.lastError);
	console.log('disconnected from native app.');
	port = null;
}
 
function onNativeMessage(message) {
	console.log('recieved message from native app: ' + JSON.stringify(message));
}

function doExtractWallpaper(filename, id){
    port.postMessage({path:filename,id:id})
}
function initNativeApp(){
    var nativeHostName = "com.muling.wallpaper";
    port = chrome.runtime.connectNative(nativeHostName);
    port.onMessage.addListener(onNativeMessage);
    port.onDisconnect.addListener(onDisconnected);
}

initNativeApp()

chrome.downloads.onCreated.addListener(DownloadCreated);
chrome.downloads.onChanged.addListener(DownloadChanged);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    if(request.id != null && typeof(request.id) == "string"){
        if(idCache.length > 10){
            idCache.shift()
        }
        idCache.push(request.id)
    }
});