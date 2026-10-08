// Кнопка «Сбросить выделение» для подсветки результатов поиска.
// Подсветка появляется, когда в адресе страницы есть параметр ?h=<запрос>.
document$.subscribe(() => {
  document.querySelector(".search-reset")?.remove();
  const url = new URL(location.href);
  if (!url.searchParams.has("h")) return;

  const btn = document.createElement("button");
  btn.className = "search-reset";
  btn.textContent = "Сбросить выделение";
  btn.addEventListener("click", () => {
    document.querySelectorAll("mark[data-md-highlight]").forEach(m => {
      const parent = m.parentNode;
      m.replaceWith(...m.childNodes);
      parent.normalize();
    });
    url.searchParams.delete("h");
    history.replaceState(null, "", url);
    btn.remove();
  });
  document.body.appendChild(btn);
});
