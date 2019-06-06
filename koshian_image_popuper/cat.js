//console.log("cat.js 1.0.0");

const DEFAULT_MEDIA_MAX_WIDTH = 400;
const DEFAULT_MEDIA_MAX_HEIGHT = 400;
const DEFAULT_VIDEO_CONTROL = false;
const DEFAULT_VIDEO_LOOP = true;
const DEFAULT_VIDEO_MUTED = false;
const DEFAULT_VIDEO_VOLUME = 0.5;
const DEFAULT_VIDEO_PLAY = true;
const DEFAULT_POPUP_TIME = 300;
const DEFAULT_POPUP_THUMBNAIL = false;
const DEFAULT_POPUP_LINK = false;
const DEFAULT_POPUP_TEXT = false;
const DEFAULT_MAX_TEXT_LINES = 1;
const DEFAULT_TEXT_HEIGHT = 15;
const DEFAULT_REQUEST_TIME = 300;

let g_media_max_width = DEFAULT_MEDIA_MAX_WIDTH;
let g_media_max_height = DEFAULT_MEDIA_MAX_HEIGHT;
let g_video_control = DEFAULT_VIDEO_CONTROL;
let g_video_loop = DEFAULT_VIDEO_LOOP;
let g_video_muted = DEFAULT_VIDEO_MUTED;
let g_video_volume = DEFAULT_VIDEO_VOLUME;
let g_video_play = DEFAULT_VIDEO_PLAY;
let g_popup_time = DEFAULT_POPUP_TIME;
let g_popup_thumbnail = DEFAULT_POPUP_THUMBNAIL;
let g_popup_link = DEFAULT_POPUP_LINK;
let g_popup_text = DEFAULT_POPUP_TEXT;
let g_max_text_lines = DEFAULT_MAX_TEXT_LINES;
let g_text_height = DEFAULT_TEXT_HEIGHT;
let g_request_time = DEFAULT_REQUEST_TIME;

function getMediaUrl(thre_doc){
    let thre = thre_doc.getElementsByClassName("thre")[0];
    if(!thre){
        return [null, ""];
    }

    let anchor = thre.getElementsByTagName("a")[0];
    if(!anchor){
        return [null, ""];
    }

    let blockquote = thre.getElementsByTagName("blockquote")[0];
    if(!blockquote){
        return [anchor.href, ""];
    }

    let text = blockquote.textContent;
    let mail = thre.querySelector(".thre > font > b > a");
    if (mail && mail.href.indexOf("%E3%83%BB3%E3%83%BB") > -1) {
        // メール欄に「・3・」が含まれるなら本文先頭がIPなので削除
        text = text.replace(/^\[\S+?\]/, "");
    }

    return [anchor.href, text];
}

function isImage(url){
    return url.search(/\.webm|\.mp4/) == -1;
}

class Cell{
    constructor(link, parent, target, img_src, text, res_num, index){
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
        this.popup_timer = null;
        this.request_timer = null;
        this.loaded_timer = null;
        this.parent = parent;
        this.img_src = img_src;
        this.text = document.createElement("div");
        this.res_num = res_num;

        this.popup.style.display = "none";
        this.popup.style.zIndex = 100;
        this.popup.setAttribute("KOSHIAN_INDEX", `${index}`);
        parent.appendChild(this.popup);

        this.text.textContent = res_num + text;
        this.text.style.fontSize = "small";
        this.text.style.color = "white";
        this.text.style.backgroundColor = "blue";
        this.text.style.borderStyle = "solid";
        this.text.style.borderWidth = "0 1px";
        this.text.style.borderColor = "blue";
        this.text.style.position = "relative";
        this.text.style.overflow = "hidden";
        this.text.style.wordBreak = "break-all";

        target.setAttribute("KOSHIAN_INDEX", `${index}`);
        target.addEventListener("mouseenter", onMouseEnter);
        target.addEventListener("mouseleave", onMouseLeave);
        this.popup.addEventListener("mouseenter", onMouseEnterSimple);
        this.popup.addEventListener("mouseleave", onMouseLeaveSimple);
    }

    setImage(url){
        this.parent.href = this.link;
        this.parent.target = "_blank";
        if (g_popup_link) {
            this.parent.onclick = (e) => {
                e.preventDefault();
                this.target.click();
            };
        } else {
            this.parent.onclick = (e) => {e.preventDefault();};
        }

        this.img = document.createElement("img");
        this.img.onload = () => {
            this.loaded = true;
        };
        this.img.onerror = () => {
            this.img.onerror = null;
            this.img.src = browser.extension.getURL("img/NoImage.png");
            this.loaded = true;
            this.img.error = true;
        };
        this.img.src = url;
        this.img.style.maxWidth = `${this.max_width}px`;
        this.img.style.maxHeight = `${this.max_height}px`;
        this.img.style.backgroundColor = "#F0E0D6";
        this.img.style.border = "solid 1px blue";
        this.popup.appendChild(this.img);
        if(g_popup_text){
            this.img.style.minWidth = "100px";  //スレ本文文字数確保
            this.popup.appendChild(document.createElement("br"));
            this.popup.appendChild(this.text);
        }
    }

    setVideo(url){
        this.parent.href = this.link;
        this.parent.target = "_blank";
        if (g_popup_link) {
            this.parent.onclick = (e) => {
                e.preventDefault();
                this.target.click();
            };
        } else {
            this.parent.onclick = (e) => {e.preventDefault();};
        }

        this.video = document.createElement("video");
        this.video.onloadedmetadata = () => {
            this.loaded = true;
        };
        this.video.src = url;
        this.video.controls = g_video_control;
        this.video.loop = g_video_loop;
        this.video.muted = g_video_muted;
        this.video.volume = g_video_volume;
        this.video.style.maxWidth = `${this.max_width}px`;
        this.video.style.maxHeight = `${this.max_height}px`;
        this.video.style.border = "solid 1px blue";
        this.popup.appendChild(this.video);
        if(g_popup_text){
            this.video.style.minWidth = "100px";  //スレ本文文字数確保
            this.popup.appendChild(document.createElement("br"));
            this.popup.appendChild(this.text);
        }

        if(this.popup.style.display != "none" && g_video_play){
            this.video.play();
        }
    }

    onThreLoad(doc){
        let [media_url, thre_text] = getMediaUrl(doc);
        if(media_url == null){
            return;
        }

        if(thre_text){
            this.text.textContent = this.res_num + thre_text;
        }

        if(isImage(media_url)){
            this.setImage(media_url);
        }else{
            this.setVideo(media_url);
        }

        let ss_obj = {};
        ss_obj.media_url = media_url;
        ss_obj.thre_text = thre_text;
        sessionStorage[this.img_src] = JSON.stringify(ss_obj);

        //this.loaded = true;
    }

    onThreNotFound(e){  // eslint-disable-line no-unused-vars
        let media_url = browser.extension.getURL("img/ThreadNotFound.png");
        //console.log("cat.js : media_url = " + media_url);
        this.setImage(media_url);
        //this.loaded = true;
    }

    onThreError(e){
        let media_url = browser.extension.getURL("img/Error.png");
        this.setImage(media_url);
        //this.loading = false;
        this.img.error = true;
        console.error("KOSHIAN_image_popuper/cat.js/onThreError - " + e.name + ": " + e.message);
        console.dir(e);
    }

    onThreTimeout(e){   // eslint-disable-line no-unused-vars
        let media_url = browser.extension.getURL("img/TimeOut.png");
        this.setImage(media_url);
        this.img.error = true;
        //this.loading = false;
    }

    load(){
        if(this.loaded || this.loading) return;
        if(g_popup_thumbnail){
            let media_url = this.img_src.replace("/cat/","/thumb/");
            if (media_url){
                this.setImage(media_url);
            }
            //this.loaded = true;
        } else if (sessionStorage.getItem(this.img_src)) {
            let ss_json = sessionStorage.getItem(this.img_src), ss_obj;
            if (ss_json) {
                ss_obj = JSON.parse(ss_json);
            } else {
                ss_obj = {};
            }
            let media_url = ss_obj.media_url;
            let thre_text = ss_obj.thre_text;

            if (!media_url) {
                return;
            }
    
            if(thre_text){
                this.text.textContent = this.res_num + thre_text;
            }
        
            if(isImage(media_url)){
                this.setImage(media_url);
            }else{
                this.setVideo(media_url);
            }
        } else {
            let xhr = new XMLHttpRequest();
            xhr.responseType = "document";
            xhr.timeout = 60000;
            xhr.open('GET', this.link);
            xhr.onload = (e) => {
                if(xhr.status == 200){
                    this.onThreLoad(xhr.responseXML);
                }
                if(xhr.status == 404){
                    this.onThreNotFound(e);
                }
            };
            xhr.onerror = (e) => {this.onThreError(e);};
            xhr.ontimeout = (e) => {this.onThreTimeout(e);};
            xhr.send();
            this.loading = true;
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
            if(this.img){
                this.img.style.cssFloat = "right";
            }else if(this.video){
                this.video.style.cssFloat = "right";
            }
            this.text.style.cssFloat = "right";
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
        this.popup.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.5)";

        if (g_popup_text) {
            if (g_max_text_lines == 1) {
                this.text.className = "";
                this.text.style.whiteSpace = "nowrap";
                this.text.style.textOverflow = "ellipsis";
                this.text.style.maxHeight = "";
                this.text.style.lineHeight = "";
            } else {
                this.text.className = "ellipsis";
                this.text.style.whiteSpace = "";
                this.text.style.textOverflow = "";
                this.text.style.maxHeight = `${g_max_text_lines * g_text_height}px`;
                this.text.style.lineHeight = `${g_text_height}px`;
            }
        }

        if(this.img){
            this.img.style.maxWidth = `${this.max_width}px`;
            this.img.style.maxHeight = `${this.max_height}px`;
            if (g_popup_text) {
                this.text.style.maxWidth = `${this.max_width}px`;
                this.text.style.width = this.img.clientWidth > 0 ? `${this.img.clientWidth}px` : `${this.max_width}px`;
                let text_rect = this.text.getBoundingClientRect();
                this.popup.style.maxWidth = `${this.max_width}px`;
                this.popup.style.maxHeight = `${max_popup_height}px`;
                this.img.style.maxHeight = `${Math.min(this.max_height, max_popup_height - text_rect.height)}px`;
                this.text.style.width = this.img.clientWidth > 0 ? `${this.img.clientWidth}px` : `${this.max_width}px`;
                this.text.style.height = `${text_rect.height}px`;
            }
        }else if(this.video){
            this.video.style.maxWidth = `${this.max_width}px`;
            this.video.style.maxHeight = `${this.max_height}px`;
            if (g_popup_text) {
                this.text.style.maxWidth = `${this.max_width}px`;
                this.text.style.width = this.video.clientWidth > 0 ? `${this.video.clientWidth}px` : `${this.max_width}px`;
                let text_rect = this.text.getBoundingClientRect();
                this.popup.style.maxWidth = `${this.max_width}px`;
                this.popup.style.maxHeight = `${max_popup_height}px`;
                this.video.style.maxHeight = `${Math.min(this.max_height, max_popup_height - text_rect.height)}px`;
                this.text.style.width = this.video.clientWidth > 0 ? `${this.video.clientWidth}px` : `${this.max_width}px`;
                this.text.style.height = `${text_rect.height}px`;
            }
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

        if(this.img && this.img.error){
            this.img = null;
            this.popup.textContent = null;  // 子要素全削除
            this.loading = false;
            this.loaded = false;
        }
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
    g_request_time = Math.min(g_request_time, g_popup_time);

    if(!cell.request_timer){
        cell.request_timer = setTimeout(() => {
            cell.request_timer = null;
            if(cell.mouseon){
                if(!cell.loaded){
                    cell.load();
                }
            }
        }, g_request_time);
    }

    if(!cell.popup_timer){
        cell.popup_timer = setTimeout(() => {
            cell.popup_timer = null;
            if(!cell.loaded_timer){
                cell.loaded_timer = setInterval(() => {
                    if(cell.loaded){
                        clearInterval(cell.loaded_timer);
                        cell.loaded_timer = null;
                        cell.show();
                    }
                }, 10);
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
    if (cell.loaded_timer) {
        clearInterval(cell.loaded_timer);
        cell.loaded_timer = null;
    }
    if (cell.request_timer) {
        clearTimeout(cell.request_timer);
        cell.request_timer = null;
    }
    if (cell.popup_timer) {
        clearTimeout(cell.popup_timer);
        cell.popup_timer = null;
    }

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

/**
 * cell_mapにスレを登録
 * @param {Array.<Element>} target_list cell_mapに登録対象スレの要素リスト
 * @param {string} name スレ本文のtagNameまたはclassName（classNameは先頭に"."が設定されている）
 * @param {number} index 実行前のcell_mapに登録されているcell数
 * @return {number} 実行後のcell_mapに登録されているcell数
 */ 
function setCellMap(target_list, name, index) {
    let hasClass = name.charAt(0) == ".";
    // nameの先頭が"."ならclassNameとして処理
    if(hasClass) {
        name = name.substr(1);
    }

    for(let i = 0; i < target_list.length; ++i){
        let target = target_list[i];
        let a_list = target.getElementsByTagName("a");
        let img_list = target.getElementsByTagName("img");
        let comment_list = hasClass ? target.getElementsByClassName(name) : target.getElementsByTagName(name);
        let font_list = target.getElementsByTagName("font");

        if(a_list.length == 0 || img_list.length == 0){
            continue;
        }

        // 既存のポップアップコンテナがあれば削除
        let containers = target.getElementsByClassName("KOSHIAN_image_popup_container");
        for (let container of containers) {
            container.remove();
        }

        let container = document.createElement("a");
        container.className = "KOSHIAN_image_popup_container";
        target.appendChild(container);

        let a = a_list[0];
        let img = img_list[0];
        let img_src = img.src;
        let comment = "";
        if(comment_list.length){
            comment = comment_list[0].textContent;
        }
        let font = "";
        if(font_list.length){
            font = "(" + font_list[0].textContent + ")";
        }

        cell_map.push(new Cell(a.href, container, img, img_src, comment, font, index));
        ++index;
    }
    return index;
}


function onError(error){    // eslint-disable-line no-unused-vars
}

function safeGetValue(value, default_value){
    if(value === undefined){
        return default_value;
    }else{
        return value;
    }
}

function onGetSettings(result){
    g_popup_time = Math.max(safeGetValue(result.popup_time, DEFAULT_POPUP_TIME), DEFAULT_REQUEST_TIME);
    g_media_max_width = safeGetValue(result.media_max_width, DEFAULT_MEDIA_MAX_WIDTH);
    g_media_max_height = safeGetValue(result.media_max_height, DEFAULT_MEDIA_MAX_HEIGHT);
    g_video_control = safeGetValue(result.video_control, DEFAULT_VIDEO_CONTROL);
    g_video_loop = safeGetValue(result.video_loop, DEFAULT_VIDEO_LOOP);
    g_video_muted = safeGetValue(result.video_muted, DEFAULT_VIDEO_MUTED);
    g_video_volume =  safeGetValue(result.video_volume, DEFAULT_VIDEO_VOLUME);
    g_video_play = safeGetValue(result.video_play, DEFAULT_VIDEO_PLAY);
    g_popup_thumbnail = safeGetValue(result.popup_thumbnail, DEFAULT_POPUP_THUMBNAIL);
    g_popup_link = safeGetValue(result.popup_link, DEFAULT_POPUP_LINK);
    g_popup_text = safeGetValue(result.popup_text, DEFAULT_POPUP_TEXT);
    g_max_text_lines = safeGetValue(result.max_text_lines, DEFAULT_MAX_TEXT_LINES);
    g_text_height = safeGetValue(result.text_height, DEFAULT_TEXT_HEIGHT);
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
    g_popup_thumbnail = safeGetValue(changes.popup_thumbnail.newValue, DEFAULT_POPUP_THUMBNAIL);
    g_popup_link = safeGetValue(changes.popup_link.newValue, DEFAULT_POPUP_LINK);
    g_popup_text = safeGetValue(changes.popup_text.newValue, DEFAULT_POPUP_TEXT);
    g_max_text_lines = safeGetValue(changes.max_text_lines.newValue, DEFAULT_MAX_TEXT_LINES);
    g_text_height = safeGetValue(changes.text_height.newValue, DEFAULT_TEXT_HEIGHT);

    for(let i = 0; i < cell_map.length; ++i){
        cell_map[i].setting();
    }
}

let map_index = 0;

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

    map_index = setCellMap(td_list, "small", 0);
 
    setPickupCell();

    document.addEventListener("FutabaTH_pickup", () => {
        cell_map.splice(map_index); // cell_mapからfutaba thread highlighter Kのピックアップ内のcellをクリア
        setPickupCell();
    });

    document.addEventListener("visibilitychange", handleVisibilityChange, false);

    document.addEventListener("KOSHIAN_cat_reload", () => {
        cell_map = [];
        map_index = setCellMap(td_list, "small", 0);
        setPickupCell();
    });

    let status = "";
    let target = document.getElementById("akahuku_catalog_reload_status");
    if (target) {
        checkAkahukuReload();
    } else {
        document.addEventListener("AkahukuContentApplied", () => {
            target = document.getElementById("akahuku_catalog_reload_status");
            if (target) {
                checkAkahukuReload();
            }
        });
    }

    function checkAkahukuReload() {
        let config = { childList: true };
        let observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {  // eslint-disable-line no-unused-vars
                if (target.textContent == status) return;
                status = target.textContent;
                if (status == "完了しました" || status == "アンドゥしました" || status == "リドゥしました") {
                    cell_map = [];
                    map_index = setCellMap(td_list, "small", 0);
                    setPickupCell();
                }
            });
        });
        observer.observe(target, config);
    }

    function setPickupCell() {
        // futaba thread highlighter Kのピックアップスレをcell_mapに登録
        let pickup_index = map_index;
        let pickup_list = document.getElementsByClassName("GM_fth_pickuped");
        if (pickup_list.length) {
            pickup_index = setCellMap(pickup_list, ".GM_fth_pickuped_caption", pickup_index);
        }
        let opened_list = document.getElementsByClassName("GM_fth_opened");
        if (opened_list.length) {
            setCellMap(opened_list, ".GM_fth_opened_caption", pickup_index);
        }
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            // ページが隠れたら全てのポップアップを隠す
            for (let cell of cell_map) {
                onMouseLeave(cell);
            }
        }
    }
}

onLoad();
