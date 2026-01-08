const unitSystemSelect = document.getElementById("unit-system");
const inputs = {
  bore: document.getElementById("bore"),
  rod: document.getElementById("rod"),
  stroke: document.getElementById("stroke"),
  pressure: document.getElementById("pressure"),
  flow: document.getElementById("flow"),
  efficiency: document.getElementById("efficiency"),
};

const units = {
  metric: {
    length: "mm",
    pressure: "bar",
    flow: "L/min",
    area: "cm²",
    force: "kN",
    volume: "L",
    speed: "mm/s",
    time: "s",
  },
  imperial: {
    length: "in",
    pressure: "psi",
    flow: "gpm",
    area: "in²",
    force: "lbf",
    volume: "gal",
    speed: "in/s",
    time: "s",
  },
};

const outputs = {
  pistonArea: document.getElementById("piston-area"),
  annulusArea: document.getElementById("annulus-area"),
  extendForce: document.getElementById("extend-force"),
  retractForce: document.getElementById("retract-force"),
  extendVolume: document.getElementById("extend-volume"),
  retractVolume: document.getElementById("retract-volume"),
  extendSpeed: document.getElementById("extend-speed"),
  retractSpeed: document.getElementById("retract-speed"),
  cycleTime: document.getElementById("cycle-time"),
  statExtendForce: document.getElementById("stat-extend-force"),
  statRetractForce: document.getElementById("stat-retract-force"),
  statCycleTime: document.getElementById("stat-cycle-time"),
};

const unitLabels = document.querySelectorAll(".unit");

const formatNumber = (value, digits = 2) =>
  Number.isFinite(value) ? value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }) : "0";

const toMetric = (value, type) => {
  if (unitSystemSelect.value === "metric") return value;
  switch (type) {
    case "length":
      return value * 25.4;
    case "pressure":
      return value * 0.0689476; // psi to bar
    case "flow":
      return value * 3.78541; // gpm to L/min
    default:
      return value;
  }
};

const calculate = () => {
  const bore = toMetric(parseFloat(inputs.bore.value) || 0, "length");
  const rod = toMetric(parseFloat(inputs.rod.value) || 0, "length");
  const stroke = toMetric(parseFloat(inputs.stroke.value) || 0, "length");
  const pressure = toMetric(parseFloat(inputs.pressure.value) || 0, "pressure");
  const flow = toMetric(parseFloat(inputs.flow.value) || 0, "flow");
  const efficiency = parseFloat(inputs.efficiency.value) || 0;

  const boreAreaMm = Math.PI * Math.pow(bore / 2, 2);
  const rodAreaMm = Math.PI * Math.pow(rod / 2, 2);
  const annulusAreaMm = Math.max(boreAreaMm - rodAreaMm, 0);

  const pistonAreaCm = boreAreaMm / 100;
  const annulusAreaCm = annulusAreaMm / 100;

  const extendForceKn = (pressure * pistonAreaCm) / 100 * efficiency;
  const retractForceKn = (pressure * annulusAreaCm) / 100 * efficiency;

  const extendVolumeL = (pistonAreaCm * stroke) / 10000;
  const retractVolumeL = (annulusAreaCm * stroke) / 10000;

  const extendSpeedMm = flow > 0 ? (flow * 1000) / (pistonAreaCm * 100) : 0;
  const retractSpeedMm = flow > 0 ? (flow * 1000) / (annulusAreaCm * 100) : 0;

  const extendTime = extendSpeedMm > 0 ? stroke / extendSpeedMm : 0;
  const retractTime = retractSpeedMm > 0 ? stroke / retractSpeedMm : 0;

  const totalCycleTime = extendTime + retractTime;

  const unitSet = units[unitSystemSelect.value];

  const display = {
    area: unitSystemSelect.value === "metric"
      ? {
          piston: pistonAreaCm,
          annulus: annulusAreaCm,
        }
      : {
          piston: pistonAreaCm / 6.4516,
          annulus: annulusAreaCm / 6.4516,
        },
    force: unitSystemSelect.value === "metric"
      ? { extend: extendForceKn, retract: retractForceKn }
      : {
          extend: extendForceKn * 224.809,
          retract: retractForceKn * 224.809,
        },
    volume: unitSystemSelect.value === "metric"
      ? { extend: extendVolumeL, retract: retractVolumeL }
      : {
          extend: extendVolumeL * 0.264172,
          retract: retractVolumeL * 0.264172,
        },
    speed: unitSystemSelect.value === "metric"
      ? { extend: extendSpeedMm, retract: retractSpeedMm }
      : {
          extend: extendSpeedMm / 25.4,
          retract: retractSpeedMm / 25.4,
        },
  };

  outputs.pistonArea.textContent = `${formatNumber(display.area.piston)} ${unitSet.area}`;
  outputs.annulusArea.textContent = `${formatNumber(display.area.annulus)} ${unitSet.area}`;
  outputs.extendForce.textContent = `${formatNumber(display.force.extend)} ${unitSet.force}`;
  outputs.retractForce.textContent = `${formatNumber(display.force.retract)} ${unitSet.force}`;
  outputs.extendVolume.textContent = `${formatNumber(display.volume.extend)} ${unitSet.volume}`;
  outputs.retractVolume.textContent = `${formatNumber(display.volume.retract)} ${unitSet.volume}`;
  outputs.extendSpeed.textContent = `${formatNumber(display.speed.extend)} ${unitSet.speed}`;
  outputs.retractSpeed.textContent = `${formatNumber(display.speed.retract)} ${unitSet.speed}`;
  outputs.cycleTime.textContent = `${formatNumber(totalCycleTime)} ${unitSet.time}`;

  outputs.statExtendForce.textContent = outputs.extendForce.textContent;
  outputs.statRetractForce.textContent = outputs.retractForce.textContent;
  outputs.statCycleTime.textContent = outputs.cycleTime.textContent;
};

const updateUnits = () => {
  const unitSet = units[unitSystemSelect.value];
  unitLabels.forEach((label) => {
    const type = label.dataset.unit;
    if (!type) return;
    label.textContent = unitSet[type];
  });
  calculate();
};

unitSystemSelect.addEventListener("change", updateUnits);
Object.values(inputs).forEach((input) => {
  input.addEventListener("input", calculate);
});

updateUnits();
