export interface IMeasurable {
  height: number;
  width: number;
}

export class Measurable implements IMeasurable {
  height: number;
  width: number;
  get ratio() {
    return this.width / this.height;
  }
  constructor(config: IMeasurable) {
    this.height = config.height;
    this.width = config.width;
  }
}

export class Touchpad extends Measurable {}

export class Screen extends Measurable {
  private static idNum = 0;
  readonly id: number;
  constructor(config: IMeasurable & { id?: number }) {
    super(config);
    this.id = config?.id ?? Screen.idNum;
    Screen.idNum++;
  }
}
