console.log("Code injected!");

const eventListener = (e) => {
  chrome.storage.local.get(["uuid"]).then(async (result) => {
    await createHash(window.location.href).then(async (encodedURL) => {
      handleInputChange(e, encodedURL, result.uuid);
    });
  });
};

let textInputFields = document.querySelectorAll('input[type="text"]');
let textareasFields = document.getElementsByTagName("textarea");

const merged = [...textInputFields, ...textareasFields];

let index = 0;

const handleInputChange = (event, encodedURL, uuid) => {
  putData("http://127.0.0.1:8000/tb/edit/", {
    content: event.target.value,
    index: event.target.index,
    url: encodedURL,
    pcid: uuid,
  })
    .then((json) => {
      console.log(json); // Handle success
    })
    .catch((err) => {
      console.log(err); // Handle errors
    });
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
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

const scriptOn = () => {
  chrome.storage.local.get(["uuid"]).then(async (result) => {
    await createHash(window.location.href).then(async (encodedURL) => {
      const response = await fetch(
        `http://127.0.0.1:8000/tb/${encodedURL}/${result.uuid}/`
      );

      const jsonData = response.json();
      jsonData.then(async (res) => {
        const curweb = await fetch(
          `http://127.0.0.1:8000/tb/getwebs/${encodedURL}/${result.uuid}/`
        );
        const webData = curweb.json();
        webData.then((web) => {
          const status = web[0].status;
          if (status) {
            merged.forEach((input) => {
              let filtered = res.filter((content) => content.index == index);
              if (filtered.length == 0) {
                postData("http://127.0.0.1:8000/tb/create/", {
                  index: index,
                  content: "none_xyz",
                  url: encodedURL,
                  pcid: result.uuid,
                });
                filtered = [{ index: index, content: "none_xyz" }];
              }
              input.index = index;
              input.value =
                filtered[0].content === "none_xyz" ? "" : filtered[0].content;
              index++;
              input.style.backgroundColor = "#d4fae0";
              input.addEventListener("input", eventListener);
            });
          }
        });
      });
    });
  });
};

scriptOn();
