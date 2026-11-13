import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LoginForm from "./components/LoginForm";
import LoginIntro from "./components/LoginIntro";
import type { LoginPageProps } from "./interfaces/login-page-props.interface";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun Kasitronik Anda untuk mengelola laporan dan penjemputan.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { confirmation } = await searchParams;
  const initialMessage =
    confirmation === "success"
      ? "Email berhasil dikonfirmasi. Silakan masuk dengan akun Anda."
      : confirmation === "error"
        ? "Konfirmasi email gagal atau tautannya sudah kedaluwarsa."
        : undefined;

  return (
    <main className={styles.page}>
      <Header variant="auth" currentAuthPage="login" />

      <div className={styles.content}>
        <LoginIntro />
        <LoginForm initialMessage={initialMessage} />
      </div>

      <Footer showBackToTop={false} />
    </main>
  );
}
