import { PopoverController } from '@ionic/angular/standalone';
import { ThemeService } from '../../../core/services/theme.service';
import { ThemeToggleComponent } from './theme-toggle.component';

describe('ThemeToggleComponent', () => {
  it('starts changing the theme without waiting for haptics', async () => {
    const themeService = jasmine.createSpyObj<ThemeService>('ThemeService', ['setTheme']);
    themeService.setTheme.and.resolveTo();
    const popoverController = jasmine.createSpyObj<PopoverController>('PopoverController', ['dismiss']);
    popoverController.dismiss.and.resolveTo(true);
    const component = new ThemeToggleComponent(themeService, popoverController);

    const result = component.selectTheme('dark');

    expect(themeService.setTheme).toHaveBeenCalledOnceWith('dark');
    await result;
    expect(popoverController.dismiss).toHaveBeenCalled();
  });
});
