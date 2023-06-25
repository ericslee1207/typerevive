chrome.runtime.onInstalled.addListener(function ({ reason }) {
  if (reason == "install") {
    const uuid = generateUUID();
    chrome.storage.local.set({ uuid }, function () {
      console.log("UUID generated and stored:", uuid);
    });
  }
});

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

chrome.tabs.onActivated.addListener(() => {
  getStatus(true);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    getStatus(false);
  }
});

const getStatus = async (ontabchange) => {
  const { uuid } = await chrome.storage.local.get(["uuid"]);
  console.log("Value currently is " + uuid);

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

  let status = "";
  if (jsonData.length === 0) {
    await fetch(`http://127.0.0.1:8000/tb/createweb/`, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      redirect: "follow",
      referrerPolicy: "no-referrer",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        status: false,
        url: encodedURL,
        pcid: uuid,
      }),
    });
    status = false;
  } else {
    status = jsonData[0].status;
  }

  if (status) {
    chrome.action.setBadgeText({ text: "ON" });
    chrome.action.setBadgeBackgroundColor({ color: "#00FF00" });
    if (!ontabchange) {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });
    }
  } else {
    chrome.action.setBadgeText({ text: "OFF" });
    chrome.action.setBadgeBackgroundColor({ color: "black" });
  }
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
