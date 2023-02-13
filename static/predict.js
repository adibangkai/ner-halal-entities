
class Predict {
  constructor() {
    // this.url = 'https://554f-114-124-175-166.ngrok.io/api/extract'
    this.url = '/api/extract'
  }

  async getEntities(formData) {
    const response = await fetch(this.url, {
      method: 'POST',
      body: formData
    })
    const entitiesResult = await response.json()

    return { entitiesResult }
  }
}
