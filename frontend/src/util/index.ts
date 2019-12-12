export const toggleFullScreen = () => {
  !document.fullscreenElement
    ? document.documentElement.requestFullscreen()
    : document.exitFullscreen && document.exitFullscreen();
};
