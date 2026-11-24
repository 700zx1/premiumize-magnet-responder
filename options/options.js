const key = document.getElementById("apiKey");
const status = document.getElementById("status");
browser.storage.local.get({ apiKey: "" }).then((s) => (key.value = s.apiKey));
document.getElementById("save").addEventListener("click", async () => {
  await browser.storage.local.set({ apiKey: key.value.trim() });
  status.textContent = "Saved";
  setTimeout(() => (status.textContent = ""), 1500);
});
