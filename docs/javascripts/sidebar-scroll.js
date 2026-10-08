// Боковое меню не «прыгает» при переходе между страницами:
// запоминаем, где оно было прокручено, и возвращаем туда же.
// Тема сама центрирует активный пункт — отменяем это, если активный
// пункт и так виден на сохранённой позиции (иначе центрирование нужно,
// например после перехода из поиска).
(() => {
  const KEY = "wiki-sidebar-scroll";
  const wrap = document.querySelector(".md-sidebar--primary .md-sidebar__scrollwrap");
  if (!wrap) return;

  let saved = null;
  try { saved = sessionStorage.getItem(KEY); } catch (e) {}

  const save = () => {
    try { sessionStorage.setItem(KEY, String(wrap.scrollTop)); } catch (e) {}
  };
  wrap.addEventListener("click", save);
  window.addEventListener("pagehide", save);

  if (saved === null) return;
  const top = Number(saved);

  const activeVisibleAt = (pos) => {
    const active = wrap.querySelector(".md-nav__link--active");
    if (!active) return true;
    const y = active.offsetTop - wrap.offsetTop;
    return y >= pos && y + active.clientHeight <= pos + wrap.clientHeight;
  };

  // Подменяем центрирование темы (оно срабатывает один раз после загрузки)
  wrap.scrollTo = function (options) {
    delete this.scrollTo;
    if (!activeVisibleAt(top)) HTMLElement.prototype.scrollTo.call(this, options);
  };

  const restore = () => {
    if (activeVisibleAt(top)) wrap.scrollTop = top;
  };
  restore();
  requestAnimationFrame(() => requestAnimationFrame(restore));
  window.addEventListener("load", restore, { once: true });
})();
