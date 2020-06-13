import { Simulator } from "../pkg/index";
import { memory } from "../pkg/index_bg";

const simulator = Simulator.new();

console.log(simulator);

// simulator.tick();
// simulator.tick();
// ptr = simulator.true_value();
// z = new Float64Array(memory.buffer, ptr, 2);
// console.log(ptr, z);
const true_values = new Array();
const obs_values = new Array();
const est_values = new Array();

const canvas = document.getElementById("graph");
canvas.height = 800;
canvas.width = 800;
const ctx = canvas.getContext("2d");

const drawGraph = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 7; ++i) {
    ctx.beginPath();
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    ctx.moveTo((i + 1) * 100, 0);
    ctx.lineTo((i + 1) * 100, 800);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    ctx.moveTo(0, (i + 1) * 100);
    ctx.lineTo(800, (i + 1) * 100);
    ctx.stroke();
  }
  // 線の太さ
  ctx.beginPath();
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 1;
  ctx.arc(400, 400, 200, 0, 2 * Math.PI);
  ctx.stroke();

  const zPtr = simulator.true_value();
  const z = new Float64Array(memory.buffer, zPtr, 2);
  true_values.push([].slice.call(z));

  const yPtr = simulator.observed_value();
  const y = new Float64Array(memory.buffer, yPtr, 2);
  obs_values.push([].slice.call(y));

  const xPtr = simulator.estimated_value();
  const x = new Float64Array(memory.buffer, xPtr, 2);
  est_values.push([].slice.call(x));

  ctx.beginPath();
  ctx.moveTo(true_values[0][0] * 200 + 400, true_values[0][1] * 200 + 400);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "red";
  for (const v of true_values) {
    ctx.lineTo(v[0] * 200 + 400, v[1] * 200 + 400);
  }
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(obs_values[0][0] * 200 + 400, obs_values[0][1] * 200 + 400);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgb(0, 0, 255)";
  for (const v of obs_values) {
    ctx.lineTo(v[0] * 200 + 400, v[1] * 200 + 400);
  }
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(est_values[0][0] * 200 + 400, est_values[0][1] * 200 + 400);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "green";
  for (const v of est_values) {
    ctx.lineTo(v[0] * 200 + 400, v[1] * 200 + 400);
  }
  ctx.stroke();

  // for (const x of est_values) {
  //   ctx.beginPath();
  //   ctx.strokeStyle = "green";
  //   ctx.fillStyle = "green";
  //   ctx.lineWidth = 1;
  //   ctx.arc(x[0] * 200 + 400, x[1] * 200 + 400, 3, 0, 2 * Math.PI);
  //   ctx.fill();
  //   ctx.stroke();
  // }

  if (true_values.length > 360) {
    true_values.shift();
  }

  if (est_values.length > 360) {
    est_values.shift();
  }

  if (obs_values.length > 360) {
    obs_values.shift();
  }
};

const renderLoop = () => {
  simulator.tick();
  drawGraph();
  requestAnimationFrame(renderLoop);
};

// setInterval(renderLoop, 100);

requestAnimationFrame(renderLoop);

// for (let i = 0; i < 50; ++i) {
//   simulator.tick();

// }
