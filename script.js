document.addEventListener("DOMContentLoaded", () => {
  // نمایش کارت‌ها با تاخیر
  const cards = document.querySelectorAll(".link-card");
  cards.forEach((card, i) => {
    setTimeout(() => {
      card.classList.add("show");
    }, i * 200);
  });

  // تغییر تم و چرخش دکمه
  const themeToggle = document.getElementById("theme-toggle"); // توجه به نام آی‌دی
  themeToggle.addEventListener("click", () => {
  //themeToggle.style.transition = "transform 0.4s ease";
  //themeToggle.style.transform = "rotate(360deg)";
  //setTimeout(() => (themeToggle.style.transform = "rotate(0deg)"), 400);
  document.body.classList.toggle("dark");
  });
});

