# Rancangan Mining Monitoring System

Dashboard ini dirancang sebagai command center tambang untuk memantau sensor geoteknik, kestabilan lereng, air tambang, cuaca, CCTV, kualitas udara, kebisingan, gas, alarm, perangkat, dan laporan operasional.

## Fokus Phase 1

Phase 1 menggunakan data dummy tambang dan mempertahankan layout dashboard GNSS yang sudah ada. Integrasi MQTT, kontrol ADR/RTS, prism target management, visualisasi 3D deformasi, dan ingestion realtime disiapkan untuk fase berikutnya.

## Area Dummy

- Pit A
- Pit B
- North Highwall
- South Dump
- Settling Pond
- Tailing Dam

## Sensor/Sistem

| Prioritas | Sensor/Sistem | Fungsi Utama |
| --- | --- | --- |
| 1 | Rain Gauge / ARR | Memantau curah hujan di area tambang |
| 2 | Water Level / AWLR | Memantau tinggi muka air di sump, pit lake, settling pond, sungai, atau kolam tambang |
| 3 | Water Quality / AWQR | Memantau kualitas air tambang seperti pH, turbidity, TSS, conductivity, suhu air, dan DO |
| 4 | Weather Station / AWS | Memantau cuaca lokal, kelembapan, tekanan udara, arah, dan kecepatan angin |
| 5 | Deformation Monitoring / ADR | Memantau pergerakan lereng, highwall, disposal area, atau tailing dam |
| 6 | Piezometer | Memantau tekanan air pori tanah untuk kestabilan lereng dan tailing dam |
| 7 | CCTV Monitoring | Pemantauan visual area kritis secara real-time |
| 8 | Dust Sensor | Memantau debu tambang seperti PM2.5, PM10, dan TSP |
| 9 | Noise Sensor | Memantau kebisingan dari alat berat, blasting, crusher, atau conveyor |
| 10 | Gas Sensor | Memantau gas area risiko seperti CH4, CO, CO2, H2S, dan O2 |

## Halaman Utama

- Dashboard
- Peta Monitoring Tambang
- Sensor Geoteknik
- Deformasi Lereng
- Air & Cuaca
- CCTV Monitoring
- Analisis Risiko Lereng
- Alarm & Event
- Laporan Monitoring Tambang
- Perangkat Sensor
- Pengaturan Mining Monitoring

## Database

Database pengembangan menggunakan nama `gnss_tambang`.
