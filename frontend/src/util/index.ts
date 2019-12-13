export const toggleFullScreen = () => {
  !document.fullscreenElement
    ? document.documentElement.requestFullscreen()
    : document.exitFullscreen && document.exitFullscreen();
};

export const avg = (...args: number[]) =>
  args.reduce((c, p) => c + p) / args.length;
