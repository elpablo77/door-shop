import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import DoorDetails from "./pages/DoorDetails";
import Finder from "./pages/Finder";
import NotFound from "./pages/NotFound";
import Account from "./pages/Account";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import AccountOrdersPage from "./pages/AccountOrdersPage";
import InfoPage from "./pages/InfoPage";
import SeriesPage from "./pages/SeriesPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import FavoritesPage from "./pages/FavoritesPage";
import ComparePage from "./pages/ComparePage";

export default function App() {
  return <Layout><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/catalog" element={<Catalog />} />
    <Route path="/interior" element={<SeriesPage doorType="INTERIOR" />} />
    <Route path="/entrance" element={<SeriesPage doorType="ENTRANCE" />} />
    <Route path="/doors/:id" element={<DoorDetails />} />
    <Route path="/finder" element={<Finder />} />
    <Route path="/cart" element={<CartPage />} />
    <Route path="/favorites" element={<FavoritesPage />} />
    <Route path="/compare" element={<ComparePage />} />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
    <Route path="/account" element={<Account />} />
    <Route path="/account/login" element={<Account />} />
    <Route path="/account/register" element={<Account />} />
    <Route path="/account/orders" element={<AccountOrdersPage />} />
    <Route path="/admin" element={<AdminOrdersPage />} />
    <Route path="/admin/orders" element={<AdminOrdersPage />} />
    <Route path="/delivery-installation" element={<InfoPage title="Доставка и монтаж" page="delivery" />} />
    <Route path="/payment" element={<InfoPage title="Оплата" />} />
    <Route path="/warranty-return" element={<InfoPage title="Гарантия и возврат" />} />
    <Route path="/about" element={<InfoPage title="О компании" />} />
    <Route path="/contacts" element={<InfoPage title="Контакты" page="contacts" />} />
    <Route path="/privacy-policy" element={<InfoPage title="Политика обработки персональных данных" page="privacy" />} />
    <Route path="/showrooms" element={<InfoPage title="Салоны" />} />
    <Route path="/dealers" element={<InfoPage title="Дилерам" />} />
    <Route path="/orders" element={<Navigate to="/cart" replace />} />
    <Route path="*" element={<NotFound />} />
  </Routes></Layout>;
}
