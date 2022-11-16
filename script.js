const generate = document.getElementById("generate");
const noOfFloors = document.getElementById("noOfFloors");
const noOfLifts = document.getElementById("noOfLifts");
const error__result = document.getElementById("error__result");
const simulation__window = document.querySelector(".simulation__window");

let liftStates = [];
let liftCallArray = [];
let intervalId;
let liftInfo;
let liftTargets = [];

generate.addEventListener("click", (e) => {
  e.preventDefault();

  if (simulation__window.innerHTML === "") {
    validateInputs();
  } else if (simulation__window.innerHTML !== "") {
    simulation__window.innerHTML = "";
    validateInputs();
  }
  return;
});

const validateInputs = () => {
  let numberOfFloors = noOfFloors.value;
  let numberOfLifts = noOfLifts.value;
  if (numberOfFloors <= 1 || numberOfLifts <= 0 || numberOfLifts > 3) {
    error__result.innerHTML =
      "Floor count should be >=2 and lift count should be in between 1 and 3.";
    simulation__window.innerHTML = "";
  } else {
    error__result.innerHTML = "";
    generateFloors(numberOfFloors);
    generateLifts(numberOfLifts);
    buttonFunctions();
    intervalId = setInterval(handleLiftCall, 1000);
  }
};

const generateFloors = (n) => {
  for (let i = 0; i < n; i++) {
    let currLevel = `L${n - i - 1}`;
    let floorNo = `Floor-${n - i - 1}`;
    let currFloor = document.createElement("div");
    currFloor.setAttribute("id", floorNo);

    console.log(document.getElementById(floorNo));
    currFloor.classList.add("floor");
    currFloor.innerHTML = `
          <p>${floorNo}</p>
          <div>
          <button id=up${currLevel} class="button-floor upBttn">Call</button><br>
          </div>
          `;
    simulation__window.appendChild(currFloor);
  }
};

const generateLifts = (n) => {
  liftInfo = [];
  for (let i = 0; i < n; i++) {
    let liftNo = `Lift-${i}`;
    const currLift = document.createElement("div");
    currLift.setAttribute("id", liftNo);
    currLift.classList.add("lifts");
    currLift.innerHTML = `
              <p>Lift${i + 1}</p>
              <div class="gate gateLeft" id="L${i}left_gate"></div>
              <div class="gate gateRight" id="L${i}right_gate"></div>
          `;
    currLift.style.left = `${(i + 1) * 80}px`;
    currLift.style.top = "0px";
    document.getElementById("Floor-0").appendChild(currLift);
    liftStates[i] = 0;

    const currliftDetail = {};
    currliftDetail.id = liftNo;
    currliftDetail.inMotion = false;
    liftInfo.push(currliftDetail);
  }
};

const buttonFunctions = () => {
  const allButtons = document.querySelectorAll(".button-floor");
  allButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetFlr = parseInt(btn.id.slice(-1));
      if (!liftTargets.includes(targetFlr)) {
        liftTargets.push(targetFlr);
        liftCallArray.push(targetFlr);
      }
    });
  });
};

const translateLiftOld = (liftNo, targetLiftPosn) => {
  const reqLift = document.getElementById(`Lift-${liftNo}`);
  let currLiftPosn = parseInt(liftStates[liftNo]);
  var animationId = setInterval(animate, 100);

  function animate() {
    if (currLiftPosn != targetLiftPosn) {
      stepVector = parseInt(Math.sign(targetLiftPosn - currLiftPosn));
      currLiftPosn += stepVector;
      reqLift.style.transform = `translateY(-100px)`;
      reqLift.style.transitionDuration = `2s`;
    } else {
      liftStates[liftNo] = targetLiftPosn;
      clearInterval(animationId);
    }
  }
};

const translateLift = (liftNo, targetLiftPosn) => {
  const reqLift = document.getElementById(`Lift-${liftNo}`);
  let currLiftPosn = parseInt(liftStates[liftNo]);

  if (currLiftPosn != targetLiftPosn) {
    liftInfo[liftNo].inMotion = true;
    let unitsToMove = Math.abs(targetLiftPosn - currLiftPosn) + 1;
    let motionDis = -100 * targetLiftPosn;

    reqLift.style.transitionTimingFunction = "linear";
    reqLift.style.transform = `translateY(${motionDis}px)`;
    reqLift.style.transitionDuration = `${unitsToMove * 1}s`;

    let timeInMs = unitsToMove * 1500;
    setTimeout(() => {
      liftStates[liftNo] = targetLiftPosn;
      animateLiftsDoors(liftNo, targetLiftPosn);
    }, timeInMs);
  } else {
    liftInfo[liftNo].inMotion = true;
    animateLiftsDoors(liftNo, targetLiftPosn);
  }
};

const animateLiftsDoors = (liftNo, targetLiftPosn) => {
  const leftGate = document.getElementById(`L${liftNo}left_gate`);
  const rightGate = document.getElementById(`L${liftNo}right_gate`);
  leftGate.classList.toggle("animateLiftsDoorsOnFloorStop");
  rightGate.classList.toggle("animateLiftsDoorsOnFloorStop");

  setTimeout(() => {
    liftInfo[liftNo].inMotion = false;
    leftGate.classList.toggle("animateLiftsDoorsOnFloorStop");
    rightGate.classList.toggle("animateLiftsDoorsOnFloorStop");
    liftTargets = liftTargets.filter((item) => item !== targetLiftPosn);
  }, 5000);
};

const findNearestFreeLift = (flrNo) => {
  let prevDiff = Number.MAX_SAFE_INTEGER;
  let nearestAvailableLift = -1;

  for (let i = 0; i < liftStates.length; i++) {
    if (liftInfo[i].inMotion === false) {
      const currDiff = Math.abs(liftStates[i] - flrNo);
      if (currDiff < prevDiff) {
        prevDiff = currDiff;
        nearestAvailableLift = i;
      }
    }
  }
  return nearestAvailableLift;
};

const handleLiftCall = () => {
  if (!liftCallArray.length) return;
  let targetFlr = liftCallArray[0];

  const liftToMove = findNearestFreeLift(targetFlr);
  if (liftToMove != -1) {
    translateLift(liftToMove, targetFlr);
    liftCallArray.shift();
  }
};
