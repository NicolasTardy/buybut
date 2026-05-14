const steps = [...document.querySelectorAll(".flow-step")];
const indicators = [...document.querySelectorAll("[data-step-indicator]")];
const form = document.querySelector("#buybackForm");
const invoice = document.querySelector("#invoice");
const invoiceUpload = document.querySelector(".invoice-upload");
const fallbackFields = [...document.querySelectorAll(".fallback-field")];
const photoGrid = document.querySelector("#photoGrid");
const photoCount = document.querySelector("#photoCount");
const toast = document.querySelector("#toast");

const photoChecklist = [
  "Assise gauche vue du dessus",
  "Assise centrale vue du dessus",
  "Assise droite vue du dessus",
  "Avant du canapé",
  "Arrière complet",
  "Côté gauche",
  "Côté droit",
  "Pieds et dessous",
  "Coutures visibles",
  "Taux d'affaissement",
  "Accoudoirs",
  "Défauts ou taches"
];

let currentStep = 1;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2800);
}

function setStep(step) {
  currentStep = Math.max(1, Math.min(step, steps.length));
  steps.forEach((section) => {
    section.classList.toggle("active", Number(section.dataset.step) === currentStep);
  });
  indicators.forEach((item) => {
    item.classList.toggle("active", Number(item.dataset.stepIndicator) === currentStep);
  });
}

function getCheckedPhotoCount() {
  return photoGrid.querySelectorAll("input:checked").length;
}

function updatePhotoCount() {
  const count = getCheckedPhotoCount();
  photoCount.textContent = `${count}/10`;
  photoCount.parentElement.style.borderColor = count >= 10 ? "#a8d6c3" : "";
  photoCount.parentElement.style.background = count >= 10 ? "#eff7f4" : "";
}

function createPhotoChecklist() {
  photoChecklist.forEach((label, index) => {
    const tile = document.createElement("label");
    tile.className = "photo-tile";
    tile.innerHTML = `
      <input type="checkbox" ${index < 10 ? "checked" : ""} />
      <span>${label}</span>
    `;
    const checkbox = tile.querySelector("input");
    tile.classList.toggle("checked", checkbox.checked);
    checkbox.addEventListener("change", () => {
      tile.classList.toggle("checked", checkbox.checked);
      updatePhotoCount();
    });
    photoGrid.appendChild(tile);
  });
  updatePhotoCount();
}

function updateInvoiceFields() {
  const hasInvoice = invoice.value === "yes";
  invoiceUpload.classList.toggle("hidden", !hasInvoice);
  fallbackFields.forEach((field) => field.classList.toggle("hidden", hasInvoice));
}

function setPickupDateDefault() {
  const pickupDate = form.elements.pickupDate;
  const date = new Date();
  date.setDate(date.getDate() + 9);
  pickupDate.value = date.toISOString().slice(0, 10);
}

function calculateEstimate() {
  const seats = Number(form.elements.seats.value);
  const condition = form.elements.condition.value;
  const material = form.elements.material.value;
  const hasInvoice = invoice.value === "yes";
  const photoReadyCount = getCheckedPhotoCount();
  const homeType = form.elements.homeType.value;

  const conditionFactor = {
    excellent: 1.18,
    bon: 1,
    correct: 0.78,
    use: 0.52
  }[condition];
  const materialBonus = {
    cuir: 70,
    velours: 35,
    tissu: 20,
    microfibre: 15
  }[material];
  const base = Math.round((120 + seats * 55 + materialBonus) * conditionFactor);
  const photoBonus = photoReadyCount >= 12 ? 30 : photoReadyCount >= 10 ? 18 : -35;
  const invoiceBonus = hasInvoice ? 25 : 0;
  const pickupCost = homeType === "flat" ? 55 : 40;
  const offer = Math.max(40, Math.round((base + photoBonus + invoiceBonus - pickupCost) / 5) * 5);

  document.querySelector("#baseValue").textContent = `${base + invoiceBonus} €`;
  document.querySelector("#photoBonus").textContent = `${photoBonus >= 0 ? "+" : ""}${photoBonus} €`;
  document.querySelector("#pickupCost").textContent = `-${pickupCost} €`;
  document.querySelector("#offerAmount").textContent = `${offer} €`;
}

document.addEventListener("click", (event) => {
  const next = event.target.closest(".next-step");
  const prev = event.target.closest(".prev-step");

  if (next) {
    if (currentStep === 3 && getCheckedPhotoCount() < 10) {
      showToast("Le dossier photo doit contenir au moins 10 vues précises.");
      return;
    }
    setStep(currentStep + 1);
  }

  if (prev) {
    setStep(currentStep - 1);
  }
});

document.querySelector("#estimateBtn").addEventListener("click", () => {
  calculateEstimate();
  setStep(5);
  showToast("Estimation immédiate générée: rachat garanti si l'offre est acceptée.");
});

document.querySelector("#finishBtn").addEventListener("click", () => {
  showToast("Rachat garanti confirmé: email officiel et rendez-vous d'enlèvement prêts.");
});

document.querySelectorAll(".choice").forEach((choice) => {
  choice.addEventListener("click", () => {
    document.querySelectorAll(".choice").forEach((item) => item.classList.remove("selected"));
    choice.classList.add("selected");
  });
});

invoice.addEventListener("change", updateInvoiceFields);

createPhotoChecklist();
updateInvoiceFields();
setPickupDateDefault();
