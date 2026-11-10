/**
 * Pelapor kemajuan untuk Z-Learning.
 *
 * APA YANG DIPECAHKAN
 *   Modul ini dihosting terpisah dari Z-Learning, jadi ia tampil di dalam
 *   iframe dari origin yang berbeda. Peramban memblokir akses langsung antar
 *   origin, sehingga Z-Learning tidak punya cara mengetahui apakah peserta
 *   benar-benar menyelesaikan modulnya. Akibatnya tombol "Tandai Selesai"
 *   bisa diklik detik pertama, tanpa menyentuh satu slide pun.
 *
 *   Satu-satunya jalur resmi antar origin adalah postMessage. Berkas ini
 *   menyediakannya.
 *
 * KENAPA BUTUH SATU TRIGGER DI STORYLINE
 *   Rancangan pertama berkas ini membaca sendiri kemajuan dari player, lewat
 *   variabel bawaan `projectSlidesViewed` dan `projectTotalSlides` yang
 *   terlihat di kode player. Itu TIDAK bekerja, dan sudah diuji: nama-nama
 *   tersebut internal, dan `GetPlayer().GetVar()` mengembalikan null untuk
 *   semuanya — begitu pula sepuluh varian nama lain yang dicoba.
 *
 *   Tidak ada jalan terdokumentasi untuk membaca kemajuan dari luar. Maka
 *   arahnya dibalik: berkas ini membuka pintu, dan modulnya yang mengetuk.
 *
 *   Yang perlu ditambahkan di Storyline hanya SATU trigger pada slide
 *   terakhir — Execute JavaScript:
 *
 *       window.ZLearningSelesai && window.ZLearningSelesai();
 *
 *   Modul ini sudah memakai trigger JavaScript untuk mengatur musik latar
 *   (Script1 sampai Script3 di story_content/user.js), jadi menambahkan satu
 *   lagi bukan hal baru bagi penyusunnya.
 *
 * YANG DIKIRIM
 *   { sumber: "paket-web", status: "siap"    }   sekali, saat modul dimuat
 *   { sumber: "paket-web", status: "selesai" }   saat ZLearningSelesai() dipanggil
 *
 *   Pesan "siap" itu PENTING dan bukan basa-basi. Tanpa pesan pembuka,
 *   Z-Learning tidak bisa membedakan modul yang belum selesai dari modul lama
 *   yang memang tidak bisa melapor sama sekali — dan modul lama akan terkunci
 *   selamanya. Dengan pesan ini, gerbang baru dipasang setelah Z-Learning tahu
 *   ada yang akan mengabarinya.
 *
 * SENGAJA TIDAK ADA TEBAKAN OTOMATIS
 *   Menebak selesai dari waktu tonton, posisi gulir, atau bentuk data simpanan
 *   player akan salah di kedua arah: membuka tombol bagi yang belum selesai,
 *   atau mengunci yang sudah. Keduanya merugikan peserta, dan keduanya tidak
 *   menimbulkan gejala yang bisa dilacak. Lebih baik tidak melapor sama sekali
 *   daripada melapor keliru.
 *
 * BATASNYA, SUPAYA TIDAK SALAH DIANDALKAN
 *   Ini gerbang kejujuran, bukan pengamanan. Peserta yang paham devtools bisa
 *   memanggil fungsi ini sendiri. Untuk menahan orang yang asal klik, ini
 *   cukup; untuk kelulusan yang diaudit, yang dibutuhkan pelaporan
 *   terverifikasi server (SCORM atau xAPI), bukan pesan dari peramban.
 */
(function () {
  "use strict";

  // Di luar iframe tidak ada yang mendengarkan. Membuka story.html langsung
  // untuk memeriksa isinya tetap berjalan normal, hanya tanpa pelaporan.
  var disematkan = window.parent !== window;

  /**
   * Origin tujuan pesan.
   *
   * Diambil dari referrer, yaitu halaman yang menyematkan modul ini. Memakai
   * "*" membuat pesan terbaca situs mana pun yang menyematkannya; isinya memang
   * tidak rahasia, tetapi menyempitkannya tidak memakan biaya apa pun. Bila
   * referrer tidak tersedia — sebagian peramban menyembunyikannya — barulah
   * jatuh ke "*", sebab pesan yang tidak pernah terkirim lebih merugikan
   * daripada pesan yang terbaca pihak lain.
   */
  var TUJUAN = (function () {
    try {
      if (document.referrer) return new URL(document.referrer).origin;
    } catch (e) {
      /* referrer tidak bisa diurai */
    }
    return "*";
  })();

  function kirim(status) {
    if (!disematkan) return;
    try {
      window.parent.postMessage({ sumber: "paket-web", status: status }, TUJUAN);
    } catch (e) {
      /* Induk sudah tertutup atau menolak. Melemparkan galat di sini hanya
         akan mengotori konsol peserta tanpa menolong siapa pun. */
    }
  }

  var sudahLapor = false;

  /**
   * Dipanggil oleh trigger Storyline di slide terakhir.
   *
   * Aman dipanggil berulang: hanya kiriman pertama yang diteruskan. Trigger
   * Storyline bisa menyala lebih dari sekali — misalnya ketika peserta
   * kembali ke slide itu — dan membanjiri induk dengan pesan yang sama tidak
   * menambah apa pun.
   */
  window.ZLearningSelesai = function () {
    if (sudahLapor) return;
    sudahLapor = true;
    kirim("selesai");
  };

  kirim("siap");
})();
