import {HarnessLoader} from '@angular/cdk/testing';
import {TabComponentHarness} from '../harnesses/test-tab-component-harness';

export function testEmulateTab(
  getTabComponentHarnessFromEnvironment: () => Promise<TabComponentHarness>,
) {
  let harness: TabComponentHarness;

  beforeEach(async () => {
    harness = await getTabComponentHarnessFromEnvironment();
  });
}
