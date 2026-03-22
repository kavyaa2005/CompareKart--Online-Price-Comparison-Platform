import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { SearchCompare } from './pages/SearchCompare';
import { ProductDetail } from './pages/ProductDetail';
import { Preferences } from './pages/Preferences';
import { Alerts } from './pages/Alerts';
import { Wishlist } from './pages/Wishlist';
import { Recommendations } from './pages/Recommendations';
import { PriceHistory } from './pages/PriceHistory';
import { Profile } from './pages/Profile';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'search', Component: SearchCompare },
      { path: 'product/:id', Component: ProductDetail },
      { path: 'preferences', Component: Preferences },
      { path: 'alerts', Component: Alerts },
      { path: 'wishlist', Component: Wishlist },
      { path: 'recommendations', Component: Recommendations },
      { path: 'price-history', Component: PriceHistory },
      { path: 'profile', Component: Profile },
    ],
  },
]);
