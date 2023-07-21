import { Divider } from "@chakra-ui/react"

type OctaDividerComponent = {
    borderColor?: string
    width?: string
    margin?: string
}

export const OctaDivider = ({
    borderColor, 
    width, 
    margin
}: OctaDividerComponent) => {
    return <Divider borderColor={borderColor || "#C4C7CF"} width={width || "260px"} margin={margin || "10px 0px"} />
}