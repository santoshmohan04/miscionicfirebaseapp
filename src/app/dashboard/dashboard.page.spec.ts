import { PopoverController } from '@ionic/angular/standalone';
import { ThemeService } from '../core/services/theme.service';
import { DashboardPage } from './dashboard.page';

describe('DashboardPage theme selector', () => {
  it('starts opening the selector without waiting for haptics', async () => {
    const page = new DashboardPage({} as PopoverController, {} as ThemeService);
    const open = spyOn(page, 'openThemeSelector').and.resolveTo();
    const event = new Event('click');

    const result = page.openThemeSelectorWithHaptics(event);

    expect(open).toHaveBeenCalledOnceWith(event);
    await result;
  });
});
