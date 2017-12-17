//console.log("cat.js 1.0.0");

const DEFAULT_MEDIA_MAX_WIDTH = 400;
const DEFAULT_MEDIA_MAX_HEIGHT = 400;
const DEFAULT_VIDEO_CONTROL = false;
const DEFAULT_VIDEO_LOOP = true;
const DEFAULT_VIDEO_MUTED = false;
const DEFAULT_VIDEO_VOLUME = 0.5;
const DEFAULT_VIDEO_PLAY = true;
const DEFAULT_POPUP_TIME = 300;

let g_media_max_width = DEFAULT_MEDIA_MAX_WIDTH;
let g_media_max_height = DEFAULT_MEDIA_MAX_HEIGHT;
let g_video_control = DEFAULT_VIDEO_CONTROL;
let g_video_loop = DEFAULT_VIDEO_LOOP;
let g_video_muted = DEFAULT_VIDEO_MUTED;
let g_video_volume = DEFAULT_VIDEO_VOLUME;
let g_video_play = DEFAULT_VIDEO_PLAY;
let g_popup_time = DEFAULT_POPUP_TIME;

function getMediaUrl(thre_doc){
    let thre_list = thre_doc.getElementsByClassName("thre");
    if(thre_list.length == 0){
        return null;
    }

    let thre = thre_list[0];

    let link_list = thre.getElementsByTagName("a");
    if(link_list.length == 0){
        return null;
    }

    return link_list[0].href;
}

function isImage(url){
    return url.search(/\.webm/) == -1;
}

class Cell{
    constructor(link, parent, target, index){
        this.link = link;
        this.popup = document.createElement("div");
        this.target = target;
        this.loaded = false;
        this.loading = false;
        this.img = null;
        this.video = null;
        this.max_width = 0;
        this.max_height = 0;
        this.mouseon = false;
        this.timer = false;
        
        this.popup.style.display = "none";
        this.popup.style.zIndex = 1;
        this.popup.setAttribute("KOSHIAN_INDEX", `${index}`);
        parent.appendChild(this.popup);

        target.setAttribute("KOSHIAN_INDEX", `${index}`);
        target.addEventListener("mouseenter", onMouseEnter);
        target.addEventListener("mouseleave", onMouseLeave);
        this.popup.addEventListener("mouseenter", onMouseEnterSimple);
        this.popup.addEventListener("mouseleave", onMouseLeaveSimple);
    }

    setImage(url){
        this.img = document.createElement("img");
        this.img.src = url;
        this.img.style.maxWidth = `${this.max_width}px`;
        this.img.style.maxHeight = `${this.max_height}px`;
        this.popup.appendChild(this.img);
    }

    setVideo(url){
        this.video = document.createElement("video");
        this.video.src = url;
        this.video.controls = g_video_control;
        this.video.loop = g_video_loop;
        this.video.muted = g_video_muted;
        this.video.volume = g_video_volume;
        this.video.style.maxWidth = `${this.max_width}px`;
        this.video.style.maxHeight = `${this.max_height}px`;
        this.popup.appendChild(this.video);

        if(this.popup.style.display != "none" && g_video_play){
            this.video.play();
        }
    }

    onThreLoad(doc){
        let media_url = getMediaUrl(doc);
        if(media_url == null){
            return;
        }

        if(isImage(media_url)){
            this.setImage(media_url);
        }else{
            this.setVideo(media_url);
        }

        this.loaded = true;
    }

    onThreError(e){
        this.loading = false;
    }

    onThreTimeout(e){
        this.loading = false;
    }

    load(){
        if(!this.loaded && !this.loading){
            let xhr = new XMLHttpRequest();
            xhr.responseType = "document";
            xhr.timeout = 60000;
            xhr.open('GET', this.link);
            xhr.onload = (e) => {if(xhr.status == 200){this.onThreLoad(xhr.responseXML);}};
            xhr.onerror = (e) => {this.onThreError(e)};
            xhr.ontimeout = (e) => {this.onThreTimeout(e)};
            xhr.send();
            this.isLoading = true;
        }
    }

    show(){
        if(!this.loaded){
            return;
        }

        let clientW = document.documentElement.clientWidth;
        let clientH = document.documentElement.clientHeight;
        let rect = this.target.getBoundingClientRect();
        let cx = rect.x + rect.width/2; // center x
        let cy = rect.y + rect.height/2;
        let ccx = cx + document.documentElement.scrollLeft;
        let ccy = cy + document.documentElement.scrollTop;
        let max_popup_width = 0;
        let max_popup_height = 0;

        if(cx < clientW/2){
            this.popup.style.left = `${ccx}px`;
            this.popup.style.right = null;
            max_popup_width = clientW - cx;
        }else{
            this.popup.style.left = null;
            this.popup.style.right = `${clientW - ccx}px`;
            max_popup_width = cx;
        }
        
        if(cy < clientH/2){
            this.popup.style.top = `${ccy}px`;
            this.popup.style.bottom = null;
            max_popup_height = clientH - cy;
        }else{
            this.popup.style.top = null;
            this.popup.style.bottom=`${clientH - ccy}px`;
            max_popup_height = cy;
        }

        this.max_width = Math.min(g_media_max_width, max_popup_width);
        this.max_height = Math.min(g_media_max_height, max_popup_height);

        this.popup.style.display = "block";
        this.popup.style.position = "absolute";

        if(this.img){
            this.img.style.maxWidth = `${this.max_width}px`;
            this.img.style.maxHeight = `${this.max_height}px`;
        }else if(this.video){
            this.video.style.maxWidth = `${this.max_width}px`;
            this.video.style.maxHeight = `${this.max_height}px`;
        }

        if(this.video && g_video_play){
            this.video.play();
        }
    }

    hide(){
        if(this.video){
            this.video.pause();
        }

        this.popup.style.display = "none";
    }

    setting(){
        if(this.img){//
        }
        else if(this.video){
            this.video.controls = g_video_control;
            this.video.loop = g_video_loop;
            this.video.muted = g_video_muted;
        }
    }
}

let cell_map = [];

function getCell(attribute){
    if(attribute == null){
        return null;
    }

    let index = Number(attribute);
    if(Number.isNaN(index)){
        return null;
    }

    if(index >= cell_map.length){
        return null;
    }

    return cell_map[index];
}

function onMouseEnter(e){
    let cell = getCell(e.target.getAttribute("KOSHIAN_INDEX"));

    if(cell == null){
        return;
    }

    cell.mouseon = true;

    if(!cell.loaded){
        cell.load();
    }

    if(!cell.timer){
        cell.timer = true;

        setTimeout(() => {
            cell.timer = false;
            
            if(cell.mouseon){
                cell.show();
            }
        }, g_popup_time);
    }
}

function onMouseLeave(e){
    let cell = getCell(e.target.getAttribute("KOSHIAN_INDEX"));

    if(cell == null){
        return;
    }

    cell.mouseon = false;

    cell.hide();
}

function onMouseEnterSimple(e){
    let cell = getCell(e.target.getAttribute("KOSHIAN_INDEX"));

    if(cell == null){
        return;
    }

    cell.show();
}

function onMouseLeaveSimple(e){
    let cell = getCell(e.target.getAttribute("KOSHIAN_INDEX"));

    if(cell == null){
        return;
    }

    cell.hide();

}

function isCatalog(){
    return (window.location.search.search(/mode=cat/) != -1);
}


function onError(error){    
}

function safeGetValue(value, default_value){
    if(value === undefined){
        return default_value;
    }else{
        return value;
    }
}

function onGetSettings(result){
    g_popup_time = safeGetValue(result.popup_time, DEFAULT_POPUP_TIME);
    g_media_max_width = safeGetValue(result.media_max_width, DEFAULT_MEDIA_MAX_WIDTH);
    g_media_max_height = safeGetValue(result.media_max_height, DEFAULT_MEDIA_MAX_HEIGHT);
    g_video_control = safeGetValue(result.video_control, DEFAULT_VIDEO_CONTROL);
    g_video_loop = safeGetValue(result.video_loop, DEFAULT_VIDEO_LOOP);
    g_video_muted = safeGetValue(result.video_muted, DEFAULT_VIDEO_MUTED);
    g_video_volume =  safeGetValue(result.video_volume, DEFAULT_VIDEO_VOLUME);
    g_video_play = safeGetValue(result.video_play, DEFAULT_VIDEO_PLAY);
}

function onChangeSetting(changes, areaName){
    if(areaName != "local"){
        return;
    }

    g_popup_time = safeGetValue(changes.popup_time.newValue, DEFAULT_POPUP_TIME);
    g_media_max_width = safeGetValue(changes.media_max_width.newValue, DEFAULT_MEDIA_MAX_WIDTH);
    g_media_max_height = safeGetValue(changes.media_max_height.newValue, DEFAULT_MEDIA_MAX_HEIGHT);
    g_video_control = safeGetValue(changes.video_control.newValue, DEFAULT_VIDEO_CONTROL);
    g_video_loop = safeGetValue(changes.video_loop.newValue, DEFAULT_VIDEO_LOOP);
    g_video_muted = safeGetValue(changes.video_muted.newValue, DEFAULT_VIDEO_MUTED);
    g_video_volume = safeGetValue(changes.video_volume.newValue, DEFAULT_VIDEO_VOLUME);
    g_video_play = safeGetValue(changes.video_play.newValue, DEFAULT_VIDEO_PLAY);

    for(let i = 0; i < cell_map.length; ++i){
        cell_map[i].setting();
    }
}

function onLoad(){
    if(!isCatalog()){
        return;
    }

    browser.storage.local.get().then(onGetSettings, onError);

    browser.storage.onChanged.addListener(onChangeSetting);

    let td_list = document.getElementsByTagName("td");
    if(td_list.length == 0){
        return;
    }

    let map_index = 0;

    for(let i = 0; i < td_list.length; ++i){
        let td = td_list[i];
        let a_list = td.getElementsByTagName("a");
        let img_list = td.getElementsByTagName("img");

        if(a_list.length == 0 || img_list.length == 0){
            continue;
        }

        let dummy = document.createElement("div");
        td.appendChild(dummy);

        let a = a_list[0];

        cell_map.push(new Cell(a.href, dummy, a, map_index));
        ++map_index;
    }
}

onLoad();
