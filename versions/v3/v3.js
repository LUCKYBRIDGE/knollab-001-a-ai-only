"use strict";

/* Version 3: usability refinements that preserve the Version 2 ordering model. */
let v3ReturnToReviewFromStep = null;
const v3SpeechAvailable = "speechSynthesis" in window;

stepMeta[2].title = "온도와 크기를 차례로 골라요";
stepMeta[2].help = "온도와 크기를 고른 뒤 수량을 확인해요. 필요한 경우에만 수량을 바꾸면 돼요.";
stepMeta[4].help = "고른 내용을 한 줄씩 확인해요. 바꾸고 싶은 내용은 그 줄의 ‘수정’ 버튼을 누르세요.";

const v3BaseRender = render;
render = function renderV3() {
  v3BaseRender();
  enhanceCurrentScreen();
};

function enhanceCurrentScreen() {
  document.documentElement.dataset.orderStage = state.stage;
  refs.listenButton.hidden = !v3SpeechAvailable || state.stage === "complete";

  if (state.stage === "ordering") {
    refs.progressWrap.setAttribute("role", "progressbar");
    refs.progressWrap.setAttribute("aria-valuemin", "1");
    refs.progressWrap.setAttribute("aria-valuemax", "4");
    refs.progressWrap.setAttribute("aria-valuenow", String(state.step));
    refs.progressWrap.setAttribute("aria-valuetext", `${state.step}단계, ${stepMeta[state.step].name}`);
    refs.stepName.textContent = `지금: ${stepMeta[state.step].name}`;
    refs.stepLabel.setAttribute("aria-current", "step");
    syncStatusState();
    syncEditReturnMode();
  } else {
    refs.progressWrap.removeAttribute("role");
    refs.progressWrap.removeAttribute("aria-valuemin");
    refs.progressWrap.removeAttribute("aria-valuemax");
    refs.progressWrap.removeAttribute("aria-valuenow");
    refs.progressWrap.removeAttribute("aria-valuetext");
    refs.stepLabel.removeAttribute("aria-current");
    refs.statusMessage.removeAttribute("data-status");
  }

  if (state.stage === "welcome" && state.drinkId) {
    const startButton = document.getElementById("startButton");
    if (startButton) startButton.innerHTML = '계속 연습하기 <span aria-hidden="true">→</span>';
    setHeading({
      eyebrow: "시작 화면",
      title: "연습 시작 화면으로 돌아왔어요",
      help: "지금까지 고른 내용은 그대로 있어요. ‘계속 연습하기’를 누르면 이어서 할 수 있어요."
    });
  }

  if (state.stage === "ordering" && state.step === 4) improveReviewRows();
}

function improveReviewRows() {
  const drink = getDrink();
  const rows = refs.screenContent.querySelectorAll(".review-row");
  if (!drink || rows.length < 3) return;

  const drinkRow = rows[0];
  const optionRow = rows[1];

  drinkRow.querySelector(".review-label").textContent = "음료";
  drinkRow.querySelector(".review-value").textContent = drink.name;
  drinkRow.querySelector(".edit-button").setAttribute("aria-label", "음료 수정하기");

  optionRow.querySelector(".review-label").textContent = "온도·크기·수량";
  optionRow.querySelector(".review-value").textContent = `${temperatureOptions[state.temperature].label} · ${sizeOptions[state.size].label} · ${state.quantity}잔`;
  optionRow.querySelector(".edit-button").setAttribute("aria-label", "온도, 크기, 수량 수정하기");
}

function syncStatusState() {
  const complete = isStepComplete(state.step);
  refs.statusMessage.dataset.status = complete ? "ready" : "needed";
}

function syncEditReturnMode() {
  const oldNote = refs.screenContent.querySelector(".edit-return-note");
  if (oldNote) oldNote.remove();
  if (v3ReturnToReviewFromStep === null || state.step === 4) return;

  const note = document.createElement("p");
  note.className = "edit-return-note";
  note.textContent = "수정 중이에요. 필요한 선택을 바꾸면 주문 확인 화면으로 바로 돌아갈 수 있어요.";
  refs.screenContent.prepend(note);

  if (isStepComplete(3)) {
    refs.nextButton.textContent = "주문 확인으로 돌아가기 →";
  }
}

function refreshAfterInteraction() {
  if (state.stage !== "ordering") return;
  syncStatusState();
  syncEditReturnMode();
}

refs.screenContent.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-step]");
  if (editButton) v3ReturnToReviewFromStep = Number(editButton.dataset.editStep);
}, true);

refs.screenContent.addEventListener("click", (event) => {
  updateInteractionMessage(event.target.closest("button"));
  refreshAfterInteraction();
});

function updateInteractionMessage(button) {
  if (!button || state.stage !== "ordering") return;

  if (button.dataset.drinkId) {
    const drink = getDrink();
    if (drink) refs.statusMessage.textContent = `${drink.name}${objectParticle(drink.name)} 선택했어요. ‘추가 선택으로’ 버튼을 누르세요.`;
    return;
  }

  if (button.dataset.temperature) {
    refs.statusMessage.textContent = `온도를 ‘${temperatureOptions[state.temperature].label}’로 골랐어요.`;
    return;
  }

  if (button.dataset.size) {
    refs.statusMessage.textContent = `크기를 ‘${sizeOptions[state.size].label}’로 골랐어요.`;
    return;
  }

  if (button.dataset.place) {
    const label = placeOptions[state.place].label;
    refs.statusMessage.textContent = `‘${label}’${objectParticle(label)} 골랐어요. 이제 주문 내용을 확인할 수 있어요.`;
  }
}

function objectParticle(word) {
  const last = word.charCodeAt(word.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return "를";
  return (last - 0xac00) % 28 === 0 ? "를" : "을";
}

refs.nextButton.addEventListener("click", (event) => {
  if (v3ReturnToReviewFromStep === null || state.stage !== "ordering" || state.step === 4) return;
  if (!isStepComplete(3)) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  v3ReturnToReviewFromStep = null;
  state.step = 4;
  render();
  focusScreenTitle();
}, true);

refs.backButton.addEventListener("click", () => {
  v3ReturnToReviewFromStep = null;
}, true);

refs.resetButton.addEventListener("click", () => {
  v3ReturnToReviewFromStep = null;
  if (v3SpeechAvailable) window.speechSynthesis.cancel();
});

refs.confirmResetButton.addEventListener("click", () => {
  v3ReturnToReviewFromStep = null;
  if (v3SpeechAvailable) window.speechSynthesis.cancel();
});

document.addEventListener("keydown", (event) => {
  if (refs.resetModal.hidden || event.key !== "Tab") return;

  const focusable = [refs.cancelResetButton, refs.confirmResetButton].filter((element) => !element.disabled);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}, true);

render();
