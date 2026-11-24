// Firefox opens this page with the magnet link URL-encoded in the hash.
(async () => {
  const magnet = decodeURIComponent(location.hash.slice(1));
  const res = await browser.runtime.sendMessage({ type: "send-magnet", magnet });
  document.getElementById("msg").textContent = res.message;
  setTimeout(async () => {
    const tab = await browser.tabs.getCurrent();
    if (tab) browser.tabs.remove(tab.id);
  }, res.ok ? 600 : 2500);
})();
