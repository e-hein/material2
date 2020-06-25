import {ComponentHarness} from '../../component-harness';

export class TabComponentHarness extends ComponentHarness {
  static hostSelector = 'testTab';

  getInput(id: string) {
    return this.locatorFor('#' + id)();
  }
}
