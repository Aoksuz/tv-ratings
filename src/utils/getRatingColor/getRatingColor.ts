const getRatingColor = (average: number) => {
  if (average == null) return 'border-1 border-gray-300'
  if (average < 6) return 'bg-red-800'
  if (average < 7) return 'bg-yellow-500'
  if (average < 8.5) return 'bg-green-600'
  return 'bg-green-800'
}
export default getRatingColor
