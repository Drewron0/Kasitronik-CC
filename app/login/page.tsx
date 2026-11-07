import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LoginForm from "./components/LoginForm";
import LoginIntro from "./components/LoginIntro";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun Kasitronik Anda untuk mengelola laporan dan penjemputan.",
};

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <Header variant="auth" currentAuthPage="login" />

      <div className={styles.content}>
        <LoginIntro />
        <LoginForm />
      </div>

      <Footer showBackToTop={false} />
    </main>
  );
}
