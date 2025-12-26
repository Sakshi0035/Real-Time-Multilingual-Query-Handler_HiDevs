const btn = document.getElementById("translateBtn");
const input = document.getElementById("inputText");
const result = document.getElementById("result");

btn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) {
    result.textContent = "Please enter a message.";
    return;
  }

  result.textContent = "Translating...";

  try {
    const response = await fetch("/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    const data = await response.json();
    result.textContent = data.translation || "Translation failed.";
  } catch {
    result.textContent = "Server error. Try again.";
  }
});
