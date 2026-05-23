import AnalisaDataPage from "@/app/analisa-data/page"

export const dynamic = "force-dynamic"

type GnssPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function GnssPage({ searchParams }: GnssPageProps) {
  const params = await searchParams

  return (
    <AnalisaDataPage
      searchParams={Promise.resolve({
        ...params,
        sensor: "gnss",
        parameter: firstParam(params.parameter) ?? "z",
        range: firstParam(params.range) ?? "180d",
      })}
    />
  )
}
