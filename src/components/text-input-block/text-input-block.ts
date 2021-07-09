import '../../SimpleRangeSlider/SimpleRangeSliderJQ';

class TextInput {
  readonly blockClass: string = 'text-input-block';

  $mainContainer: JQuery;

  $sliderContainer: JQuery;

  sliderConfig: CompleteConfigList;

  isSinglePointer: boolean;

  inputs: JQuery[] = [];

  configurationName: string;

  configurationValue: number | number[];

  constructor(
    $container: JQuery,
    $sliderContainer: JQuery,
    sliderConfig: CompleteConfigList,
    isSinglePointer: boolean,
  ) {
    this.bindContext();
    this.$mainContainer = $container;
    this.$sliderContainer = $sliderContainer;
    this.sliderConfig = sliderConfig;
    this.isSinglePointer = isSinglePointer;
    this.configurationName = $container.data('configuration-name');
    this.configurationValue = this.sliderConfig[this.configurationName];
    this.initInputs();
    this.bindHandlers();
  }

  initInputs() {
    this.$mainContainer.find(`.js-${this.blockClass}__input`).each((_, element) => {
      this.inputs.push($(element));
    });
    if (this.configurationName === 'start' && this.isSinglePointer) {
      this.inputs[1].hide();
    }
    this.inputs.forEach((input, index) => {
      $(input).val(
        Array.isArray(this.configurationValue)
          ? this.configurationValue[index]
          : this.configurationValue,
      );
    });
  }

  handleInputFocusOut(event: JQuery.FocusOutEvent) {
    const $target = $(event.target);
    const { range, start } = this.sliderConfig;
    const value = Number($target.val());
    const index = Number($target.data('index'));
    const isNotEqualPrevious = Array.isArray(this.configurationValue)
      ? value !== this.configurationValue[index]
      : value !== this.configurationValue;
    if (isNotEqualPrevious) {
      switch (this.configurationName) {
        case 'step': {
          const isTooBigStep = value > Math.round((Math.abs(range[0]) + Math.abs(range[1])) / 10);
          const isZero = value === 0;
          if (!isTooBigStep && !isZero) {
            this.sliderConfig.step = value;
            this.rebuildSlider(this.sliderConfig);
          } else {
            this.blinkInputAndReturnPreviousValue($target, this.sliderConfig.step);
          }
          break;
        }
        case 'start': {
          if (this.isSinglePointer) {
            const isOutOfRange = value < range[0] || value > range[1];
            if (!isOutOfRange) {
              this.sliderConfig.start[index] = value;
              this.rebuildSlider(this.sliderConfig);
            } else {
              this.blinkInputAndReturnPreviousValue($target, this.sliderConfig.start[index]);
              $target.val();
            }
          } else {
            const isOutOfRange = start[1]
              ? value < range[0] || value > start[1]
              : value < start[0] || value > range[1];
            const isEqualOtherStart = start[1]
              ? value === start[1]
              : value === start[0];
            if (!isOutOfRange && !isEqualOtherStart) {
              this.sliderConfig.start[index] = value;
              this.rebuildSlider(this.sliderConfig);
            } else {
              this.blinkInputAndReturnPreviousValue($target, this.sliderConfig.start[index]);
            }
          }
          break;
        }
        case 'range': {
          const isEqualOtherRange = index === 0
            ? value === range[1]
            : value === range[0];
          if (this.isSinglePointer) {
            const isOutOfStart = index === 0
              ? value > start[0]
              : value < start[0];
            if (!isOutOfStart && !isEqualOtherRange) {
              this.sliderConfig.range[index] = value;
              this.rebuildSlider(this.sliderConfig);
            } else {
              this.blinkInputAndReturnPreviousValue($target, range[index]);
            }
          } else {
            const isOutOfStart = index === 0
              ? value > start[index]
              : value < start[index];
            if (!isOutOfStart && !isEqualOtherRange) {
              this.sliderConfig.range[index] = value;
              this.rebuildSlider(this.sliderConfig);
            } else {
              this.blinkInputAndReturnPreviousValue($target, range[index]);
            }
          }
          break;
        }
        default:
          break;
      }
    }
  }

  bindHandlers() {
    this.inputs.forEach((input) => {
      $(input).on('focusout', this.handleInputFocusOut);
    });
  }

  bindContext() {
    this.handleInputFocusOut = this.handleInputFocusOut.bind(this);
  }

  rebuildSlider(config: CompleteConfigList) {
    this.$sliderContainer.empty();
    this.$sliderContainer.simpleRangeSlider(<ConfigUserList> config);
  }

  blinkInputAndReturnPreviousValue($input: JQuery, previousValue: number) {
    $input.removeClass(`${this.blockClass}__input_normal`);
    $input.addClass(`${this.blockClass}__input_wrong`);
    setTimeout(() => {
      $input.addClass(`${this.blockClass}__input_normal`);
      $input.removeClass(`${this.blockClass}__input_wrong`);
    }, 250);
    $input.val(previousValue);
  }
}

export default TextInput;
