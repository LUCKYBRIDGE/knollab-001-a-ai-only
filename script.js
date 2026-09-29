"use strict";

const menuItems = [
  { id: "americano", name: "아메리카노", emoji: "☕", description: "깔끔한 커피", tag: "커피", basePrice: 3500, temperatures: ["hot", "ice"] },
  { id: "latte", name: "카페라떼", emoji: "🥛", description: "우유가 들어간 부드러운 커피", tag: "커피", basePrice: 4000, temperatures: ["hot", "ice"] },
  { id: "vanilla-latte", name: "바닐라 라떼", emoji: "🌼", description: "달콤한 바닐라 향의 라떼", tag: "커피", basePrice: 4500, temperatures: ["hot", "ice"] },
  { id: "chocolate", name: "초콜릿", emoji: "🍫", description: "달콤한 초콜릿 음료", tag: "논커피", basePrice: 4000, temperatures: ["hot", "ice"] },
  { id: "lemon-tea", name: "레몬티", emoji: "🍋", description: "상큼한 레몬 차", tag: "논커피", basePrice: 4000, temperatures: ["hot", "ice"] },
  { id: "strawberry-smoothie", name: "딸기 스무디", emoji: "🍓", description: "차갑고 달콤한 딸기 음료", tag: "논커피", basePrice: 5000, temperatures: ["ice"] }
];

const temperatureOptions = {
  hot: { label: "따뜻하게", short: "따뜻한", emoji: "♨️", sub: "HOT" },
  ice: { label: "차갑게", short: "아이스", emoji: "🧊", sub: "ICE" }
};
const sizeOptions = {
  regular: { label: "보통 크기", short: "보통", emoji: "🥤", sub: "REGULAR", extra: 0 },
  large: { label: "큰 크기", short: "큰", emoji: "🥤", sub: "LARGE · +500원", extra: 500 }
};
const placeOptions = {
  here: { label: "매장에서 먹기", short: "매장", emoji: "🪑", sub: "카페 안에서 마셔요" },
  togo: { label: "가지고 가기", short: "포장", emoji: "🛍️", sub: "들고 나가요" }
};
const paymentOptions = {
  card: { label: "카드", emoji: "💳", sub: "카드를 단말기에 대요" },
  cash: { label: "현금", emoji: "💵", sub: "지폐나 동전을 내요" }
};

const state = {
  stage: "welcome",
  step: 1,
  drinkId: null,
  temperature: null,
  size: null,
  quantity: 1,
  place: null,
  payment: null
};

const refs = {
  progressWrap: document.getElementById("progressWrap"),
  progressBar: document.getElementById("progressBar"),
  stepLabel: document.getElementById("stepLabel"),
  stepName: document.getElementById("stepName"),
  eyebrow: document.getElementById("eyebrow"),
  screenTitle: document.getElementById("screenTitle"),
  screenHelp: document.getElementById("screenHelp"),
  screenContent: document.getElementById("screenContent"),
  statusMessage: document.getElementById("statusMessage"),
  navigationRow: document.getElementById("navigationRow"),
  backButton: document.getElementById("backButton"),
  nextButton: document.getElementById("nextButton"),
  orderSummary: document.getElementById("orderSummary"),
  summaryContent: document.getElementById("summaryContent"),
  listenButton: document.getElementById("listenButton"),
  resetButton: document.getElementById("resetButton"),
  resetModal: document.getElementById("resetModal"),
  cancelResetButton: document.getElementById("cancelResetButton"),
  confirmResetButton: document.getElementById("confirmResetButton")
};

const stepMeta = {
  1: { name: "음료 고르기", eyebrow: "1단계 · 메뉴 보기", title: "마시고 싶은 음료를 골라요", help: "음료 카드를 한 번 눌러 선택하세요. 고른 카드는 초록색으로 표시돼요." },
  2: { name: "옵션 고르기", eyebrow: "2단계 · 원하는 방법 고르기", title: "음료를 어떻게 받을까요?", help: "온도와 크기를 차례로 골라요. 필요한 경우 수량도 바꿀 수 있어요." },
  3: { name: "주문 방법", eyebrow: "3단계 · 카페에서 말하기", title: "어디서 마시고, 어떻게 계산할까요?", help: "매장 또는 포장을 고르고, 계산 방법을 골라요." },
  4: { name: "주문 확인", eyebrow: "4단계 · 마지막 확인", title: "주문이 맞는지 확인해요", help: "잘못 고른 것이 있으면 ‘수정’ 버튼으로 돌아가서 바꿀 수 있어요." }
};

function getDrink() {
  return menuItems.find((item) => item.id === state.drinkId) || null;
}
function formatPrice(value) {
  return `${value.toLocaleString("ko-KR")}원`;
}
function getUnitPrice() {
  const drink = getDrink();
  if (!drink) return 0;
  const sizeExtra = state.size ? sizeOptions[state.size].extra : 0;
  return drink.basePrice + sizeExtra;
}
function getTotalPrice() {
  return getUnitPrice() * state.quantity;
}
function getOrderPhrase() {
  const drink = getDrink();
  if (!drink || !state.temperature || !state.size || !state.place || !state.payment) return "";
  const temp = temperatureOptions[state.temperature].short;
  const size = sizeOptions[state.size].short;
  const place = state.place === "here" ? "매장에서 먹을게요" : "포장해 주세요";
  const payment = state.payment === "card" ? "카드로 계산할게요" : "현금으로 계산할게요";
  const count = state.quantity === 1 ? "한 잔" : `${state.quantity}잔`;
  return `안녕하세요. ${temp} ${drink.name} ${size} 크기로 ${count} 주세요. ${place}. ${payment}.`;
}
function setHeading(meta) {
  refs.eyebrow.textContent = meta.eyebrow;
  refs.screenTitle.textContent = meta.title;
  refs.screenHelp.textContent = meta.help;
}

function render() {
  refs.statusMessage.textContent = "";
  if (state.stage === "welcome") {
    renderWelcome();
    return;
  }
  if (state.stage === "complete") {
    renderComplete();
    return;
  }

  refs.progressWrap.hidden = false;
  refs.orderSummary.hidden = false;
  refs.resetButton.hidden = false;
  refs.navigationRow.hidden = false;
  refs.stepLabel.textContent = `${state.step}단계 / 4단계`;
  refs.stepName.textContent = stepMeta[state.step].name;
  refs.progressBar.style.width = `${state.step * 25}%`;
  setHeading(stepMeta[state.step]);
  refs.backButton.disabled = false;
  refs.backButton.innerHTML = '<span aria-hidden="true">←</span> 이전';
  refs.nextButton.textContent = state.step === 4 ? "주문하기" : "다음 →";

  if (state.step === 1) renderMenuStep();
  if (state.step === 2) renderOptionStep();
  if (state.step === 3) renderMethodStep();
  if (state.step === 4) renderReviewStep();

  updateSummary();
  updateNextButton();
}

function renderWelcome() {
  refs.progressWrap.hidden = true;
  refs.orderSummary.hidden = true;
  refs.resetButton.hidden = true;
  refs.navigationRow.hidden = true;
  setHeading({ eyebrow: "카페에 왔어요", title: "주문을 연습해 볼까요?", help: "화면에 보이는 큰 버튼을 하나씩 눌러 주문을 완성해 보세요." });
  refs.screenContent.innerHTML = `
    <div class="welcome-card">
      <div class="welcome-copy">
        <h3>혼자서 천천히 해도 괜찮아요.</h3>
        <p>한 화면에서 한 가지씩 고르면 돼요. 잘못 골라도 언제든 이전으로 돌아가 바꿀 수 있어요.</p>
        <div class="practice-points" aria-label="연습 순서">
          <div class="practice-point"><span class="point-number">1</span><span>마실 음료 고르기</span></div>
          <div class="practice-point"><span class="point-number">2</span><span>온도와 크기 고르기</span></div>
          <div class="practice-point"><span class="point-number">3</span><span>매장·포장과 계산 방법 고르기</span></div>
        </div>
        <button class="start-button" id="startButton" type="button">연습 시작하기 <span aria-hidden="true">→</span></button>
      </div>
      <div class="counter-illustration" aria-hidden="true">
        <div class="counter-scene"><div class="big-emoji">🧑‍🍳☕</div><p>“무엇을 드릴까요?”</p></div>
      </div>
    </div>`;
  document.getElementById("startButton").addEventListener("click", () => {
    state.stage = "ordering";
    state.step = 1;
    render();
    focusScreenTitle();
  });
}

function renderMenuStep() {
  refs.screenContent.innerHTML = `
    <div class="menu-grid" role="group" aria-label="음료 메뉴">
      ${menuItems.map((item) => `
        <button class="menu-card" type="button" data-drink-id="${item.id}" aria-pressed="${state.drinkId === item.id}">
          <span class="menu-top"><span class="menu-emoji" aria-hidden="true">${item.emoji}</span><span class="menu-tag">${item.tag}</span></span>
          <span class="menu-name">${item.name}</span>
          <span class="menu-description">${item.description}</span>
          <span class="menu-price">${formatPrice(item.basePrice)}</span>
        </button>`).join("")}
    </div>
    <p class="step-note">💡 주문 연습에서는 한 종류의 음료를 골라 연습해요.</p>`;

  refs.screenContent.querySelectorAll("[data-drink-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const newDrinkId = button.dataset.drinkId;
      if (state.drinkId !== newDrinkId) {
        state.drinkId = newDrinkId;
        state.temperature = null;
        state.size = null;
      }
      refreshPressedStates("data-drink-id", state.drinkId);
      updateSummary();
      updateNextButton();
      announce(`${getDrink().name}을 선택했어요.`);
    });
  });
}

function renderOptionStep() {
  const drink = getDrink();
  if (!drink) {
    state.step = 1;
    render();
    return;
  }
  if (drink.temperatures.length === 1 && !state.temperature) state.temperature = drink.temperatures[0];

  const tempButtons = drink.temperatures.map((id) => {
    const option = temperatureOptions[id];
    return `
      <button class="choice-card" type="button" data-temperature="${id}" aria-pressed="${state.temperature === id}">
        <span class="choice-icon" aria-hidden="true">${option.emoji}</span>
        <span class="choice-copy"><span class="choice-label">${option.label}</span><span class="choice-sub">${option.sub}</span></span>
      </button>`;
  }).join("");

  refs.screenContent.innerHTML = `
    <section class="selection-section" aria-labelledby="temperatureTitle">
      <h3 class="option-title" id="temperatureTitle">1. 온도를 골라요</h3>
      ${drink.temperatures.length === 1 ? '<p class="option-note">이 음료는 차갑게만 주문할 수 있어요.</p>' : ''}
      <div class="choice-grid" role="group" aria-label="음료 온도">${tempButtons}</div>
    </section>
    <section class="selection-section" aria-labelledby="sizeTitle">
      <h3 class="option-title" id="sizeTitle">2. 크기를 골라요</h3>
      <div class="choice-grid" role="group" aria-label="음료 크기">
        ${Object.entries(sizeOptions).map(([id, option]) => `
          <button class="choice-card" type="button" data-size="${id}" aria-pressed="${state.size === id}">
            <span class="choice-icon" aria-hidden="true">${option.emoji}</span>
            <span class="choice-copy"><span class="choice-label">${option.label}</span><span class="choice-price">${option.sub}</span></span>
          </button>`).join("")}
      </div>
    </section>
    <section class="selection-section" aria-labelledby="quantityTitle">
      <h3 class="option-title" id="quantityTitle">3. 몇 잔인지 확인해요</h3>
      <div class="quantity-box">
        <div class="quantity-copy"><strong>음료 수량</strong><span>1잔부터 3잔까지 연습할 수 있어요.</span></div>
        <div class="quantity-controls" aria-label="음료 수량 조절">
          <button class="quantity-button" id="decreaseQuantity" type="button" aria-label="수량 1 줄이기">−</button>
          <output class="quantity-value" id="quantityValue" aria-live="polite">${state.quantity}</output>
          <button class="quantity-button" id="increaseQuantity" type="button" aria-label="수량 1 늘리기">＋</button>
        </div>
      </div>
    </section>`;

  refs.screenContent.querySelectorAll("[data-temperature]").forEach((button) => {
    button.addEventListener("click", () => {
      state.temperature = button.dataset.temperature;
      refreshPressedStates("data-temperature", state.temperature);
      updateSummary();
      updateNextButton();
      announce(`${temperatureOptions[state.temperature].label}를 선택했어요.`);
    });
  });
  refs.screenContent.querySelectorAll("[data-size]").forEach((button) => {
    button.addEventListener("click", () => {
      state.size = button.dataset.size;
      refreshPressedStates("data-size", state.size);
      updateSummary();
      updateNextButton();
      announce(`${sizeOptions[state.size].label}를 선택했어요.`);
    });
  });

  const decrease = document.getElementById("decreaseQuantity");
  const increase = document.getElementById("increaseQuantity");
  const quantityValue = document.getElementById("quantityValue");
  const refreshQuantity = () => {
    quantityValue.value = state.quantity;
    quantityValue.textContent = state.quantity;
    decrease.disabled = state.quantity <= 1;
    increase.disabled = state.quantity >= 3;
    updateSummary();
  };
  decrease.addEventListener("click", () => { if (state.quantity > 1) state.quantity -= 1; refreshQuantity(); });
  increase.addEventListener("click", () => { if (state.quantity < 3) state.quantity += 1; refreshQuantity(); });
  refreshQuantity();
}

function renderMethodStep() {
  refs.screenContent.innerHTML = `
    <section class="selection-section" aria-labelledby="placeTitle">
      <h3 class="option-title" id="placeTitle">1. 어디서 마실까요?</h3>
      <div class="choice-grid" role="group" aria-label="이용 방법">
        ${Object.entries(placeOptions).map(([id, option]) => `
          <button class="choice-card" type="button" data-place="${id}" aria-pressed="${state.place === id}">
            <span class="choice-icon" aria-hidden="true">${option.emoji}</span>
            <span class="choice-copy"><span class="choice-label">${option.label}</span><span class="choice-sub">${option.sub}</span></span>
          </button>`).join("")}
      </div>
    </section>
    <section class="selection-section" aria-labelledby="paymentTitle">
      <h3 class="option-title" id="paymentTitle">2. 어떻게 계산할까요?</h3>
      <div class="choice-grid" role="group" aria-label="결제 방법">
        ${Object.entries(paymentOptions).map(([id, option]) => `
          <button class="choice-card" type="button" data-payment="${id}" aria-pressed="${state.payment === id}">
            <span class="choice-icon" aria-hidden="true">${option.emoji}</span>
            <span class="choice-copy"><span class="choice-label">${option.label}</span><span class="choice-sub">${option.sub}</span></span>
          </button>`).join("")}
      </div>
    </section>
    <p class="step-note">💡 실제 카페에서는 직원이 “드시고 가세요?” 또는 “결제는 어떻게 하세요?”라고 물어볼 수 있어요.</p>`;

  refs.screenContent.querySelectorAll("[data-place]").forEach((button) => {
    button.addEventListener("click", () => {
      state.place = button.dataset.place;
      refreshPressedStates("data-place", state.place);
      updateSummary();
      updateNextButton();
      announce(`${placeOptions[state.place].label}를 선택했어요.`);
    });
  });
  refs.screenContent.querySelectorAll("[data-payment]").forEach((button) => {
    button.addEventListener("click", () => {
      state.payment = button.dataset.payment;
      refreshPressedStates("data-payment", state.payment);
      updateSummary();
      updateNextButton();
      announce(`${paymentOptions[state.payment].label} 결제를 선택했어요.`);
    });
  });
}

function renderReviewStep() {
  if (!isStepComplete(3)) {
    state.step = 3;
    render();
    return;
  }
  const drink = getDrink();
  const drinkText = `${temperatureOptions[state.temperature].short} ${drink.name}`;
  const optionText = `${sizeOptions[state.size].label} · ${state.quantity}잔`;
  refs.screenContent.innerHTML = `
    <div class="review-card">
      ${reviewRow("음료", drinkText, 1)}
      ${reviewRow("크기·수량", optionText, 2)}
      ${reviewRow("이용 방법", placeOptions[state.place].label, 3)}
      ${reviewRow("결제", paymentOptions[state.payment].label, 3)}
    </div>
    <div class="total-row"><span>총 금액</span><span class="total-price">${formatPrice(getTotalPrice())}</span></div>
    <div class="practice-script"><strong>🗣️ 이렇게 말해 볼 수 있어요</strong><p class="practice-line">“${getOrderPhrase()}”</p></div>`;
  refs.screenContent.querySelectorAll("[data-edit-step]").forEach((button) => {
    button.addEventListener("click", () => {
      state.step = Number(button.dataset.editStep);
      render();
      focusScreenTitle();
    });
  });
}
function reviewRow(label, value, step) {
  return `<div class="review-row"><span class="review-label">${label}</span><span class="review-value">${value}</span><button class="edit-button" type="button" data-edit-step="${step}" aria-label="${label} 수정하기">수정</button></div>`;
}

function renderComplete() {
  refs.progressWrap.hidden = true;
  refs.orderSummary.hidden = true;
  refs.resetButton.hidden = true;
  refs.navigationRow.hidden = true;
  setHeading({ eyebrow: "주문 완료", title: "주문 연습을 끝냈어요!", help: "방금 고른 내용을 실제 카페에서도 천천히 말해 보세요." });
  refs.screenContent.innerHTML = `
    <div class="complete-wrap"><div class="complete-card">
      <div class="complete-icon" aria-hidden="true">✓</div>
      <h3>잘 주문했어요.</h3>
      <p class="complete-sub">직원이 음료를 준비하는 동안 기다리면 돼요.</p>
      <p class="complete-total">결제 금액 · ${formatPrice(getTotalPrice())}</p>
      <div class="tip-box"><strong>내가 한 주문</strong><p>“${getOrderPhrase()}”</p></div>
      <div class="complete-actions">
        <button class="listen-button" id="listenOrderButton" type="button"><span aria-hidden="true">🔊</span> 주문 문장 듣기</button>
        <button class="start-button" id="practiceAgainButton" type="button">한 번 더 연습하기</button>
      </div>
    </div></div>`;
  document.getElementById("practiceAgainButton").addEventListener("click", resetPractice);
  document.getElementById("listenOrderButton").addEventListener("click", () => speakText(getOrderPhrase()));
}

function isStepComplete(step) {
  if (step === 1) return Boolean(state.drinkId);
  if (step === 2) return Boolean(state.drinkId && state.temperature && state.size);
  if (step === 3) return Boolean(state.drinkId && state.temperature && state.size && state.place && state.payment);
  if (step === 4) return isStepComplete(3);
  return false;
}
function updateNextButton() {
  const complete = isStepComplete(state.step);
  refs.nextButton.disabled = !complete;
  if (!complete) refs.nextButton.setAttribute("aria-describedby", "statusMessage");
  else refs.nextButton.removeAttribute("aria-describedby");
}
function refreshPressedStates(dataAttribute, selectedValue) {
  refs.screenContent.querySelectorAll(`[${dataAttribute}]`).forEach((button) => {
    button.setAttribute("aria-pressed", String(button.getAttribute(dataAttribute) === selectedValue));
  });
}
function updateSummary() {
  const drink = getDrink();
  const items = [];
  if (drink) items.push({ icon: drink.emoji, label: "음료", value: drink.name });
  if (state.temperature) items.push({ icon: temperatureOptions[state.temperature].emoji, label: "온도", value: temperatureOptions[state.temperature].label });
  if (state.size) items.push({ icon: "🥤", label: "크기", value: sizeOptions[state.size].label });
  if (state.quantity > 1) items.push({ icon: "#️⃣", label: "수량", value: `${state.quantity}잔` });
  if (state.place) items.push({ icon: placeOptions[state.place].emoji, label: "이용", value: placeOptions[state.place].label });
  if (state.payment) items.push({ icon: paymentOptions[state.payment].emoji, label: "결제", value: paymentOptions[state.payment].label });

  if (items.length === 0) {
    refs.summaryContent.innerHTML = '<p class="summary-empty">선택한 내용이 여기에 차례로 보여요.</p>';
    return;
  }
  refs.summaryContent.innerHTML = `
    ${items.map((item) => `<div class="summary-item"><span class="summary-item-icon" aria-hidden="true">${item.icon}</span><span><span class="summary-item-label">${item.label}</span><span class="summary-item-value">${item.value}</span></span></div>`).join("")}
    ${drink ? `<div class="summary-total"><span>현재 금액</span><span>${formatPrice(getTotalPrice())}</span></div>` : ""}`;
}
function announce(message) {
  refs.statusMessage.textContent = message;
}
function focusScreenTitle() {
  refs.screenTitle.setAttribute("tabindex", "-1");
  refs.screenTitle.focus({ preventScroll: true });
  refs.screenTitle.addEventListener("blur", () => refs.screenTitle.removeAttribute("tabindex"), { once: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function resetPractice() {
  state.stage = "welcome";
  state.step = 1;
  state.drinkId = null;
  state.temperature = null;
  state.size = null;
  state.quantity = 1;
  state.place = null;
  state.payment = null;
  closeResetModal();
  render();
  focusScreenTitle();
}
function getSpeechText() {
  if (state.stage === "welcome") return "카페 주문 연습입니다. 연습 시작하기 버튼을 누르세요. 한 화면에서 한 가지씩 고르면 됩니다.";
  if (state.stage === "complete") return `주문 연습을 끝냈어요. ${getOrderPhrase()}`;
  const base = `${stepMeta[state.step].title}. ${stepMeta[state.step].help}`;
  if (state.step === 4) return `${base} ${getOrderPhrase()}`;
  return base;
}
function speakText(text) {
  if (!("speechSynthesis" in window)) {
    announce("이 기기에서는 읽어주기 기능을 사용할 수 없어요.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}
function openResetModal() {
  refs.resetModal.hidden = false;
  document.body.style.overflow = "hidden";
  refs.cancelResetButton.focus();
}
function closeResetModal() {
  refs.resetModal.hidden = true;
  document.body.style.overflow = "";
}

refs.nextButton.addEventListener("click", () => {
  if (!isStepComplete(state.step)) {
    announce("먼저 화면에서 필요한 항목을 골라 주세요.");
    return;
  }
  if (state.step < 4) {
    state.step += 1;
    render();
    focusScreenTitle();
    return;
  }
  state.stage = "complete";
  render();
  focusScreenTitle();
});
refs.backButton.addEventListener("click", () => {
  if (state.step > 1) state.step -= 1;
  else state.stage = "welcome";
  render();
  focusScreenTitle();
});
refs.listenButton.addEventListener("click", () => speakText(getSpeechText()));
refs.resetButton.addEventListener("click", openResetModal);
refs.cancelResetButton.addEventListener("click", () => { closeResetModal(); refs.resetButton.focus(); });
refs.confirmResetButton.addEventListener("click", resetPractice);
refs.resetModal.addEventListener("click", (event) => {
  if (event.target === refs.resetModal) {
    closeResetModal();
    refs.resetButton.focus();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !refs.resetModal.hidden) {
    closeResetModal();
    refs.resetButton.focus();
  }
});
if (!("speechSynthesis" in window)) refs.listenButton.hidden = true;
render();
