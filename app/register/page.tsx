import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RegisterForm from "./components/RegisterForm";
import RegisterIntro from "./components/RegisterIntro";
import styles from "../login/login.module.css";

export const metadata: Metadata = {
  title: "Daftar Akun",
  description: "Daftar akun Kasitronik untuk mulai menyalurkan barang elektronik lama.",
};

export default function RegisterPage() {
  return (
    <main className={styles.page}>
      <Header variant="auth" currentAuthPage="register" />

      <div className={styles.content}>
        <RegisterIntro />
        <RegisterForm />
      </div>

      <Footer showBackToTop={false} />
    </main>
  );
}
