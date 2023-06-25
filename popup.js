let prevStatus;

document.addEventListener("DOMContentLoaded", async () => {
  await getStatus();
});

const statusLabel = document.querySelector(".statuslabel");
const button1 = document.getElementById("button1");
const button2 = document.getElementById("button2");

button1.style.display = "none";
button2.style.display = "none";

button1.addEventListener("click", () => {
  const enabled = document.getElementById("toggleButton").checked;
  setStatus(enabled);
  chrome.tabs.reload();
});

button2.addEventListener("click", () => {
  const enabled = document.getElementById("toggleButton").checked;
  const confirm = window.confirm(
    "Are you sure? Turning off the extension will delete all written data on this page"
  );

  if (confirm) {
    setStatus(enabled);
    chrome.tabs.reload();
  }
});

document
  .getElementById("toggleButton")
  .addEventListener("change", async (event) => {
    const enabled = event.target.checked;
    if (prevStatus !== enabled) {
      button1.style.display = enabled ? "block" : "none";
      button2.style.display = enabled ? "none" : "block";
    } else {
      button1.style.display = "none";
      button2.style.display = "none";
    }
  });

const getStatus = async () => {
  const { uuid } = await chrome.storage.local.get(["uuid"]);
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  const url = tab.url;
  const encodedURL = await createHash(url);

  const response = await fetch(
    `http://127.0.0.1:8000/tb/getwebs/${encodedURL}/${uuid}/`
  );
  const jsonData = await response.json();
  const status = jsonData[0].status;
  prevStatus = status;
  document.getElementById("toggleButton").checked = status;
};

const setStatus = async (enabled) => {
  const { uuid } = await chrome.storage.local.get(["uuid"]);
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  const url = tab.url;
  const encodedURL = await createHash(url);

  await fetch("http://127.0.0.1:8000/tb/setstatus/", {
    method: "PUT",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    redirect: "follow",
    referrerPolicy: "no-referrer",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      url: encodedURL,
      status: enabled,
      pcid: uuid,
    }),
  }).then(async () => {
    if (!enabled) {
      await fetch(`http://127.0.0.1:8000/tb/delete/${encodedURL}/${uuid}/`, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        redirect: "follow",
        referrerPolicy: "no-referrer",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }).then(() => {
        window.close();
      });
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["save.js"],
        });
      });
      window.close();
    }
  });
};

async function createHash(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
