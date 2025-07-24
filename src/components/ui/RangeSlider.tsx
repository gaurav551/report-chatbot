// import { Slider } from "@/components/ui/slider"
// import React from "react"

// type Props = {
//   filter: {
//     rangeFrom: number
//     rangeTo: number
//     type: string
//     [key: string]: any
//   }
//   onFilterChange: (updatedFilter: any) => void
//   min?: number
//   max?: number
//   step?: number
// }

// export const RangeSlider: React.FC<Props> = ({
//   filter,
//   onFilterChange,
//   min = 0,
//   max = 100,
//   step = 1,
// }) => {
//   const value: [number, number] = [filter.rangeFrom ?? min, filter.rangeTo ?? max]

//   const handleChange = (values: number[]) => {
//     onFilterChange({
//       ...filter,
//       rangeFrom: values[0],
//       rangeTo: values[1],
//     })
//   }

//   return (
//     <div className="w-full max-w-md space-y-2">
//       <div className="flex justify-between text-sm text-muted-foreground">
//         <span>From: {value[0]}</span>
//         <span>To: {value[1]}</span>
//       </div>
//       <Slider
//         value={value}
//         onValueChange={handleChange}
//         min={min}
//         max={max}
//         step={step}
//         className="w-full"
//       />
//     </div>
//   )
// }
