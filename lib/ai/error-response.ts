export function aiErrorResponse(cause: unknown) {
  const status = cause && typeof cause === "object" && "status" in cause ? cause.status : undefined;
  const name = cause instanceof Error ? cause.name : "";

  switch (status) {
    case 429:
      return { status: 429, error: "Batas permintaan atau kuota Gemini tercapai. Coba lagi nanti atau isi manual." };
    case 503:
      return { status: 503, error: "Gemini sedang sibuk atau sementara tidak tersedia. Coba lagi beberapa saat atau isi manual." };
    case 500:
    case 502:
      return { status: 502, error: "Terjadi gangguan pada server Gemini. Coba lagi nanti atau isi manual." };
    case 504:
    case 408:
      return { status: 504, error: "Gemini terlalu lama merespons. Coba lagi atau isi manual." };
    case 401:
    case 403:
      return { status: 503, error: "Akses Gemini ditolak. Pengelola perlu memeriksa API key dan izin layanan. Anda tetap bisa mengisi manual." };
    case 404:
      return { status: 503, error: "Model Gemini tidak ditemukan atau tidak tersedia untuk konfigurasi ini. Hubungi pengelola atau isi manual." };
    case 400:
    case 422:
      return { status: 502, error: "Gemini menolak permintaan AI. Coba foto lain; jika tetap gagal, hubungi pengelola atau isi manual." };
  }

  if (name === "AbortError" || name === "TimeoutError") {
    return { status: 504, error: "Waktu tunggu Gemini habis. Coba lagi atau isi manual." };
  }
  return { status: 502, error: "Respons AI belum dapat diproses. Coba lagi atau isi manual." };
}
