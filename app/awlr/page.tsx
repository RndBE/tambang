import AnalisaDataPage from "@/app/analisa-data/page"

export const dynamic = "force-dynamic"

type AwlrPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function AwlrPage({ searchParams }: AwlrPageProps) {
  const params = await searchParams

  return (
    <AnalisaDataPage
      searchParams={Promise.resolve({
        ...params,
        sensor: "awlr",
        parameter: firstParam(params.parameter) ?? "waterLevel",
        range: firstParam(params.range) ?? "180d",
      })}
    />
  )
}
