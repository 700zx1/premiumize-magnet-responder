const $ = (id) => document.getElementById(id);
$("send").addEventListener("click", async () => {
  $("msg").textContent = "Sending…";
  const res = await browser.runtime.sendMessage({ type: "send-magnet", magnet: $("magnet").value });
  $("msg").textContent = res.message;
  if (res.ok) $("magnet").value = "";
});
$("opts").addEventListener("click", () => { browser.runtime.openOptionsPage(); window.close(); });
