document.addEventListener("DOMContentLoaded", function () {
  const elements = {
    scrollBox: document.getElementById("scrollBox"),
    colorPicker: document.getElementById("colorPicker"),
    colorLabel: document.getElementById("colorLabel"),
    addButton: document.getElementById("addButton"),
    sendButton: document.getElementById("sendButton"),
    slider: document.getElementById("slider"),
    sliderValue: document.getElementById("sliderValue"),
    canvas: document.getElementById("colorCanvas"),
    colorSlider: document.getElementById("colorSlider"),
  };

  const ctx = elements.canvas.getContext("2d");
  let currentColor = "RGB: (255, 255, 255)";
  let roomCounter = 1;
  let brightness = 50;
  const roomsData = [];

  // Инициализация цветовой палитры
  function createColorPalette() {
    const gradientX = ctx.createLinearGradient(0, 0, elements.canvas.width, 0);
    ["red", "orange", "yellow", "green", "blue", "indigo", "violet"].forEach(
      (color, i) => {
        gradientX.addColorStop(i / 6, color);
      }
    );

    const gradientY = ctx.createLinearGradient(0, 0, 0, elements.canvas.height);
    gradientY.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = gradientX;
    ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
    ctx.fillStyle = gradientY;
    ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
  }

  // Обновление цвета и позиции ползунка
  function updateColor(event) {
    const rect = elements.canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - rect.left, elements.canvas.width));
    const y = Math.max(0, Math.min(event.clientY - rect.top, elements.canvas.height));

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    currentColor = `RGB: (${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    elements.colorLabel.textContent = currentColor;

    elements.colorSlider.style.left = `${x}px`;
    elements.colorSlider.style.top = `${y}px`;
    elements.colorSlider.style.backgroundColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  }

  // Обработка событий палитры
  function initColorPicker() {
    let isDragging = false;

    elements.canvas.addEventListener("mousedown", (event) => {
      isDragging = true;
      updateColor(event);
    });

    elements.canvas.addEventListener("mousemove", (event) => {
      if (isDragging) updateColor(event);
    });

    elements.canvas.addEventListener("mouseup", () => (isDragging = false));
    elements.canvas.addEventListener("mouseleave", () => (isDragging = false));
  }

  // Обновление слайдера яркости
  function updateSlider() {
    brightness = parseInt(elements.slider.value, 10);
    elements.slider.style.setProperty("--slider-progress", `${brightness}%`);
    elements.sliderValue.textContent = `${brightness}%`;
  }

  // Инициализация слайдера
  function initSlider() {
    elements.slider.addEventListener("input", updateSlider);
    updateSlider();
  }

  // Добавление кнопки "Помещение"
  function addRoom() {
    if (roomCounter > 16) {
      alert("Достигнуто максимальное количество помещений (16).");
      return;
    }

    const button = document.createElement("button");
    button.textContent = `Помещение ${roomCounter}`;
    button.classList.add("room-btn");

    const rgbValues = currentColor.match(/\d+/g).map(Number);
    button.dataset.originalText = button.textContent;
    button.dataset.color = currentColor;
    button.dataset.brightness = brightness;
    button.dataset.rgb = rgbValues.join(",");

    button.addEventListener("mouseover", function () {
      this.textContent = `${this.dataset.color} | Яркость: ${this.dataset.brightness}%`;
      this.style.backgroundColor = `rgba(${this.dataset.rgb}, ${
        this.dataset.brightness / 100
      })`;
    });

    button.addEventListener("mouseout", function () {
      this.textContent = this.dataset.originalText;
      this.style.backgroundColor = "";
    });

    elements.scrollBox.appendChild(button);

    roomsData.push({
      room: roomCounter,
      color: { r: rgbValues[0], g: rgbValues[1], b: rgbValues[2] },
      brightness: brightness,
    });

    roomCounter++;
  }

  // Отправка данных
  function sendData() {
    const data = {
      rooms: roomsData.map((room) => ({
        room: room.room,
        color: room.color,
        brightness: room.brightness,
      })),
    };

    const jsonData = JSON.stringify(data, null, 2);
    console.log("Отправлено:", jsonData);
    // Здесь можно добавить код для отправки данных через WebSocket
    // // // const socket = new WebSocket("ws://сервер");
    // // // socket.onopen = function () {
    // // //   socket.send(jsonData);
    // // // };
  }

  // Инициализация
  createColorPalette();
  initColorPicker();
  initSlider();
  elements.addButton.addEventListener("click", addRoom);
  elements.sendButton.addEventListener("click", sendData);
});
