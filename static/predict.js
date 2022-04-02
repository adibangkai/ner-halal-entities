// window.alert('conected ')
class Predict {
  constructor() {
    this.url = 'http://halaldong.herokuapp.com/api/extract'
  }
  // async updateCity(city){
  //     const cityDets = await this.getCity(city);
  //     const weather = await this.getWeather(cityDets.Key);
  //     return { cityDets,weather };
  // }
  async getEntities(formData) {
    const response = await fetch(this.url, {
      method: 'POST',
      body: formData
    })
    const entitiesResult = await response.json()

    return { entitiesResult }
  }
}
