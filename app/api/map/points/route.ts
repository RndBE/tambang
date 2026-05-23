import { getMonitoringPoints } from "@/lib/backend/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const points = await getMonitoringPoints();

  return Response.json({
    points,
    layers: [
      "Titik ADR/Deformasi",
      "Titik AWLR",
      "Titik CCTV",
      "Sensor Lingkungan",
      "Zona Risiko Lereng",
      "Infrastruktur Penting",
      "Batas Administrasi",
    ],
  });
}
