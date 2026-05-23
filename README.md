# Mining Monitoring System

Dashboard monitoring tambang berbasis sensor geoteknik, deformasi ADR, AWLR, kualitas air, cuaca, CCTV, debu, kebisingan, gas, alarm, perangkat, dan laporan operasional.

## Status Phase 1

Sudah dibuat:

- Next.js App Router + TypeScript.
- Backend Prisma/MySQL untuk data operasional dummy.
- Layout dashboard operasional mengikuti tampilan dan styling GNSS.
- Navigasi Mining Monitoring untuk seluruh modul utama.
- KPI ringkasan operasional tambang.
- Marker peta monitoring tambang.
- Grafik ADR dan kualitas/level air.
- Panel risiko lereng.
- Kategori sensor ARR, AWLR, AWQR, AWS, ADR, Piezometer, CCTV, Dust, Noise, dan Gas.
- Halaman alarm.
- Halaman laporan.
- Halaman perangkat.
- Halaman pengaturan.
- Halaman login.

Belum dilakukan:

- Schema generic mining baru.
- MQTT/control ADR dari `asaba-nextjs`.
- Prism target management.
- Deformasi 3D nyata.
- Realtime ingestion.
- Export PDF nyata.
- Session cookie dan role guard middleware.

## Setup

Isi `.env` dengan koneksi MySQL:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/mining_monitoring"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Lalu jalankan:

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Buka `http://localhost:3000`.

## Login Demo

```text
operator@mining.local / operator123
```
