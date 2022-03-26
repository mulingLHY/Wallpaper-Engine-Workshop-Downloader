
(() => {
    const load = () => {
      if (typeof jQuery === "undefined") {
        setTimeout(load, 50);
        return
      }

      $("body").empty()
      
      var bg = chrome.extension.getBackgroundPage();
      for(ind in bg.downloadIdCache){
        info = bg.downloadIdCache[ind]
        statusT = ""
        switch (info.status) {
            case "downloading":statusT = " 下载中";break;
            case "cancle":statusT = "下载取消";break;
            case "complete":statusT = "下载完成";break;
            case "done":statusT = "安装完成";break;
            case "error":statusT = "安装错误";break;
            default:
                break;
        }
        $("body").append(`
            <div class="card">
                <div style="flex-grow:1; font-size:14px;">${info.name}</div>
                <div style="flex-shrink:0;padding-left:5px;">${statusT}</div>
            </div>
        `)
      }
      setTimeout(load, 100)
    };
    load();
  })();