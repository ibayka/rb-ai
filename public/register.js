const registerBtn = document.getElementById("registerBtn");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const message = document.getElementById("message");

registerBtn.addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    message.textContent = "Kullanıcı adı ve şifre gir.";
    return;
  }

  try {
    const res = await fetch("/register", {
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
        window.location.href = "/login.html";
      }, 1000);
    }
  } catch {
    message.textContent = "Bir hata oluştu.";
  }
});