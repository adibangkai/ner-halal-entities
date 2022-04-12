const form = document.querySelector('.periksa')
const formTeks = document.querySelector('.periksa-teks')
const show = document.querySelector('.show')
const food = document.querySelector('.food')
const other = document.querySelector('.other')
const loading = document.querySelector('.loading')
const image = document.querySelector('.image')
const ocr = document.querySelector('.ocr')
const error = document.querySelector('.error')

const predict = new Predict()

const updateUI = (data) => {
  const { entitiesResult } = data
  console.log(entitiesResult)
  food.innerHTML = ''
  other.innerHTML = ''
  ocr.innerHTML = ''
  image.innerHTML = ''
  show.classList.remove('hide')
  loading.classList.add('hide')
  if (entitiesResult.status === 200) {
    // image.innerHTML += `<img src="https://554f-114-124-175-166.ngrok.io/static/uploads/${entitiesResult.filename}" class='image'>`
    image.innerHTML += `<img src="https://halaldong.herokuapp.com/static/uploads/${entitiesResult.filename}" class='image'>`
    ocr.innerHTML += `${entitiesResult.result}`
    entitiesResult.detected_entities.forEach((detected_entities) => {
      food.innerHTML += `
              <a href="https://www.google.com/search?q=is+${detected_entities.name}+halal" target="_blank"><span class="entitas ${detected_entities.entities}">${detected_entities.name}</span></a>
          `
    })
    entitiesResult.other_entities.forEach((other_entities) => {
      other.innerHTML += `
              <span class="entitas">${other_entities.name} |<strong> ${other_entities.entities}</strong></span>
          `
    })
  }
}

form.addEventListener('change', (e) => {
  e.preventDefault()
  let dataFoto = form.file.value
  console.log('data', dataFoto)
  const formData = new FormData(form)
  formData.append('rawtext', dataFoto)
  loading.classList.remove('hide')

  predict
    .getEntities(formData)
    .then((data) => updateUI(data))
    .catch((err) => console.log(err))
})

formTeks.addEventListener('submit', (e) => {
  e.preventDefault()
  let dataKomposisi = formTeks.komposisi.value
  console.log('data', dataKomposisi)
  const formData = new FormData(formTeks)
  formData.append('rawtext', dataKomposisi)
  loading.classList.remove('hide')
  food.innerHTML = ''
  other.innerHTML = ''
  image.innerHTML = ''
  predict
    .getEntities(formData)
    .then((data) => updateUI(data))
    .catch((err) => console.log(err))
})
