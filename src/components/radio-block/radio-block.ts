import SimpleRangeSlider from '../../SimpleRangeSlider/SimpleRangeSlider';

class RadioBlock {
  readonly blockClass: string

  $mainContainer: JQuery

  sliderInstance: SimpleRangeSlider

  $sliderContainer: JQuery

  sliderConfig: iObject

  configurationName: string

  configurationValue: boolean | string

  radioBlocks: JQuery[] = []

  constructor($container: JQuery, blockClass: string, sliderInstance: SimpleRangeSlider) {
    this.$mainContainer = $container;
    this.blockClass = blockClass;
    this.sliderInstance = sliderInstance;
    this.$sliderContainer = sliderInstance.$container;
    this.sliderConfig = this.sliderInstance.config;
    this.configurationName = this.$mainContainer.data('configuration-name');
    this.configurationValue = this.sliderConfig[this.configurationName];
    this.$mainContainer.find(`.js-${blockClass}__label`).each((_, element) => {
      this.radioBlocks.push($(element).find(`.js-${blockClass}__radio`));
    });
    this.radioBlocks.forEach(($element) => {
      const text = this.configurationName === 'orientation'
        ? $element.data('text')
        : $element.data('text') === 'enable';
      $element.prop('checked', text === this.configurationValue);
    });
    this.bindContext();
    this.bindHandlers();
  }

  handleRadioClick(event: JQuery.MouseEventBase) {
    const $target = $(event.target);
    const value = this.configurationName === 'orientation'
      ? $target.data('text')
      : $target.data('text') === 'enable';
    if (value !== this.configurationValue) {
      this.configurationValue = value;
      this.rebuildSlider();
    }
  }

  bindContext() {
    this.handleRadioClick = this.handleRadioClick.bind(this);
    this.rebuildSlider = this.rebuildSlider.bind(this);
  }

  bindHandlers() {
    this.radioBlocks.forEach(($element) => {
      $element.on('click', this.handleRadioClick);
    });
  }

  rebuildSlider() {
    this.$sliderContainer.empty();
    this.sliderConfig[this.configurationName] = this.configurationValue;
    const config: iConfigUser = this.sliderConfig;
    this.sliderInstance = new SimpleRangeSlider(this.$sliderContainer, config);
  }
}

export default RadioBlock;