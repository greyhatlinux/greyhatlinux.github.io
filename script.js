function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  const body = document.body;

  menu.classList.toggle("open");
  icon.classList.toggle("open");

  if (menu.classList.contains('open')) {
      body.style.overflow = 'hidden'; 
  } else {
      body.style.overflow = '';
  }

}
