// Ledgerleaf quote builder: turns three answers into a ready-to-send chat message.
// Demo mode: no phone number, so WhatsApp and Viber ask which chat to send it to.
// For a real client, put their number here in international format without "+", e.g. "639171234567".
const WHATSAPP_NUMBER = "";

// Sample monthly pricing per service, by volume tier (under 50 / 50–150 / over 150).
const PRICES = {
  "Monthly bookkeeping": [2500, 4000, 6500],
  "BIR filing": [1500, 2000, 3000],
  Payroll: [1200, 2000, 3500],
};

const form = document.querySelector("[data-quote-form]");
const messageBox = document.querySelector("[data-message]");
const estimateBox = document.querySelector("[data-estimate]");
const errorBox = document.querySelector("[data-error]");
const whatsappLink = document.querySelector('[data-send="whatsapp"]');
const viberLink = document.querySelector('[data-send="viber"]');
const copyButton = document.querySelector("[data-copy]");
const mobileBar = document.querySelector("[data-mobile-bar]");

const peso = (amount) => `₱${amount.toLocaleString("en-PH")}`;

const readAnswers = () => {
  const data = new FormData(form);
  const volumeInput = form.querySelector('input[name="volume"]:checked');
  return {
    type: data.get("type"),
    volume: data.get("volume"),
    tier: Number(volumeInput.dataset.tier),
    needs: data.getAll("need"),
    name: String(data.get("name") || "").trim(),
  };
};

// Low end is the tier price; high end allows for one tier up, so the range stays honest.
const estimate = ({ tier, needs }) => {
  const monthly = needs.filter((need) => PRICES[need]);
  if (!monthly.length) return null;
  const low = monthly.reduce((sum, need) => sum + PRICES[need][tier], 0);
  const high = monthly.reduce((sum, need) => sum + PRICES[need][Math.min(tier + 1, 2)], 0);
  return low === high ? peso(low) : `${peso(low)}–${peso(high)}`;
};

const buildMessage = (answers) => {
  const lines = [answers.name ? `Hi Ledgerleaf, I'm ${answers.name}! I'd like a quote.` : "Hi Ledgerleaf! I'd like a quote."];
  lines.push(`Business: ${answers.type}`);
  lines.push(`Transactions: ${answers.volume} a month`);
  lines.push(`Need: ${answers.needs.join(", ") || "(not sure yet)"}`);
  lines.push("Best time for a short call:");
  return lines.join("\n");
};

const update = () => {
  const answers = readAnswers();
  const message = buildMessage(answers);
  const range = estimate(answers);
  const text = encodeURIComponent(message);

  messageBox.textContent = message;
  estimateBox.textContent = range ? `Sample estimate: ${range} / month` : "Quoted in chat";
  errorBox.hidden = answers.needs.length > 0;

  // wa.me pre-fills the text; Messenger links can't, which is why the Golden Compound funnel copies to the clipboard instead.
  whatsappLink.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  viberLink.href = `viber://forward?text=${text}`;
};

// Block sending until at least one service is picked, so every lead arrives complete.
[whatsappLink, viberLink].forEach((link) =>
  link.addEventListener("click", (event) => {
    if (readAnswers().needs.length) return;
    event.preventDefault();
    errorBox.hidden = false;
    errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
  })
);

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(messageBox.textContent);
    copyButton.textContent = "Copied ✓";
  } catch {
    // Clipboard blocked: select the text so it can be copied by hand.
    window.getSelection().selectAllChildren(messageBox);
    copyButton.textContent = "Selected, press Ctrl+C";
  }
  setTimeout(() => (copyButton.textContent = "Copy message"), 2500);
});

form.addEventListener("input", update);
form.addEventListener("submit", (event) => event.preventDefault());
update();

// Show the phone bar after the hero, and hide it while the quote form itself is on screen.
if (mobileBar && "IntersectionObserver" in window) {
  const hero = document.querySelector(".hero");
  const quote = document.querySelector("#quote");
  const visible = new Map();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => visible.set(entry.target, entry.isIntersecting));
    mobileBar.classList.toggle("is-shown", !visible.get(hero) && !visible.get(quote));
  });
  observer.observe(hero);
  observer.observe(quote);
}
