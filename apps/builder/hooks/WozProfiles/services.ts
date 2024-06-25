import { WOZService } from "services/octadesk/woz/woz.service"

export const fetchWOZProfiles = async (): Promise<Array<any>> => {
  const wozProfilesList: Array<any> = []
  Promise.all([
    WOZService()
      .getAll()
      .then((res) => {
        res.sort((a: any, b: any) => a.name.localeCompare(b.name))
        const itemList = res
          .map((profile: any, idx: number) => ({
            ...profile,
            label: profile.name,
            value: { profile: profile.id },
            key: `wp-${idx}`
          }))

        wozProfilesList.push(...itemList)
      }),
  ])

  return wozProfilesList
}