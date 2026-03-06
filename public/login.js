const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const message = document.getElementById("message");

loginBtn.addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    message.textContent = "Kullanıcı adı ve şifre gir.";
    return;
  }

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    message.textContent = data.message;

    if (res.ok) {
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  } catch {
    message.textContent = "Bir hata oluştu.";
  }
});