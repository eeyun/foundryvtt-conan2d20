export default class SoakForm extends FormApplication {
  constructor(object, options = {}) {
    super(object.data, options);
    //@ts-ignore
    this.objectType = object.constructor.name;
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = 'soak-form';
    options.classes = ['conan2d20'];
    options.title = 'Area Soak';
    options.template = 'systems/conan2d20/templates/apps/morale-cover.html';
    options.width = '300px';
    options.height = 'auto';
    return options;
  }

  async _updateObject(event: Event, formData: any) {
    //@ts-ignore
    formData['_id'] = this.object._id;
    //@ts-ignore
    return canvas.scene.updateEmbeddedEntity(this.objectType, formData);
  }
}
