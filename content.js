console.log("Code injected!");

const eventListener = async (e) => {
  const { uuid } = await chrome.storage.local.get(["uuid"]);
  const encodedURL = await createHash(window.location.href);
  handleInputChange(e, encodedURL, uuid);
};

const textInputFields = document.querySelectorAll('input[type="text"]');
const textareasFields = document.getElementsByTagName("textarea");
const merged = [...textInputFields, ...textareasFields];
let index = 0;

const handleInputChange = async (event, encodedURL, uuid) => {
  try {
    const json = await putData("http://127.0.0.1:8000/tb/edit/", {
      content: event.target.value,
      index: event.target.index,
      url: encodedURL,
      pcid: uuid,
    });
    console.log(json); // Handle success
  } catch (err) {
    console.log(err); // Handle errors
  }
};

async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    redirect: "follow",
    referrerPolicy: "no-referrer",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

async function putData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "PUT",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    redirect: "follow",
    referrerPolicy: "no-referrer",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

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

const scriptOn = async () => {
  const { uuid } = await chrome.storage.local.get(["uuid"]);
  const encodedURL = await createHash(window.location.href);
  const response = await fetch(
    `http://127.0.0.1:8000/tb/${encodedURL}/${uuid}/`
  );
  const jsonData = await response.json();

  const curweb = await fetch(
    `http://127.0.0.1:8000/tb/getwebs/${encodedURL}/${uuid}/`
  );
  const webData = await curweb.json();
  const status = webData[0].status;

  if (status) {
    merged.forEach((input) => {
      const filtered = jsonData.filter((content) => content.index == index);
      if (filtered.length == 0) {
        postData("http://127.0.0.1:8000/tb/create/", {
          index: index,
          content: "none_xyz",
          url: encodedURL,
          pcid: uuid,
        });
      }
      input.index = index;
      input.value =
        filtered[0].content === "none_xyz" ? "" : filtered[0].content;
      index++;
      input.style.backgroundColor = "#d4fae0";
      input.addEventListener("input", eventListener);
    });
  }
};

scriptOn();
