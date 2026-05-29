export function Scrubber(values, {
  format = value => value,
  initial = 0,
  direction = 1,
  delay = null,
  autoplay = true,
  loop = true,
  loopDelay = null,
  alternate = false
} = {}) {
  values = Array.from(values);

  const form = document.createElement("form");
  form.style.font = "12px var(--sans-serif)";
  form.style.fontVariantNumeric = "tabular-nums";
  form.style.display = "flex";
  form.style.height = "33px";
  form.style.alignItems = "center";

  const button = document.createElement("button");
  button.name = "b";
  button.type = "button";
  button.style.marginRight = "0.4em";
  button.style.width = "5em";

  const label = document.createElement("label");
  label.style.display = "flex";
  label.style.alignItems = "center";

  const input = document.createElement("input");
  input.name = "i";
  input.type = "range";
  input.min = 0;
  input.max = values.length - 1;
  input.value = initial;
  input.step = 1;
  input.style.width = "180px";

  const output = document.createElement("output");
  output.name = "o";
  output.style.marginLeft = "0.4em";

  label.appendChild(input);
  label.appendChild(output);
  form.appendChild(button);
  form.appendChild(label);

  let frame = null;
  let timer = null;
  let interval = null;

  function start() {
    form.b.textContent = "Pause";
    if (delay === null) frame = requestAnimationFrame(tick);
    else interval = setInterval(tick, delay);
  }

  function stop() {
    form.b.textContent = "Play";
    if (frame !== null) cancelAnimationFrame(frame), frame = null;
    if (timer !== null) clearTimeout(timer), timer = null;
    if (interval !== null) clearInterval(interval), interval = null;
  }

  function running() {
    return frame !== null || timer !== null || interval !== null;
  }

  function tick() {
    if (form.i.valueAsNumber === (direction > 0 ? values.length - 1 : direction < 0 ? 0 : NaN)) {
      if (!loop) {
        stop();
        return;
      }

      if (alternate) direction = -direction;

      if (loopDelay !== null) {
        if (frame !== null) cancelAnimationFrame(frame), frame = null;
        if (interval !== null) clearInterval(interval), interval = null;
        timer = setTimeout(() => {
          step();
          start();
        }, loopDelay);
        return;
      }
    }

    if (delay === null) frame = requestAnimationFrame(tick);
    step();
  }

  function step() {
    form.i.valueAsNumber = (form.i.valueAsNumber + direction + values.length) % values.length;
    form.i.dispatchEvent(new CustomEvent("input", {bubbles: true}));
  }

  form.i.oninput = event => {
    if (event && event.isTrusted && running()) stop();

    form.value = values[form.i.valueAsNumber];
    form.o.value = format(form.value, form.i.valueAsNumber, values);
  };

  form.b.onclick = () => {
    if (running()) {
      stop();
      return;
    }

    direction = alternate && form.i.valueAsNumber === values.length - 1 ? -1 : 1;

    if (!loop && direction > 0 && form.i.valueAsNumber === values.length - 1) {
      form.i.valueAsNumber = 0;
    }

    form.i.dispatchEvent(new CustomEvent("input", {bubbles: true}));
    start();
  };

  form.i.oninput();

  if (autoplay) start();
  else stop();

  return form;
}
