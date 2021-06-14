export const validateFile = (file) => {
  if (file.type != "audio/wav") {
    return false;
  }
  return true;
};

export const getUserFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem("user"));
};

export function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
}

export const lerp = (a, b, mix) => {
  return a.map((ae, i) => ae * (1 - mix) + b[i] * mix);
};
