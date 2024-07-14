import { exportToJson, importFromJson } from "./exportDB.js";

const request = indexedDB.open("db", 1); // подключаемся к бд
let i = 0;
let time = 0;
let imageData = null;
let photoInput = document.getElementById("photoInput");

request.onupgradeneeded = (event) => {
  const db = event.target.result; // получаем бд
  db.createObjectStore("images", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = (event) => {
  const db = request.result; // получаем бд
  const transaction = db.transaction(["images"], "readwrite");
  const store = transaction.objectStore("images"); // получаем хранилище users

  const getRequest = store.getAll();
  getRequest.onsuccess = (e) => {
    console.log("onsuccess");
    const images = getRequest.result;
    const select = document.getElementById("versions");
    select.options[select.options.length] = new Option("Не выбрано", -1);

    images.forEach((item) => {
      select.options[select.options.length] = new Option(item.name, item.id);
    });
    select.value = localStorage.getItem("version") ?? -1;
    onVersionChange();
  };
  getRequest.onerror = (e) => console.log(e.target.error.message);
};

request.onerror = function () {
  console.error("Error", openRequest.error);
};

document.getElementById("save").onclick = async () => {
  const select = document.getElementById("versions");
  let existingName = "Версия №";

  if (+select.value !== -1) {
    existingName = Array.from(select.options).filter(
      (option) => option.selected
    )[0].text;
  }

  const name = prompt("Введите название сохраняемой версии", existingName);
  if (!name) return;
  onSave(name);
};

photoInput.onchange = async (event) => {
  onphotoInputChange(event);
};

function onphotoInputChange(event) {
  const reader = new FileReader();
  reader.readAsDataURL(event.target.files[0]);

  reader.addEventListener("load", function () {
    imageData = reader.result;
    document.getElementById("preview").src = reader.result;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // const db = request.result; // получаем бд
  // console.log(db);
});

function addButton(inx, name, offsetLeft, offsetTop, isOn = false) {
  const edit = document.createElement("div");
  edit.style.position = "absolute";
  edit.style.width = "7px";
  edit.style.height = "7px";
  edit.style.top = "-8px";
  edit.style.right = "3px";
  edit.style.background = "black";
  edit.style.borderRadius = "50%";
  edit.style.cursor = "pointer";
  edit.classList.add("editButton");

  const del = document.createElement("div");
  del.style.position = "absolute";
  del.style.width = "7px";
  del.style.height = "7px";
  del.style.top = "-8px";
  del.style.right = "-5px";
  del.style.background = "red";
  del.style.borderRadius = "50%";
  del.style.cursor = "pointer";
  del.classList.add("delButton");

  const butWrap = document.createElement("div");
  butWrap.style.position = "relative";
  butWrap.id = inx;
  butWrap.classList.add("butWrap");
  butWrap.style.position = "absolute";
  butWrap.style.position = "absolute";
  butWrap.style.zIndex = 1000;

  let but = document.createElement("input");
  but.style.color = "white";
  but.style.cursor = "pointer";
  but.type = "button";
  but.value = name ?? "КНОПКА № " + inx;
  but.setAttribute("on", isOn);

  but.style.backgroundColor =
    but.getAttribute("on") === "true" ? "red" : "green";

  butWrap.appendChild(edit);
  butWrap.appendChild(del);
  butWrap.appendChild(but);

  document.body.append(butWrap);
  if (offsetLeft) {
    butWrap.style.left = offsetLeft + "px";
  }
  if (offsetTop) {
    butWrap.style.top = offsetTop + "px";
  }
  const selectedButton = document.getElementById(inx);
  selectedButton.ondragstart = function () {
    return false;
  };
  selectedButton.onmousedown = function (event) {
    time = new Date();
    if (event.target.classList.contains("editButton")) {
      const inp = event.currentTarget.querySelector("input");
      const name = prompt("Введите название кнопки", inp.getAttribute("value"));
      if (name) {
        inp.setAttribute("value", name);
      }
      return;
    }

    if (event.target.classList.contains("delButton")) {
      document.getElementById(event.currentTarget.id).remove();
      return;
    }
    let shiftX = event.clientX - selectedButton.getBoundingClientRect().left;
    let shiftY = event.clientY - selectedButton.getBoundingClientRect().top;

    moveAt(event.pageX, event.pageY);

    function moveAt(pageX, pageY) {
      selectedButton.style.left = pageX - shiftX + "px";
      selectedButton.style.top = pageY - shiftY + "px";
    }

    function onMouseMove(event) {
      moveAt(event.pageX, event.pageY);
    }

    document.addEventListener("mousemove", onMouseMove);

    selectedButton.onmouseup = function (event) {
      const inp = selectedButton.querySelector("input");
      if (Math.abs(time.getTime() - new Date().getTime()) < 160) {
        let isOn = inp.getAttribute("on") === "true";
        selectedButton
          .querySelector("input")
          .setAttribute("on", isOn ? "false" : "true");
        isOn = inp.getAttribute("on") === "true";
        inp.style.backgroundColor = isOn ? "red" : "green";
        naumCode(selectedButton, isOn);
      }
      document.removeEventListener("mousemove", onMouseMove);
      selectedButton.onmouseup = null;
    };
  };
}

document.getElementById("addButton").addEventListener("click", () => {
  addButton(++i);
});

document.getElementById("reset").addEventListener("click", (event) => {
  if (confirm("Очистить базу данных?")) {
    indexedDB.deleteDatabase("db");
    localStorage.clear();
    location.reload();
  }
});

document.getElementById("deleteButton").addEventListener("click", (event) => {
  if (confirm("Удалить текущую версию?")) {
    const db = request.result; // получаем бд
    const transaction = db.transaction(["images"], "readwrite"); // создаем транзакцию
    const imagesStore = transaction.objectStore("images"); // получаем хранилище images
    const versionNode = document.getElementById("versions");
    const version = +versionNode.value;
    if (version === -1) {
      alert("так делать нельзя, выбери другую версию");
    } else {
      imagesStore.delete(+version);
      clearWindow();
      versionNode.options[versionNode.selectedIndex].remove();
      localStorage.setItem("version", -1);
    }
  }
});

//выбор селекта
document.getElementById("versions").addEventListener("change", (_event) => {
  onVersionChange();
});

function onVersionChange() {
  const db = request.result; // получаем бд
  const transaction = db.transaction(["images"], "readwrite");
  const store = transaction.objectStore("images"); // получаем хранилище users

  const getRequest = store.getAll();
  getRequest.onsuccess = (e) => {
    const images = getRequest.result;
    let selectedId = +Array.from(document.getElementById("versions").options)
      .filter((option) => option.selected)
      .map((option) => option.value)?.[0];
    const selectedVersion = images.find((i) => i.id === selectedId);
    clearWindow();
    localStorage.setItem("version", selectedId);

    if (selectedVersion) {
      document.getElementById("preview").src = selectedVersion?.img || "";
      (selectedVersion.buttons || []).forEach((b) => {
        addButton(b.id, b.name, b.offsetLeft, b.offsetTop, b.isOn);
      });
    }
  };
  getRequest.onerror = (e) => console.log(e.target.error.message);
}

function clearWindow() {
  const deleteElement = document.getElementsByClassName("butWrap");
  document.getElementById("preview").src = "";
  for (let i = 0; i < deleteElement.length; i++) {
    deleteElement[i].remove();
  }
}

document.getElementById("export").onclick = async () => {
  const filename = prompt("Введите имя файла");
  if (filename) {
    exportToJson(request.result)
      .then((result) => {
        const blob = new Blob([result], { type: "text/csv" });
        if (window.navigator.msSaveOrOpenBlob) {
          console.log("Exported JSON string:", result);
          window.navigator.msSaveBlob(blob, filename);
        } else {
          const elem = window.document.createElement("a");
          elem.href = window.URL.createObjectURL(blob);
          elem.download = filename;
          document.body.appendChild(elem);
          elem.click();
          document.body.removeChild(elem);
        }
      })
      .catch((error) => {
        console.error("Something went wrong during export:", error);
      });
  }
};

document.getElementById("import").addEventListener("change", () => {
  const fr = new FileReader();
  fr.readAsText(document.getElementById("import").files[0]);
  fr.addEventListener("load", function () {
    const data = fr.result;
    console.log(data);
    importFromJson(request.result, data)
      .then((result) => {
        console.log("Exported JSON string:", result);
        setTimeout(() => {
          location.reload();
        }, 500);
      })
      .catch((error) => {
        console.error("Something went wrong during export:", error);
      });
  });
});

function onSave(name) {
  const db = request.result; // получаем бд
  const transaction = db.transaction(["images"], "readwrite"); // создаем транзакцию
  const imagesStore = transaction.objectStore("images"); // получаем хранилище images
  const buttons = [];
  const btnList = document.getElementsByClassName("butWrap");

  for (let index = 0; index < btnList.length; index++) {
    const btnWrap = btnList[index];
    buttons.push({
      id: +btnWrap.id,
      name: btnWrap.querySelector("input").value,
      offsetLeft: btnWrap.offsetLeft,
      offsetTop: btnWrap.offsetTop,
      isOn: btnWrap.querySelector("input").getAttribute("on"),
    });
  }
  const image = {
    name,
    img: imageData,
    buttons,
  };
  const select = document.getElementById("versions");
  const selectedId = +select.value;
  if (selectedId === -1) {
    const addRequest = imagesStore.add(image); // добавляем объект image в хранилище imagesStore
    addRequest.onsuccess = (_) => {
      const id = +addRequest.result;
      select.options[select.options.length] = new Option(name, id);
      select.value = id;
      alert(`Создана новая запись с именем "${name}" и ID ${id}`);
    };
  } else {
    const request = imagesStore.get(selectedId);
    request.onsuccess = (e) => {
      if (request.result) {
        const data = { ...request.result, ...image };
        imagesStore.put(data);
      }
    };
  }
}

function naumCode(selectedButton, on) {
  //вот так посмотреть id кнопки
  const id = selectedButton.id;
  console.log(id);
  //вот так посмотреть имя кнопки
  const name = selectedButton.querySelector("input").getAttribute("value");
  console.log(name);
  //вот так посмотреть состояние кнопки true - включени, false - выключена
  console.log(on);
  //при клике по кнопке в эти переменные попадает значение клинутой кнопки
  //ниже между строками с угловыми скобками можно писать свой код и использовать id и name
  //>>>>>>>>>>>>>>>>>>

  //>>>>>>>>>>>>>>>>>>
}
