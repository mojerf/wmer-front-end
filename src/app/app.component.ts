import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CartItem } from './shared/models/cart';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './shared/services/notification/notification.service';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { CartService } from './shared/services/cart/cart.service';
import { Menu } from './shared/models/menu';
import { ThemeService } from './shared/services/theme/theme.service';
import { LoadingService } from './shared/services/loading/loading.service';
import {
  Router,
  NavigationStart,
  NavigationCancel,
  NavigationEnd,
} from '@angular/router';

const MENU: Menu[] = [
  {
    url: '',
    icon: 'home',
    name: 'صفحه اصلی',
    exact: true,
  },
  {
    url: 'works',
    icon: 'work',
    name: 'نمونه کار ها',
    exact: false,
  },
  {
    url: 'posts',
    icon: 'description',
    name: 'نوشته ها',
    exact: false,
  },
  {
    url: 'store',
    icon: 'store',
    name: 'فروشگاه',
    exact: false,
  },
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, AfterViewInit {
  menu = MENU;
  logoUrl = 'image/logo-l.png';
  titleName = 'مجتبی عرفان راد';
  titleDesc = 'توسعه دهنده فول استک';
  themeIcon = 'contrast';
  pageTitle = 'صفحه اصلی';
  needCard = false;
  loading = 'display:block;';

  cartItems: CartItem[] = [];
  cartItemCount = 0;

  constructor(
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService,
    private themeService: ThemeService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.notificationService.notification$.subscribe((notification) => {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: notification.message,
        panelClass: notification.isSuccess
          ? ['notification-class-success']
          : ['notification-class-danger'],
        duration: 2000,
      });
    });

    this.cartService.cartItems$.subscribe((data) => {
      this.cartItems = data;
      this.cartItemCount = data.length;
    });
    this.cartService.getCartItems();

    this.loadingService.loading$.subscribe((state) => {
      this.loading = state ? 'display:block;' : 'display:none;';
    });
  }

  ngAfterViewInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loadingService.setLoading(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel
      ) {
        this.loadingService.setLoading(false);
      }
    });
  }

  onActivate($event: { title: string; needCard?: boolean }) {
    this.pageTitle = $event.title;
    this.needCard =
      $event.needCard || $event.needCard === false ? $event.needCard : true;
  }

  toggleTheme() {
    const bodyElement = document.getElementsByTagName('body')[0];
    const themeState = bodyElement.dataset['theme'];

    bodyElement.dataset['theme'] = themeState === 'light' ? 'dark' : 'light';
    this.themeService.setTheme(themeState === 'light' ? true : false);
    this.themeIcon = themeState === 'light' ? 'light_mode' : 'dark_mode';
  }

  removeFromCart(id: number) {
    this.cartService.removeFromCart(id);
  }
}
