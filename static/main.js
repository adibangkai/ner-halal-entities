const form = document.querySelector(".periksa");
const formTeks = document.querySelector(".periksa-teks");
const show = document.querySelector(".show");
const notif = document.querySelector(".notif");
const food = document.querySelector(".food");
const other = document.querySelector(".other");
const loading = document.querySelector(".loading");
const image = document.querySelector(".image");
const ocr = document.querySelector(".ocr");
const error = document.querySelector(".error");

const predict = new Predict();

const validateFileType = () => {
  var fileName = document.getElementById("fileName").value;
  var idxDot = fileName.lastIndexOf(".") + 1;
  var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();

  if (extFile == "heic" || extFile == "pdf" || extFile == "docx") {
    notif.classList.remove("hide");
  } else if (extFile == "jpg" || extFile == "jpeg" || extFile == "png") {
    form.addEventListener("change", (e) => {
      e.preventDefault();
      show.classList.add("hide");
      let dataFoto = form.file.value;
      const formData = new FormData(form);
      formData.append("rawtext", dataFoto);
      loading.classList.remove("hide");
      error.classList.add("hide");
      notif.classList.add("hide");
      predict
        .getEntities(formData)
        .then((data) => updateUI(data))
        .catch((err) => console.log(err));
    });
  } else {
    notif.classList.remove("hide");
  }
};

const updateUI = (data) => {
  const { entitiesResult } = data;
  error.classList.add("hide");

  food.innerHTML = "";
  other.innerHTML = "";
  ocr.innerHTML = "";
  image.innerHTML = "";
  loading.classList.add("hide");
  show.classList.remove("hide");
  notif.classList.add("hide");

  if (entitiesResult.status === 200) {
    // image.innerHTML += `<img src="https://554f-114-124-175-166.ngrok.io/static/uploads/${entitiesResult.filename}" class='image'>`
    image.innerHTML += `<img src="/static/uploads/${entitiesResult.filename}" class='image'>`;
    // ocr.innerHTML += `${entitiesResult.result}`
    entitiesResult.detected_entities.forEach((detected_entities) => {
      food.innerHTML += `
              <a href="https://www.google.com/search?q=is+${detected_entities.name}+halal" target="_blank"><span class="entitas ${detected_entities.entities}">${detected_entities.name}</span></a>
          `;
    });
    entitiesResult.other_entities.forEach((other_entities) => {
      other.innerHTML += `
              <span class="entitas">${other_entities.name} |<strong> ${other_entities.entities}</strong></span>
          `;
    });
  } else {
    error.classList.remove("hide");
  }
};

formTeks.addEventListener("submit", (e) => {
  e.preventDefault();
  show.classList.add("hide");

  let dataKomposisi = formTeks.komposisi.value;

  const formData = new FormData(formTeks);
  formData.append("rawtext", dataKomposisi);
  loading.classList.remove("hide");

  food.innerHTML = "";
  other.innerHTML = "";
  image.innerHTML = "";
  predict
    .getEntities(formData)
    .then((data) => updateUI(data))
    .catch((err) => console.log(err));
});
