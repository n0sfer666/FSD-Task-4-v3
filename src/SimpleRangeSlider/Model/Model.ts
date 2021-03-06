class Model {
  readonly normalizingCoefficient: number = 1e4;

  readonly range: ConfigRange;

  readonly step: number;

  callbackList: ModelCallback[] = [];

  positions: number[];

  values: number[];

  isSinglePointer: boolean;

  activePointerIndex: number = 0;

  constructor(config: ConfigModelList, values?: number[]) {
    const { range, start, step } = config;
    this.values = values ? [...values] : [...start];
    this.range = [...range];
    this.step = step;
    this.isSinglePointer = start.length === 1;
    this.positions = this.values.map((value) => this.getPositionFromValue(value));
  }

  subscribeOn(callback: ModelCallback) {
    this.callbackList.push(callback);
  }

  getPositionFromValue(value: number): number {
    const result: number = (value - this.range[0]) / (this.range[1] - this.range[0]);
    return Math.round(result * this.normalizingCoefficient) / this.normalizingCoefficient;
  }

  getValueFromPosition(position: number): number {
    const result: number = (position * (this.range[1] - this.range[0])) + this.range[0];
    return Math.round(result);
  }

  getNewValue(viewData: ViewData): number {
    const { index, position, value } = viewData;
    let newValue = 0;
    if (position || position === 0) {
      if (position <= 0) {
        return this.range[0];
      }
      if (position >= 1) {
        return this.range[1];
      }
      newValue = this.getValueFromPosition(position);
    }
    if (value || value === 0) {
      if (value <= this.range[0]) {
        return this.range[0];
      }
      if (value >= this.range[1]) {
        return this.range[1];
      }
      newValue = value;
    }
    const rightBoundary = this.values[1] - this.step;
    const leftBoundary = this.values[0] + this.step;
    const isValueOfLeftPointerBiggerThanRight = newValue > rightBoundary;
    const isValueOfRightPointerSmallerThanLeft = newValue < leftBoundary;
    if (index === 0 && !this.isSinglePointer) {
      return isValueOfLeftPointerBiggerThanRight ? rightBoundary : newValue;
    }
    if (index === 1) {
      return isValueOfRightPointerSmallerThanLeft ? leftBoundary : newValue;
    }
    return newValue;
  }

  setValueAndPosition(newValue: number, index: number) {
    const leftBoundary = this.values[index] - (this.step / 2);
    const rightBoundary = this.values[index] + (this.step / 2);
    const isOutOfBoundary = newValue >= rightBoundary || newValue <= leftBoundary;
    const resultValue = Math.round(newValue / this.step) * this.step;

    if (isOutOfBoundary) {
      this.values[index] = resultValue;
      this.positions[index] = this.getPositionFromValue(resultValue);
    }
  }

  updateByView(viewData: ViewData) {
    const { index } = viewData;
    this.activePointerIndex = index;
    const newValue = this.getNewValue(viewData);
    this.setValueAndPosition(newValue, index);
    const { positions, values } = this;
    this.callbackList.forEach(
      (viewCallback: ModelCallback) => viewCallback({ positions, values, index }),
    );
  }
}

export default Model;
