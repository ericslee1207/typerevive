console.log("Code injected!");

let textInputFieldsToSave = document.querySelectorAll('input[type="text"]');
let textareasFieldsToSave = document.getElementsByTagName("textarea");

const mergedToSave = [...textInputFieldsToSave, ...textareasFieldsToSave];

let indexToSave = 0;

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

async function createHash(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

const save = () => {
  chrome.storage.local.get(["uuid"]).then(async (result) => {
    await createHash(window.location.href).then(async (encodedURL) => {
      mergedToSave.forEach((input) => {
        postData("http://127.0.0.1:8000/tb/create/", {
          index: indexToSave,
          content: input.value,
          url: encodedURL,
          pcid: result.uuid,
          doa: new Date(),
        });
        indexToSave++;
      });
    });
  });
};

save();
