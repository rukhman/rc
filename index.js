let i = 0;
let time = 0;
document.getElementById("photoInput").onchange = (event) => {
  let reader = new FileReader();
  reader.onload = (e) =>
    (document.getElementById("preview").src = e.target.result);
  reader.readAsDataURL(event.target.files[0]);
};

document.getElementById("addButton").addEventListener("click", () => {
  ++i;

  const edit = document.createElement("div");
  edit.style.position = "absolute";
  edit.style.width = "10px";
  edit.style.height = "10px";
  edit.style.top = "-5px";
  edit.style.right = "-5px";
  edit.style.background = "red";
  edit.style.borderRadius = "50%";
  edit.style.cursor = "pointer";
  edit.classList.add("editButton");

  const butWrap = document.createElement("div");
  butWrap.style.position = "relative";
  butWrap.id = i;
  butWrap.style.position = "absolute";
  butWrap.style.zIndex = 1000;

  let but = document.createElement("input");
  but.style.color = "white";
  but.style.backgroundColor = "green";
  but.style.cursor = "pointer";
  but.type = "button";
  but.value = "КНОПКА № " + i;
  but.setAttribute("on", false);

  butWrap.appendChild(edit);
  butWrap.appendChild(but);

  document.body.append(butWrap);

  const selectedButton = document.getElementById(i);

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
    let shiftX = event.clientX - selectedButton.getBoundingClientRect().left;
    let shiftY = event.clientY - selectedButton.getBoundingClientRect().top;

    selectedButton.style.position = "absolute";
    selectedButton.style.zIndex = 1000;
    // document.body.append(selectedButton);
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
});

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
