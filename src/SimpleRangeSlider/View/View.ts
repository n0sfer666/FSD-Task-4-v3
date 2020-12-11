import Connect from './entities/Connect';
import Input from './entities/Input';
import Pointer from './entities/Pointer';
import Tooltip from './entities/Tooltip';

class View {
  readonly normalizingCoefficient: number = 1e4;

  $container: JQuery;

  config: iConfigView;

  $slider: JQuery;

  pointer: Pointer[];

  tooltip?: Tooltip[];

  connect?: Connect;

  inputValue?: Input[];

  inputTooltip?: Input[];

  constructor($container: JQuery, config: iConfigView) {
    this.$container = $container;
    this.config = config;
    this.$slider = this.getSlider();
    this.pointer = this.config.start.map((value, index) => this.getPointer(value, index));
    this.tooltip = this.config.tooltip
      ? this.config.start.map((value) => this.getTooltip(value))
      : undefined;
    this.connect = this.config.connect ? this.getConnect(this.pointer) : undefined;
    this.initInputs();
    this.drawSlider();
  }

  getSlider() {
    const element: JQuery = jQuery(document.createElement('div'));
    element.addClass('simple-range-slider__slider');
    element.addClass(`simple-range-slider__slider_${this.config.orientation}`);
    return element;
  }

  getPointer(value: number, index: number): Pointer {
    const { range } = this.config;
    const position: number = (value - range[0]) / (range[1] - range[0]);
    const normalizedPosition: number = this.getNormalizedPosition(position);
    return new Pointer(this.config.orientation, normalizedPosition, index);
  }

  getTooltip(value: number): Tooltip {
    return new Tooltip(value, this.config.orientation);
  }

  getConnect(pointer: Pointer[]): Connect {
    if (pointer.length === 1) {
      return new Connect(0, pointer[0].position, this.config.orientation);
    }
    return new Connect(pointer[0].position, pointer[1].position, this.config.orientation);
  }

  getInput(type: tInputType, $element: JQuery, value?: number, index?: number): Input {
    if (type === 'value') {
      return new Input(type, $element, value, index);
    }
    return new Input(type, $element);
  }

  initInputs() {
    if (this.config.input && this.tooltip) {
      if (this.config.input.$value) {
        this.inputValue = this.config.input.$value.map(
          ($inputValue, index) => new Input('value', $inputValue, this.config.start[index], index),
        );
      }
      if (this.config.input.$tooltip) {
        this.inputTooltip = [new Input('tooltip', this.config.input.$tooltip[0])];
        this.inputTooltip[0].setVisibilityTooltip(this.tooltip);
      }
    }
  }

  getNormalizedPosition(position: number):number {
    return Math.round(position * this.normalizingCoefficient);
  }

  drawSlider() {
    this.pointer.forEach((pointer, index) => {
      if (this.tooltip) {
        pointer.$element.append(this.tooltip[index].$element);
      }
      this.$slider.append(pointer.$element);
    });
    if (this.connect) {
      this.$slider.append(this.connect.$element);
    }
    this.$container.append(this.$slider);
  }
}

export default View;
