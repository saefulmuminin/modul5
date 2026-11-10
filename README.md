# MODUL 5 — Tangan yang Menolak

Modul pembelajaran interaktif PUSDIKLAT BAZNAS RI, hasil ekspor HTML5 dari
Articulate Storyline. Repositori ini hanya berisi berkas statis hasil ekspor
tersebut, apa adanya.

## Kenapa dihosting terpisah

Modul interaktif seperti ini berisi JavaScript dalam jumlah besar. Saat
diunggah lewat domain Z-Learning, sebagian berkasnya ditolak oleh pemeriksa
keamanan di depan layanan karena polanya menyerupai muatan berbahaya —
padahal isinya sah. Menghostingnya terpisah menghindari persoalan itu,
sekaligus memberi isolasi yang lebih tegas: modul berjalan di origin sendiri
dan tidak bisa menyentuh sesi peserta di Z-Learning.

Tiap modul dipisah ke repositori sendiri, bukan digabung. Isinya media biner —
139 png, 127 mp3, 38 js — dan git menyimpan salinan utuh setiap kali modul diekspor ulang,
bukan selisihnya. Digabung, riwayat seluruh modul membengkak bersama dan
membersihkannya menyeret modul yang tidak bersalah.

## Menjalankan secara lokal

Butuh peladen statis; membuka `story.html` langsung lewat `file://` tidak
bekerja karena peramban memblokir pemuatan antar-berkasnya.

```bash
python3 -m http.server 4100
# lalu buka http://localhost:4100/story.html
```

## Deploy ke Vercel

1. Buat project baru di Vercel, hubungkan ke repositori ini.
2. Framework Preset: **Other**. Build command dan output directory dikosongkan
   — tidak ada yang perlu dibangun.
3. Setelah deploy selesai, salin domainnya.

## Menautkannya di Z-Learning

Pada form materi, pilih tipe **Paket**, lalu tempel alamat hasil deploy pada
kolom *Alamat Paket yang Dihosting Sendiri*.

## Pelaporan selesai ke Z-Learning

Tanpa ini, tombol **Tandai Selesai** di Z-Learning bisa diklik peserta sejak
detik pertama, tanpa membuka satu slide pun.

`zlearning-lapor.js` sudah dimuat oleh `story.html` dan menyediakan pintunya.
Yang masih kurang satu: **trigger di proyek Storyline**.

Pada slide terakhir, tambahkan trigger *Execute JavaScript* berisi:

```js
window.ZLearningSelesai && window.ZLearningSelesai();
```

Lalu ekspor ulang, salin berkasnya ke repositori ini, dan push. Vercel
mem-publish ulang otomatis.

Modul ini **belum** punya trigger JavaScript sama sekali — `story_content/user.js`
masih kosong dari `window.Script`. Jadi trigger di atas akan jadi yang pertama,
dan tanpa penambahan itu modul ini tidak akan pernah melapor selesai.

### Kenapa harus lewat trigger

Rancangan pertama membaca sendiri kemajuan dari player lewat variabel bawaan
`projectSlidesViewed` dan `projectTotalSlides`. Itu diuji dan **tidak bekerja**:
nama-nama tersebut internal, dan `GetPlayer().GetVar()` mengembalikan `null`
untuk semuanya, begitu pula sepuluh varian nama lain. Tidak ada jalan
terdokumentasi untuk membaca kemajuan dari luar.

Menebaknya dari lama tonton atau dari data simpanan player sengaja tidak
dilakukan: tebakan akan salah di kedua arah — membuka tombol bagi yang belum
selesai, atau mengunci yang sudah — dan keduanya tidak meninggalkan gejala
yang bisa dilacak.

### Batasnya

Ini gerbang kejujuran, bukan pengamanan. Peserta yang paham devtools bisa
memanggil fungsi itu sendiri. Untuk menahan yang asal klik, ini memadai; untuk
kelulusan yang diaudit, yang dibutuhkan pelaporan terverifikasi server (SCORM
atau xAPI).

## Catatan

- Peluncurnya **`story.html`**, bukan `index.html`. `vercel.json` di repositori
  ini mengarahkan alamat akar ke sana, jadi domain polos pun langsung terbuka.
- `analytics-frame.html` di akar **bukan** peluncur. Ia bingkai pelacakan, dan
  membukanya hanya menampilkan halaman kosong.
