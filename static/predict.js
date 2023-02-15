class Predict {
  constructor() {
    this.url = "/api/extract";
  }

  async getEntities(formData) {
    const response = await fetch(this.url, {
      method: "POST",
      body: formData,
    });
    const entitiesResult = await response.json();

    return { entitiesResult };
  }
}
