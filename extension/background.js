var projectCache = []
// item {id,name,filename,status[downloading,cancle,complete,done,error]}
var downloadIdCache = {}


function DownloadCreated(el) {
    for(ind in projectCache){
        info = projectCache[ind]
        console.log(info)
        console.log(el.url.match(info.id))
        if(el.url.match(info.id) != null){
            console.log(el)
            downloadIdCache[el.id] = {id:info.id, name:info.name}
            console.log(downloadIdCache)
            return;
        }
    }
}
function DownloadChanged(el) {
    console.log(el)
    if(downloadIdCache[el.id]){
        if(el.filename && typeof(el.filename.current) == 'string'){
            downloadIdCache[el.id].filename = el.filename.current
            downloadIdCache[el.id].status = 'downloading'
        }
        if(el.state && el.state.current == 'complete'){
            downloadIdCache[el.id].status = 'complete'
            //console.log(el)
            console.log("complete")
            doExtractWallpaper(downloadIdCache[el.id].filename, downloadIdCache[el.id].id)
            //delete downloadIdCache[id]
        }
        if(el.state && el.state.current == 'interrupted'){
            downloadIdCache[el.id].status = 'cancle'
        }
    }
}


function onDisconnected() {
	console.log(chrome.runtime.lastError);
	console.log('disconnected from native app.');
	port = null;
}
 
function onNativeMessage(message) {
    if(message.id){
        for(ind in downloadIdCache){
            info = downloadIdCache[ind]
            if(info.id == message.id){
                if(message.success){
                    info.status='done'
                }else{
                    info.status='error'
                    console.log("安装 " + info.name +" 时出错")
                    console.error(message.error)
                }
            }
        }
    }
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
        if(projectCache.length > 10){
            projectCache.shift()
        }
        if(projectCache.find(function(value, index, arr){
            return value.id == request.id
        }) == null){
            projectCache.push(request)
        }
    }
});