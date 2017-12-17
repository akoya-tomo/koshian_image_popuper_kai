const DEFAULT_MEDIA_MAX_WIDTH = 400;
const DEFAULT_MEDIA_MAX_HEIGHT = 400;
const DEFAULT_VIDEO_CONTROL = false;
const DEFAULT_VIDEO_LOOP = true;
const DEFAULT_VIDEO_MUTED = false;
const DEFAULT_VIDEO_VOLUME = 0.5;
const DEFAULT_VIDEO_PLAY = true;
const DEFAULT_POPUP_TIME = 300;

function onError(error) {
}

function safeGetValue(value, default_value) {
  if (value === undefined) {
    return default_value;
  } else {
    return value;
  }
}

function saveOptions(e) {
  e.preventDefault();

  browser.storage.local.set({
    popup_time: document.querySelector("#popup_time").value,
    media_max_width: document.querySelector("#media_max_width").value,
    media_max_height: document.querySelector("#media_max_height").value,
    video_control: document.querySelector("#video_control").checked,
    video_loop: document.querySelector("#video_loop").checked,
    video_muted: document.querySelector("#video_muted").checked,
    video_play: document.querySelector("#video_play").checked,
    video_volume: document.querySelector("#video_volume").value
  });
}

function setCurrentChoice(result) {
  document.querySelector("#popup_time").value = safeGetValue(result.popup_time, DEFAULT_POPUP_TIME);
  document.querySelector("#media_max_width").value = safeGetValue(result.media_max_width, DEFAULT_MEDIA_MAX_WIDTH);
  document.querySelector("#media_max_height").value = safeGetValue(result.media_max_height, DEFAULT_MEDIA_MAX_HEIGHT);
  document.querySelector("#video_control").checked = safeGetValue(result.video_control, DEFAULT_VIDEO_CONTROL);
  document.querySelector("#video_loop").checked = safeGetValue(result.video_loop, DEFAULT_VIDEO_LOOP);
  document.querySelector("#video_muted").checked = safeGetValue(result.video_muted, DEFAULT_VIDEO_MUTED);
  document.querySelector("#video_play").checked = safeGetValue(result.video_play, DEFAULT_VIDEO_PLAY);
  document.querySelector("#video_volume").value = safeGetValue(result.video_volume, DEFAULT_VIDEO_VOLUME);
}

function restoreOptions() {
  browser.storage.local.get().then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);